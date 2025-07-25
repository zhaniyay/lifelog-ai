from app.core.database import SessionLocal
from app.models.models import Entry
from sqlalchemy import func

def remove_entry_duplicates():
    db = SessionLocal()
    # Find all (user_id, title) pairs with duplicates
    duplicates = db.query(
        Entry.user_id, Entry.title, func.count(Entry.id)
    ).group_by(Entry.user_id, Entry.title).having(func.count(Entry.id) > 1).all()

    for user_id, title, count in duplicates:
        # Get all entries for this user_id/title, ordered by created_at
        entries = db.query(Entry).filter(
            Entry.user_id == user_id,
            Entry.title == title
        ).order_by(Entry.created_at.asc()).all()
        # Keep the first, delete the rest
        for entry in entries[1:]:
            db.delete(entry)
    db.commit()
    db.close()

if __name__ == "__main__":
    remove_entry_duplicates()
    print("Duplicate entries removed.") 