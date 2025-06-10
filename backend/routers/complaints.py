from fastapi import APIRouter, Depends, HTTPException, status, Request, UploadFile, File
from models.models import ComplaintCreate, Complaint, UserRole, ComplaintStatus, AIAnalysis
from utils.auth import get_current_user, check_permissions
from utils.ai_analysis import analyze_complaint_text, analyze_complaint_image
from bson import ObjectId
from typing import List, Optional
from datetime import datetime
import cloudinary
import cloudinary.uploader
import os
import logging
import asyncio

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize Cloudinary
cloudinary.config(
    cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
    api_key=os.getenv("CLOUDINARY_API_KEY"),
    api_secret=os.getenv("CLOUDINARY_API_SECRET")
)

router = APIRouter()

async def analyze_complaint(request: Request, complaint: dict) -> dict:
    """Analyze complaint using AI and return predictions"""
    logger.info(f"Starting analyze_complaint for complaint ID: {complaint['_id']}")
    
    try:
        # Perform text analysis
        logger.info("Calling analyze_complaint_text...")
        department_id, priority_score, analysis_text = await analyze_complaint_text(complaint)
        logger.info(f"Text analysis results: department={department_id}, priority={priority_score}")
        
        # Extract officer recommendation from analysis text
        lines = analysis_text.strip().split('\n')
        officer_line = next((line for line in lines if line.startswith("Officer:")), "")
        officer_recommendation = officer_line.split("Officer:")[1].strip() if officer_line else "No specific officer recommendation provided."
        
        # Extract analysis from analysis text
        analysis_line = next((line for line in lines if line.startswith("Analysis:")), "")
        analysis = analysis_line.split("Analysis:")[1].strip() if analysis_line else analysis_text
        
        logger.info("Successfully extracted analysis and recommendation")
        
        # Create analysis record
        analysis_record = {
            "_id": str(ObjectId()),
            "complaint_id": complaint["_id"],
            "department_id": department_id,
            "priority_score": priority_score,
            "analysis_text": analysis_text,
            "officer_recommendation": officer_recommendation,
            "version": "llama-3.3-70b-versatile",
            "created_at": datetime.utcnow()
        }
        
        logger.info(f"Created analysis record: {analysis_record}")
        
        # Store analysis in database
        try:
            await request.app.mongodb["ai_analyses"].insert_one(analysis_record)
            logger.info("Successfully stored analysis in database")
        except Exception as db_error:
            logger.error(f"Error storing analysis in database: {str(db_error)}")
            # Continue even if storage fails - we still want to return the analysis
        
        return analysis_record
        
    except Exception as e:
        logger.error(f"Error in analyze_complaint: {str(e)}")
        raise

@router.post("/", response_model=Complaint)
async def create_complaint(
    request: Request,
    complaint: ComplaintCreate
):
    try:
        # Convert complaint to dict and add required fields
        complaint_dict = complaint.dict()
        complaint_dict["_id"] = str(ObjectId())
        complaint_dict["created_at"] = datetime.utcnow()
        complaint_dict["last_updated"] = complaint_dict["created_at"]
        complaint_dict["status"] = ComplaintStatus.PENDING
        # Log the complaint data for debugging
        logger.info(f"Creating complaint with data: {complaint_dict}")
        # Insert complaint first
        await request.app.mongodb["complaints"].insert_one(complaint_dict)
        
        # Trigger AI analysis with retries
        max_retries = 3
        retry_delay = 2  # seconds
        analysis = None
        last_error = None
        
        for attempt in range(max_retries):
            try:
                logger.info(f"Starting AI analysis attempt {attempt + 1} for complaint: {complaint_dict['_id']}")
                analysis = await analyze_complaint(request, complaint_dict)
                if analysis:
                    logger.info(f"AI Analysis completed on attempt {attempt + 1}: {analysis}")
                    break
            except Exception as e:
                last_error = e
                logger.error(f"Error in AI analysis attempt {attempt + 1}: {str(e)}")
                if attempt < max_retries - 1:
                    await asyncio.sleep(retry_delay * (2 ** attempt))  # Exponential backoff
                continue
        
        if analysis:
            # Get department ID from analysis
            department_id = analysis.get("department_id")
            
            # Find available officer from the department
            officer = await request.app.mongodb["users"].find_one({
                "role": "officer",
                "department_id": department_id,
                "$expr": {
                    "$lt": [
                        {"$size": {"$ifNull": ["$active_complaints", []]}},
                        5  # Maximum of 5 active complaints per officer
                    ]
                }
            }, sort=[("active_complaints", 1)])
            
            update_data = {
                "department_id": department_id,
                "last_updated": datetime.utcnow(),
                "ai_analysis": analysis
            }
            
            if officer:
                update_data["assigned_to"] = officer["_id"]
                # Update officer's active complaints
                await request.app.mongodb["users"].update_one(
                    {"_id": officer["_id"]},
                    {
                        "$push": {"active_complaints": complaint_dict["_id"]},
                        "$set": {"last_updated": datetime.utcnow()}
                    }
                )
            
            # Update complaint with department, officer assignment, and AI analysis
            await request.app.mongodb["complaints"].update_one(
                {"_id": complaint_dict["_id"]},
                {"$set": update_data}
            )
        else:
            # If all retries failed, update with error state
            error_analysis = {
                "_id": str(ObjectId()),
                "complaint_id": complaint_dict["_id"],
                "department_id": "ERROR",
                "category_prediction": "error",
                "priority_score": 0,
                "analysis_text": f"Error during AI analysis after {max_retries} attempts. Please try again later.",
                "officer_recommendation": "Unable to generate recommendation due to error.",
                "version": "error",
                "created_at": datetime.utcnow()
            }
            
            await request.app.mongodb["complaints"].update_one(
                {"_id": complaint_dict["_id"]},
                {"$set": {
                    "ai_analysis": error_analysis,
                    "last_updated": datetime.utcnow()
                }}
            )
            
            if last_error:
                logger.error(f"All AI analysis attempts failed for complaint {complaint_dict['_id']}: {str(last_error)}")
        
        # Get updated complaint to return
        updated_complaint = await request.app.mongodb["complaints"].find_one(
            {"_id": complaint_dict["_id"]}
        )
        if not updated_complaint:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Complaint not found after creation"
            )
        
        logger.info(f"Returning updated complaint with analysis: {updated_complaint}")
        return updated_complaint
            
    except Exception as e:
        logger.error(f"Error creating complaint: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error creating complaint: {str(e)}"
        )

