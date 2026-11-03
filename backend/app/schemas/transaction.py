from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, ConfigDict

class TransactionCreate(BaseModel):
    transaction_id: Optional[str] = None
    user_email: Optional[str] = "customer@bank.com"
    amount: float
    merchant_category: str
    time_delta_sec: int = 3600
    failed_logins_24h: int = 0
    device_trust_score: float = 0.85
    location_distance_km: float = 15.0
    is_international: int = 0
    is_vpn_or_proxy: int = 0

class TransactionResponse(BaseModel):
    id: int
    transaction_id: str
    user_email: Optional[str]
    amount: float
    merchant_category: str
    time_delta_sec: int
    failed_logins_24h: int
    device_trust_score: float
    location_distance_km: float
    is_international: int
    is_vpn_or_proxy: int
    created_at: datetime

    # Associated AI prediction info (joined)
    risk_score: Optional[int] = 0
    risk_level: Optional[str] = "LOW"
    is_flagged: Optional[bool] = False

    model_config = ConfigDict(from_attributes=True)

class TransactionDetailResponse(TransactionResponse):
    fraud_probability: Optional[float] = 0.0
    risk_factors: List[str] = []

class BatchUploadResponse(BaseModel):
    total_processed: int
    flagged_fraud_count: int
    fraud_rate_percentage: float
    high_risk_count: int
    medium_risk_count: int
    low_risk_count: int
    alerts_created: int
