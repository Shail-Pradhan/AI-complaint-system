import os
import logging
from groq import Groq
from typing import Dict, Tuple
from datetime import datetime

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize Groq client
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
if not GROQ_API_KEY:
    logger.error("GROQ_API_KEY is not set in environment variables")
    raise ValueError("GROQ_API_KEY is required")

groq_client = Groq(api_key=GROQ_API_KEY)

# Department name to ID mapping
DEPARTMENT_MAPPING = {
    "Roads and Bridges Department": "ROADS_001",
    "Social Welfare Department": "SOCIAL_001",
    "Public Health Department": "HEALTH_001",
    "Public Works Department": "WORKS_001"
}

SYSTEM_PROMPT = """You are an AI assistant that analyzes citizen complaints and provides:
1. The most appropriate department to handle the complaint
2. A priority score from 1 to 10 (10 being highest priority)
3. A category prediction
4. A brief analysis of the complaint
5. Officer assignment recommendation based on the complaint nature

Base your analysis on the complaint title, description, and location. For officer assignment, consider:
- Complaint complexity and urgency
- Required expertise level
- Geographic location
- Workload implications
"""

async def analyze_complaint_text(complaint: Dict) -> Tuple[str, float, str, str]:
    """
    Analyze complaint text using Groq LLM to determine department, priority, and category.
    
    Args:
        complaint: Dictionary containing complaint details
        
    Returns:
        Tuple of (department_id, priority_score, category, analysis_text)
    """
    try:
        logger.info(f"Starting analysis for complaint: {complaint.get('_id', 'N/A')}")
        logger.info(f"Complaint data: {complaint}")
        
        prompt = f"""
Complaint Title: {complaint['title']}
Description: {complaint['description']}
Location: {complaint['location']}

Please analyze this complaint and provide:
1. Department ID (choose from: Roads and Bridges Department, Social Welfare Department, Public Health Department, Public Works Department)
2. Priority score (1 to 10)
3. Category (infrastructure, sanitation, administration, public_services)
4. Brief analysis
5. Officer assignment recommendation (explain what type of officer would be best suited and why)

Format your response exactly as follows:
Department: <department_name>
Priority: <score>
Category: <category>
Analysis: <your analysis>
Officer Assignment: <your officer assignment recommendation>
"""

        try:
            logger.info("Attempting to call Groq API...")
            # Call Groq API with timeout
            completion = groq_client.chat.completions.create(
                model="llama-3.3-70b-versatile",  # Changed to a more reliable model
                messages=[
                    {"role": "system", "content": SYSTEM_PROMPT},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.1,
                max_tokens=1000,  # Increased token limit
                timeout=60  # Increased timeout
            )
            
            # Get raw response
            raw_response = completion.choices[0].message.content
            logger.info(f"Raw Groq API response: {raw_response}")
            
            # Parse response
            lines = raw_response.strip().split('\n')
            if len(lines) < 5:
                logger.error(f"Incomplete response from Groq API: {raw_response}")
                raise ValueError(f"Incomplete response from Groq API: {raw_response}")
            
            # Extract department name and get ID
            department_line = next((line for line in lines if line.startswith("Department:")), "")
            department_name = department_line.split(": ")[1].strip() if department_line else "Public Works Department"
            department_id = DEPARTMENT_MAPPING.get(department_name, "WORKS_001")
            logger.info(f"Extracted department: {department_name} -> {department_id}")
            
            # Extract priority score
            priority_line = next((line for line in lines if line.startswith("Priority:")), "")
            try:
                priority_score = float(priority_line.split(": ")[1].strip()) / 10.0 if priority_line else 0.5
            except (ValueError, IndexError) as e:
                logger.error(f"Error parsing priority score: {str(e)}")
                priority_score = 0.5
            logger.info(f"Extracted priority score: {priority_score}")
            
            # Extract category
            category_line = next((line for line in lines if line.startswith("Category:")), "")
            category = category_line.split(": ")[1].strip() if category_line else "others"
            logger.info(f"Extracted category: {category}")
            
            # Return the raw response as analysis text
            return department_id, priority_score, category, raw_response
            
        except Exception as api_error:
            logger.error(f"Error calling Groq API: {str(api_error)}")
            logger.error(f"API error details: {api_error.__dict__}")
            raise
            
    except Exception as e:
        logger.error(f"Error in analyze_complaint_text: {str(e)}")
        logger.error(f"Full error details: {e.__dict__}")
        return (
            "WORKS_001",
            0.5,
            "others",
            f"Error during AI analysis: {str(e)}. Please try again or contact support if the issue persists."
        )

async def analyze_complaint_image(image_url: str) -> Dict:
    """
    Analyze complaint image using BLIP model (placeholder for future implementation).
    
    Args:
        image_url: URL of the complaint image
        
    Returns:
        Dictionary containing image analysis results
    """
    logger.info(f"Image analysis requested for URL: {image_url}")
    # TODO: Implement image analysis using BLIP model
    return {
        "objects_detected": [],
        "scene_description": "Image analysis not implemented yet",
        "severity_score": 0.5
    } 