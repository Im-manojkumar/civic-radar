from fastapi import APIRouter, Depends, HTTPException, Query
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
