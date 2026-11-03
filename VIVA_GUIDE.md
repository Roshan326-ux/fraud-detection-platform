# University FYP Viva & Defense Preparation Guide
## Project: AI-Based Fraud Detection and Risk Analysis Platform for Digital Businesses

---

## 🎯 1. Project High-Level Summary (Elevator Pitch)
Agar examiner pooche: *"Tell me about your project in 1 minute"*, to aap yeh bolein:

> *"Sir/Ma'am, our project is an enterprise-grade AI Fraud Detection & Risk Analysis Platform designed for digital payment gateways and online businesses.*
> 
> *Traditional rule-based fraud engines rely on static `if-else` rules that fail to detect dynamic, evolving fraud patterns. Our platform utilizes a trained **Machine Learning pipeline (Random Forest Classifier)** that evaluates both transaction attributes and behavioral telemetry—such as device trust scores, velocity pacing, and geolocation anomalies.*
> 
> *The model predicts a **calibrated Risk Score from 0 to 100**, partitions transactions into Low, Medium, and High risk tiers, provides explainable AI decision triggers, and integrates with a **FastAPI backend** and an interactive **React.js dashboard** for real-time monitoring and incident triage."*

---

## 🏛️ 2. Complete End-to-End Data Flow

```text
[1] User / External Gateway / CSV Upload
               │
               ▼ (HTTP POST with transaction telemetry)
[2] FastAPI REST API Server (/api/v1/predict or /batch-upload)
               │
               ▼ (Runs through Scikit-Learn ColumnTransformer)
[3] ML Preprocessing Pipeline (StandardScaler + OneHotEncoder)
               │
               ▼ (Feature array passed to Random Forest Classifier)
[4] Machine Learning Model (.joblib)
       ├── Calculates raw fraud probability: P(Fraud)
       ├── Scales to calibrated 0-100 Risk Score
       └── Extracts explainable risk triggers (e.g. "VPN detected", "Distance > 500km")
               │
               ▼
[5] Database Layer (SQLAlchemy ORM -> PostgreSQL / SQLite)
       ├── Saves Transaction record
       ├── Saves FraudPrediction record
       └── If Risk Score >= 70, automatically creates a Security Alert
               │
               ▼ (JSON Response)
[6] React.js Frontend Dashboard (Port 5173)
       ├── Displays live KPI cards (Volume, Fraud Rate, At-Risk Amount)
       ├── Visualizes Recharts (Risk Donut, 24h Area Trend, Sector Risk Bar)
       └── Updates Security Alerts Center for analyst triage
```

---

## 🧠 3. Machine Learning Deep Dive

### Q1: Why is Accuracy misleading in Fraud Detection?
- **Answer:** *"In financial transactions, the data is heavily imbalanced (e.g., 96.5% legitimate transactions and only 3.5% fraud). If a naive model simply predicts 'Legitimate' for every transaction, it will achieve 96.5% accuracy while completely failing to detect a single fraudulent transaction. Therefore, we evaluate our models using **Recall, Precision, F1-Score, and PR-AUC/ROC-AUC**."*

### Q2: Why did Random Forest outperform Logistic Regression?
- **Answer:** 
  1. **Non-Linear Interactions:** Logistic Regression assumes linear separability. In contrast, financial fraud involves complex non-linear combinations (e.g., a high amount is normal for luxury travel, but high amount + new device + VPN = fraud). Decision trees in Random Forest capture these multi-feature interactions naturally.
  2. **False Alarm Reduction (Precision):** Logistic Regression with balanced weights caught fraud (92.38% Recall) but had poor Precision (32.01%), resulting in many false alarms. Random Forest maintained the same high Recall (92.38%) while boosting Precision to **76.38%**, saving legitimate customers from being wrongfully blocked.
  3. **Ensemble Voting:** Random Forest trains 100 diverse decision trees with bagging (bootstrap aggregation) and feature subsetting, significantly reducing variance and preventing overfitting.

### Q3: How did you handle Class Imbalance?
- **Answer:** *"We used **class weighting (`class_weight='balanced'`)** during training. This automatically adjusts the loss function penalties inversely proportional to class frequencies, forcing the algorithm to pay significantly higher penalty for misclassifying the minority fraud class. Furthermore, we used **Stratified Train-Test Splitting (80/20)** to ensure both splits maintain identical fraud proportions without data leakage."*

### Q4: What is the difference between Raw Probability and Calibrated Risk Score?
- **Answer:** *"Raw model probability is simply the percentage of decision trees that voted for the fraud class (between 0.0 and 1.0). In an imbalanced operational environment, raw probabilities can be difficult for human fraud analysts to interpret. We scale and calibrate this into an intuitive **0 to 100 Risk Score** mapped to standardized operational business rules:
  - **0 – 39 (Low Risk):** Automatic Instant Approval.
  - **40 – 69 (Medium Risk):** Step-up authentication (OTP / 2FA challenge).
  - **70 – 100 (High Risk):** Immediate card freeze and automated security alert generation."*

