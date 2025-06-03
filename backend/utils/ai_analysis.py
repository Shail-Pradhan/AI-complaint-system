import os
from groq import Groq
from typing import Dict, Tuple
from datetime import datetime

# Initialize Groq client
groq_client = Groq(
    api_key=os.getenv("GROQ_API_KEY")
)

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
        # Call Groq API
        completion = groq_client.chat.completions.create(
            model="llama-3.3-70b-versatile",  # Using Llama 3.3 70B model which is currently supported
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": prompt}
            ],
            temperature=0.1,  # Low temperature for consistent results
            max_tokens=500
        )
        
        # Parse response
        response = completion.choices[0].message.content
        lines = response.strip().split('\n')
        
        department_name = lines[0].split(': ')[1].strip()
        priority_score = float(lines[1].split(': ')[1]) / 10.0  # Convert 1-10 score to 0-1
        category = lines[2].split(': ')[1].strip()
        analysis = lines[3].split(': ')[1].strip()
        officer_recommendation = lines[4].split(': ')[1].strip()
        
        # Map department name to ID
        department_id = DEPARTMENT_MAPPING.get(department_name, "WORKS_001")  # Default to Public Works if unknown
        
        # Combine analysis and officer recommendation
        full_analysis = f"{analysis}\n\nOfficer Assignment Recommendation: {officer_recommendation}"
        
        return department_id, priority_score, category, full_analysis
        
    except Exception as e:
        # Fallback values in case of API error
        return (
            "WORKS_001",  # Default to Public Works department
            0.5,  # Medium priority
            "others",  # Default category
            f"Error during AI analysis: {str(e)}"
        )

async def analyze_complaint_image(image_url: str) -> Dict:
    """
    Analyze complaint image using BLIP model (placeholder for future implementation).
    
    Args:
        image_url: URL of the complaint image
        
    Returns:
        Dictionary containing image analysis results
    """
    # TODO: Implement image analysis using BLIP model
    return {
        "objects_detected": [],
        "scene_description": "Image analysis not implemented yet",
        "severity_score": 0.5
    } 