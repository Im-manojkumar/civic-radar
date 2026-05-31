from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import List, Optional
from backend.db import get_db
from backend.models import Issue, IssueUpvote, IssueStatusUpdate, User, IssueStatus, Region
from backend.schemas.issues import (
    IssueCreate, IssueResponse, UpvoteResponse,
    StatusUpdateCreate, StatusUpdateResponse,
    IssueAssign, IssueComment
)
from backend.security.jwt import get_current_active_user, get_current_admin_user
from backend.services import ai_service

router = APIRouter(prefix="/issues", tags=["issues"])

# ── Citizen Endpoints ──

@router.get("/", response_model=List[IssueResponse])
def get_issues(
    status: Optional[IssueStatus] = None,
    region_id: Optional[str] = None,
    limit: int = 50,
    db: Session = Depends(get_db)
):
    query = db.query(Issue)
    if status:
        query = query.filter(Issue.status == status)
    if region_id:
        query = query.filter(Issue.region_id == region_id)
        
    issues = query.order_by(desc(Issue.created_at)).limit(limit).all()
    return issues

@router.get("/my", response_model=List[IssueResponse])
def get_my_issues(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get all issues reported by the current user."""
    issues = db.query(Issue).filter(
        Issue.reporter_id == current_user.id
    ).order_by(desc(Issue.created_at)).all()
    return issues

@router.post("/", response_model=IssueResponse)
def create_issue(
    payload: IssueCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    # Perform deterministic analysis
    analysis = ai_service.analyze_issue_deterministic(payload.description)
    
    # Auto-routing logic based on Region
    zone_name = "Unassigned Zone"
    officer_name = "Pending Assignment"
    if payload.region_id:
        region = db.query(Region).filter(Region.id == payload.region_id).first()
        if region:
            zone_name = f"{region.name} Zone"
            officer_name = f"{region.name} Area Officer"

    new_issue = Issue(
        title=payload.title,
        description=payload.description,
        category=analysis.get("category", payload.category),
        urgency=analysis.get("urgency", payload.urgency),
        location=payload.location,
        lat=payload.lat,
        lng=payload.lng,
        region_id=payload.region_id,
        assigned_zone=zone_name,
        assigned_officer=officer_name,
        reporter_id=current_user.id,
        ai_analysis=analysis.get("reasoning", ""),
        photo_url=payload.photo_url
    )
    
    # Award Karma Points
    current_user.karma_points = (current_user.karma_points or 0) + 10
    
    db.add(new_issue)
    db.commit()
    db.refresh(new_issue)
    return new_issue

@router.post("/{issue_id}/upvote", response_model=UpvoteResponse)
def upvote_issue(
    issue_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    issue = db.query(Issue).filter(Issue.id == issue_id).first()
    if not issue:
        raise HTTPException(status_code=404, detail="Issue not found")
        
    existing_upvote = db.query(IssueUpvote).filter(
        IssueUpvote.issue_id == issue_id,
        IssueUpvote.user_id == current_user.id
    ).first()
    
    if existing_upvote:
        raise HTTPException(status_code=400, detail="Already upvoted this issue")
        
    upvote = IssueUpvote(issue_id=issue_id, user_id=current_user.id)
    db.add(upvote)
    issue.upvotes += 1
    current_user.karma_points = (current_user.karma_points or 0) + 2
    
    db.commit()
    
    return {
        "issue_id": issue.id,
        "upvotes": issue.upvotes,
        "message": "Upvoted successfully"
    }

# ── Issue Timeline ──

@router.get("/{issue_id}/timeline", response_model=List[StatusUpdateResponse])
def get_issue_timeline(
    issue_id: str,
    db: Session = Depends(get_db)
):
    """Get the full status change history for an issue."""
    issue = db.query(Issue).filter(Issue.id == issue_id).first()
    if not issue:
        raise HTTPException(status_code=404, detail="Issue not found")
    
    updates = db.query(IssueStatusUpdate).filter(
        IssueStatusUpdate.issue_id == issue_id
    ).order_by(IssueStatusUpdate.created_at).all()
    return updates

# ── Admin Endpoints ──

@router.get("/admin/list", response_model=List[IssueResponse])
def get_admin_issues(
    status: Optional[IssueStatus] = None,
    category: Optional[str] = None,
    region_id: Optional[str] = None,
    limit: int = 100,
    offset: int = 0,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Admin: Get all issues with filters."""
    query = db.query(Issue)
    if status:
        query = query.filter(Issue.status == status)
    if category:
        query = query.filter(Issue.category == category)
    if region_id:
        query = query.filter(Issue.region_id == region_id)
    
    issues = query.order_by(desc(Issue.created_at)).offset(offset).limit(limit).all()
    return issues

@router.patch("/{issue_id}/status", response_model=IssueResponse)
def update_issue_status(
    issue_id: str,
    payload: StatusUpdateCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Admin: Update issue status and log the change."""
    issue = db.query(Issue).filter(Issue.id == issue_id).first()
    if not issue:
        raise HTTPException(status_code=404, detail="Issue not found")
    
    old_status = issue.status
    
    # Create status update log
    status_update = IssueStatusUpdate(
        issue_id=issue_id,
        old_status=old_status,
        new_status=payload.new_status,
        comment=payload.comment,
        updated_by_id=current_user.id
    )
    db.add(status_update)
    
    # Update the issue
    issue.status = payload.new_status
    db.commit()
    db.refresh(issue)
    return issue

@router.patch("/{issue_id}/assign", response_model=IssueResponse)
def assign_issue(
    issue_id: str,
    payload: IssueAssign,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Admin: Assign an officer to an issue."""
    issue = db.query(Issue).filter(Issue.id == issue_id).first()
    if not issue:
        raise HTTPException(status_code=404, detail="Issue not found")
    
    issue.assigned_officer = payload.assigned_officer
    if payload.assigned_zone:
        issue.assigned_zone = payload.assigned_zone
    
    db.commit()
    db.refresh(issue)
    return issue

@router.post("/{issue_id}/comment", response_model=StatusUpdateResponse)
def add_issue_comment(
    issue_id: str,
    payload: IssueComment,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Admin: Add a comment to an issue (logged as a status update with same status)."""
    issue = db.query(Issue).filter(Issue.id == issue_id).first()
    if not issue:
        raise HTTPException(status_code=404, detail="Issue not found")
    
    status_update = IssueStatusUpdate(
        issue_id=issue_id,
        old_status=issue.status,
        new_status=issue.status,
        comment=payload.comment,
        updated_by_id=current_user.id
    )
    db.add(status_update)
    db.commit()
    db.refresh(status_update)
    return status_update
