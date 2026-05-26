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
        "api_v1": settings.API_V1_STR
    }

# Database init and router registration
# Wrapped in try/except so the app still starts even if DB is temporarily unavailable
try:
    from backend.db import init_db
    from backend import models
    from backend.routers import auth, policies, regions, datasets, ingest, surveys, ngo_reports, analytics, nlp, alerts, explain, reports, ai

    @app.on_event("startup")
    def on_startup():
        logger.info("Starting up Civic Radar Backend...")
        try:
            init_db()
            logger.info("Database initialized successfully.")
        except Exception as e:
            logger.error(f"Database init failed: {e}")
            logger.error(traceback.format_exc())

    # Register Routers
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
    logger.info("All routers registered successfully.")
except Exception as e:
    logger.error(f"Failed to load backend modules: {e}")
    logger.error(traceback.format_exc())
    
    @app.get(f"{settings.API_V1_STR}/error")
    def error_info():
        return {"error": str(e), "detail": "Backend modules failed to load. Check logs."}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
