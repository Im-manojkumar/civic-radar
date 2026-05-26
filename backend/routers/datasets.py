from fastapi import APIRouter, Depends, UploadFile, File, BackgroundTasks, HTTPException
from sqlalchemy.orm import Session
from backend.db import get_db
from backend.services import ingest_service
from backend.schemas.ingest import DatasetListResponse, IngestResult
from backend.security.jwt import get_current_admin_user

router = APIRouter(prefix="/datasets", tags=["datasets"])

@router.get("", response_model=DatasetListResponse)
def list_available_datasets(
    current_user = Depends(get_current_admin_user)
):
    """List datasets available on disk in the registry."""
    datasets = ingest_service.list_datasets()
    return DatasetListResponse(datasets=datasets)

@router.post("/upload")
def upload_dataset(
    file: UploadFile = File(...),
    current_user = Depends(get_current_admin_user)
):
    """Upload a zip file containing dataset.json and data files."""
    return ingest_service.handle_upload(file)

@router.post("/load", response_model=IngestResult)
def load_dataset(
    dataset_id: str,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_admin_user)
):
    """Trigger ingestion of a dataset from disk into the database."""
    return ingest_service.load_dataset_into_db(db, dataset_id)
