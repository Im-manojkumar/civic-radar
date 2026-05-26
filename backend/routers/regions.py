from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from backend.db import get_db
from backend.schemas.region import RegionResponse
from backend.services import region_service

router = APIRouter(prefix="/regions", tags=["regions"])

@router.get("/districts", response_model=List[RegionResponse])
def read_districts(db: Session = Depends(get_db)):
    """List all Districts in Tamil Nadu"""
    return region_service.get_districts(db)

@router.get("/taluks", response_model=List[RegionResponse])
def read_taluks(district_id: str, db: Session = Depends(get_db)):
    """List Taluks within a District"""
    return region_service.get_taluks(db, district_id)

@router.get("/blocks", response_model=List[RegionResponse])
def read_blocks(taluk_id: str, db: Session = Depends(get_db)):
    """List Blocks within a Taluk"""
    return region_service.get_blocks(db, taluk_id)

@router.get("/panchayats", response_model=List[RegionResponse])
def read_panchayats(block_id: str, db: Session = Depends(get_db)):
    """List Panchayats/Wards within a Block"""
    return region_service.get_panchayats(db, block_id)

@router.get("/{region_id}", response_model=RegionResponse)
def read_region(region_id: str, db: Session = Depends(get_db)):
    region = region_service.get_region(db, region_id)
    if not region:
        raise HTTPException(status_code=404, detail="Region not found")
    return region
