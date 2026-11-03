"""
Fraud Inference Engine
Reusable prediction service for both real-time single transactions and batch processing.
Calculates calibrated 0-100 risk score and human-readable risk factors.
"""

import os
import joblib
import numpy as np
import pandas as pd
from typing import Dict, Any, List, Tuple
from ml_pipeline.preprocess import ALL_FEATURES

class FraudPredictor:
    def __init__(self, model_path: str = None):
        if model_path is None:
            base_dir = os.path.dirname(os.path.abspath(__file__))
            model_path = os.path.join(base_dir, 'models', 'fraud_model.joblib')
        
        self.model_path = model_path
        self._pipeline = None

    @property
    def pipeline(self):
        if self._pipeline is None:
            if not os.path.exists(self.model_path):
                raise FileNotFoundError(f"Model file not found at: {self.model_path}. Run ml_pipeline/train.py first!")
            self._pipeline = joblib.load(self.model_path)
        return self._pipeline

    def _extract_risk_factors(self, data: Dict[str, Any]) -> List[str]:
        """
        Generates explainable human-readable reasons why the transaction was flagged.
        Crucial for university presentation and fraud analysts.
        """
        factors = []
        
        amount = float(data.get('amount', 0))
        time_delta = int(data.get('time_delta_sec', 9999))
        distance = float(data.get('location_distance_km', 0))
        device_trust = float(data.get('device_trust_score', 1.0))
        failed_logins = int(data.get('failed_logins_24h', 0))
        is_vpn = int(data.get('is_vpn_or_proxy', 0))
        is_intl = int(data.get('is_international', 0))
        category = str(data.get('merchant_category', '')).lower()

        if amount > 1500:
            factors.append(f"Unusually high transaction volume (${amount:,.2f})")
        if time_delta < 60:
            factors.append(f"Rapid velocity: only {time_delta}s since prior transaction (possible bot/card testing)")
        if distance > 500:
            factors.append(f"Severe geographic anomaly ({distance:,.1f} km from registered billing city)")
        if device_trust < 0.40:
            factors.append(f"Unrecognized or low-trust hardware footprint (Trust score: {device_trust:.2f})")
        if failed_logins >= 2:
            factors.append(f"Preceded by {failed_logins} failed authentication attempts in past 24 hours")
        if is_vpn == 1:
            factors.append("Transaction routed through known VPN / Proxy / TOR exit node")
        if is_intl == 1:
            factors.append("Cross-border international payment gateway")
        if category in ['crypto_exchange', 'gaming'] and amount > 500:
            factors.append(f"High-risk volatile merchant sector ({category.replace('_', ' ').title()})")

        if not factors:
            factors.append("Normal consumer behavior profile within expected baseline variance")

        return factors

    def predict_single(self, transaction: Dict[str, Any]) -> Dict[str, Any]:
        """
        Predicts fraud likelihood for a single transaction dictionary.
        Returns:
            - fraud_probability: raw model probability [0.0, 1.0]
            - risk_score: calibrated integer score [0, 100]
            - risk_level: 'LOW' | 'MEDIUM' | 'HIGH'
            - is_flagged: bool
            - risk_factors: list of reasons
        """
        df_single = pd.DataFrame([{col: transaction.get(col, 0) for col in ALL_FEATURES}])
        
        # Get calibrated probabilities
        probabilities = self.pipeline.predict_proba(df_single)[0]
        fraud_prob = float(probabilities[1])
        
        # Calibrated 0-100 risk score
        risk_score = int(round(min(100.0, max(0.0, fraud_prob * 100.0))))

        if risk_score >= 70:
            risk_level = "HIGH"
            is_flagged = True
        elif risk_score >= 40:
            risk_level = "MEDIUM"
            is_flagged = True
        else:
            risk_level = "LOW"
            is_flagged = False

        factors = self._extract_risk_factors(transaction)

        return {
            "fraud_probability": round(fraud_prob, 4),
            "risk_score": risk_score,
            "risk_level": risk_level,
            "is_flagged": is_flagged,
            "risk_factors": factors
        }

    def predict_batch(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Predicts fraud likelihood on a batch DataFrame.
        Appends risk_score, risk_level, and fraud_probability.
        """
        # Ensure all required features are present
        X = df[ALL_FEATURES]
        probabilities = self.pipeline.predict_proba(X)[:, 1]
        
        result_df = df.copy()
        result_df['fraud_probability'] = np.round(probabilities, 4)
        result_df['risk_score'] = np.round(probabilities * 100).astype(int)
        
        # Vectorized risk level categorization
        conditions = [
            (result_df['risk_score'] >= 70),
            (result_df['risk_score'] >= 40) & (result_df['risk_score'] < 70),
            (result_df['risk_score'] < 40)
        ]
        choices = ['HIGH', 'MEDIUM', 'LOW']
        result_df['risk_level'] = np.select(conditions, choices, default='LOW')
        result_df['is_flagged'] = result_df['risk_score'] >= 40

        return result_df

# Global predictor instance
predictor = FraudPredictor()
