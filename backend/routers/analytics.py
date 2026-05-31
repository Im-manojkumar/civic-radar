from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import Integer
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from backend.db import get_db
from backend.services import analytics_service
from backend.security.jwt import get_current_admin_user
from typing import Optional

router = APIRouter(prefix="/analytics", tags=["analytics"])

@router.post("/baseline/run")
def run_baseline(
    signal_id: Optional[str] = Query(None),
    region_id: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_admin_user)
):
    """
    Trigger baseline computation (Mean/StdDev) for numeric signals.
    """
    count = analytics_service.run_baseline_computation(db, signal_id, region_id)
    return {"status": "success", "baselines_updated": count}

@router.post("/deviations/run")
def run_deviations(
    method: str = Query("zscore", regex="^(zscore|cusum|ewma|sudden_drop|changepoint)$"),
    signal_id: Optional[str] = Query(None),
    region_id: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_admin_user)
):
    """
    Trigger anomaly detection using specified statistical method.
    Methods: zscore, cusum, ewma, sudden_drop, changepoint.
    """
    count = analytics_service.run_deviation_detection(db, method, signal_id, region_id)
    return {"status": "success", "anomalies_detected": count}

@router.get("/leaderboard")
def get_leaderboard(db: Session = Depends(get_db)):
    """
    Get ward/region leaderboard based on resolution time.
    """
    return analytics_service.get_ward_leaderboard(db)

@router.get("/predictive")
def get_predictive_analytics(db: Session = Depends(get_db)):
    """
    Get predictive analytics forecasting future issues per region.
    """
    return analytics_service.get_predictive_analytics(db)

@router.get("/impact-report")
def download_impact_report(db: Session = Depends(get_db), current_user = Depends(get_current_admin_user)):
    """
    Download automated impact report (PDF) for admins.
    """
    pdf_buffer = analytics_service.generate_impact_report(db)
    
    response = StreamingResponse(pdf_buffer, media_type="application/pdf")
    response.headers["Content-Disposition"] = "attachment; filename=civic_radar_impact_report.pdf"
    return response

@router.get("/public-stats")
def get_public_stats(db: Session = Depends(get_db)):
    """
    Public (unauthenticated) endpoint for the transparency dashboard.
    Returns aggregate statistics with no PII.
    """
    from backend.models import Issue, IssueStatus, Region
    from sqlalchemy import func
    
    total_issues = db.query(func.count(Issue.id)).scalar() or 0
    resolved_issues = db.query(func.count(Issue.id)).filter(Issue.status == IssueStatus.RESOLVED).scalar() or 0
    in_progress_issues = db.query(func.count(Issue.id)).filter(Issue.status == IssueStatus.IN_PROGRESS).scalar() or 0
    open_issues = db.query(func.count(Issue.id)).filter(Issue.status == IssueStatus.OPEN).scalar() or 0
    
    # Category breakdown
    category_counts = db.query(
        Issue.category, func.count(Issue.id)
    ).group_by(Issue.category).all()
    
    categories = [{"name": c[0] or "Uncategorized", "count": c[1]} for c in category_counts]
    
    # Regional stats
    regional_stats = db.query(
        Region.name,
        func.count(Issue.id).label("total"),
        func.sum(func.cast(Issue.status == IssueStatus.RESOLVED, Integer)).label("resolved")
    ).outerjoin(Issue, Issue.region_id == Region.id).group_by(Region.name).all()
    
    regions = [
        {"name": r[0], "total": r[1] or 0, "resolved": r[2] or 0}
        for r in regional_stats if r[1] and r[1] > 0
    ]
    
    # Recently resolved (anonymized)
    recent_resolved = db.query(Issue).filter(
        Issue.status == IssueStatus.RESOLVED
    ).order_by(Issue.updated_at.desc()).limit(5).all()
    
    recent = [
        {"category": i.category, "location": i.location, "resolved_at": str(i.updated_at or i.created_at)}
        for i in recent_resolved
    ]
    
    resolution_rate = round((resolved_issues / total_issues * 100), 1) if total_issues > 0 else 0
    
    return {
        "total_issues": total_issues,
        "resolved_issues": resolved_issues,
        "in_progress_issues": in_progress_issues,
        "open_issues": open_issues,
        "resolution_rate": resolution_rate,
        "categories": categories,
        "regions": regions,
        "recently_resolved": recent
    }
