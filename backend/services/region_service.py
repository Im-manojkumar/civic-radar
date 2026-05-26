from sqlalchemy.orm import Session
from backend.models import Region, RegionType

def get_districts(db: Session):
    return db.query(Region).filter(Region.type == RegionType.DISTRICT).all()

def get_taluks(db: Session, district_id: str):
    return db.query(Region).filter(
        Region.type == RegionType.TALUK,
        Region.parent_id == district_id
    ).all()

def get_blocks(db: Session, taluk_id: str):
    return db.query(Region).filter(
        Region.type == RegionType.BLOCK,
        Region.parent_id == taluk_id
    ).all()

def get_panchayats(db: Session, block_id: str):
    return db.query(Region).filter(
        Region.type == RegionType.PANCHAYAT_WARD,
        Region.parent_id == block_id
    ).all()

def get_region(db: Session, region_id: str):
    return db.query(Region).filter(Region.id == region_id).first()

# Admin helper
def create_region(db: Session, name: str, type: RegionType, parent_id: str = None):
    region = Region(name=name, type=type, parent_id=parent_id)
    db.add(region)
    db.commit()
    db.refresh(region)
    return region
