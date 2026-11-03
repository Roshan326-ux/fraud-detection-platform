from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict

class AlertStatusUpdate(BaseModel):
    status: str # ACTIVE, INVESTIGATING, RESOLVED, DISMISSED
    notes: Optional[str] = None

class AlertResponse(BaseModel):
    id: int
    transaction_id: str
    risk_score: int
    severity: str
    status: str
    notes: Optional[str]
    created_at: datetime
    updated_at: datetime

    # Transaction metadata
    amount: Optional[float] = None
    merchant_category: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)
