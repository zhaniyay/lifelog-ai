from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List

class UserBase(BaseModel):
    email: str
    name: str
    picture: Optional[str] = None

class UserCreate(UserBase):
    google_id: str

class User(UserBase):
    id: int
    google_id: str
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

class EntryBase(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    entry_type: str

class EntryCreate(EntryBase):
    pass

class Entry(EntryBase):
    id: int
    user_id: int
    file_path: Optional[str] = None
    original_filename: Optional[str] = None
    file_size: Optional[int] = None
    processed: bool = False
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

class WeeklySummaryBase(BaseModel):
    summary: str

class WeeklySummary(WeeklySummaryBase):
    id: int
    user_id: int
    week_start: datetime
    week_end: datetime
    created_at: datetime
    
    class Config:
        from_attributes = True

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: User

class SearchQuery(BaseModel):
    query: str
    limit: int = 10

class SearchResult(BaseModel):
    entries: List[Entry]
    total: int
