from fastapi import FastAPI, Depends, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
import os
from typing import List, Optional

from app.core.config import settings
from app.core.database import get_db, engine
#from app.models import models
# Create database tables (for development only; use Alembic for production migrations)
#models.Base.metadata.create_all(bind=engine)
from app.api import auth, uploads, timeline, search
from app.services.auth_service import verify_token

app = FastAPI(
    title="LifeLog AI API",
    description="AI-powered life logging and analysis platform",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Security
security = HTTPBearer()

# Include routers
# Health check endpoint
@app.get("/health")
async def health_check():
    return {"status": "healthy", "message": "LifeLog AI API is running"}

# Include routers
app.include_router(auth.router, prefix="/auth", tags=["authentication"])
app.include_router(uploads.router, prefix="/uploads", tags=["uploads"])
app.include_router(timeline.router, prefix="/timeline", tags=["timeline"])
app.include_router(search.router, prefix="/search", tags=["search"])

@app.get("/")
async def root():
    return {"message": "LifeLog AI API is running"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
