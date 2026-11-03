"""
Alerts & Security Incident Management API
"""

from typing import List, Optional
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import desc
from app.db.session import get_db
from app.models.alert import Alert
from app.models.transaction import Transaction
from app.schemas.alert import AlertResponse, AlertStatusUpdate

router = APIRouter()

@router.get("/", response_model=List[AlertResponse])
def get_alerts(
    status_filter: Optional[str] = Query(None, description="Filter by ACTIVE, INVESTIGATING, RESOLVED, DISMISSED"),
    limit: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db)
):
    """
    Lists suspicious transaction alerts with associated transaction amounts and merchant details.
    """
    query = db.query(Alert, Transaction).outerjoin(
        Transaction, Alert.transaction_id == Transaction.transaction_id
    )

    if status_filter:
        query = query.filter(Alert.status == status_filter.upper())

    results = query.order_by(desc(Alert.created_at)).limit(limit).all()

    response = []
    for alert, txn in results:
        response.append({
            "id": alert.id,
            "transaction_id": alert.transaction_id,
            "risk_score": alert.risk_score,
            "severity": alert.severity,
            "status": alert.status,
            "notes": alert.notes,
            "created_at": alert.created_at,
            "updated_at": alert.updated_at,
            "amount": txn.amount if txn else 0.0,
            "merchant_category": txn.merchant_category if txn else "Unknown"
        })
    return response

@router.patch("/{alert_id}/status", response_model=AlertResponse)
def update_alert_status(
    alert_id: int,
    payload: AlertStatusUpdate,
    db: Session = Depends(get_db)
):
    """
    Updates the operational triage status of an alert (e.g., mark as RESOLVED or INVESTIGATING).
    """
    alert = db.query(Alert).filter(Alert.id == alert_id).first()
    if not alert:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Alert #{alert_id} not found."
        )

    valid_statuses = ["ACTIVE", "INVESTIGATING", "RESOLVED", "DISMISSED"]
    new_status = payload.status.upper()
    if new_status not in valid_statuses:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid status. Choose from: {', '.join(valid_statuses)}"
        )

    alert.status = new_status
    if payload.notes:
        alert.notes = payload.notes
    alert.updated_at = datetime.now(timezone.utc)

    db.commit()
    db.refresh(alert)

    txn = db.query(Transaction).filter(Transaction.transaction_id == alert.transaction_id).first()

    return {
        "id": alert.id,
        "transaction_id": alert.transaction_id,
        "risk_score": alert.risk_score,
        "severity": alert.severity,
        "status": alert.status,
        "notes": alert.notes,
        "created_at": alert.created_at,
        "updated_at": alert.updated_at,
        "amount": txn.amount if txn else 0.0,
        "merchant_category": txn.merchant_category if txn else "Unknown"
    }
