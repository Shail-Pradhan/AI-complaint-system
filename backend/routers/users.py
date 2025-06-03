from fastapi import APIRouter, Depends, HTTPException, status, Request
from models.models import User, UserRole
from utils.auth import get_current_user, check_permissions
from typing import List
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter()

@router.get("/me", response_model=User)
async def get_current_user_info(
    request: Request,
    current_user = Depends(get_current_user)
):
    """Get current user's information"""
    try:
        user = await request.app.mongodb["users"].find_one({"email": current_user.email})
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        return user
    except Exception as e:
        logger.error(f"Error getting user info: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error retrieving user information"
        )

@router.get("/", response_model=List[User])
async def get_users(
    request: Request,
    current_user = Depends(check_permissions(UserRole.ADMIN))
):
    """Get all users (admin only)"""
    try:
        users = await request.app.mongodb["users"].find().to_list(1000)
        return users
    except Exception as e:
        logger.error(f"Error getting users: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error retrieving users"
        ) 