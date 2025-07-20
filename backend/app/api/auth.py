from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app.core.database import get_db
from app.models import models, schemas
from app.services.auth_service import AuthService, verify_token

router = APIRouter()
security = HTTPBearer()

class GoogleTokenRequest(BaseModel):
    token: str

class DemoLoginRequest(BaseModel):
    email: str
    password: str

@router.post("/google", response_model=schemas.TokenResponse)
async def google_auth(
    request: GoogleTokenRequest,
    db: Session = Depends(get_db)
):
    """Authenticate user with Google OAuth token"""
    try:
        # Verify Google token
        user_data = AuthService.verify_google_token(request.token)
        
        # Get or create user
        user = AuthService.get_or_create_user(db, user_data)
        
        # Create JWT token
        access_token = AuthService.create_access_token(
            data={"sub": str(user.id), "email": user.email}
        )
        
        return schemas.TokenResponse(
            access_token=access_token,
            user=schemas.User.from_orm(user)
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(e)
        )

@router.post("/demo", response_model=schemas.TokenResponse)
async def demo_auth(
    request: DemoLoginRequest,
    db: Session = Depends(get_db)
):
    """Demo authentication for testing without Google OAuth"""
    # Create or get demo user
    demo_user = db.query(models.User).filter(models.User.email == request.email).first()
    
    if not demo_user:
        demo_user = models.User(
            email=request.email,
            name=request.email.split('@')[0].title(),
            google_id=f"demo_{request.email}"
        )
        db.add(demo_user)
        db.commit()
        db.refresh(demo_user)
    
    # Create JWT token
    access_token = AuthService.create_access_token(
        data={"sub": str(demo_user.id), "email": demo_user.email}
    )
    
    return schemas.TokenResponse(
        access_token=access_token,
        user=schemas.User.from_orm(demo_user)
    )

@router.get("/me", response_model=schemas.User)
async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    """Get current authenticated user"""
    token = credentials.credentials
    payload = verify_token(token)
    
    user_id = int(payload.get("sub"))
    user = db.query(models.User).filter(models.User.id == user_id).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return schemas.User.from_orm(user)

async def get_current_user_dependency(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    """Dependency to get current user for protected routes"""
    token = credentials.credentials
    payload = verify_token(token)
    
    user_id = int(payload.get("sub"))
    user = db.query(models.User).filter(models.User.id == user_id).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return user
