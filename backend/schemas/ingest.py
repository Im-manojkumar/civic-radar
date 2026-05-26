from pydantic import BaseModel
from typing import List
from datetime import datetime
from backend.schemas.dataset import DatasetMetadata

class IngestResult(BaseModel):
    total_records: int
    success_count: int
    error_count: int
    quality_score: float
    summary: str

class DatasetLoadRequest(BaseModel):
    dataset_id: str

class DatasetListResponse(BaseModel):
    datasets: List[DatasetMetadata]

class DirectNumericIngest(BaseModel):
    signal_id: str
    region_id: str
    timestamp: datetime
    value: float

class DirectTextIngest(BaseModel):
    signal_id: str
    region_id: str
    timestamp: datetime
    value: str
