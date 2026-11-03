"""
FastAPI Application Entry Point
"""

from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.v1.api_router import api_router
from app.db.init_db import init_db

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Initialize tables and seed data
    print("[Startup] Initializing Database and Pre-loading Seed Data...")
    init_db()
    yield
    # Shutdown logic if any
    print("[Shutdown] Cleaning up application resources.")

app = FastAPI(
    title=settings.PROJECT_NAME,
    version="1.0.0",
    description="Enterprise REST API for AI-based transaction fraud detection, risk scoring (0-100), security alerts, and analytics.",
    lifespan=lifespan
)

# CORS Middleware configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allows frontend dev servers
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API Routers
app.include_router(api_router, prefix=settings.API_V1_STR)

@app.get("/", tags=["System"])
def root():
    return {
        "platform": settings.PROJECT_NAME,
        "version": "1.0.0",
        "status": "OPERATIONAL",
        "docs_url": "/docs",
        "api_v1": settings.API_V1_STR
    }

@app.get("/health", tags=["System"])
def health_check():
    return {
        "status": "healthy",
        "service": "Fraud Detection API",
        "ml_engine": "Scikit-Learn Random Forest Pipeline"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
