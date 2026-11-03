"""
Realistic Synthetic Transaction Dataset Generator
For: AI-Based Fraud Detection and Risk Analysis Platform

Generates realistic financial transaction data incorporating known fraud patterns:
- High-velocity consecutive transactions (card testing / bot attacks)
- High-value anomalies on crypto/gaming/luxury categories
- VPN / Proxy usage combined with unusual geographic distance
- Failed authentication attempts preceding the transaction
"""

import os
import random
import numpy as np
import pandas as pd

def generate_transactions(n_samples: int = 15000, fraud_rate: float = 0.035, random_state: int = 42) -> pd.DataFrame:
    """
    Generates a realistic transaction dataset with a controlled class imbalance.
    """
    np.random.seed(random_state)
    random.seed(random_state)

    merchant_categories = ['grocery', 'dining', 'clothing', 'travel', 'electronics', 'crypto_exchange', 'gaming']
    category_weights = [0.30, 0.25, 0.15, 0.10, 0.10, 0.05, 0.05]

    data = []
    
    n_fraud = int(n_samples * fraud_rate)
    n_legit = n_samples - n_fraud
    labels = [0] * n_legit + [1] * n_fraud
    random.shuffle(labels)

    for i, is_fraud in enumerate(labels):
        txn_id = f"TXN-{100000 + i}"
        
        # Introduce 4% label ambiguity / real-world noise (stealthy fraud & false alarm triggers)
        is_noisy = np.random.rand() < 0.05

        if is_fraud == 0:
            # Normal legitimate user behavior
            category = random.choices(merchant_categories, weights=category_weights)[0]
            
            # Typical everyday amounts based on category
            if category in ['grocery', 'dining']:
                amount = round(float(np.random.gamma(shape=3.0, scale=18.0)), 2) + 2.0
            elif category in ['clothing', 'gaming']:
                amount = round(float(np.random.gamma(shape=2.5, scale=40.0)), 2) + 5.0
            elif category == 'electronics':
                amount = round(float(np.random.gamma(shape=3.0, scale=85.0)), 2) + 20.0
            elif category == 'travel':
                amount = round(float(np.random.gamma(shape=3.5, scale=120.0)), 2) + 50.0
            else: # crypto_exchange
                amount = round(float(np.random.gamma(shape=2.0, scale=60.0)), 2) + 10.0

            time_delta_sec = int(np.random.exponential(scale=14000)) + 45
            device_trust_score = round(float(np.clip(np.random.normal(0.82, 0.15), 0.25, 1.0)), 2)
            location_distance_km = round(float(np.random.exponential(scale=25.0)), 1)
            failed_logins_24h = int(np.random.choice([0, 1, 2, 3], p=[0.88, 0.08, 0.03, 0.01]))
            is_international = int(np.random.choice([0, 1], p=[0.92, 0.08]))
            is_vpn_or_proxy = int(np.random.choice([0, 1], p=[0.93, 0.07]))

            # Borderline legitimate edge case (e.g., legitimate user traveling abroad on public Wi-Fi)
            if is_noisy:
                amount = round(amount * float(np.random.uniform(2.5, 6.0)), 2)
                device_trust_score = round(float(np.random.uniform(0.35, 0.65)), 2)
                location_distance_km = round(float(np.random.uniform(200.0, 1500.0)), 1)
                is_international = 1
                is_vpn_or_proxy = int(np.random.choice([0, 1], p=[0.5, 0.5]))
            
        else:
            # Fraudulent behavior scenarios
            scenario = random.choice(['card_testing', 'account_takeover', 'luxury_crypto_heist', 'stealth_mimic'])
            
            if scenario == 'card_testing':
                # Rapid low-amount automated hits
                category = random.choice(['gaming', 'dining', 'clothing'])
                amount = round(float(np.random.uniform(5.0, 45.0)), 2)
                time_delta_sec = int(np.random.uniform(10, 180))
                device_trust_score = round(float(np.random.uniform(0.15, 0.55)), 2)
                location_distance_km = round(float(np.random.exponential(scale=90.0)), 1)
                failed_logins_24h = int(np.random.choice([0, 1, 2, 3], p=[0.3, 0.3, 0.3, 0.1]))
                is_international = int(np.random.choice([0, 1], p=[0.5, 0.5]))
                is_vpn_or_proxy = int(np.random.choice([0, 1], p=[0.4, 0.6]))
                
            elif scenario == 'account_takeover':
                category = random.choice(['electronics', 'crypto_exchange', 'travel'])
                amount = round(float(np.random.uniform(350.0, 2800.0)), 2)
                time_delta_sec = int(np.random.uniform(90, 3600))
                device_trust_score = round(float(np.random.uniform(0.1, 0.48)), 2)
                location_distance_km = round(float(np.random.uniform(180.0, 3500.0)), 1)
                failed_logins_24h = int(np.random.choice([1, 2, 3, 4], p=[0.2, 0.4, 0.3, 0.1]))
                is_international = int(np.random.choice([0, 1], p=[0.4, 0.6]))
                is_vpn_or_proxy = int(np.random.choice([0, 1], p=[0.3, 0.7]))

            elif scenario == 'luxury_crypto_heist':
                category = random.choice(['crypto_exchange', 'electronics'])
                amount = round(float(np.random.uniform(600.0, 4200.0)), 2)
                time_delta_sec = int(np.random.uniform(150, 7200))
                device_trust_score = round(float(np.random.uniform(0.15, 0.60)), 2)
                location_distance_km = round(float(np.random.uniform(100.0, 1800.0)), 1)
                failed_logins_24h = int(np.random.choice([0, 1, 2], p=[0.5, 0.3, 0.2]))
                is_international = int(np.random.choice([0, 1], p=[0.4, 0.6]))
                is_vpn_or_proxy = int(np.random.choice([0, 1], p=[0.2, 0.8]))

            else: # stealth_mimic (fraudster intentionally tries to look normal)
                category = random.choice(['dining', 'clothing', 'grocery'])
                amount = round(float(np.random.uniform(25.0, 120.0)), 2)
                time_delta_sec = int(np.random.uniform(600, 12000))
                device_trust_score = round(float(np.random.uniform(0.40, 0.75)), 2)
                location_distance_km = round(float(np.random.uniform(10.0, 150.0)), 1)
                failed_logins_24h = int(np.random.choice([0, 1], p=[0.8, 0.2]))
                is_international = 0
                is_vpn_or_proxy = int(np.random.choice([0, 1], p=[0.7, 0.3]))

        data.append({
            'transaction_id': txn_id,
            'amount': amount,
            'time_delta_sec': time_delta_sec,
            'failed_logins_24h': failed_logins_24h,
            'device_trust_score': device_trust_score,
            'location_distance_km': location_distance_km,
            'is_international': is_international,
            'is_vpn_or_proxy': is_vpn_or_proxy,
            'merchant_category': category,
            'is_fraud': is_fraud
        })

    df = pd.DataFrame(data)
    return df

if __name__ == '__main__':
    output_dir = os.path.dirname(os.path.abspath(__file__))
    os.makedirs(output_dir, exist_ok=True)
    
    print("Generating training dataset (15,000 transactions)...")
    df_train = generate_transactions(n_samples=15000, fraud_rate=0.035, random_state=42)
    train_path = os.path.join(output_dir, 'transactions_train.csv')
    df_train.to_csv(train_path, index=False)
    print(f"Saved: {train_path} | Shape: {df_train.shape} | Fraud count: {df_train['is_fraud'].sum()} ({df_train['is_fraud'].mean()*100:.2f}%)")

    print("\nGenerating sample batch test dataset (500 transactions for upload demo)...")
    df_sample = generate_transactions(n_samples=500, fraud_rate=0.04, random_state=99)
    sample_path = os.path.join(output_dir, 'sample_transactions_batch.csv')
    df_sample.to_csv(sample_path, index=False)
    print(f"Saved: {sample_path} | Shape: {df_sample.shape} | Fraud count: {df_sample['is_fraud'].sum()}")
