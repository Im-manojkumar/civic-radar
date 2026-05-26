import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.config import settings
from backend.db import init_db
# Import models so they are registered with SQLAlchemy Base
from backend import models
from backend.routers import auth, policies, regions, datasets, ingest, surveys, ngo_reports, analytics, nlp, alerts, explain, reports, ai

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
@app.get("/api/v1/health")
def health_v1():
    return {"status": "ok"}

# CORS Middleware Setup
if settings.BACKEND_CORS_ORIGINS:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
else:
    # Default permissive CORS for development
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

@app.on_event("startup")
def on_startup():
    logger.info("Starting up Civic Radar Backend...")
    logger.info("Initializing database...")
    init_db()
    logger.info("Database initialized successfully.")

@app.get("/health")
def health_check():
    """
    Health check endpoint to ensure service is running.
    """
    return {"status": "ok", "service": settings.PROJECT_NAME}

@app.get(f"{settings.API_V1_STR}/version")
def version():
    """
    Return API version information.
    """
    return {
        "version": "1.0.0", 
        "environment": "development",
        "api_v1": settings.API_V1_STR
    }

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

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
