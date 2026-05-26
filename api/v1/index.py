import sys
import os
import traceback

# Ensure the project root is on the Python path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

try:
    from backend.main import app
except Exception as e:
    # If backend fails to import, create a minimal app that shows the error
    from fastapi import FastAPI
    app = FastAPI()
    error_detail = traceback.format_exc()
    
    @app.get("/{path:path}")
    def catch_all(path: str = ""):
        return {
            "error": "Backend failed to load",
            "type": type(e).__name__,
            "message": str(e),
            "traceback": error_detail
        }
