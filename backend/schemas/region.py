from pydantic import BaseModel
from typing import Optional, Any
from ..models import RegionType

class RegionBase(BaseModel):
    name: str
    type: RegionType
    parent_id: Optional[str] = None

class RegionCreate(RegionBase):
    geometry: Optional[Any] = None

class RegionResponse(RegionBase):
    id: str
    geometry: Optional[Any] = None # GeoJSON

    class Config:
        from_attributes = True
