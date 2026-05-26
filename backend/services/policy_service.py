from sqlalchemy.orm import Session
from backend.models import Sector, Policy

def get_sectors(db: Session, skip: int = 0, limit: int = 100):
    return db.query(Sector).offset(skip).limit(limit).all()

def get_sector(db: Session, sector_id: str):
    return db.query(Sector).filter(Sector.id == sector_id).first()

def get_policies_by_sector(db: Session, sector_id: str):
    return db.query(Policy).filter(Policy.sector_id == sector_id).all()

def get_policy(db: Session, policy_id: str):
    return db.query(Policy).filter(Policy.id == policy_id).first()

# Admin helpers
def create_sector(db: Session, name: str, description: str = None):
    sector = Sector(name=name, description=description)
    db.add(sector)
    db.commit()
    db.refresh(sector)
    return sector

def create_policy(db: Session, sector_id: str, title: str, content: str):
    policy = Policy(sector_id=sector_id, title=title, content=content)
    db.add(policy)
    db.commit()
    db.refresh(policy)
    return policy
