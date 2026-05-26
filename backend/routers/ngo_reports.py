from fastapi import APIRouter, Depends, UploadFile, File
from sqlalchemy.orm import Session
from backend.db import get_db
from backend.schemas.ngo_report import NGOReportUploadResponse
from backend.services import ngo_report_service
from backend.security.jwt import get_current_active_user
from backend.models import User

router = APIRouter(prefix="/ngo", tags=["ngo"])

@router.post("/upload", response_model=NGOReportUploadResponse)
def upload_ngo_report(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Upload a CSV file containing field data from NGOs.
    Format: signal_id, region_id, value, timestamp
    Triggers recomputation for affected regions.
    """
    return ngo_report_service.process_upload(db, current_user, file)
