from sqlalchemy.orm import Session
from backend.models import SurveySubmissionLog, Region
from backend.schemas.survey import SurveySubmission
import logging

logger = logging.getLogger("civic_radar")

def trigger_partial_recompute(region_id: str):
    """
    Stub function to trigger analytics recomputation for a specific region.
    In a real system, this would push a job to a queue (e.g., Celery/Redis).
    """
    logger.info(f"Triggering partial analytics recomputation for Region: {region_id}")

def process_submission(db: Session, data: SurveySubmission):
    # 1. Validate Region
    region = db.query(Region).filter(Region.id == data.region_id).first()
    if not region:
        raise ValueError(f"Invalid Region ID: {data.region_id}")

    # 2. Log Submission
    # Note: Actual answers would typically be stored in a NoSQL store or a JSON column.
    # Here we log the event in the relational DB.
    log = SurveySubmissionLog(
        survey_id=data.survey_id,
        region_id=data.region_id
    )
    db.add(log)
    db.commit()
    db.refresh(log)

    logger.info(f"Survey {data.survey_id} submitted for region {data.region_id}. Answers: {data.answers.keys()}")
    
    # 3. Trigger Recomputation
    trigger_partial_recompute(data.region_id)
    
    return log
