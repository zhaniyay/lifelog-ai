from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base
from sqlalchemy.orm import sessionmaker
from app.core.config import settings
import os

# Configure engine based on database type
if settings.database_url.startswith('sqlite'):
    # SQLite configuration
    engine = create_engine(
        settings.database_url,
        connect_args={"check_same_thread": False}  # Needed for SQLite
    )
else:
    # PostgreSQL/MySQL configuration with connection pool tuning
    engine = create_engine(
        settings.database_url,
        pool_size=int(os.environ.get("DB_POOL_SIZE", 10)),
        max_overflow=int(os.environ.get("DB_MAX_OVERFLOW", 20)),
        pool_timeout=int(os.environ.get("DB_POOL_TIMEOUT", 30)),
        pool_recycle=int(os.environ.get("DB_POOL_RECYCLE", 1800)),
    )
# To re-enable Alembic migrations, add alembic.ini and alembic/ back to backend/ and use the same engine.

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
