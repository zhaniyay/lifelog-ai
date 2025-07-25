from sqlalchemy import Column, Integer, String, DateTime, Text, ForeignKey, Boolean, LargeBinary, UniqueConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    google_id = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    name = Column(String)
    picture = Column(String)
    password_hash = Column(String, nullable=True)  # For demo users only
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    entries = relationship("Entry", back_populates="user", cascade="all, delete-orphan")
    summaries = relationship("WeeklySummary", back_populates="user", cascade="all, delete-orphan")

class Entry(Base):
    __tablename__ = "entries"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"))
    title = Column(String)
    content = Column(Text)
    entry_type = Column(String)  # 'text', 'audio', 'image'
    file_path = Column(String)
    original_filename = Column(String)
    file_size = Column(Integer)
    processed = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    __table_args__ = (
        # Example unique constraint: user cannot have two entries with the same title
        # (adjust as needed for your use case)
        UniqueConstraint('user_id', 'title', name='uq_user_entry_title'),
    )
    
    # Relationships
    user = relationship("User", back_populates="entries")

class WeeklySummary(Base):
    __tablename__ = "weekly_summaries"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"))
    week_start = Column(DateTime(timezone=True))
    week_end = Column(DateTime(timezone=True))
    summary = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    user = relationship("User", back_populates="summaries")

class SearchIndex(Base):
    __tablename__ = "search_index"
    
    id = Column(Integer, primary_key=True, index=True)
    entry_id = Column(Integer, ForeignKey("entries.id", ondelete="CASCADE"))
    embedding = Column(LargeBinary)  # Store FAISS embeddings
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    entry = relationship("Entry")