---

## 🛡️ 4. Backend & Security Architecture

### Q5: How is user authentication secured?
- **Answer:** *"We use stateless **JWT (JSON Web Tokens)** signed with HMAC-SHA256. Passwords are never stored in plain text; they are salted and hashed using **bcrypt (12 rounds)**. Protected endpoints inspect the `Authorization: Bearer <token>` header, decode the cryptographic signature, verify expiration timestamps, and retrieve user permissions."*

### Q6: How does the Dual-Database Architecture work?
- **Answer:** *"We built the database layer using **SQLAlchemy 2.0 ORM**. In production, it connects to **PostgreSQL**. However, for local zero-configuration execution or university presentations, our `session.py` includes an automatic fallback to local **SQLite (`fraud_platform.db`)**. This guarantees that the system will never crash if a local PostgreSQL service is unstarted."*

---

## 💻 5. Frontend & UI Architecture

### Q7: What makes the frontend modern and responsive?
- **Answer:** 
  - Built with **React 18** and **Vite** for sub-second hot module replacement.
  - Interactive data visualizations powered by **Recharts** (Donut chart for risk tiers, Area chart for transaction volume over time, and Bar charts for merchant category risk).
  - Fully responsive glassmorphism dark-mode UI with high visual contrast.
  - Dedicated **Live AI Simulator** allowing real-time testing of custom transactions.
  - **Batch CSV Upload Center** that can ingest hundreds of transactions at once.

---

## 🎓 6. 10 High-Probability Examiner Viva Questions

| # | Examiner Question | Key Technical Answer |
| :--- | :--- | :--- |
| **1** | *Where did you get your dataset?* | Real credit card data cannot be distributed publicly due to PCI-DSS and banking privacy regulations. We generated domain-accurate synthetic data modeled on statistical distributions (Gamma distribution for amounts, Poisson/exponential decay for velocity pacing, Gaussian for device trust) replicating 4 realistic fraud scenarios: Card Testing, Account Takeover, Crypto Heists, and Geographic anomalies. |
| **2** | *What is the most influential feature?* | Device Trust Score (34.5%), followed by Geolocation Distance (19.2%) and Velocity Time Delta (17.8%). |
| **3** | *What is a False Positive vs False Negative in your project?* | **False Positive:** Legitimate customer purchase is wrongfully blocked (causes customer friction). **False Negative:** Fraudulent attack slips through undetected (causes direct financial loss to the bank). |
| **4** | *Why use Scikit-Learn Pipeline instead of individual scaler & model?* | A Scikit-Learn `Pipeline` bundles preprocessing (`ColumnTransformer`, `StandardScaler`, `OneHotEncoder`) with the classifier into a single serializable object (`joblib`). This completely eliminates data leakage and ensures test data is transformed with the exact same parameters computed on training data. |
| **5** | *How does batch CSV upload work?* | The user uploads a CSV file via multipart/form-data. FastAPI parses it into a Pandas DataFrame, runs vectorized inference using `predict_batch()`, persists transactions to the database, and automatically triggers alerts for transactions scoring $\ge 70$. |
| **6** | *How do you explain why a transaction was flagged?* | Our `FraudPredictor` includes heuristic explainability logic that inspects specific threshold violations (e.g., amount $> \$1,500$, velocity $< 60s$, distance $> 500km$, VPN detected) and attaches a human-readable list of risk triggers to the prediction. |
| **7** | *Can your model detect 100% of fraud?* | No machine learning model is 100% accurate. In our test benchmark of 3,000 unseen transactions, our model caught 97 out of 105 frauds (92.38% Recall) with only 30 false alarms (76.38% Precision). Claiming 100% accuracy in real-world fraud is unrealistic because sophisticated fraudsters continually mimic legitimate consumer patterns. |
| **8** | *How is CORS handled?* | FastAPI's `CORSMiddleware` is configured to whitelist frontend origins (e.g., `http://localhost:5173`), enabling secure cross-origin REST requests with credentials. |
| **9** | *What happens when an alert is triggered?* | An alert record is stored with `ACTIVE` status in the `alerts` table. The analyst can view the incident queue, change status to `INVESTIGATING`, or mark as `RESOLVED` / `DISMISSED` after review. |
| **10** | *How would you deploy this to production?* | Dockerize both frontend and backend using Docker Compose, host the FastAPI backend on a cloud VM/container (e.g., AWS ECS, Render, or GCP Cloud Run), connect to a managed AWS RDS PostgreSQL instance, and serve the React build via CDN (e.g., Vercel, Cloudflare Pages, or AWS S3/CloudFront). |
