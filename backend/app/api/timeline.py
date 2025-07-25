from fastapi import APIRouter, Depends, Query, HTTPException
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
            raise HTTPException(
                status_code=400,
                detail=f"Invalid date_from format: '{date_from}'. Expected YYYY-MM-DD."
            )
    
    if date_to:
        try:
            end_date = datetime.fromisoformat(date_to)
            # Add one day to include the entire end date
            end_date = end_date + timedelta(days=1)
            query = query.filter(models.Entry.created_at < end_date)
        except ValueError:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid date_to format: '{date_to}'. Expected YYYY-MM-DD."
            )
    
    # Entry type filtering
    if entry_type:
        query = query.filter(models.Entry.entry_type == entry_type)
    
    # Order by creation date (newest first)
    entries = query.order_by(desc(models.Entry.created_at)).offset(skip).limit(limit).all()
    
    return [schemas.Entry.model_validate(entry) for entry in entries]

@router.get("/stats")
async def get_timeline_stats(
    current_user: models.User = Depends(get_current_user_dependency),
    db: Session = Depends(get_db),
    batch: Optional[int] = Query(None, description="Batch number for stats (optional)"),
    batch_size: Optional[int] = Query(None, description="Batch size for stats (optional)")
):
    """Get timeline statistics for the user, optionally in batches for large datasets"""
    query = db.query(models.Entry).filter(
        models.Entry.user_id == current_user.id
    )
    if batch is not None and batch_size is not None:
        query = query.offset(batch * batch_size).limit(batch_size)
    
    # Total entries (batched if requested)
    total_entries = query.count()
    
    # Entries by type
    entries_by_type = {}
    for entry_type in ['text', 'audio', 'image']:
        type_query = db.query(models.Entry).filter(
            models.Entry.user_id == current_user.id,
            models.Entry.entry_type == entry_type
        )
        if batch is not None and batch_size is not None:
            type_query = type_query.offset(batch * batch_size).limit(batch_size)
        count = type_query.count()
        entries_by_type[entry_type] = count
    
    # Recent activity (last 7 days)
    week_ago = datetime.utcnow() - timedelta(days=7)
    recent_query = db.query(models.Entry).filter(
        models.Entry.user_id == current_user.id,
        models.Entry.created_at >= week_ago
    )
    if batch is not None and batch_size is not None:
        recent_query = recent_query.offset(batch * batch_size).limit(batch_size)
    recent_entries = recent_query.count()
    
    # Processing status
    processed_query = db.query(models.Entry).filter(
        models.Entry.user_id == current_user.id,
        models.Entry.processed == True
    )
    if batch is not None and batch_size is not None:
        processed_query = processed_query.offset(batch * batch_size).limit(batch_size)
    processed_entries = processed_query.count()
    
    pending_entries = total_entries - processed_entries
    
    return {
        "total_entries": total_entries,
        "entries_by_type": entries_by_type,
        "recent_activity": recent_entries,
        "processed_entries": processed_entries,
        "pending_entries": pending_entries
    }

@router.get("/weekly-summaries", response_model=List[schemas.WeeklySummary])
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
    
    return [schemas.WeeklySummary.model_validate(summary) for summary in summaries]


