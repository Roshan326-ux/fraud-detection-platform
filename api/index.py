import os
import sys

# Ensure project root and backend are on python path
root_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
backend_dir = os.path.join(root_dir, "backend")

if root_dir not in sys.path:
    sys.path.insert(0, root_dir)
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from backend.app.main import app
from backend.app.db.init_db import init_db

# Initialize database on startup / cold start
try:
    init_db()
except Exception as e:
    print(f"[Vercel Init DB Error]: {e}")
