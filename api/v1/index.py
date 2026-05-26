import sys
import os

# Ensure the project root is on the Python path so 'backend' package is importable
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from backend.main import app

# Vercel's @vercel/python runtime auto-detects 'app' as an ASGI application
