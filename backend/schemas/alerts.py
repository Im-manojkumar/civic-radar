from pydantic import BaseModel
from typing import List, Dict, Optional, Any
from datetime import datetime
from ..models import AlertStatus, Urgency

class RecommendationSchema(BaseModel):
    content: str
    type: str = "AI_GENERATED"

class EvidenceSchema(BaseModel):
    numeric_anomalies: List[str]
    nlp_insights: List[str]
    sentiment_score: float
    total_reports: int

class AlertResponse(BaseModel):
    id: str
    status: str
    created_at: datetime
    
    # Fusion Fields
    policy_health_score: float
    severity_label: str # Low, Medium, High, Critical
    confidence: str # Low, Medium, High
    evidence: EvidenceSchema
    recommendations: List[str]
    
    # Metadata
    region_id: Optional[str] = None
    sector_id: Optional[str] = None
    
    class Config:
        from_attributes = True

class AlertReviewRequest(BaseModel):
    action: str # ACKNOWLEDGE, RESOLVE, IGNORE
    comments: Optional[str] = None

class AlertGenerateRequest(BaseModel):
    region_id: str
    sector_id: str
