from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from backend.db import get_db
from backend.schemas.policy import SectorResponse, PolicyResponse
from backend.services import policy_service

router = APIRouter(prefix="/policies", tags=["policies"])

@router.get("/sectors", response_model=List[SectorResponse])
def read_sectors(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """List all policy sectors (e.g., Agriculture, Housing)"""
    return policy_service.get_sectors(db, skip=skip, limit=limit)

@router.get("/sectors/{sector_id}", response_model=SectorResponse)
def read_sector(sector_id: str, db: Session = Depends(get_db)):
    sector = policy_service.get_sector(db, sector_id)
    if not sector:
        raise HTTPException(status_code=404, detail="Sector not found")
    return sector

@router.get("/sectors/{sector_id}/list", response_model=List[PolicyResponse])
def read_sector_policies(sector_id: str, db: Session = Depends(get_db)):
    """List all policies under a specific sector"""
    return policy_service.get_policies_by_sector(db, sector_id)

@router.get("/{policy_id}", response_model=PolicyResponse)
def read_policy_detail(policy_id: str, db: Session = Depends(get_db)):
    """Get full details of a specific policy including eligibility and steps"""
    policy = policy_service.get_policy(db, policy_id)
    if not policy:
        raise HTTPException(status_code=404, detail="Policy not found")
    return policy
