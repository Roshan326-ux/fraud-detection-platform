"""
Backend Server Runner
Usage:
    python run_backend.py
"""

import sys
import os
import uvicorn

# Ensure both project root and backend are on python path
root_dir = os.path.dirname(os.path.abspath(__file__))
backend_dir = os.path.join(root_dir, "backend")

if root_dir not in sys.path:
    sys.path.insert(0, root_dir)
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

if __name__ == "__main__":
    print("=" * 70)
    print("  STARTING AI FRAUD DETECTION & RISK ANALYSIS BACKEND API SERVER")
    print("=" * 70)
    print("  Host:         http://127.0.0.1:8000")
    print("  Interactive:  http://127.0.0.1:8000/docs (Swagger UI)")
    print("  Alternative:  http://127.0.0.1:8000/redoc")
    print("  Admin Email:  admin@fraudshield.ai")
    print("  Admin Pass:   Admin@12345")
    print("=" * 70)
    port = int(os.environ.get("PORT", 8000))
    is_dev = port == 8000
    uvicorn.run("app.main:app", host="0.0.0.0", port=port, reload=is_dev)
