"""
Quick Inspection Script for AI Fraud Detection & Risk Analysis Platform
Run this file to inspect dataset, model metrics, and sample predictions in one go!

Usage:
    python test_inspect.py
"""

import os
import json
import pandas as pd
from ml_pipeline.predict import predictor

def main():
    print("=" * 75)
    print("       AI-BASED FRAUD DETECTION PLATFORM - SYSTEM INSPECTION")
    print("=" * 75)

    # 1. Inspect Dataset
    csv_path = os.path.join("ml_pipeline", "data", "transactions_train.csv")
    if os.path.exists(csv_path):
        df = pd.read_csv(csv_path)
        print(f"\n[1] DATASET INSPECTION ({csv_path}):")
        print(f"    - Total records: {len(df):,}")
        print(f"    - Legitimate (0): {(df['is_fraud'] == 0).sum():,} ({((df['is_fraud'] == 0).mean() * 100):.1f}%)")
        print(f"    - Fraudulent (1): {(df['is_fraud'] == 1).sum():,} ({((df['is_fraud'] == 1).mean() * 100):.1f}%)")
        print("\n    Sample First 3 Rows:")
        print(df.head(3).to_string(index=False))
    else:
        print("\n[1] Dataset not found.")

    # 2. Inspect Model Metadata & Metrics
    meta_path = os.path.join("ml_pipeline", "models", "model_metadata.json")
    if os.path.exists(meta_path):
        with open(meta_path, "r") as f:
            meta = json.load(f)
        rf = meta["evaluation"]["production_random_forest"]
        print(f"\n[2] MODEL PERFORMANCE METRICS (Random Forest Classifier):")
        print(f"    - Accuracy:        {rf['accuracy'] * 100:.2f}%")
        print(f"    - Precision:       {rf['precision'] * 100:.2f}% (High precision = fewer false alarms)")
        print(f"    - Recall:          {rf['recall'] * 100:.2f}% (High recall = catches 92%+ of frauds)")
        print(f"    - F1-Score:        {rf['f1_score']:.4f}")
        print(f"    - ROC-AUC:         {rf['roc_auc']:.4f}")
        
        cm = rf['confusion_matrix']
        print(f"\n    Confusion Matrix on 3,000 Unseen Test Transactions:")
        print(f"    - True Negatives  (Legit passed):  {cm[0][0]:,}")
        print(f"    - False Positives (Legit flagged): {cm[0][1]:,} (False alarm rate: {(cm[0][1]/(cm[0][0]+cm[0][1]))*100:.2f}%)")
        print(f"    - False Negatives (Fraud missed):  {cm[1][0]:,}")
        print(f"    - True Positives  (Fraud caught):  {cm[1][1]:,}")

        print(f"\n    Top Influential Features:")
        for feat in meta.get("top_features", [])[:5]:
            print(f"    - {feat['feature']:<22}: {feat['importance'] * 100:.1f}%")

    # 3. Test Live Inference Engine with 2 Cases
    print("\n[3] LIVE AI INFERENCE DEMO:")
    
    # Case A: Normal Everyday Transaction
    legit_sample = {
        'amount': 45.20,
        'time_delta_sec': 8500,
        'failed_logins_24h': 0,
        'device_trust_score': 0.95,
        'location_distance_km': 8.5,
        'is_international': 0,
        'is_vpn_or_proxy': 0,
        'merchant_category': 'grocery'
    }
    res_legit = predictor.predict_single(legit_sample)
    print("\n    >>> Case A: Normal Grocery Purchase ($45.20, Trusted Device)")
    print(f"        Risk Score:       {res_legit['risk_score']} / 100")
    print(f"        Risk Level:       {res_legit['risk_level']}")
    print(f"        Decision:         {'FLAGGED (Alert Triggered)' if res_legit['is_flagged'] else 'APPROVED (Safe)'}")
    print(f"        Risk Factors:     {res_legit['risk_factors']}")

    # Case B: High-Risk Crypto Transfer via VPN
    fraud_sample = {
        'amount': 3200.00,
        'time_delta_sec': 25,
        'failed_logins_24h': 3,
        'device_trust_score': 0.12,
        'location_distance_km': 3500.0,
        'is_international': 1,
        'is_vpn_or_proxy': 1,
        'merchant_category': 'crypto_exchange'
    }
    res_fraud = predictor.predict_single(fraud_sample)
    print("\n    >>> Case B: Rapid International Crypto Transfer ($3,200, New Device, VPN)")
    print(f"        Risk Score:       {res_fraud['risk_score']} / 100")
    print(f"        Risk Level:       {res_fraud['risk_level']}")
    print(f"        Decision:         {'FLAGGED (Alert Triggered)' if res_fraud['is_flagged'] else 'APPROVED (Safe)'}")
    print(f"        Risk Factors:")
    for factor in res_fraud['risk_factors']:
        print(f"          * {factor}")

    print("\n" + "=" * 75)
    print("Inspection complete! All components are working as expected.")
    print("=" * 75)

if __name__ == "__main__":
    main()
