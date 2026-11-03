"""
Security Alert Model
Triggered when high/medium risk transactions require human or automated intervention.
"""

from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, DateTime, Text
from app.db.base import Base

class Alert(Base):
    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True, index=True)
    transaction_id = Column(String(100), index=True, nullable=False)
    risk_score = Column(Integer, nullable=False)
    severity = Column(String(20), nullable=False, default="HIGH") # MEDIUM, HIGH, CRITICAL
    status = Column(String(50), nullable=False, default="ACTIVE") # ACTIVE, INVESTIGATING, RESOLVED, DISMISSED
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False, index=True)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)
