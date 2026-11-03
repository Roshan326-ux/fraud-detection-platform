"""
Transactions and Alerts API Tests
"""

from app.core.config import settings

def test_list_transactions(client):
    response = client.get(f"{settings.API_V1_STR}/transactions/?limit=10")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) > 0
    assert "transaction_id" in data[0]
    assert "risk_score" in data[0]

def test_filter_transactions_by_risk_level(client):
    response = client.get(f"{settings.API_V1_STR}/transactions/?risk_level=HIGH")
    assert response.status_code == 200
    data = response.json()
    for item in data:
        assert item["risk_level"] == "HIGH"

def test_inspect_single_transaction(client):
    # Fetch first transaction
    list_res = client.get(f"{settings.API_V1_STR}/transactions/?limit=1")
    txn_id = list_res.json()[0]["transaction_id"]

    detail_res = client.get(f"{settings.API_V1_STR}/transactions/{txn_id}")
    assert detail_res.status_code == 200
    detail_data = detail_res.json()
    assert detail_data["transaction_id"] == txn_id
    assert "risk_factors" in detail_data

def test_analytics_overview(client):
    response = client.get(f"{settings.API_V1_STR}/analytics/overview")
    assert response.status_code == 200
    kpis = response.json()
    assert kpis["total_transactions"] > 0
    assert "fraud_rate_percentage" in kpis
    assert "at_risk_amount_usd" in kpis

def test_alerts_status_update(client):
    # Fetch alerts
    alerts_res = client.get(f"{settings.API_V1_STR}/alerts/?limit=1")
    alerts = alerts_res.json()
    if len(alerts) > 0:
        alert_id = alerts[0]["id"]
        patch_res = client.patch(
            f"{settings.API_V1_STR}/alerts/{alert_id}/status",
            json={"status": "INVESTIGATING", "notes": "Audit initiated by Risk Officer"}
        )
        assert patch_res.status_code == 200
        assert patch_res.json()["status"] == "INVESTIGATING"
