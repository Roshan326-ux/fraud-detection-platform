"""
Preprocessing Pipeline for Transaction Fraud Detection
Defines consistent transformations for numerical and categorical features.
"""

from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import StandardScaler, OneHotEncoder

NUMERIC_FEATURES = [
    'amount',
    'time_delta_sec',
    'failed_logins_24h',
    'device_trust_score',
    'location_distance_km',
    'is_international',
    'is_vpn_or_proxy'
]

CATEGORICAL_FEATURES = [
    'merchant_category'
]

ALL_FEATURES = NUMERIC_FEATURES + CATEGORICAL_FEATURES
TARGET_COLUMN = 'is_fraud'

def create_preprocessor() -> ColumnTransformer:
    """
    Creates a scikit-learn ColumnTransformer that standardizes numeric
    inputs and one-hot encodes categorical categories.
    """
    numeric_transformer = StandardScaler()
    categorical_transformer = OneHotEncoder(handle_unknown='ignore', sparse_output=False)

    preprocessor = ColumnTransformer(
        transformers=[
            ('num', numeric_transformer, NUMERIC_FEATURES),
            ('cat', categorical_transformer, CATEGORICAL_FEATURES)
        ],
        remainder='drop'
    )
    return preprocessor
