import sys
import os

# Add parent dir to path to allow importing app modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.db import SessionLocal, init_db, engine
from backend.models import Base, Region, RegionType, Sector, Policy, User, Role, SignalDefinition
from backend.services.auth_service import create_user

def seed_data():
    print("Creating tables...")
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    
    # 1. Regions (Tamil Nadu Hierarchy)
    print("Seeding Regions...")
    
    # State
    tn = db.query(Region).filter_by(id="reg_state_tn").first()
    if not tn:
        tn = Region(id="reg_state_tn", name="Tamil Nadu", type=RegionType.STATE)
        db.add(tn)
    
    # Districts
    districts = [
        {"id": "reg_dist_chennai", "name": "Chennai"},
        {"id": "reg_dist_coimbatore", "name": "Coimbatore"},
        {"id": "reg_dist_madurai", "name": "Madurai"},
        {"id": "reg_dist_kanchipuram", "name": "Kanchipuram"}
    ]
    
    for d in districts:
        if not db.query(Region).filter_by(id=d['id']).first():
            reg = Region(id=d['id'], name=d['name'], type=RegionType.DISTRICT, parent_id="reg_state_tn")
            db.add(reg)
            
    db.commit()

    # 2. Sectors & Signals (matching dataset.json IDs for seamless ingest)
    print("Seeding Sectors...")
    
    sectors = [
        {"id": "sec_nutrition", "name": "Nutrition & Welfare", "desc": "Midday meals and child nutrition"},
        {"id": "sec_civil_supplies", "name": "Civil Supplies", "desc": "PDS, Ration shops, Food security"},
        {"id": "sec_education", "name": "School Education", "desc": "Scholarships, infrastructure, attendance"},
        {"id": "sec_water", "name": "Water Resources", "desc": "Drinking water and irrigation"}
    ]
    
    for s in sectors:
        if not db.query(Sector).filter_by(id=s['id']).first():
            sec = Sector(id=s['id'], name=s['name'], description=s['desc'])
            db.add(sec)
    db.commit()

    # 3. Policies
    print("Seeding Policies...")
    policies = [
        {
            "sector_id": "sec_nutrition", 
            "title": "Puratchi Thalaivar MGR Nutritious Meal Programme", 
            "content": "To provide healthy meals to school children aged 5-15."
        },
        {
            "sector_id": "sec_civil_supplies", 
            "title": "Universal Public Distribution System (UPDS)", 
            "content": "Supply of rice and essential commodities to all cardholders."
        },
        {
            "sector_id": "sec_education",
            "title": "Post-Matric Scholarship Scheme",
            "content": "Financial assistance for SC/ST students in higher education."
        }
    ]
    
    for p in policies:
        if not db.query(Policy).filter_by(title=p['title']).first():
            pol = Policy(sector_id=p['sector_id'], title=p['title'], content=p['content'])
            db.add(pol)
    db.commit()

    # 4. Users
    print("Seeding Users...")
    
    # Admin
    admin_email = "admin@tn.gov.in"
    if not db.query(User).filter_by(email=admin_email).first():
        create_user(db, email=admin_email, role=Role.ADMIN)
        print(f"Created Admin: {admin_email}")

    # Citizen
    citizen_email = "citizen@gmail.com"
    if not db.query(User).filter_by(email=citizen_email).first():
        create_user(db, email=citizen_email, role=Role.CITIZEN)
        print(f"Created Citizen: {citizen_email}")

    # Official (District Collector)
    official_email = "collector.chennai@tn.gov.in"
    if not db.query(User).filter_by(email=official_email).first():
        create_user(db, email=official_email, role=Role.ADMIN) # Admin role for demo
        print(f"Created Official: {official_email}")

    db.close()
    print("Seeding Complete!")

if __name__ == "__main__":
    seed_data()
