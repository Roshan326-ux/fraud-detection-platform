"""
Authentication Endpoints
Supports both JSON payload and OAuth2 Form data for maximum frontend/Swagger flexibility.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from typing import Optional
from app.db.session import get_db
from app.core.security import verify_password, create_access_token
from app.models.user import User
from app.schemas.user import UserLogin, Token, UserResponse
from app.api.deps import get_current_user

router = APIRouter()

@router.post("/login", response_model=Token)
def login(
    login_data: UserLogin,
    db: Session = Depends(get_db)
):
    """
    Admin authentication endpoint. Returns a signed JWT Bearer token.
    """
    email = login_data.email
    password = login_data.password

    if not email or not password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email and password are required."
        )

    user = db.query(User).filter(User.email == email).first()
    if not user or not verify_password(password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User account is deactivated."
        )

    token = create_access_token(subject=user.email)
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": user
    }

@router.get("/me", response_model=UserResponse)
def read_current_user(current_user: User = Depends(get_current_user)):
    """
    Returns the currently authenticated admin/analyst profile.
    """
    return current_user
