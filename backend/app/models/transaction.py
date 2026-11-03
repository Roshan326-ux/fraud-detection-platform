"""
Transaction Model
Represents historical, real-time, and batch-uploaded digital transactions.
"""

from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Float, DateTime
from app.db.base import Base

class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    transaction_id = Column(String(100), unique=True, index=True, nullable=False)
    user_email = Column(String(255), nullable=True, default="customer@bank.com")
    amount = Column(Float, nullable=False, index=True)
    merchant_category = Column(String(100), nullable=False, index=True)
    
    # Behavioral Risk Features
    time_delta_sec = Column(Integer, nullable=False, default=3600)
    failed_logins_24h = Column(Integer, nullable=False, default=0)
    device_trust_score = Column(Float, nullable=False, default=0.85)
    location_distance_km = Column(Float, nullable=False, default=15.0)
    is_international = Column(Integer, nullable=False, default=0)
    is_vpn_or_proxy = Column(Integer, nullable=False, default=0)
    
    # Ground truth (if historical/labeled)
    actual_label = Column(Integer, nullable=True) # 0 = Legit, 1 = Fraud (if known)
    
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False, index=True)
