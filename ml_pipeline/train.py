"""
Model Training and Comparison Script:
1. Baseline: Logistic Regression (class_weight='balanced')
2. Advanced: Random Forest Classifier (class_weight='balanced')

Evaluates Precision, Recall, F1-Score, ROC-AUC, and Confusion Matrix.
Saves the production pipeline and metadata.
"""

import os
import json
import numpy as np
import pandas as pd
import joblib

from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
from sklearn.pipeline import Pipeline
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    roc_auc_score,
    confusion_matrix,
    classification_report
)

from ml_pipeline.preprocess import create_preprocessor, ALL_FEATURES, TARGET_COLUMN
from ml_pipeline.data.generate_dataset import generate_transactions

def train_and_evaluate():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    data_dir = os.path.join(base_dir, 'data')
    models_dir = os.path.join(base_dir, 'models')
    os.makedirs(data_dir, exist_ok=True)
    os.makedirs(models_dir, exist_ok=True)

    data_path = os.path.join(data_dir, 'transactions_train.csv')
    if not os.path.exists(data_path):
        print("[1/5] Training dataset not found. Generating 15,000 transactions...")
        df = generate_transactions(n_samples=15000, fraud_rate=0.035, random_state=42)
        df.to_csv(data_path, index=False)
        print(f"Dataset generated and saved to: {data_path}")
    else:
        print(f"[1/5] Loading existing dataset from: {data_path}")
        df = pd.read_csv(data_path)

    print(f"Total Transactions: {len(df)}")
    fraud_count = int(df[TARGET_COLUMN].sum())
    legit_count = len(df) - fraud_count
    print(f"Class Breakdown: Legitimate = {legit_count} ({legit_count/len(df)*100:.1f}%), Fraud = {fraud_count} ({fraud_count/len(df)*100:.1f}%)")

    # Features and Target
    X = df[ALL_FEATURES]
    y = df[TARGET_COLUMN]

    # Stratified Train-Test Split (80% Train, 20% Test)
    # Stratification ensures identical fraud ratio in both train and test splits without data leakage
    print("\n[2/5] Performing Stratified Train-Test Split (80/20)...")
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.20, random_state=42, stratify=y
    )
    print(f"Training samples: {len(X_train)} (Fraud: {y_train.sum()})")
    print(f"Testing samples:  {len(X_test)} (Fraud: {y_test.sum()})")

    # 1. Baseline Model: Logistic Regression
    print("\n[3/5] Training Baseline Model: Logistic Regression (class_weight='balanced')...")
    lr_preprocessor = create_preprocessor()
    lr_pipeline = Pipeline([
        ('preprocessor', lr_preprocessor),
        ('classifier', LogisticRegression(class_weight='balanced', max_iter=1000, random_state=42))
    ])
    lr_pipeline.fit(X_train, y_train)
    lr_y_pred = lr_pipeline.predict(X_test)
    lr_y_prob = lr_pipeline.predict_proba(X_test)[:, 1]

    # Evaluate Logistic Regression
    lr_metrics = {
        'model_name': 'Logistic Regression (Baseline)',
        'accuracy': round(float(accuracy_score(y_test, lr_y_pred)), 4),
        'precision': round(float(precision_score(y_test, lr_y_pred, zero_division=0)), 4),
        'recall': round(float(recall_score(y_test, lr_y_pred)), 4),
        'f1_score': round(float(f1_score(y_test, lr_y_pred)), 4),
        'roc_auc': round(float(roc_auc_score(y_test, lr_y_prob)), 4),
        'confusion_matrix': confusion_matrix(y_test, lr_y_pred).tolist()
    }

    # 2. Advanced Model: Random Forest
    print("\n[4/5] Training Advanced Model: Random Forest (n_estimators=100, class_weight='balanced')...")
    rf_preprocessor = create_preprocessor()
    rf_pipeline = Pipeline([
        ('preprocessor', rf_preprocessor),
        ('classifier', RandomForestClassifier(
            n_estimators=100,
            max_depth=12,
            class_weight='balanced',
            min_samples_split=5,
            random_state=42,
            n_jobs=-1
        ))
    ])
    rf_pipeline.fit(X_train, y_train)
    rf_y_pred = rf_pipeline.predict(X_test)
    rf_y_prob = rf_pipeline.predict_proba(X_test)[:, 1]

    # Evaluate Random Forest
    rf_metrics = {
        'model_name': 'Random Forest Classifier',
        'accuracy': round(float(accuracy_score(y_test, rf_y_pred)), 4),
        'precision': round(float(precision_score(y_test, rf_y_pred, zero_division=0)), 4),
        'recall': round(float(recall_score(y_test, rf_y_pred)), 4),
        'f1_score': round(float(f1_score(y_test, rf_y_pred)), 4),
        'roc_auc': round(float(roc_auc_score(y_test, rf_y_prob)), 4),
        'confusion_matrix': confusion_matrix(y_test, rf_y_pred).tolist()
    }

    # Feature Importance Extraction from Random Forest
    rf_classifier = rf_pipeline.named_steps['classifier']
    preprocessor = rf_pipeline.named_steps['preprocessor']
    cat_feature_names = list(preprocessor.named_transformers_['cat'].get_feature_names_out())
    all_feature_names = [f"num__{feat}" for feat in ALL_FEATURES if feat != 'merchant_category'] + cat_feature_names
    
    importances = rf_classifier.feature_importances_
    feature_importance_list = [
        {'feature': name.replace('num__', '').replace('cat__merchant_category_', 'merchant_'), 'importance': round(float(imp), 4)}
        for name, imp in sorted(zip(all_feature_names, importances), key=lambda x: x[1], reverse=True)
    ]

    print("\n" + "="*65)
    print("              MODEL COMPARISON BENCHMARK RESULTS")
    print("="*65)
    print(f"{'Metric':<20} | {'Logistic Regression':<20} | {'Random Forest':<20}")
    print("-" * 65)
    print(f"{'Accuracy':<20} | {lr_metrics['accuracy']:<20.4f} | {rf_metrics['accuracy']:<20.4f}")
    print(f"{'Precision':<20} | {lr_metrics['precision']:<20.4f} | {rf_metrics['precision']:<20.4f}")
    print(f"{'Recall':<20} | {lr_metrics['recall']:<20.4f} | {rf_metrics['recall']:<20.4f}")
    print(f"{'F1-Score':<20} | {lr_metrics['f1_score']:<20.4f} | {rf_metrics['f1_score']:<20.4f}")
    print(f"{'ROC-AUC':<20} | {lr_metrics['roc_auc']:<20.4f} | {rf_metrics['roc_auc']:<20.4f}")
    print("="*65)
    
    print("\nConfusion Matrix - Random Forest:")
    cm = rf_metrics['confusion_matrix']
    print(f"  True Negatives (Legit detected as Legit): {cm[0][0]}")
    print(f"  False Positives (Legit flagged as Fraud): {cm[0][1]}")
    print(f"  False Negatives (Fraud missed):           {cm[1][0]}")
    print(f"  True Positives (Fraud caught):            {cm[1][1]}")

    print("\nTop 5 Most Influential Features:")
    for item in feature_importance_list[:5]:
        print(f"  - {item['feature']}: {item['importance']*100:.1f}%")

    # 5. Save the Winning Production Pipeline (Random Forest)
    print("\n[5/5] Saving production pipeline and metadata...")
    model_save_path = os.path.join(models_dir, 'fraud_model.joblib')
    joblib.dump(rf_pipeline, model_save_path)
    print(f"Model Pipeline saved to: {model_save_path}")

    # Metadata & Risk Calibration documentation
    metadata = {
        'production_model': 'Random Forest Classifier',
        'training_dataset_size': len(df),
        'fraud_ratio': round(float(fraud_count / len(df)), 4),
        'features': ALL_FEATURES,
        'evaluation': {
            'baseline_logistic_regression': lr_metrics,
            'production_random_forest': rf_metrics
        },
        'top_features': feature_importance_list[:8],
        'risk_score_calibration': {
            'description': 'Model probability is scaled to a 0-100 score and partitioned into operational risk bands.',
            'bands': {
                'low': {'min': 0, 'max': 39, 'action': 'Approve'},
                'medium': {'min': 40, 'max': 69, 'action': 'Flag for Manual Verification'},
                'high': {'min': 70, 'max': 100, 'action': 'Immediate Freeze & Alert Notification'}
            }
        }
    }
    
    metadata_path = os.path.join(models_dir, 'model_metadata.json')
    with open(metadata_path, 'w') as f:
        json.dump(metadata, f, indent=2)
    print(f"Metadata saved to: {metadata_path}")

    return rf_pipeline, metadata

if __name__ == '__main__':
    train_and_evaluate()
