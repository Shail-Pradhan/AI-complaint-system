import pytest
from fastapi.testclient import TestClient
from main import app
from models.models import UserRole
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

client = TestClient(app)

def test_login_flow():
    # 1. First register a test user
    register_data = {
        "email": "testlogin@example.com",
        "password": "testpass123",
        "name": "Test Login User",
        "role": UserRole.CITIZEN,
        "contact": "1234567890",
        "location": "Test City"
    }
    
    response = client.post("/api/auth/register", json=register_data)
    assert response.status_code == 200, f"Registration failed: {response.text}"
    
    # 2. Try to login with correct credentials
    login_data = {
        "username": "testlogin@example.com",
        "password": "testpass123"
    }
    
    response = client.post("/api/auth/token", data=login_data)
    assert response.status_code == 200, f"Login failed: {response.text}"
    
    json_response = response.json()
    assert "access_token" in json_response
    assert "token_type" in json_response
    assert json_response["token_type"] == "bearer"
    
    # 3. Try to login with wrong password
    wrong_password_data = {
        "username": "testlogin@example.com",
        "password": "wrongpass"
    }
    
    response = client.post("/api/auth/token", data=wrong_password_data)
    assert response.status_code == 401
    
    # 4. Try to login with non-existent user
    nonexistent_user_data = {
        "username": "nonexistent@example.com",
        "password": "testpass123"
    }
    
    response = client.post("/api/auth/token", data=nonexistent_user_data)
    assert response.status_code == 401

if __name__ == "__main__":
    pytest.main([__file__]) 