import pytest
from fastapi import status
from tests.conftest import TEST_EMAIL, TEST_PASSWORD, TEST_NAME

def test_register_success(test_client, mock_db):
    """Test successful user registration"""
    response = test_client.post(
        "/api/auth/register",
        json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD,
            "name": TEST_NAME,
            "role": "citizen"
        }
    )
    assert response.status_code == status.HTTP_201_CREATED
    data = response.json()
    assert "message" in data
    assert data["message"] == "User registered successfully"

def test_register_duplicate_email(test_client, mock_db):
    """Test registration with duplicate email"""
    # First registration
    test_client.post(
        "/api/auth/register",
        json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD,
            "name": TEST_NAME,
            "role": "citizen"
        }
    )
    
    # Second registration with same email
    response = test_client.post(
        "/api/auth/register",
        json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD,
            "name": TEST_NAME,
            "role": "citizen"
        }
    )
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    data = response.json()
    assert "detail" in data
    assert "already registered" in data["detail"].lower()

def test_register_invalid_data(test_client):
    """Test registration with invalid data"""
    # Test with missing required fields
    response = test_client.post(
        "/api/auth/register",
        json={
            "email": TEST_EMAIL
        }
    )
    assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY

    # Test with invalid email format
    response = test_client.post(
        "/api/auth/register",
        json={
            "email": "invalid-email",
            "password": TEST_PASSWORD,
            "name": TEST_NAME,
            "role": "citizen"
        }
    )
    assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY

    # Test with invalid role
    response = test_client.post(
        "/api/auth/register",
        json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD,
            "name": TEST_NAME,
            "role": "invalid_role"
        }
    )
    assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY

def test_login_success(test_client, mock_db):
    """Test successful login"""
    # Register a user first
    test_client.post(
        "/api/auth/register",
        json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD,
            "name": TEST_NAME,
            "role": "citizen"
        }
    )
    
    # Try to login
    response = test_client.post(
        "/api/auth/token",
        data={
            "username": TEST_EMAIL,
            "password": TEST_PASSWORD
        }
    )
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert "access_token" in data
    assert "token_type" in data
    assert data["token_type"] == "bearer"

def test_login_invalid_credentials(test_client, mock_db):
    """Test login with invalid credentials"""
    # Register a user first
    test_client.post(
        "/api/auth/register",
        json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD,
            "name": TEST_NAME,
            "role": "citizen"
        }
    )
    
    # Try to login with wrong password
    response = test_client.post(
        "/api/auth/token",
        data={
            "username": TEST_EMAIL,
            "password": "wrongpassword"
        }
    )
    assert response.status_code == status.HTTP_401_UNAUTHORIZED
    
    # Try to login with non-existent email
    response = test_client.post(
        "/api/auth/token",
        data={
            "username": "nonexistent@example.com",
            "password": TEST_PASSWORD
        }
    )
    assert response.status_code == status.HTTP_401_UNAUTHORIZED

@pytest.mark.asyncio
async def test_protected_route(test_client, test_token):
    """Test accessing a protected route with valid token"""
    response = test_client.get(
        "/api/auth/me",
        headers={"Authorization": f"Bearer {test_token}"}
    )
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert "email" in data
    assert data["email"] == TEST_EMAIL

def test_protected_route_no_token(test_client):
    """Test accessing a protected route without token"""
    response = test_client.get("/api/auth/me")
    assert response.status_code == status.HTTP_401_UNAUTHORIZED

def test_protected_route_invalid_token(test_client):
    """Test accessing a protected route with invalid token"""
    response = test_client.get(
        "/api/auth/me",
        headers={"Authorization": "Bearer invalid_token"}
    )
    assert response.status_code == status.HTTP_401_UNAUTHORIZED 