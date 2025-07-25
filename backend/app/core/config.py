import os
from pydantic_settings import BaseSettings
from typing import Optional
import warnings

class Settings(BaseSettings):
    # Database
    database_url: str = f"sqlite:///{os.path.abspath('backend/lifelog_dev.db')}"
    
    # Redis
    redis_url: str = "memory://"
    
    # Google OAuth
    google_client_id: Optional[str] = None
    google_client_secret: Optional[str] = None
    
    # OpenAI
    openai_api_key: Optional[str] = None
    
    # JWT
    jwt_secret: str = os.environ.get("JWT_SECRET", "your-secret-key-change-in-production")
    jwt_algorithm: str = os.environ.get("JWT_ALGORITHM", "HS256")
    jwt_expiration_hours: int = int(os.environ.get("JWT_EXPIRATION_HOURS", 24))
    
    # File uploads
    upload_dir: str = os.environ.get("UPLOAD_DIR", "uploads")
    max_file_size: int = int(os.environ.get("MAX_FILE_SIZE", 100 * 1024 * 1024))  # 100MB
    
    test_env_path: Optional[str] = None
    
    class Config:
        env_file = os.path.abspath(os.path.join(os.path.dirname(__file__), '../../../.env'))
        extra = "ignore"  # Ignore extra environment variables

settings = Settings()

# Warn if using default secrets in production
if settings.jwt_secret == "your-secret-key-change-in-production":
    warnings.warn("WARNING: You are using the default JWT secret. Set JWT_SECRET in your environment for production.")

print("ENV FILE PATH:", os.path.abspath(os.path.join(os.path.dirname(__file__), '../../../.env')))
print(".env exists:", os.path.exists(os.path.abspath(os.path.join(os.path.dirname(__file__), '../../../.env'))))
