"""
Real-Time Fraud Prediction Endpoint
Scores transaction data against the trained Random Forest model and records alerts.
"""

import json
import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.transaction import Transaction
from app.models.prediction import FraudPrediction
from app.models.alert import Alert
from app.schemas.prediction import PredictionRequest, PredictionResponse
from ml_pipeline.predict import predictor

router = APIRouter()

@router.post("/", response_model=PredictionResponse)
def predict_transaction(
    payload: PredictionRequest,
    db: Session = Depends(get_db)
):
    """
    Real-time fraud scoring API:
    - Runs inference via Scikit-learn Pipeline
    - Generates 0-100 calibrated risk score
    - Extracts human-readable risk factors
    - Automatically creates security alert if risk is HIGH
    """
    txn_id = payload.transaction_id or f"TXN-RT-{uuid.uuid4().hex[:8].upper()}"

    # Prepare feature dictionary for ML predictor
    feature_dict = {
        'amount': payload.amount,
        'time_delta_sec': payload.time_delta_sec,
        'failed_logins_24h': payload.failed_logins_24h,
        'device_trust_score': payload.device_trust_score,
        'location_distance_km': payload.location_distance_km,
        'is_international': payload.is_international,
        'is_vpn_or_proxy': payload.is_vpn_or_proxy,
        'merchant_category': payload.merchant_category
    }

    try:
        prediction_result = predictor.predict_single(feature_dict)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"ML Inference Engine Error: {str(e)}"
        )

    risk_score = prediction_result['risk_score']
    risk_level = prediction_result['risk_level']
    is_flagged = prediction_result['is_flagged']
    risk_factors = prediction_result['risk_factors']
    fraud_prob = prediction_result['fraud_probability']

    if payload.save_to_db:
        # Save transaction record
        db_txn = Transaction(
            transaction_id=txn_id,
            user_email=payload.user_email,
            amount=payload.amount,
            merchant_category=payload.merchant_category,
            time_delta_sec=payload.time_delta_sec,
            failed_logins_24h=payload.failed_logins_24h,
            device_trust_score=payload.device_trust_score,
            location_distance_km=payload.location_distance_km,
            is_international=payload.is_international,
            is_vpn_or_proxy=payload.is_vpn_or_proxy
        )
        db.add(db_txn)

        # Save AI prediction record
        db_pred = FraudPrediction(
            transaction_id=txn_id,
            fraud_probability=fraud_prob,
            risk_score=risk_score,
            risk_level=risk_level,
            is_flagged=is_flagged,
            risk_factors_json=json.dumps(risk_factors)
        )
        db.add(db_pred)

        # Trigger security alert if high risk
        if risk_score >= 70:
            db_alert = Alert(
                transaction_id=txn_id,
                risk_score=risk_score,
                severity="HIGH" if risk_score < 90 else "CRITICAL",
                status="ACTIVE",
                notes=f"Automated Alert: AI detected {len(risk_factors)} suspicious indicators."
            )
            db.add(db_alert)

        db.commit()

    return {
        "transaction_id": txn_id,
        "fraud_probability": fraud_prob,
        "risk_score": risk_score,
        "risk_level": risk_level,
        "is_flagged": is_flagged,
        "risk_factors": risk_factors,
        "model_version": "RandomForest-v1.0"
    }
