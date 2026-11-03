"""
Pytest Fixtures for FastAPI TestClient and Database
"""

import os
import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.core.config import settings

@pytest.fixture(scope="session")
def client():
    with TestClient(app) as test_client:
        yield test_client

@pytest.fixture(scope="session")
def auth_headers(client):
    response = client.post(
        f"{settings.API_V1_STR}/auth/login",
        json={"email": settings.DEFAULT_ADMIN_EMAIL, "password": settings.DEFAULT_ADMIN_PASSWORD}
    )
    assert response.status_code == 200, f"Login failed: {response.text}"
    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}
