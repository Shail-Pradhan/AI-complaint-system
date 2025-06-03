from fastapi import APIRouter, Depends, Request, HTTPException, status
from models.models import UserRole
from utils.auth import get_current_user, check_permissions
from datetime import datetime, timedelta
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter()

@router.get("/citizen-stats")
async def get_citizen_stats(
    request: Request,
    current_user: dict = Depends(check_permissions(UserRole.CITIZEN))
):
    """Get statistics for citizen dashboard"""
    try:
        logger.info(f"Fetching stats for user: {current_user}")
        
        # Get all complaints by the citizen
        total_complaints = await request.app.mongodb["complaints"].count_documents({
            "citizen_id": current_user.email  # Using email as identifier
        })
        logger.info(f"Total complaints: {total_complaints}")
        
        # Get active (pending + in_progress) complaints
        active_complaints = await request.app.mongodb["complaints"].count_documents({
            "citizen_id": current_user.email,
            "status": {"$in": ["pending", "in_progress"]}
        })
        logger.info(f"Active complaints: {active_complaints}")
        
        # Get resolved complaints
        resolved_complaints = await request.app.mongodb["complaints"].count_documents({
            "citizen_id": current_user.email,
            "status": "resolved"
        })
        logger.info(f"Resolved complaints: {resolved_complaints}")
        
        # Get recent complaints
        recent_complaints = await request.app.mongodb["complaints"].find({
            "citizen_id": current_user.email
        }).sort("created_at", -1).limit(5).to_list(5)
        logger.info(f"Recent complaints count: {len(recent_complaints)}")
        
        return {
            "total_complaints": total_complaints,
            "active_complaints": active_complaints,
            "resolved_complaints": resolved_complaints,
            "recent_complaints": recent_complaints
        }
        
    except Exception as e:
        logger.error(f"Error getting citizen stats: {str(e)}")
        logger.error(f"Current user data: {current_user}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error getting statistics: {str(e)}"
        ) 