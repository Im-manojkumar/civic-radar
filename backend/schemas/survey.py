from pydantic import BaseModel
from typing import Dict, Any

class SurveySubmission(BaseModel):
    survey_id: str
    region_id: str
    answers: Dict[str, Any]

class SurveyResponse(BaseModel):
    submission_id: str
    status: str
    message: str
