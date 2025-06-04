from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List, Dict
from datetime import datetime
from enum import Enum
from bson import ObjectId

class UserRole(str, Enum):
    CITIZEN = "citizen"
    OFFICER = "officer"
    ADMIN = "admin"

class ComplaintCategory(str, Enum):
    INFRASTRUCTURE = "infrastructure"
    PUBLIC_SERVICES = "public_services"
    ADMINISTRATION = "administration"
    SANITATION = "sanitation"
    OTHERS = "others"

class ComplaintStatus(str, Enum):
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    RESOLVED = "resolved"
    ESCALATED = "escalated"

class UserBase(BaseModel):
    email: EmailStr
    name: str
    role: UserRole
    contact: Optional[str] = None
    location: Optional[str] = None
    department_id: Optional[str] = None
    active_complaints: Optional[List[str]] = Field(default_factory=list)

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: Optional[str] = Field(alias="_id")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    last_updated: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True
        json_encoders = {
            datetime: lambda v: v.isoformat(),
            ObjectId: lambda v: str(v)
        }
        json_schema_extra = {
            "example": {
                "email": "user@example.com",
                "name": "John Doe",
                "role": "citizen",
                "contact": "1234567890",
                "location": "City",
                "department_id": None,
                "active_complaints": []
            }
        }

class UserInDB(User):
    hashed_password: str

    class Config:
        populate_by_name = True
        json_encoders = {
            datetime: lambda v: v.isoformat(),
            ObjectId: lambda v: str(v)
        }

class ComplaintBase(BaseModel):
    title: str
    description: str
    category: ComplaintCategory
    location: str
    image_url: Optional[str] = None

class ComplaintCreate(ComplaintBase):
    citizen_id: str

class AIAnalysis(BaseModel):
    id: str = Field(alias="_id")
    complaint_id: str
    department_id: str
    category_prediction: str
    priority_score: float
    analysis_text: str
    officer_recommendation: str
    version: str
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True
        json_encoders = {
            datetime: lambda v: v.isoformat(),
            ObjectId: lambda v: str(v)
        }

class Complaint(ComplaintBase):
    id: str = Field(alias="_id")
    citizen_id: str
    status: ComplaintStatus = ComplaintStatus.PENDING
    department_id: Optional[str] = None
    assigned_to: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    last_updated: datetime = Field(default_factory=datetime.utcnow)
    resolution_eta: Optional[datetime] = None
    ai_analysis: Optional[Dict] = None

    class Config:
        populate_by_name = True
        json_encoders = {
            datetime: lambda v: v.isoformat(),
            ObjectId: lambda v: str(v)
        }

class DepartmentBase(BaseModel):
    name: str
    description: str
    area_of_jurisdiction: str

class Department(DepartmentBase):
    id: str = Field(alias="_id")
    created_at: datetime = Field(default_factory=datetime.utcnow)

class RedressalActionBase(BaseModel):
    complaint_id: str
    officer_id: str
    action_description: str

class RedressalAction(RedressalActionBase):
    id: str = Field(alias="_id")
    created_at: datetime = Field(default_factory=datetime.utcnow)

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: str
    role: UserRole 