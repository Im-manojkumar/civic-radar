from pydantic import BaseModel

class NGOReportUploadResponse(BaseModel):
    log_id: str
    filename: str
    rows_processed: int
    status: str
