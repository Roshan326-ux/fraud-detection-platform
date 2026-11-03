"""
API v1 Central Router
"""

from fastapi import APIRouter
from app.api.v1.auth import router as auth_router
from app.api.v1.prediction import router as prediction_router
from app.api.v1.transactions import router as transactions_router
from app.api.v1.alerts import router as alerts_router
from app.api.v1.analytics import router as analytics_router
from app.api.v1.reports import router as reports_router

api_router = APIRouter()

api_router.include_router(auth_router, prefix="/auth", tags=["Authentication"])
api_router.include_router(prediction_router, prefix="/predict", tags=["Real-Time Prediction"])
api_router.include_router(transactions_router, prefix="/transactions", tags=["Transactions"])
api_router.include_router(alerts_router, prefix="/alerts", tags=["Alerts & Triage"])
api_router.include_router(analytics_router, prefix="/analytics", tags=["Analytics & KPIs"])
api_router.include_router(reports_router, prefix="/reports", tags=["Reports"])
