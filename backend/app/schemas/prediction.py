from typing import List, Optional
from pydantic import BaseModel, Field

class PredictionRequest(BaseModel):
    transaction_id: Optional[str] = None
    amount: float = Field(..., gt=0, description="Transaction amount in currency")
    merchant_category: str = Field(..., description="e.g. grocery, dining, crypto_exchange, travel, electronics, clothing, gaming")
    time_delta_sec: int = Field(3600, ge=0, description="Seconds since last transaction")
    failed_logins_24h: int = Field(0, ge=0, description="Failed password attempts in past 24 hours")
    device_trust_score: float = Field(0.85, ge=0.0, le=1.0, description="Device trust score between 0.0 and 1.0")
    location_distance_km: float = Field(10.0, ge=0.0, description="Distance from usual billing location in km")
    is_international: int = Field(0, ge=0, le=1, description="1 if international, 0 if domestic")
    is_vpn_or_proxy: int = Field(0, ge=0, le=1, description="1 if VPN/proxy detected, 0 otherwise")
    user_email: Optional[str] = "customer@bank.com"
    save_to_db: Optional[bool] = True

class PredictionResponse(BaseModel):
    transaction_id: str
    fraud_probability: float
    risk_score: int
    risk_level: str
    is_flagged: bool
    risk_factors: List[str]
    model_version: str = "RandomForest-v1.0"
