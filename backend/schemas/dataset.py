from pydantic import BaseModel, Field, validator
from typing import List, Optional, Literal
from datetime import datetime

class SignalSchema(BaseModel):
    id: str
    name: str
    description: Optional[str] = None
    unit: str
    frequency: str
    type: Literal["numeric", "text"]

class DatasetMetadata(BaseModel):
    dataset_id: str
    name: str
    description: str
    version: str
    schema_version: str = Field(default="1.0")
    sector_id: str
    region_level: str # e.g., "DISTRICT", "BLOCK"
    maintainer: str
    signals: List[SignalSchema]

    @validator('schema_version')
    def validate_version(cls, v):
        if v != "1.0":
            raise ValueError("Unsupported schema version")
        return v

class NumericDataRow(BaseModel):
    signal_id: str
    region_id: str
    timestamp: datetime
    value: float

class TextDataRow(BaseModel):
    signal_id: str
    region_id: str
    timestamp: datetime
    value: str
