"""
Fraud Prediction Model
Stores the AI model's scored output, risk score (0-100), and explainable risk factors.
"""

from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, Text
from app.db.base import Base

class FraudPrediction(Base):
    __tablename__ = "fraud_predictions"

    id = Column(Integer, primary_key=True, index=True)
    transaction_id = Column(String(100), index=True, nullable=False)
    fraud_probability = Column(Float, nullable=False)
    risk_score = Column(Integer, nullable=False, index=True) # 0 to 100
    risk_level = Column(String(20), nullable=False, index=True) # LOW, MEDIUM, HIGH
    is_flagged = Column(Boolean, nullable=False, default=False)
    risk_factors_json = Column(Text, nullable=False, default="[]")
    model_version = Column(String(50), default="RandomForest-v1.0", nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False, index=True)
