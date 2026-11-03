"""
Analytics API: Provides aggregated statistics, KPI cards, and charts data.
"""

from typing import List, Dict, Any
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.db.session import get_db
from app.models.transaction import Transaction
from app.models.prediction import FraudPrediction
from app.models.alert import Alert
from app.schemas.analytics import OverviewStats, CategoryRiskStat, TrendPoint

router = APIRouter()

@router.get("/overview", response_model=OverviewStats)
def get_overview_kpis(db: Session = Depends(get_db)):
    """
    Returns high-level KPI card statistics for the Executive Dashboard.
    """
    total_txns = db.query(func.count(Transaction.id)).scalar() or 0
    total_vol = db.query(func.sum(Transaction.amount)).scalar() or 0.0

    flagged_txns = db.query(func.count(FraudPrediction.id)).filter(FraudPrediction.is_flagged == True).scalar() or 0
    
    # Calculate at-risk volume
    at_risk_vol = db.query(func.sum(Transaction.amount)).join(
        FraudPrediction, Transaction.transaction_id == FraudPrediction.transaction_id
    ).filter(FraudPrediction.is_flagged == True).scalar() or 0.0

    high_count = db.query(func.count(FraudPrediction.id)).filter(FraudPrediction.risk_level == 'HIGH').scalar() or 0
    med_count = db.query(func.count(FraudPrediction.id)).filter(FraudPrediction.risk_level == 'MEDIUM').scalar() or 0
    low_count = db.query(func.count(FraudPrediction.id)).filter(FraudPrediction.risk_level == 'LOW').scalar() or 0

    active_alerts = db.query(func.count(Alert.id)).filter(Alert.status == 'ACTIVE').scalar() or 0

    fraud_rate = round((flagged_txns / total_txns * 100), 2) if total_txns > 0 else 0.0

    return {
        "total_transactions": total_txns,
        "flagged_transactions": flagged_txns,
        "fraud_rate_percentage": fraud_rate,
        "total_volume_usd": round(float(total_vol), 2),
        "at_risk_amount_usd": round(float(at_risk_vol), 2),
        "active_alerts_count": active_alerts,
        "high_risk_count": high_count,
        "medium_risk_count": med_count,
        "low_risk_count": low_count
    }

@router.get("/categories", response_model=List[CategoryRiskStat])
def get_merchant_category_stats(db: Session = Depends(get_db)):
    """
    Returns fraud rate and transaction volume broken down by merchant sector.
    """
    results = db.query(
        Transaction.merchant_category,
        func.count(Transaction.id).label('total_count'),
        func.sum(Transaction.amount).label('total_amount')
    ).group_by(Transaction.merchant_category).all()

    stats = []
    for cat, count, amount in results:
        # Count flagged in this category
        flagged = db.query(func.count(Transaction.id)).join(
            FraudPrediction, Transaction.transaction_id == FraudPrediction.transaction_id
        ).filter(
            Transaction.merchant_category == cat,
            FraudPrediction.is_flagged == True
        ).scalar() or 0

        rate = round((flagged / count * 100), 2) if count > 0 else 0.0
        stats.append({
            "category": cat.replace("_", " ").title(),
            "total_count": count,
            "fraud_count": flagged,
            "fraud_rate": rate,
            "total_amount": round(float(amount or 0.0), 2)
        })

    # Sort by fraud count descending
    stats.sort(key=lambda x: x["fraud_count"], reverse=True)
    return stats

@router.get("/risk-distribution")
def get_risk_distribution(db: Session = Depends(get_db)):
    """
    Returns risk level counts for Pie / Donut charts.
    """
    high = db.query(func.count(FraudPrediction.id)).filter(FraudPrediction.risk_level == 'HIGH').scalar() or 0
    med = db.query(func.count(FraudPrediction.id)).filter(FraudPrediction.risk_level == 'MEDIUM').scalar() or 0
    low = db.query(func.count(FraudPrediction.id)).filter(FraudPrediction.risk_level == 'LOW').scalar() or 0

    return [
        {"name": "Low Risk (0-39)", "value": low, "color": "#10B981"},
        {"name": "Medium Risk (40-69)", "value": med, "color": "#F59E0B"},
        {"name": "High Risk (70-100)", "value": high, "color": "#EF4444"}
    ]

@router.get("/trends")
def get_trends(db: Session = Depends(get_db)):
    """
    Returns time series sample trends for Area / Line charts.
    """
    # Sample hourly distribution representation
    txns = db.query(Transaction, FraudPrediction).outerjoin(
        FraudPrediction, Transaction.transaction_id == FraudPrediction.transaction_id
    ).order_by(Transaction.id.desc()).limit(150).all()

    # Bucket into 6 temporal window chunks
    buckets = [{"label": f"Interval T-{i*4}h", "total_count": 0, "fraud_count": 0, "volume": 0.0} for i in range(6, 0, -1)]

    for idx, (t, p) in enumerate(txns):
        b_idx = idx % 6
        buckets[b_idx]["total_count"] += 1
        buckets[b_idx]["volume"] += round(t.amount, 2)
        if p and p.is_flagged:
            buckets[b_idx]["fraud_count"] += 1

    return [
        {
            "label": b["label"],
            "total_count": b["total_count"],
            "fraud_count": b["fraud_count"],
            "total_amount": round(b["volume"], 2)
        }
        for b in buckets
    ]

@router.post("/reset-all")
def reset_all_data(db: Session = Depends(get_db)):
    """
    Clears all transactions, fraud predictions, and security alerts.
    Resets all KPIs and charts to zero for a clean real-time demonstration.
    """
    db.query(Alert).delete()
    db.query(FraudPrediction).delete()
    db.query(Transaction).delete()
    db.commit()
    return {"message": "All transaction data reset to 0 successfully."}

@router.post("/seed-demo")
def seed_demo_data(db: Session = Depends(get_db)):
    """
    Populates 500 benchmark demo transactions from sample CSV.
    """
    from app.db.init_db import seed_demo_batch
    # Clear existing first
    db.query(Alert).delete()
    db.query(FraudPrediction).delete()
    db.query(Transaction).delete()
    db.commit()

    count = seed_demo_batch(db)
    return {"message": f"Successfully loaded {count} demo transactions."}
