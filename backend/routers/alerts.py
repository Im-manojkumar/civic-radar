from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from backend.db import get_db
from backend.services import alert_service
from backend.schemas.alerts import AlertResponse, AlertGenerateRequest, AlertReviewRequest
from backend.security.jwt import get_current_admin_user

router = APIRouter(prefix="/alerts", tags=["alerts"])

@router.post("/generate")
def generate_alerts(
    payload: AlertGenerateRequest,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_admin_user)
):
    """
    Triggers the Fusion Engine to assess health for a Region+Sector.
    Generates an Alert if health score is critical.
    """
    alert = alert_service.generate_alert_for_sector(db, payload.region_id, payload.sector_id)
    if alert:
        return {"status": "generated", "alert_id": alert.id}
    return {"status": "healthy", "message": "Policy health score is acceptable. No alert generated."}

@router.get("", response_model=List[AlertResponse])
def list_alerts(
    region_id: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_admin_user)
):
    """
    Get all alerts with live Fusion insights (Health Score, Confidence).
    """
    return alert_service.get_alerts_enriched(db, region_id)

@router.get("/{alert_id}", response_model=AlertResponse)
def get_alert(
    alert_id: str,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_admin_user)
):
    """
    Get detailed fusion view for a specific alert.
    """
    alert = alert_service.get_alert_detail(db, alert_id)
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    return alert

@router.post("/{alert_id}/review")
def review_alert(
    alert_id: str,
    payload: AlertReviewRequest,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_admin_user)
):
    """
    Admin action to Acknowledge or Resolve an alert.
    """
    success = alert_service.review_alert(db, alert_id, current_user.id, payload.action, payload.comments)
    if not success:
        raise HTTPException(status_code=404, detail="Alert not found")
    return {"status": "success"}
