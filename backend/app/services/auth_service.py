from google.auth.transport import requests
from google.oauth2 import id_token
from jose import JWTError, jwt
from datetime import datetime, timedelta
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from app.core.config import settings
from app.models import models, schemas
from typing import Optional

class AuthService:
    @staticmethod
    def verify_google_token(token: str) -> dict:
        """Verify Google OAuth token and return user info"""
        try:
            idinfo = id_token.verify_oauth2_token(
                token, requests.Request(), settings.google_client_id
            )
            
            if idinfo['iss'] not in ['accounts.google.com', 'https://accounts.google.com']:
                raise ValueError('Wrong issuer.')
                
            return {
                'google_id': idinfo['sub'],
                'email': idinfo['email'],
                'name': idinfo['name'],
                'picture': idinfo.get('picture')
            }
        except ValueError as e:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=f"Invalid Google token: {str(e)}"
            )
    
    @staticmethod
    def create_access_token(data: dict) -> str:
        """Create JWT access token"""
        to_encode = data.copy()
        expire = datetime.utcnow() + timedelta(hours=settings.jwt_expiration_hours)
        to_encode.update({"exp": expire})
        
        encoded_jwt = jwt.encode(
            to_encode, 
            settings.jwt_secret, 
            algorithm=settings.jwt_algorithm
        )
        return encoded_jwt
    
    @staticmethod
    def get_or_create_user(db: Session, user_data: dict) -> models.User:
        """Get existing user or create new one"""
        user = db.query(models.User).filter(
            models.User.google_id == user_data['google_id']
        ).first()
        
        if not user:
            user = models.User(**user_data)
            db.add(user)
            db.commit()
            db.refresh(user)
        else:
            # Update user info
            user.name = user_data['name']
            user.picture = user_data['picture']
            db.commit()
            db.refresh(user)
            
        return user

def verify_token(token: str) -> dict:
    """Verify JWT token and return payload"""
    try:
        payload = jwt.decode(
            token, 
            settings.jwt_secret, 
            algorithms=[settings.jwt_algorithm]
        )
        return payload
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials"
        )
