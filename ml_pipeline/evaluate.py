"""
ML Model Evaluation and Inspection Script
Allows inspecting saved model metadata, confusion matrix, and feature importances.
"""

import os
import json

def display_evaluation():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    metadata_path = os.path.join(base_dir, 'models', 'model_metadata.json')

    if not os.path.exists(metadata_path):
        print(f"Metadata file not found at: {metadata_path}. Please run ml_pipeline/train.py first.")
        return

    with open(metadata_path, 'r') as f:
        data = json.load(f)

    print("\n" + "="*70)
    print("  AI FRAUD DETECTION PLATFORM - MODEL PERFORMANCE SUMMARY")
    print("="*70)
    print(f"Production Model:        {data.get('production_model')}")
    print(f"Dataset Size:            {data.get('training_dataset_size'):,} samples")
    print(f"Fraud Prevalence:        {data.get('fraud_ratio')*100:.2f}%")
    
    print("\n[MODEL COMPARISON]")
    evals = data.get('evaluation', {})
    lr = evals.get('baseline_logistic_regression', {})
    rf = evals.get('production_random_forest', {})

    print(f"{'Metric':<22} | {'Logistic Regression':<20} | {'Random Forest':<20}")
    print("-" * 70)
    print(f"{'Precision':<22} | {lr.get('precision', 0):<20.4f} | {rf.get('precision', 0):<20.4f}")
    print(f"{'Recall':<22} | {lr.get('recall', 0):<20.4f} | {rf.get('recall', 0):<20.4f}")
    print(f"{'F1-Score':<22} | {lr.get('f1_score', 0):<20.4f} | {rf.get('f1_score', 0):<20.4f}")
    print(f"{'ROC-AUC':<22} | {lr.get('roc_auc', 0):<20.4f} | {rf.get('roc_auc', 0):<20.4f}")
    print("="*70)

    cm = rf.get('confusion_matrix', [[0, 0], [0, 0]])
    print("\n[CONFUSION MATRIX - RANDOM FOREST]")
    print(f"                 Predicted Legit    Predicted Fraud")
    print(f"  Actual Legit:  {cm[0][0]:<18} {cm[0][1]:<18} (False Positives: {cm[0][1]})")
    print(f"  Actual Fraud:  {cm[1][0]:<18} {cm[1][1]:<18} (False Negatives: {cm[1][0]})")

    print("\n[FEATURE IMPORTANCE BREAKDOWN]")
    for item in data.get('top_features', []):
        bar = "#" * int(item['importance'] * 50)
        print(f"  {item['feature']:<25} | {item['importance']*100:>5.1f}% | {bar}")

    print("\n[RISK SCORE BANDS]")
    bands = data.get('risk_score_calibration', {}).get('bands', {})
    for level, info in bands.items():
        print(f"  - {level.upper():<6} (Score {info['min']}-{info['max']}): {info['action']}")
    print("="*70 + "\n")

if __name__ == '__main__':
    display_evaluation()
