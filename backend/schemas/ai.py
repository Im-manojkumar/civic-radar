from pydantic import BaseModel
from typing import List, Optional, Dict, Any

class IssueAnalysisRequest(BaseModel):
    description: str

class IssueAnalysisResponse(BaseModel):
    category: str
    urgency: str
    title: str
    summary: str
    confidence: float
    recommended_actions: List[str]

class AdminInsightsRequest(BaseModel):
    issues: List[Dict[str, Any]]

class AdminInsightsResponse(BaseModel):
    insight: str