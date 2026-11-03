"""
Transactions API: Search, Filtering, Inspection, and CSV Batch Upload
"""

import io
import json
import uuid
from typing import List, Optional
import pandas as pd
from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File, status
from sqlalchemy.orm import Session
from sqlalchemy import desc, or_
from app.db.session import get_db
from app.models.transaction import Transaction
from app.models.prediction import FraudPrediction
from app.models.alert import Alert
from app.schemas.transaction import TransactionResponse, TransactionDetailResponse, BatchUploadResponse
from ml_pipeline.predict import predictor

router = APIRouter()

@router.get("/", response_model=List[TransactionResponse])
def get_transactions(
    search: Optional[str] = Query(None, description="Search by transaction ID or user email"),
    risk_level: Optional[str] = Query(None, description="Filter by LOW, MEDIUM, HIGH"),
    merchant_category: Optional[str] = Query(None, description="Filter by merchant sector"),
    page: int = Query(1, ge=1),
    limit: int = Query(25, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """
    Lists transactions joined with their AI prediction risk levels.
    Supports live searching, category filtering, and risk tier filters.
    """
    query = db.query(Transaction, FraudPrediction).outerjoin(
        FraudPrediction, Transaction.transaction_id == FraudPrediction.transaction_id
    )

    if search:
        search_fmt = f"%{search}%"
        query = query.filter(
            or_(
                Transaction.transaction_id.ilike(search_fmt),
                Transaction.user_email.ilike(search_fmt)
            )
        )

    if merchant_category:
        query = query.filter(Transaction.merchant_category == merchant_category.lower())

    if risk_level:
        query = query.filter(FraudPrediction.risk_level == risk_level.upper())

    # Order newest first
    offset = (page - 1) * limit
    results = query.order_by(desc(Transaction.created_at)).offset(offset).limit(limit).all()

    response = []
    for txn, pred in results:
        item = {
            "id": txn.id,
            "transaction_id": txn.transaction_id,
            "user_email": txn.user_email,
            "amount": txn.amount,
            "merchant_category": txn.merchant_category,
            "time_delta_sec": txn.time_delta_sec,
            "failed_logins_24h": txn.failed_logins_24h,
            "device_trust_score": txn.device_trust_score,
            "location_distance_km": txn.location_distance_km,
            "is_international": txn.is_international,
            "is_vpn_or_proxy": txn.is_vpn_or_proxy,
            "created_at": txn.created_at,
            "risk_score": pred.risk_score if pred else 0,
            "risk_level": pred.risk_level if pred else "LOW",
            "is_flagged": pred.is_flagged if pred else False
        }
        response.append(item)

    return response

@router.get("/{txn_id}", response_model=TransactionDetailResponse)
def get_transaction_details(txn_id: str, db: Session = Depends(get_db)):
    """
    Detailed inspection of a specific transaction including top AI risk factors.
    """
    row = db.query(Transaction, FraudPrediction).outerjoin(
        FraudPrediction, Transaction.transaction_id == FraudPrediction.transaction_id
    ).filter(Transaction.transaction_id == txn_id).first()

    if not row:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Transaction '{txn_id}' not found."
        )

    txn, pred = row
    risk_factors = []
    if pred and pred.risk_factors_json:
        try:
            risk_factors = json.loads(pred.risk_factors_json)
        except Exception:
            risk_factors = []

    return {
        "id": txn.id,
        "transaction_id": txn.transaction_id,
        "user_email": txn.user_email,
        "amount": txn.amount,
        "merchant_category": txn.merchant_category,
        "time_delta_sec": txn.time_delta_sec,
        "failed_logins_24h": txn.failed_logins_24h,
        "device_trust_score": txn.device_trust_score,
        "location_distance_km": txn.location_distance_km,
        "is_international": txn.is_international,
        "is_vpn_or_proxy": txn.is_vpn_or_proxy,
        "created_at": txn.created_at,
        "risk_score": pred.risk_score if pred else 0,
        "risk_level": pred.risk_level if pred else "LOW",
        "is_flagged": pred.is_flagged if pred else False,
        "fraud_probability": pred.fraud_probability if pred else 0.0,
        "risk_factors": risk_factors
    }

@router.post("/batch-upload", response_model=BatchUploadResponse)
async def upload_batch_csv(
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """
    Upload a CSV file containing transactions, execute batch ML scoring,
    and persist results + automated alerts to the database.
    """
    if not file.filename.endswith(".csv"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only CSV files (.csv) are supported."
        )

    content = await file.read()
    try:
        df = pd.read_csv(io.BytesIO(content))
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid CSV structure: {str(e)}"
        )

    required_cols = ['amount', 'merchant_category', 'device_trust_score', 'location_distance_km']
    missing = [c for c in required_cols if c not in df.columns]
    if missing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"CSV missing mandatory columns: {', '.join(missing)}"
        )

    # Defaults for optional columns
    if 'time_delta_sec' not in df.columns:
        df['time_delta_sec'] = 3600
    if 'failed_logins_24h' not in df.columns:
        df['failed_logins_24h'] = 0
    if 'is_international' not in df.columns:
        df['is_international'] = 0
    if 'is_vpn_or_proxy' not in df.columns:
        df['is_vpn_or_proxy'] = 0

    # Execute Batch Prediction
    try:
        scored_df = predictor.predict_batch(df)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Batch Inference Failed: {str(e)}"
        )

    # Persist batch to DB
    alerts_created = 0
    for _, row in scored_df.iterrows():
        txn_id = str(row.get('transaction_id', ''))
        if not txn_id or txn_id == 'nan':
            txn_id = f"TXN-BAT-{uuid.uuid4().hex[:8].upper()}"

        db_txn = Transaction(
            transaction_id=txn_id,
            user_email=str(row.get('user_email', 'batch_customer@bank.com')),
            amount=float(row['amount']),
            merchant_category=str(row['merchant_category']),
            time_delta_sec=int(row['time_delta_sec']),
            failed_logins_24h=int(row['failed_logins_24h']),
            device_trust_score=float(row['device_trust_score']),
            location_distance_km=float(row['location_distance_km']),
            is_international=int(row['is_international']),
            is_vpn_or_proxy=int(row['is_vpn_or_proxy']),
            actual_label=int(row.get('is_fraud', 0)) if 'is_fraud' in row else None
        )
        db.add(db_txn)

        factors = predictor._extract_risk_factors(row.to_dict())
        db_pred = FraudPrediction(
            transaction_id=txn_id,
            fraud_probability=float(row['fraud_probability']),
            risk_score=int(row['risk_score']),
            risk_level=str(row['risk_level']),
            is_flagged=bool(row['is_flagged']),
            risk_factors_json=json.dumps(factors)
        )
        db.add(db_pred)

        if int(row['risk_score']) >= 70:
            db_alert = Alert(
                transaction_id=txn_id,
                risk_score=int(row['risk_score']),
                severity="HIGH" if int(row['risk_score']) < 90 else "CRITICAL",
                status="ACTIVE",
                notes=f"Batch Upload Alert: High risk detected on ${float(row['amount']):,.2f} transfer."
            )
            db.add(db_alert)
            alerts_created += 1

    db.commit()

    total_proc = len(scored_df)
    flagged = int(scored_df['is_flagged'].sum())
    high = int((scored_df['risk_level'] == 'HIGH').sum())
    med = int((scored_df['risk_level'] == 'MEDIUM').sum())
    low = int((scored_df['risk_level'] == 'LOW').sum())

    return {
        "total_processed": total_proc,
        "flagged_fraud_count": flagged,
        "fraud_rate_percentage": round((flagged / total_proc) * 100, 2) if total_proc > 0 else 0.0,
        "high_risk_count": high,
        "medium_risk_count": med,
        "low_risk_count": low,
        "alerts_created": alerts_created
    }
