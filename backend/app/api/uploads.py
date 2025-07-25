from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from sqlalchemy.orm import Session
from typing import List, Optional
import os

from app.core.database import get_db
from app.models import models, schemas
from app.api.auth import get_current_user_dependency
from app.services.file_service import FileService
from app.tasks.processing_tasks import process_file_task
from app.core.config import settings

router = APIRouter()

@router.post("/file", response_model=schemas.Entry)
async def upload_file(
    file: UploadFile = File(...),
    title: Optional[str] = Form(None),
    current_user: models.User = Depends(get_current_user_dependency),
    db: Session = Depends(get_db)
):
    """Upload and process a file"""
    
    # Read file content to check size
    file_content = await file.read()
    file_size = len(file_content)
    if file_size > settings.max_file_size:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"File size exceeds maximum limit of {settings.max_file_size} bytes"
        )
    # Reset file pointer for downstream consumers
    file.file.seek(0)
    
    file_service = FileService()
    
    # Determine file type using content-based validation
    file_type = file_service.get_file_type(file.filename, file_content=file_content)
    if file_type == 'unknown':
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Unsupported or unrecognized file type"
        )
    
    try:
        # Save file
        file_path, original_filename = await file_service.save_file(file, current_user.id)
        file_saved = True
        
        # Create entry in database
        entry = models.Entry(
            user_id=current_user.id,
            title=title or original_filename,
            entry_type=file_type,
            file_path=file_path,
            original_filename=original_filename,
            file_size=file_size,
            processed=False
        )
        
        db.add(entry)
        try:
            db.commit()
            db.refresh(entry)
        except Exception as db_exc:
            # Rollback and cleanup file if DB commit fails
            db.rollback()
            if file_saved and os.path.exists(file_path):
                file_service.delete_file(file_path)
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to save entry to database: {str(db_exc)}"
            )
        
        # Start background processing task
        process_file_task.delay(entry.id)
        
        return schemas.Entry.model_validate(entry)
        
    except Exception as e:
        # Cleanup file if it was saved
        if 'file_path' in locals() and os.path.exists(file_path):
            file_service.delete_file(file_path)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to upload file: {str(e)}"
        )

@router.get("/", response_model=List[schemas.Entry])
async def get_user_entries(
    skip: int = 0,
    limit: int = 50,
    current_user: models.User = Depends(get_current_user_dependency),
    db: Session = Depends(get_db)
):
    """Get user's uploaded entries"""
    entries = db.query(models.Entry).filter(
        models.Entry.user_id == current_user.id
    ).offset(skip).limit(limit).all()
    
    return [schemas.Entry.model_validate(entry) for entry in entries]

@router.get("/{entry_id}", response_model=schemas.Entry)
async def get_entry(
    entry_id: int,
    current_user: models.User = Depends(get_current_user_dependency),
    db: Session = Depends(get_db)
):
    """Get specific entry"""
    entry = db.query(models.Entry).filter(
        models.Entry.id == entry_id,
        models.Entry.user_id == current_user.id
    ).first()
    
    if not entry:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Entry not found"
        )
    
    return schemas.Entry.model_validate(entry)

@router.delete("/{entry_id}")
async def delete_entry(
    entry_id: int,
    current_user: models.User = Depends(get_current_user_dependency),
    db: Session = Depends(get_db)
):
    """Delete entry and associated file"""
    entry = db.query(models.Entry).filter(
        models.Entry.id == entry_id,
        models.Entry.user_id == current_user.id
    ).first()
    
    if not entry:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Entry not found"
        )
    
    # Delete file from filesystem
    file_service = FileService()
    if entry.file_path and os.path.exists(entry.file_path):
        file_service.delete_file(entry.file_path)
    
    # Delete entry from database
    db.delete(entry)
    db.commit()
    
    return {"message": "Entry deleted successfully"}
