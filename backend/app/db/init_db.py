"""
Database Initialization and Seed Data Loader
Creates tables, default admin account, and pre-populates initial demo transactions.
"""

import os
import json
import pandas as pd
from sqlalchemy.orm import Session
from app.db.base import Base
from app.db.session import engine, SessionLocal
from app.models.user import User
from app.models.transaction import Transaction
from app.models.prediction import FraudPrediction
from app.models.alert import Alert
from app.core.security import get_password_hash
from app.core.config import settings
from ml_pipeline.predict import predictor

def init_db():
    print("[DB Init] Creating database tables...")
    Base.metadata.create_all(bind=engine)

    db: Session = SessionLocal()
    try:
        # 1. Seed Admin User
        admin_email = settings.DEFAULT_ADMIN_EMAIL
        admin_user = db.query(User).filter(User.email == admin_email).first()
        if not admin_user:
            print(f"[DB Init] Seeding default admin user ({admin_email})...")
            admin_user = User(
                email=admin_email,
                hashed_password=get_password_hash(settings.DEFAULT_ADMIN_PASSWORD),
                full_name=settings.DEFAULT_ADMIN_NAME,
                role="admin",
                is_active=True
            )
            db.add(admin_user)
            db.commit()
            print("[DB Init] Admin user successfully created.")
        else:
            print("[DB Init] Admin user already exists.")

        # 2. Keep transactions table clean for real-time live evaluation
        print("[DB Init] Database ready. Transactions table preserved for real-time live evaluation.")
    finally:
        db.close()

def seed_demo_batch(db: Session) -> int:
    """Loads and scores the 500 benchmark demo transactions from sample CSV."""
    root_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
    sample_csv = os.path.join(root_dir, "ml_pipeline", "data", "sample_transactions_batch.csv")

    if not os.path.exists(sample_csv):
        return 0

    df = pd.read_csv(sample_csv)
    scored_df = predictor.predict_batch(df)

    for _, row in scored_df.iterrows():
        txn_id = str(row['transaction_id'])
        db_txn = Transaction(
            transaction_id=txn_id,
            user_email=f"user_{row.name + 100}@digitalbank.com",
            amount=float(row['amount']),
            merchant_category=str(row['merchant_category']),
            time_delta_sec=int(row['time_delta_sec']),
            failed_logins_24h=int(row['failed_logins_24h']),
            device_trust_score=float(row['device_trust_score']),
            location_distance_km=float(row['location_distance_km']),
            is_international=int(row['is_international']),
            is_vpn_or_proxy=int(row['is_vpn_or_proxy']),
            actual_label=int(row.get('is_fraud', 0))
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
                notes=f"Automated Alert: High risk detected on {str(row['merchant_category']).title()} transfer."
            )
            db.add(db_alert)

    db.commit()
    return len(scored_df)

if __name__ == "__main__":
    init_db()
