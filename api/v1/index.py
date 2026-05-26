import sys
import os

# Ensure project root is on Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", ".."))

from fastapi import FastAPI

# Create app at module level first — Vercel requires this
app = FastAPI()

# Now try to import the real backend app (overwrites 'app' on success)
try:
    from backend.main import app
except Exception:
    import traceback
    err = traceback.format_exc()

    @app.get("/api/v1/health")
    def health():
        return {"status": "error", "detail": "Backend failed to load"}

    @app.get("/api/v1/{path:path}")
    def fallback(path: str = ""):
        return {"error": "Backend failed to load", "traceback": err}
