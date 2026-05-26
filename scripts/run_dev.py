import uvicorn
import os
import sys

# Ensure backend dir is in path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

if __name__ == "__main__":
    print("Starting Civic Radar TN Backend...")
    # Using 'app.main:app' assumes this script is run from the `backend/` root or path is set correctly.
    # Since we added path above, we can import, but uvicorn needs string import path.
    # We run uvicorn on app directory.
    
    # Check if .env exists, warn if not
    if not os.path.exists(".env"):
        print("Warning: .env file not found. Ensure API_KEY is set in environment.")

    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
