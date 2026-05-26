from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from typing import Optional

from backend.db import get_db
from backend.services.nlp_service import NLPService
from backend.security.jwt import get_current_admin_user

router = APIRouter(prefix="/nlp", tags=["nlp"])

@router.post("/run")
def run_nlp_pipeline(
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_admin_user)
):
    """
    Triggers batch NLP classification for unanalyzed records.
    Populates language, sentiment, and failure type.
    """
    processed_count = NLPService.run_batch_classification(db, limit)
    return {"status": "success", "records_processed": processed_count}

@router.get("/insights")
def get_nlp_insights(
    region_id: Optional[str] = None,
    policy_id: Optional[str] = None,
    days: int = Query(30, description="Lookback window in days"),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_admin_user)
):
    """
    Retrieves aggregated NLP insights including:
    - Topic Clusters (TF-IDF + KMeans)
    - Keyword Surges (vs previous period)
    - Failure Type Distribution
    - Sentiment Trends
    """
    end_date = datetime.now()
    start_date = end_date - timedelta(days=days)
    
    insights = NLPService.get_aggregated_insights(
        db, 
        start_date, 
        end_date, 
        region_id, 
        policy_id
    )
    
    return insights
