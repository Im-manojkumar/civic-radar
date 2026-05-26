from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.db import get_db
from backend.services import explain_service
from backend.security.jwt import get_current_admin_user

router = APIRouter(prefix="/alerts", tags=["alerts"])

@router.post("/{alert_id}/explain")
def explain_alert_endpoint(
    alert_id: str,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_admin_user)
):
    """
    Generates an AI-powered explanation for a specific alert.
    Returns a JSON object with the explanation text.
    """
    try:
        explanation = explain_service.explain_alert(db, alert_id)
        return {"alert_id": alert_id, "explanation": explanation}
    except ValueError:
         raise HTTPException(status_code=404, detail="Alert not found")
