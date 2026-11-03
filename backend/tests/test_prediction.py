"""
Real-time ML Fraud Prediction API Tests
"""

from app.core.config import settings

def test_predict_legitimate_transaction(client):
    payload = {
        "amount": 35.50,
        "merchant_category": "grocery",
        "time_delta_sec": 7200,
        "failed_logins_24h": 0,
        "device_trust_score": 0.95,
        "location_distance_km": 5.2,
        "is_international": 0,
        "is_vpn_or_proxy": 0,
        "save_to_db": True
    }
    response = client.post(f"{settings.API_V1_STR}/predict/", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["risk_score"] < 40
    assert data["risk_level"] == "LOW"
    assert data["is_flagged"] is False
    assert len(data["risk_factors"]) > 0

def test_predict_fraudulent_transaction(client):
    payload = {
        "amount": 2900.00,
        "merchant_category": "crypto_exchange",
        "time_delta_sec": 15,
        "failed_logins_24h": 4,
        "device_trust_score": 0.10,
        "location_distance_km": 4200.0,
        "is_international": 1,
        "is_vpn_or_proxy": 1,
        "save_to_db": True
    }
    response = client.post(f"{settings.API_V1_STR}/predict/", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["risk_score"] >= 70
    assert data["risk_level"] == "HIGH"
    assert data["is_flagged"] is True
    assert any("VPN" in factor for factor in data["risk_factors"])
