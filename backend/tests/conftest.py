import pytest
from fastapi.testclient import TestClient
from motor.motor_asyncio import AsyncIOMotorClient
import mongomock
import asyncio
from main import app
from datetime import datetime, timedelta
from jose import jwt
from typing import Generator
import os
from dotenv import load_dotenv

load_dotenv()

# Test configurations
TEST_EMAIL = "test@example.com"
TEST_PASSWORD = "testpass123"
TEST_NAME = "Test User"

@pytest.fixture
def test_client() -> Generator:
    client = TestClient(app)
    yield client

@pytest.fixture
def mock_db():
    """Create a mock MongoDB client"""
    client = mongomock.MongoClient()
    db = client.complaint_system
    return db

@pytest.fixture
def event_loop():
    """Create an instance of the default event loop for each test case"""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()

@pytest.fixture
async def test_app(mock_db):
    """Configure the app for testing"""
    app.mongodb_client = AsyncIOMotorClient()
    app.mongodb = mock_db
    yield app

@pytest.fixture
def test_user():
    """Create a test user object"""
    return {
        "email": TEST_EMAIL,
        "password": TEST_PASSWORD,
        "name": TEST_NAME,
        "role": "citizen"
    }

@pytest.fixture
def test_token(test_user):
    """Create a test JWT token"""
    secret_key = os.getenv("SECRET_KEY", "your-secret-key")
    algorithm = "HS256"
    expires_delta = timedelta(minutes=30)
    
    expire = datetime.utcnow() + expires_delta
    to_encode = {
        "exp": expire,
        "sub": test_user["email"],
        "role": test_user["role"]
    }
    encoded_jwt = jwt.encode(to_encode, secret_key, algorithm=algorithm)
    return encoded_jwt 