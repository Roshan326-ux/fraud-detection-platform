# AI-Based Fraud Detection and Risk Analysis Platform for Digital Businesses

An enterprise-grade, full-stack cybersecurity and machine learning platform built as a university final-year project (FYP). The platform analyzes digital transactions in real-time, identifies suspicious patterns, assigns calibrated 0–100 risk scores, triggers security incident alerts, and visualizes financial telemetry via an interactive executive dashboard.

---

## 🏛️ System Architecture

```
[ React.js Frontend (Recharts + Modern CSS) ] ── (Port 5173)
                   ▲
                   │ REST APIs (JSON / JWT / HTTP)
                   ▼
[ FastAPI Backend (Python) ] ──────────────── (Port 8000)
       ├── API Routers (/auth, /predict, /transactions, /alerts, /analytics, /reports)
       ├── SQLAlchemy 2.0 ORM (PostgreSQL with automatic local SQLite fallback)
       └── ML Inference Engine (Scikit-Learn Random Forest Pipeline)
```

---

## 🛠️ Technology Stack

| Layer | Technologies Used |
| :--- | :--- |
| **Frontend** | React 18, Vite, JavaScript, Recharts, Lucide Icons, Glassmorphism Vanilla CSS |
| **Backend** | Python 3.14+, FastAPI, Uvicorn, Pydantic v2 |
| **Machine Learning** | Scikit-Learn, Pandas, NumPy, Joblib |
| **Database** | PostgreSQL / SQLite (auto-fallback), SQLAlchemy ORM |
| **Security** | Bcrypt (Salted Password Hashing), PyJWT (JSON Web Tokens) |
| **Testing** | Pytest, FastAPI TestClient, Automated API test suite |

---

## 📁 Repository Structure

```text
FYP-project/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   ├── deps.py               # JWT bearer token verification
│   │   │   └── v1/
│   │   │       ├── auth.py           # Admin login & current user profile
│   │   │       ├── prediction.py     # Live transaction AI risk scoring
│   │   │       ├── transactions.py   # Search, filter, inspect, CSV batch upload
│   │   │       ├── alerts.py         # Incident triage & status updates
│   │   │       ├── analytics.py      # KPIs, trends, and category distribution
│   │   │       ├── reports.py        # Downloadable compliance CSV reports
│   │   │       └── api_router.py     # Master v1 router
│   │   ├── core/
│   │   │   ├── config.py             # Environment configurations
│   │   │   └── security.py           # Bcrypt & JWT cryptographic helpers
│   │   ├── db/
│   │   │   ├── base.py               # Declarative Base
│   │   │   ├── session.py            # Engine & sessionmaker (PostgreSQL / SQLite)
│   │   │   └── init_db.py            # Table initialization & demo data seeding
│   │   ├── models/                   # User, Transaction, FraudPrediction, Alert
│   │   └── schemas/                  # Pydantic request & response validation
│   ├── tests/                        # 11 Automated Pytest test cases
│   ├── .env                          # Local environment secrets & DB connection
│   └── requirements.txt
│
├── ml_pipeline/
│   ├── data/
│   │   ├── generate_dataset.py       # Realistic banking fraud data generator
│   │   ├── transactions_train.csv    # 15,000 transactions training set (3.5% fraud)
│   │   └── sample_transactions_batch.csv # 500 demo transactions for upload testing
│   ├── models/
│   │   ├── fraud_model.joblib        # Trained Random Forest pipeline
│   │   └── model_metadata.json       # Evaluated metrics, confusion matrix, features
│   ├── preprocess.py                 # ColumnTransformer (StandardScaler + OneHotEncoder)
│   ├── train.py                      # Logistic Regression vs Random Forest training
│   ├── evaluate.py                   # Model evaluation and confusion matrix reporter
│   └── predict.py                    # Inference engine with 0-100 risk scoring
│
├── frontend/
│   ├── src/
│   │   ├── components/               # Navbar, Sidebar, StatCard, RiskBadge, TransactionModal
│   │   ├── context/                  # AuthContext (JWT state management)
│   │   ├── pages/
│   │   │   ├── DashboardPage.jsx     # KPIs, Area trends, Donut chart, Category risk
│   │   │   ├── TransactionsPage.jsx  # Search, filter, pagination, inspect modal
│   │   │   ├── SimulatorPage.jsx     # Live AI fraud test simulator with scenarios
│   │   │   ├── BatchUploadPage.jsx   # Drag-and-drop CSV batch analysis center
│   │   │   ├── AlertsPage.jsx        # Security incident queue and triage actions
│   │   │   ├── ReportsPage.jsx       # Downloadable compliance audit reports
│   │   │   └── LoginPage.jsx         # Secure administrator login
│   │   ├── services/api.js           # REST API client
│   │   ├── index.css                 # Glassmorphic design system tokens
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
│
├── run_backend.py                    # 1-click backend server launcher
├── test_inspect.py                   # 1-click system inspection script
└── VIVA_GUIDE.md                     # University viva questions & technical answers
```

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- Python 3.10+
- Node.js v18+ and npm

### 2. Running the Backend Server
From the project root:
```powershell
python run_backend.py
```
- Backend starts at: **`http://127.0.0.1:8000`**
- Interactive Swagger UI: **`http://127.0.0.1:8000/docs`**
- Alternative ReDoc UI: **`http://127.0.0.1:8000/redoc`**

### 3. Running the React Frontend
Open a new terminal window in the `frontend` folder:
```powershell
cd frontend
npm install
npm run dev
```
- Frontend dashboard starts at: **`http://localhost:5173`**

### 4. Default Admin Login Credentials
- **Email:** `admin@fraudshield.ai`
- **Password:** `Admin@12345`

---

## 🧪 Running Automated Tests

To run the complete Pytest test suite:
```powershell
cd backend
$env:PYTHONPATH="c:\FYP-project;c:\FYP-project\backend"
python -m pytest tests -v
```

All 11 unit tests covering Authentication, Real-Time Prediction, Filtering, Inspection, Analytics, and Alerts triage will execute and pass.

---

## 📊 Machine Learning Model Benchmarks

| Metric | Logistic Regression (Baseline) | Random Forest (Winning Model) | Viva Significance |
| :--- | :--- | :--- | :--- |
| **Accuracy** | 92.87% | **98.73%** | Overall correct classifications across all transactions |
| **Precision** | 32.01% | **76.38%** | Eliminates false alarms; prevents blocking legitimate customers |
| **Recall** | 92.38% | **92.38%** | Catches 92%+ of real fraud attacks (Low False Negatives) |
| **F1-Score** | 0.4755 | **0.8362** | Harmonic balance between Precision and Recall |
| **ROC-AUC** | 0.9834 | **0.9971** | Near-perfect separation boundary across thresholds |

### Confusion Matrix (Tested on 3,000 Unseen Transactions):
- **True Negatives (Legit approved):** `2,865`
- **False Positives (Legit flagged as fraud):** `30` (Only 1%)
- **False Negatives (Fraud missed):** `8`
- **True Positives (Fraud caught):** `97`

---

## ⚖️ Calibrated Risk Score Bands (0 – 100)
- 🟢 **Low Risk (Score 0 – 39):** Safe baseline — Automatic instant approval.
- 🟡 **Medium Risk (Score 40 – 69):** Moderate anomaly — Automated 2FA challenge / manual review.
- 🔴 **High Risk (Score 70 – 100):** Severe fraud indicators — Immediate card freeze & security alert.
