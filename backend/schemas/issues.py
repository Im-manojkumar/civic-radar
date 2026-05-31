from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from backend.models import Urgency, IssueStatus

class IssueBase(BaseModel):
    title: str
    description: str
    category: Optional[str] = None
    urgency: Optional[Urgency] = Urgency.MEDIUM
    location: Optional[str] = None
    lat: Optional[float] = None
    lng: Optional[float] = None
    region_id: Optional[str] = None

class IssueCreate(IssueBase):
    photo_url: Optional[str] = None

class IssueResponse(IssueBase):
    id: str
    status: IssueStatus
    reporter_id: Optional[str] = None
    upvotes: int = 0
    assigned_zone: Optional[str] = None
    assigned_officer: Optional[str] = None
    ai_analysis: Optional[str] = None
    photo_url: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        orm_mode = True

class UpvoteResponse(BaseModel):
    issue_id: str
    upvotes: int
    message: str

# --- Status Lifecycle ---

class StatusUpdateCreate(BaseModel):
    new_status: IssueStatus
    comment: Optional[str] = None

class StatusUpdateResponse(BaseModel):
    id: str
    issue_id: str
    old_status: IssueStatus
    new_status: IssueStatus
    comment: Optional[str] = None
    updated_by_id: Optional[str] = None
    created_at: datetime

    class Config:
        orm_mode = True

# --- Admin CRM ---

class IssueAssign(BaseModel):
    assigned_officer: str
    assigned_zone: Optional[str] = None

class IssueComment(BaseModel):
    comment: str
