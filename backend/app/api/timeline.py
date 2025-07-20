from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc
from datetime import datetime, timedelta
from typing import List, Optional

from app.core.database import get_db
from app.models import models, schemas
from app.api.auth import get_current_user_dependency

router = APIRouter()

@router.get("/", response_model=List[schemas.Entry])
async def get_timeline(
    date_from: Optional[str] = Query(None, description="Start date (YYYY-MM-DD)"),
    date_to: Optional[str] = Query(None, description="End date (YYYY-MM-DD)"),
    entry_type: Optional[str] = Query(None, description="Filter by entry type"),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    current_user: models.User = Depends(get_current_user_dependency),
    db: Session = Depends(get_db)
):
    """Get user's timeline entries with optional filtering"""
    
    query = db.query(models.Entry).filter(
        models.Entry.user_id == current_user.id
    )
    
    # Date filtering
    if date_from:
        try:
            start_date = datetime.fromisoformat(date_from)
            query = query.filter(models.Entry.created_at >= start_date)
        except ValueError:
            pass
    
    if date_to:
        try:
            end_date = datetime.fromisoformat(date_to)
            # Add one day to include the entire end date
            end_date = end_date + timedelta(days=1)
            query = query.filter(models.Entry.created_at < end_date)
        except ValueError:
            pass
    
    # Entry type filtering
    if entry_type:
        query = query.filter(models.Entry.entry_type == entry_type)
    
    # Order by creation date (newest first)
    entries = query.order_by(desc(models.Entry.created_at)).offset(skip).limit(limit).all()
    
    return [schemas.Entry.from_orm(entry) for entry in entries]

@router.get("/stats")
async def get_timeline_stats(
    current_user: models.User = Depends(get_current_user_dependency),
    db: Session = Depends(get_db)
):
    """Get timeline statistics for the user"""
    
    # Total entries
    total_entries = db.query(models.Entry).filter(
        models.Entry.user_id == current_user.id
    ).count()
    
    # Entries by type
    entries_by_type = {}
    for entry_type in ['text', 'audio', 'image']:
        count = db.query(models.Entry).filter(
            models.Entry.user_id == current_user.id,
            models.Entry.entry_type == entry_type
        ).count()
        entries_by_type[entry_type] = count
    
    # Recent activity (last 7 days)
    week_ago = datetime.utcnow() - timedelta(days=7)
    recent_entries = db.query(models.Entry).filter(
        models.Entry.user_id == current_user.id,
        models.Entry.created_at >= week_ago
    ).count()
    
    # Processing status
    processed_entries = db.query(models.Entry).filter(
        models.Entry.user_id == current_user.id,
        models.Entry.processed == True
    ).count()
    
    pending_entries = total_entries - processed_entries
    
    return {
        "total_entries": total_entries,
        "entries_by_type": entries_by_type,
        "recent_activity": recent_entries,
        "processed_entries": processed_entries,
        "pending_entries": pending_entries
    }

@router.get("/summaries", response_model=List[schemas.WeeklySummary])
async def get_weekly_summaries(
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=50),
    current_user: models.User = Depends(get_current_user_dependency),
    db: Session = Depends(get_db)
):
    """Get user's weekly summaries"""
    
    summaries = db.query(models.WeeklySummary).filter(
        models.WeeklySummary.user_id == current_user.id
    ).order_by(desc(models.WeeklySummary.week_start)).offset(skip).limit(limit).all()
    
    return [schemas.WeeklySummary.from_orm(summary) for summary in summaries]
