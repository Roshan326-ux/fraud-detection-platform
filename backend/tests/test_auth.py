"""
Authentication Tests: Login, Token Verification, Profile
"""

from app.core.config import settings

def test_root_endpoint(client):
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "OPERATIONAL"

def test_login_success(client):
    response = client.post(
        f"{settings.API_V1_STR}/auth/login",
        json={
            "email": settings.DEFAULT_ADMIN_EMAIL,
            "password": settings.DEFAULT_ADMIN_PASSWORD
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert data["user"]["email"] == settings.DEFAULT_ADMIN_EMAIL

def test_login_invalid_password(client):
    response = client.post(
        f"{settings.API_V1_STR}/auth/login",
        json={
            "email": settings.DEFAULT_ADMIN_EMAIL,
            "password": "WrongPassword999!"
        }
    )
    assert response.status_code == 401
    assert "Invalid email or password" in response.json()["detail"]

def test_get_current_user_profile(client, auth_headers):
    response = client.get(f"{settings.API_V1_STR}/auth/me", headers=auth_headers)
    assert response.status_code == 200
    user_data = response.json()
    assert user_data["email"] == settings.DEFAULT_ADMIN_EMAIL
    assert user_data["role"] == "admin"
