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
    "Land Revenue and Disaster Management Department": "LAND_001",
    "Health & Family Welfare Department": "HEALTH_001",
    "Human Resource Development Department": "HRD_001",
    "Energy & Power Department": "ENERGY_001",
    "Public Health Engineering Department": "PHE_001",
    "Transport Department": "TRANS_001",
    "Roads & Bridges Department": "ROADS_001",
    "Rural Management & Development Department": "RURAL_001",
    "Urban Development & Housing Department": "URBAN_001",
    "Forest, Environment & Wildlife Management Department": "FOREST_001",
    "Tourism & Civil Aviation Department": "TOURISM_001",
    "Excise Department": "EXCISE_001"
}
# Department name to Officer name mapping
DEPARTMENT_OFFICERS = {
    "Land Revenue and Disaster Management Department": ["Tenzing Bhutia – Senior Land Records Officer", "Mina Subba – Disaster Risk Management Coordinator"],
    "Health & Family Welfare Department": ["Dr. Pema Lepcha – Chief Medical Officer", "Rinchen Gurung – Family Welfare Program Officer"],
    "Human Resource Development Department": ["Karma Tamang – Education Policy Officer", "Anita Chettri – HRD Program Manager"],
    "Energy & Power Department": ["Sonam Sherpa – Electrical Grid Supervisor", "Dipen Rai – Renewable Energy Project Lead"],
    "Public Health Engineering Department": ["Dawa Bhutia – Sanitation Infrastructure Officer", "Sunita Pradhan – Rural Water Supply Engineer"],
    "Transport Department": ["Raju Moktan – Regional Transport Officer", "Tshering Lhamu – Traffic and Safety Analyst"],
    "Roads & Bridges Department": ["Nima Lepcha – Structural Engineer", "Bikash Kharel – Highway Maintenance Officer"],
    "Rural Management & Development Department": ["Puspa Thapa – Rural Project Coordinator", "Dorjee Bhutia – Community Development Officer"],
    "Urban Development & Housing Department": ["Rinzin Ongmu – Urban Planning Officer", "Sanjay Rai – Housing Welfare Manager"],
    "Forest, Environment & Wildlife Management Department": ["Tashi Norbu – Wildlife Conservation Officer", "Meena Gurung – Environmental Monitoring Analyst"],
    "Tourism & Civil Aviation Department": ["Sonam Lhamu – Tourism Operations Director", "Dichen Rai – Civil Aviation Liaison Officer"],
    "Excise Department": ["Bikram Subba – Excise Control Officer", "Lhamu Tamang – Licensing and Enforcement Officer"]
}

SYSTEM_PROMPT = """You are an AI assistant that analyzes citizen complaints and provides structured analysis.
Your responses must be extremely concise and actionable.

For each complaint, provide:
1. Department assignment (select from the provided list)
2. Priority score (1-10, where 10 is highest)
3. Brief analysis (ONE clear, specific sentence about impact)
4. Officer recommendation (ONE sentence specifying which officer from the assigned department should handle this case and why)

Keep all responses brief and focused."""

async def analyze_complaint_text(complaint: Dict) -> Tuple[str, float, str]:
    """
    Analyze complaint text using Groq LLM to determine department and priority.
    
    Args:
        complaint: Dictionary containing complaint details
        
    Returns:
        Tuple of (department_id, priority_score, analysis_text)
    """
    try:
        logger.info(f"Starting analysis for complaint: {complaint.get('_id', 'N/A')}")
        
        prompt = f"""
Complaint Title: {complaint['title']}
Description: {complaint['description']}
Location: {complaint['location']}
District: {complaint.get('district', 'N/A')}

Analyze this complaint and provide a structured response with these exact sections:

Department: [Select ONE most appropriate department]
Priority: [Score 1-10]
Analysis: [One sentence about the issue and its impact]
Officer: [Recommend ONE specific officer from the department and explain why they are best suited]

Available Departments and Officers:

- Land Revenue and Disaster Management Department
   - Tenzing Bhutia – Senior Land Records Officer
   - Mina Subba – Disaster Risk Management Coordinator

- Health & Family Welfare Department
   - Dr. Pema Lepcha – Chief Medical Officer
   - Rinchen Gurung – Family Welfare Program Officer

- Human Resource Development Department
   - Karma Tamang – Education Policy Officer
   - Anita Chettri – HRD Program Manager

- Energy & Power Department
   - Sonam Sherpa – Electrical Grid Supervisor
   - Dipen Rai – Renewable Energy Project Lead

- Public Health Engineering Department
   - Dawa Bhutia – Sanitation Infrastructure Officer
   - Sunita Pradhan – Rural Water Supply Engineer

- Transport Department
   - Raju Moktan – Regional Transport Officer
   - Tshering Lhamu – Traffic and Safety Analyst

- Roads & Bridges Department
   - Nima Lepcha – Structural Engineer
   - Bikash Kharel – Highway Maintenance Officer

- Rural Management & Development Department
   - Puspa Thapa – Rural Project Coordinator
   - Dorjee Bhutia – Community Development Officer

- Urban Development & Housing Department
   - Rinzin Ongmu – Urban Planning Officer
   - Sanjay Rai – Housing Welfare Manager

- Forest, Environment & Wildlife Management Department
    - Tashi Norbu – Wildlife Conservation Officer
    - Meena Gurung – Environmental Monitoring Analyst

- Tourism & Civil Aviation Department
    - Sonam Lhamu – Tourism Operations Director
    - Dichen Rai – Civil Aviation Liaison Officer

- Excise Department
    - Bikram Subba – Excise Control Officer
    - Lhamu Tamang – Licensing and Enforcement Officer

Format your response exactly as shown below:
Department: [Full department name]
Priority: [1-10]
Analysis: [One sentence analysis]
Officer: [Specific officer name and title] should handle this case because [brief reason]"""

        try:
            logger.info("Attempting to call Groq API...")
            # Call Groq API with timeout
            completion = groq_client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=[
                    {"role": "system", "content": SYSTEM_PROMPT},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.1,
                max_tokens=1000,
                timeout=60
            )
            
            # Get raw response
            raw_response = completion.choices[0].message.content
            logger.info(f"Raw Groq API response: {raw_response}")
            
            # Parse response
            lines = raw_response.strip().split('\n')
            if len(lines) < 4:  # Updated to check for 4 sections instead of 5
                logger.error(f"Incomplete response from Groq API: {raw_response}")
                raise ValueError(f"Incomplete response from Groq API: {raw_response}")
            
            # Extract department name and get ID
            department_line = next((line for line in lines if line.startswith("Department:")), "")
            department_name = department_line.split(": ")[1].strip() if department_line else "Public Health Engineering Department"
            department_id = DEPARTMENT_MAPPING.get(department_name, "PHE_001")
            
            # Extract priority score
            priority_line = next((line for line in lines if line.startswith("Priority:")), "")
            try:
                priority_score = float(priority_line.split(": ")[1].strip()) / 10.0 if priority_line else 0.5
            except (ValueError, IndexError) as e:
                logger.error(f"Error parsing priority score: {str(e)}")
                priority_score = 0.5
            
            # Return the raw response as analysis text
            return department_id, priority_score, raw_response
            
        except Exception as api_error:
            logger.error(f"Error calling Groq API: {str(api_error)}")
            raise
            
    except Exception as e:
        logger.error(f"Error in analyze_complaint_text: {str(e)}")
        return (
            "PHE_001",
            0.5,
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