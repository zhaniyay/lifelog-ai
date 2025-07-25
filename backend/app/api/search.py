from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import or_, func
from typing import List

from app.core.database import get_db, engine
from app.models import models, schemas
from app.api.auth import get_current_user_dependency

router = APIRouter()

def is_postgres():
    return str(engine.url).startswith("postgresql")

@router.post("/", response_model=schemas.SearchResult)
async def search_entries(
    search_query: schemas.SearchQuery,
    current_user: models.User = Depends(get_current_user_dependency),
    db: Session = Depends(get_db)
):
    """Search user's entries using full-text search if PostgreSQL, else fallback to ilike"""
    
    if not search_query.query.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Search query cannot be empty"
        )
    
    if is_postgres():
        # Use PostgreSQL full-text search
        ts_vector = (
            func.to_tsvector('english', models.Entry.title) +
            func.to_tsvector('english', func.coalesce(models.Entry.content, '')) +
            func.to_tsvector('english', func.coalesce(models.Entry.original_filename, ''))
        )
        ts_query = func.plainto_tsquery('english', search_query.query)
        entries = db.query(models.Entry).filter(
            models.Entry.user_id == current_user.id,
            models.Entry.processed == True,
            ts_vector.op('@@')(ts_query)
        ).limit(search_query.limit).all()
    else:
        # Fallback to ilike
        query_terms = search_query.query.lower().split()
        search_conditions = []
        for term in query_terms:
            search_conditions.extend([
                models.Entry.title.ilike(f"%{term}%"),
                models.Entry.content.ilike(f"%{term}%"),
                models.Entry.original_filename.ilike(f"%{term}%")
            ])
        entries = db.query(models.Entry).filter(
            models.Entry.user_id == current_user.id,
            models.Entry.processed == True,
            or_(*search_conditions)
        ).limit(search_query.limit).all()
    
    return schemas.SearchResult(
        entries=[schemas.Entry.model_validate(entry) for entry in entries],
        total=len(entries)
    )

@router.get("/suggestions")
async def get_search_suggestions(
    current_user: models.User = Depends(get_current_user_dependency),
    db: Session = Depends(get_db)
):
    """Get search suggestions based on user's content"""
    
    # Get common words from titles and content
    entries = db.query(models.Entry).filter(
        models.Entry.user_id == current_user.id,
        models.Entry.processed == True
    ).limit(100).all()
    
    # Extract common terms (sanitized, unique, limited)
    suggestions = set()
    for entry in entries:
        if entry.title:
            suggestion = entry.title[:30].strip()
            if suggestion:
                suggestions.add(suggestion)
        if len(suggestions) >= 10:
            break
    
    return {"suggestions": list(suggestions)}
