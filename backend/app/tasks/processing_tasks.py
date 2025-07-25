from celery import current_task
from sqlalchemy.orm import Session
from app.celery_app import celery_app
from app.core.database import SessionLocal
from app.models import models
from app.services.file_service import FileService
import logging
import os
import time

logger = logging.getLogger(__name__)

@celery_app.task(bind=True, max_retries=3, default_retry_delay=5)
def process_file_task(self, entry_id: int):
    """Background task to process uploaded files with retry and file existence check"""
    db = SessionLocal()
    file_service = FileService()
    try:
        # Get entry from database
        entry = db.query(models.Entry).filter(models.Entry.id == entry_id).first()
        if not entry:
            raise Exception(f"Entry {entry_id} not found")
        # Check if file exists
        if not entry.file_path or not os.path.exists(entry.file_path):
            logger.error(f"File for entry {entry_id} does not exist: {entry.file_path}")
            raise FileNotFoundError(f"File for entry {entry_id} does not exist: {entry.file_path}")
        # Update task progress
        current_task.update_state(state='PROGRESS', meta={'progress': 25})
        # Process file based on type
        content = ""
        try:
            if entry.entry_type == 'text':
                content = file_service.process_text_file(entry.file_path)
            elif entry.entry_type == 'audio':
                content = file_service.process_audio_file(entry.file_path)
            elif entry.entry_type == 'image':
                content = file_service.process_image_file(entry.file_path)
        except Exception as e:
            logger.error(f"Processing failed for entry {entry_id}: {str(e)}. Retrying...")
            raise self.retry(exc=e)
        current_task.update_state(state='PROGRESS', meta={'progress': 75})
        # Update entry with extracted content
        entry.content = content
        entry.processed = True
        db.commit()
        current_task.update_state(state='SUCCESS', meta={'progress': 100})
        logger.info(f"Successfully processed file for entry {entry_id}")
        return {"status": "success", "entry_id": entry_id}
    except FileNotFoundError as fnf:
        logger.error(str(fnf))
        entry = db.query(models.Entry).filter(models.Entry.id == entry_id).first()
        if entry:
            entry.processed = False
            db.commit()
        current_task.update_state(
            state='FAILURE',
            meta={'error': str(fnf)}
        )
        raise fnf
    except Exception as e:
        logger.error(f"Error processing file for entry {entry_id}: {str(e)}")
        entry = db.query(models.Entry).filter(models.Entry.id == entry_id).first()
        if entry:
            entry.processed = False
            db.commit()
        current_task.update_state(
            state='FAILURE',
            meta={'error': str(e)}
        )
        raise e
    finally:
        db.close()

@celery_app.task
def generate_weekly_summary_task(user_id: int, week_start: str, week_end: str):
    """Background task to generate weekly summaries using GPT-4"""
    db = SessionLocal()
    
    try:
        # Get user entries for the week
        from datetime import datetime
        start_date = datetime.fromisoformat(week_start)
        end_date = datetime.fromisoformat(week_end)
        
        entries = db.query(models.Entry).filter(
            models.Entry.user_id == user_id,
            models.Entry.created_at >= start_date,
            models.Entry.created_at <= end_date,
            models.Entry.processed == True
        ).all()
        
        if not entries:
            return {"status": "no_entries"}
        
        # Combine all content
        combined_content = "\n\n".join([
            f"Entry {i+1} ({entry.entry_type}): {entry.content[:500]}..."
            for i, entry in enumerate(entries)
        ])
        
        # Generate summary using OpenAI (placeholder for now)
        summary = f"Weekly summary for {len(entries)} entries from {week_start} to {week_end}. " \
                 f"Activities included various {', '.join(set(e.entry_type for e in entries))} entries."
        
        # Save summary to database
        weekly_summary = models.WeeklySummary(
            user_id=user_id,
            week_start=start_date,
            week_end=end_date,
            summary=summary
        )
        db.add(weekly_summary)
        db.commit()
        
        logger.info(f"Generated weekly summary for user {user_id}")
        return {"status": "success", "summary_id": weekly_summary.id}
        
    except Exception as e:
        logger.error(f"Error generating weekly summary: {str(e)}")
        raise e
    finally:
        db.close()