@router.post("/generate-summary")
async def generate_weekly_summary(
    current_user: models.User = Depends(get_current_user_dependency),
    db: Session = Depends(get_db)
):
    """Generate a new weekly summary for the current user"""
    from datetime import datetime, timedelta
    
    try:
        # Calculate the date range for the current week
        today = datetime.now()
        week_start = today - timedelta(days=today.weekday())
        week_end = week_start + timedelta(days=6)
        
        # Get user's entries for the week
        entries = db.query(models.Entry).filter(
            models.Entry.user_id == current_user.id,
            models.Entry.created_at >= week_start,
            models.Entry.created_at <= week_end + timedelta(days=1)
        ).all()
        
        # Generate summary using OpenAI (even if no entries)
        from app.core.config import settings
        import openai
        import logging
        
        # Debug output
        import os
        print(f"DEBUG: OpenAI API key configured: {bool(settings.openai_api_key)}")
        print(f"DEBUG: Raw env var OPENAI_API_KEY: {bool(os.getenv('OPENAI_API_KEY'))}")
        if os.getenv('OPENAI_API_KEY'):
            print(f"DEBUG: Raw env var starts with: {os.getenv('OPENAI_API_KEY')[:10]}...")
        if settings.openai_api_key:
            print(f"DEBUG: Settings API key starts with: {settings.openai_api_key[:10]}...")
        
        if not entries:
            # No entries case - use GPT to provide helpful feedback
            if not settings.openai_api_key:
                print("DEBUG: Using fallback summary - no OpenAI key (no entries)")
                summary = f"No entries were logged for the week of {week_start.strftime('%Y-%m-%d')} to {week_end.strftime('%Y-%m-%d')}. Consider adding some activities to track your weekly progress!"
            else:
                # Use OpenAI to generate helpful feedback for no entries
                openai.api_key = settings.openai_api_key
                
                try:
                    print("DEBUG: Attempting OpenAI API call for no entries case...")
                    response = openai.ChatCompletion.create(
                        model="gpt-3.5-turbo",
                        messages=[
                            {"role": "system", "content": "You are a helpful life coach assistant. The user has no logged activities for this week."},
                            {"role": "user", "content": f"I have no logged activities for the week of {week_start.strftime('%Y-%m-%d')} to {week_end.strftime('%Y-%m-%d')}. Please provide encouraging and helpful feedback about this, and suggest ways to start tracking activities."}
                        ],
                        max_tokens=200
                    )
                    summary = response.choices[0].message.content
                    print("DEBUG: OpenAI API call successful for no entries case")
                except Exception as e:
                    print(f"DEBUG: OpenAI API call failed for no entries: {str(e)}")
                    summary = f"No entries were logged for the week of {week_start.strftime('%Y-%m-%d')} to {week_end.strftime('%Y-%m-%d')}. Consider adding some activities to track your weekly progress! (OpenAI error: {str(e)})"
        else:
            # Check if summary already exists for this week
            existing_summary = db.query(models.WeeklySummary).filter(
                models.WeeklySummary.user_id == current_user.id,
                models.WeeklySummary.week_start == week_start.date(),
                models.WeeklySummary.week_end == week_end.date()
            ).first()
            
            if existing_summary:
                return {
                    "message": "Weekly summary already exists for this week",
                    "status": "already_exists",
                    "summary": existing_summary.summary
                }
            
            # Entries exist case - use GPT to generate comprehensive summary
            if not settings.openai_api_key:
                # Fallback to simple summary if no OpenAI key
                print("DEBUG: Using fallback summary - no OpenAI key")
                summary = f"Weekly summary for {len(entries)} entries from {week_start.strftime('%Y-%m-%d')} to {week_end.strftime('%Y-%m-%d')}. " \
                         f"Activities included: {', '.join(set(e.entry_type for e in entries))}."
            else:
                # Use OpenAI to generate summary
                openai.api_key = settings.openai_api_key
                
                # Combine all content
                combined_content = "\n\n".join([
                    f"Entry {i+1} ({entry.entry_type}): {entry.content[:500]}..."
                    for i, entry in enumerate(entries)
                ])
                
                try:
                    print("DEBUG: Attempting OpenAI API call...")
                    response = openai.ChatCompletion.create(
                        model="gpt-3.5-turbo",
                        messages=[
                            {"role": "system", "content": "You are a helpful assistant that creates concise weekly summaries of life activities."},
                            {"role": "user", "content": f"Please create a brief weekly summary of these activities:\n\n{combined_content}"}
                        ],
                        max_tokens=300
                    )
                    summary = response.choices[0].message.content
                    print("DEBUG: OpenAI API call successful")
                except Exception as e:
                    # Fallback if OpenAI fails
                    print(f"DEBUG: OpenAI API call failed: {str(e)}")
                    summary = f"Weekly summary for {len(entries)} entries from {week_start.strftime('%Y-%m-%d')} to {week_end.strftime('%Y-%m-%d')}. " \
                             f"Activities included: {', '.join(set(e.entry_type for e in entries))}. (OpenAI error: {str(e)})"
        
        # Save summary to database
        weekly_summary = models.WeeklySummary(
            user_id=current_user.id,
            week_start=week_start.date(),
            week_end=week_end.date(),
            summary=summary
        )
        
        db.add(weekly_summary)
        db.commit()
        db.refresh(weekly_summary)
        
        return {
            "message": "Weekly summary generated successfully",
            "status": "success",
            "summary": summary
        }
        
    except Exception as e:
        return {
            "message": f"Error generating weekly summary: {str(e)}",
            "status": "error"
        }
