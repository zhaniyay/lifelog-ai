from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import or_
from typing import List

from app.core.database import get_db
from app.models import models, schemas
from app.api.auth import get_current_user_dependency

router = APIRouter()

@router.post("/", response_model=schemas.SearchResult)
async def search_entries(
    search_query: schemas.SearchQuery,
    current_user: models.User = Depends(get_current_user_dependency),
    db: Session = Depends(get_db)
):
    """Search user's entries using text matching"""
    
    if not search_query.query.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Search query cannot be empty"
        )
    
    # Simple text search (can be enhanced with semantic search later)
    query_terms = search_query.query.lower().split()
    
    # Build search conditions
    search_conditions = []
    for term in query_terms:
        search_conditions.extend([
            models.Entry.title.ilike(f"%{term}%"),
            models.Entry.content.ilike(f"%{term}%"),
            models.Entry.original_filename.ilike(f"%{term}%")
        ])
    
    # Execute search
    entries = db.query(models.Entry).filter(
        models.Entry.user_id == current_user.id,
        models.Entry.processed == True,
        or_(*search_conditions)
    ).limit(search_query.limit).all()
    
    return schemas.SearchResult(
        entries=[schemas.Entry.from_orm(entry) for entry in entries],
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
    
    # Extract common terms (simplified version)
    suggestions = []
    for entry in entries[:10]:  # Limit for demo
        if entry.title:
            suggestions.append(entry.title[:30])
    
    return {"suggestions": list(set(suggestions))}
