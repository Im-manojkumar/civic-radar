import logging
import traceback
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.config import settings

# Setup Structured Logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger("civic_radar")

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# CORS Middleware Setup - permissive for all origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/v1/health")
def health_v1():
    return {"status": "ok"}

@app.get("/health")
def health_check():
    return {"status": "ok", "service": settings.PROJECT_NAME}

@app.get(f"{settings.API_V1_STR}/version")
def version():
    return {
        "version": "1.0.0",
        "environment": "production",
        "api_v1": settings.API_V1_STR,
        "database_configured": "sqlite" not in settings.DATABASE_URL
    }

# Initialize database directly at import time (serverless has no persistent startup)
db_status = "not initialized"
try:
    from backend.db import init_db
    from backend import models
    init_db()
    db_status = "ok"
    logger.info("Database initialized successfully.")
except Exception as e:
    db_status = f"error: {e}"
    logger.error(f"DB init error: {e}")
    logger.error(traceback.format_exc())

@app.get(f"{settings.API_V1_STR}/debug")
def debug_info():
    db_check = "pending"
    try:
        from backend.db import SessionLocal
        from backend.models import User
        db = SessionLocal()
        user = db.query(User).first()
        if user:
            db_check = f"found user {user.email}, columns exist!"
        else:
            db_check = "no users, but query successful"
        db.close()
    except Exception as e:
        db_check = f"Error: {e}"
    
    return {"db_status": db_status, "database_url_set": "sqlite" not in settings.DATABASE_URL, "query_test": db_check}

# Import and register routers
try:
    from backend.routers import auth, policies, regions, datasets, ingest, surveys, ngo_reports, analytics, nlp, alerts, explain, reports, ai, issues, uploads

    app.include_router(auth.router, prefix=settings.API_V1_STR)
    app.include_router(policies.router, prefix=settings.API_V1_STR)
    app.include_router(regions.router, prefix=settings.API_V1_STR)
    app.include_router(datasets.router, prefix=settings.API_V1_STR)
    app.include_router(ingest.router, prefix=settings.API_V1_STR)
    app.include_router(surveys.router, prefix=settings.API_V1_STR)
    app.include_router(ngo_reports.router, prefix=settings.API_V1_STR)
    app.include_router(analytics.router, prefix=settings.API_V1_STR)
    app.include_router(nlp.router, prefix=settings.API_V1_STR)
    app.include_router(alerts.router, prefix=settings.API_V1_STR)
    app.include_router(explain.router, prefix=settings.API_V1_STR)
    app.include_router(reports.router, prefix=settings.API_V1_STR)
    app.include_router(ai.router, prefix=settings.API_V1_STR)
    app.include_router(issues.router, prefix=settings.API_V1_STR)
    app.include_router(uploads.router, prefix=settings.API_V1_STR)

    logger.info("All routers registered successfully.")
except Exception as e:
    logger.error(f"Failed to load backend modules: {e}")
    logger.error(traceback.format_exc())

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

