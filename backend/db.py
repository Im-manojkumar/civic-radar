from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase
from backend.config import settings
import logging

logger = logging.getLogger("civic_radar")

database_url = settings.DATABASE_URL

# SQLite specific connection arguments
connect_args = {}
if "sqlite" in database_url:
    connect_args = {"check_same_thread": False}

# Supabase / PostgreSQL: ensure sslmode is set
if "postgresql" in database_url or "postgres" in database_url:
    if "sslmode" not in database_url:
        separator = "&" if "?" in database_url else "?"
        database_url = f"{database_url}{separator}sslmode=require"

engine = create_engine(
    database_url, 
    connect_args=connect_args,
    pool_pre_ping=True,  # Test connections before using them
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

class Base(DeclarativeBase):
    pass

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def init_db():
    """Create all tables. Safe to call multiple times."""
    try:
        Base.metadata.create_all(bind=engine)
        logger.info("Database tables created/verified successfully.")
    except Exception as e:
        logger.error(f"Database initialization error: {e}")
        raise
