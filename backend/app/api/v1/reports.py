"""
Downloadable Reports API (CSV / Audit Summary)
"""

import io
import csv
from datetime import datetime
from fastapi import APIRouter, Depends, Query, Response
from sqlalchemy.orm import Session
from sqlalchemy import desc
from app.db.session import get_db
from app.models.transaction import Transaction
from app.models.prediction import FraudPrediction

router = APIRouter()

@router.get("/export-csv")
def export_transactions_csv(
    only_flagged: bool = Query(True, description="Export only suspicious transactions"),
    db: Session = Depends(get_db)
):
    """
    Generates and downloads a CSV compliance report of evaluated transactions.
    """
    query = db.query(Transaction, FraudPrediction).outerjoin(
        FraudPrediction, Transaction.transaction_id == FraudPrediction.transaction_id
    )

    if only_flagged:
        query = query.filter(FraudPrediction.is_flagged == True)

    results = query.order_by(desc(Transaction.created_at)).limit(1000).all()

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow([
        "Transaction ID",
        "Timestamp",
        "Customer Email",
        "Amount (USD)",
        "Merchant Category",
        "Risk Score (0-100)",
        "Risk Level",
        "Device Trust Score",
        "Location Distance (km)",
        "VPN Detected",
        "International"
    ])

    for txn, pred in results:
        writer.writerow([
            txn.transaction_id,
            txn.created_at.strftime("%Y-%m-%d %H:%M:%S") if txn.created_at else "",
            txn.user_email or "N/A",
            f"{txn.amount:.2f}",
            txn.merchant_category,
            pred.risk_score if pred else 0,
            pred.risk_level if pred else "LOW",
            txn.device_trust_score,
            txn.location_distance_km,
            "YES" if txn.is_vpn_or_proxy == 1 else "NO",
            "YES" if txn.is_international == 1 else "NO"
        ])

    csv_data = output.getvalue()
    filename = f"Fraud_Risk_Report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"

    return Response(
        content=csv_data,
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )
