from fastapi import APIRouter, Depends, HTTPException
from backend.schemas.ai import IssueAnalysisRequest, IssueAnalysisResponse, AdminInsightsRequest, AdminInsightsResponse
from backend.services import ai_service

router = APIRouter(prefix="/ai", tags=["ai"])

@router.post("/analyze-issue", response_model=IssueAnalysisResponse)
def analyze_issue(payload: IssueAnalysisRequest):
    """
    Analyzes a citizen's issue description to automatically categorize it 
    and assign an urgency level.
    """
    return ai_service.analyze_issue_deterministic(payload.description)

@router.post("/admin-insights", response_model=AdminInsightsResponse)
def admin_insights(payload: AdminInsightsRequest):
    """
    Generates strategic insights for administrators based on a list of recent issues.
    """
    insight_text = ai_service.generate_admin_insights_mock(payload.issues)
    return {"insight": insight_text}