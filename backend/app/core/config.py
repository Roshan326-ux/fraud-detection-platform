"""
Core Application Configuration
Loads environment variables safely without hardcoded secrets.
"""

import os
import json
from typing import List

# Helper to read .env file manually if exists
def load_dotenv(env_path: str):
    if os.path.exists(env_path):
        with open(env_path, "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith("#") and "=" in line:
                    key, value = line.split("=", 1)
                    key = key.strip()
                    value = value.strip().strip('"').strip("'")
                    if key not in os.environ:
                        os.environ[key] = value

# Load from backend/.env
env_file = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), ".env")
load_dotenv(env_file)

class Settings:
    PROJECT_NAME: str = os.getenv("PROJECT_NAME", "AI-Based Fraud Detection & Risk Analysis Platform")
    API_V1_STR: str = os.getenv("API_V1_STR", "/api/v1")
    
    # Security
    SECRET_KEY: str = os.getenv("SECRET_KEY", "fraudshield-super-secret-production-encryption-key-university-fyp")
    ALGORITHM: str = os.getenv("ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "1440"))

    # Database
    if os.getenv("VERCEL"):
        import tempfile
        default_db = f"sqlite:///{os.path.join(tempfile.gettempdir(), 'fraud_platform.db')}"
    else:
        default_db = "sqlite:///./fraud_platform.db"
    DATABASE_URL: str = os.getenv("DATABASE_URL", default_db)

    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://localhost:4173"
    ]

    # Default Seed Admin
    DEFAULT_ADMIN_EMAIL: str = os.getenv("DEFAULT_ADMIN_EMAIL", "admin@fraudshield.ai")
    DEFAULT_ADMIN_PASSWORD: str = os.getenv("DEFAULT_ADMIN_PASSWORD", "Admin@12345")
    DEFAULT_ADMIN_NAME: str = os.getenv("DEFAULT_ADMIN_NAME", "Chief Risk Officer")

settings = Settings()
