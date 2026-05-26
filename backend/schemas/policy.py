from pydantic import BaseModel
from datetime import datetime
from typing import List, Optional

class SectorBase(BaseModel):
    name: str
    description: Optional[str] = None

class SectorCreate(SectorBase):
    pass

class SectorResponse(SectorBase):
    id: str

    class Config:
        from_attributes = True

class PolicyBase(BaseModel):
    title: str
    content: str
    effective_date: Optional[datetime] = None

class PolicyCreate(PolicyBase):
    sector_id: str

class PolicyResponse(PolicyBase):
    id: str
    sector_id: str
    
    class Config:
        from_attributes = True

class SectorWithPolicies(SectorResponse):
    policies: List[PolicyResponse] = []
