import sys
import os
import argparse

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.db import SessionLocal
from backend.services.auth_service import create_user
from backend.models import Role, User

def create_admin(email: str):
    db = SessionLocal()
    existing = db.query(User).filter_by(email=email).first()
    if existing:
        print(f"User {email} already exists.")
        if existing.role != Role.ADMIN:
            existing.role = Role.ADMIN
            db.commit()
            print(f"Updated {email} to ADMIN role.")
    else:
        create_user(db, email=email, role=Role.ADMIN)
        print(f"Created new ADMIN user: {email}")
    db.close()

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Create an Admin user")
    parser.add_argument("email", help="Email address of the admin")
    args = parser.parse_args()
    
    create_admin(args.email)
