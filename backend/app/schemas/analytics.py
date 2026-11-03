from typing import List, Dict, Any
from pydantic import BaseModel

class OverviewStats(BaseModel):
    total_transactions: int
    flagged_transactions: int
    fraud_rate_percentage: float
    total_volume_usd: float
    at_risk_amount_usd: float
    active_alerts_count: int
    high_risk_count: int
    medium_risk_count: int
    low_risk_count: int

class CategoryRiskStat(BaseModel):
    category: str
    total_count: int
    fraud_count: int
    fraud_rate: float
    total_amount: float

class TrendPoint(BaseModel):
    label: str
    total_count: int
    fraud_count: int
    total_amount: float
