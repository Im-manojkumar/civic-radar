from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from typing import Optional
from backend.db import get_db
from backend.services import report_service
from backend.security.jwt import get_current_admin_user

router = APIRouter(prefix="/reports", tags=["reports"])

@router.get("/export/csv")
def export_csv_data(
    status: Optional[str] = None,
    urgency: Optional[str] = None,
    region_id: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_admin_user)
):
    """
    Download raw issue data as CSV based on optional filters.
    """
    filters = {}
    if status: filters['status'] = status
    if urgency: filters['urgency'] = urgency
    if region_id: filters['region_id'] = region_id
    
    csv_file = report_service.generate_csv_export(db, filters)
    
    response = StreamingResponse(iter([csv_file.getvalue()]), media_type="text/csv")
    response.headers["Content-Disposition"] = "attachment; filename=civic_data_export.csv"
    return response

@router.get("/export/pdf")
def export_pdf_summary(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_admin_user)
):
    """
    Download PDF Executive Summary.
    """
    pdf_buffer = report_service.generate_pdf_summary(db, user_name=current_user.email)
    
    response = StreamingResponse(pdf_buffer, media_type="application/pdf")
    response.headers["Content-Disposition"] = "attachment; filename=civic_summary_report.pdf"
    return response