@router.get("/", response_model=List[Complaint])
async def get_complaints(
    request: Request,
    status: Optional[ComplaintStatus] = None,
    department_id: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    try:
        query = {}
        
        # Filter by status if provided
        if status:
            query["status"] = status
            
        # Filter by department if provided
        if department_id:
            query["department_id"] = department_id
            
        # If user is citizen, only show their complaints
        if current_user.role == UserRole.CITIZEN:
            query["citizen_id"] = current_user.email
        
        # If user is officer, only show complaints from their department
        elif current_user.role == UserRole.OFFICER:
            officer = await request.app.mongodb["users"].find_one({"email": current_user.email})
            if officer and officer.get("department_id"):
                query["department_id"] = officer["department_id"]
        
        complaints = await request.app.mongodb["complaints"].find(query).to_list(1000)
        for c in complaints:
            if 'district' not in c or not c['district']:
                c['district'] = c.get('location', 'Unknown')
        return complaints
    except Exception as e:
        logger.error(f"Error fetching complaints: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching complaints: {str(e)}"
        )

@router.get("/{complaint_id}", response_model=Complaint)
async def get_complaint(
    complaint_id: str,
    request: Request,
    current_user: dict = Depends(get_current_user)
):
    try:
        complaint = await request.app.mongodb["complaints"].find_one({"_id": complaint_id})
        if not complaint:
            raise HTTPException(status_code=404, detail="Complaint not found")
        
        # Check permissions
        if (current_user.role == UserRole.CITIZEN and 
            complaint["citizen_id"] != current_user.email):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to view this complaint"
            )
        
        return complaint
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching complaint: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching complaint: {str(e)}"
        )

@router.put("/{complaint_id}", response_model=Complaint)
async def update_complaint(
    complaint_id: str,
    request: Request,
    status: Optional[ComplaintStatus] = None,
    resolution_eta: Optional[datetime] = None,
    current_user: dict = Depends(check_permissions(UserRole.OFFICER, UserRole.ADMIN))
):
    update_data = {"last_updated": datetime.utcnow()}
    if status:
        update_data["status"] = status
    if resolution_eta:
        update_data["resolution_eta"] = resolution_eta
        
    result = await request.app.mongodb["complaints"].update_one(
        {"_id": complaint_id},
        {"$set": update_data}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Complaint not found")
        
    return await request.app.mongodb["complaints"].find_one({"_id": complaint_id})

@router.post("/{complaint_id}/image")
async def upload_complaint_image(
    complaint_id: str,
    request: Request,
    file: UploadFile = File(...),
    current_user: dict = Depends(check_permissions(UserRole.CITIZEN))
):
    complaint = await request.app.mongodb["complaints"].find_one({"_id": complaint_id})
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")
        
    if complaint["citizen_id"] != current_user.email:
        raise HTTPException(status_code=403, detail="Not authorized to update this complaint")
    
    # Upload to Cloudinary
    try:
        contents = await file.read()
        upload_result = cloudinary.uploader.upload(
            contents,
            folder="complaints",
            public_id=f"{complaint_id}_{datetime.utcnow().timestamp()}",
            resource_type="auto"
        )
        
        # Update complaint with image URL
        await request.app.mongodb["complaints"].update_one(
            {"_id": complaint_id},
            {"$set": {"image_url": upload_result["secure_url"]}}
        )
        
        return {"image_url": upload_result["secure_url"]}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error uploading image: {str(e)}") 