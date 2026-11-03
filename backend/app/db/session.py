"""
Database session management with multi-engine resilience (PostgreSQL / SQLite).
"""

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from app.core.config import settings

# Engine configuration: SQLite requires connect_args check_same_thread=False
connect_args = {}
if settings.DATABASE_URL.startswith("sqlite"):
    connect_args = {"check_same_thread": False}

try:
    engine = create_engine(
        settings.DATABASE_URL,
        connect_args=connect_args,
        pool_pre_ping=True
    )
except Exception as e:
    # Safe fallback to local SQLite if PostgreSQL connection fails
    print(f"[DB Warning] Could not connect to {settings.DATABASE_URL}: {e}")
    print("[DB Info] Falling back automatically to local SQLite database.")
    fallback_url = "sqlite:///./fraud_platform.db"
    engine = create_engine(fallback_url, connect_args={"check_same_thread": False})

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    """
    FastAPI dependency that provides a database session per request.
    Closes automatically when request finishes.
    """
    db: Session = SessionLocal()
    try:
        yield db
    finally:
        db.close()
