from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.db import get_db
from backend.schemas.survey import SurveySubmission, SurveyResponse
from backend.services import survey_service

router = APIRouter(prefix="/surveys", tags=["surveys"])

@router.post("/submit", response_model=SurveyResponse)
def submit_survey(payload: SurveySubmission, db: Session = Depends(get_db)):
    """
    Submit a citizen or official survey response.
    Triggers partial recomputation of analytics for the affected region.
    """
    try:
        log = survey_service.process_submission(db, payload)
        return SurveyResponse(
            submission_id=log.id, 
            status="received",
            message="Survey submitted and processing triggered."
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
