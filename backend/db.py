from sqlalchemy import create_engine, text
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

def ensure_missing_columns():
    """Safely adds missing columns to existing tables for MVP schema updates."""
    queries = [
        "ALTER TABLE users ADD COLUMN language_preference VARCHAR DEFAULT 'en';",
        "ALTER TABLE users ADD COLUMN karma_points INTEGER DEFAULT 0;",
        "ALTER TABLE users ADD COLUMN is_active BOOLEAN DEFAULT TRUE;",
        "ALTER TABLE issues ADD COLUMN photo_url TEXT;",
        "ALTER TABLE issues ADD COLUMN ai_analysis TEXT;"
    ]
    with engine.connect() as conn:
        for query in queries:
            try:
                conn.execute(text(query))
                conn.commit()
            except Exception:
                # Column likely already exists, or table doesn't exist yet
                pass

def init_db():
    """Create all tables. Safe to call multiple times."""
    try:
        Base.metadata.create_all(bind=engine)
        ensure_missing_columns()
        logger.info("Database tables created/verified successfully.")
    except Exception as e:
        logger.error(f"Database initialization error: {e}")
        raise
