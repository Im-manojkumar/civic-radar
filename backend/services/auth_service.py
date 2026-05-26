from sqlalchemy.orm import Session
from backend.models import User, Role
from backend.security.jwt import create_access_token, ACCESS_TOKEN_EXPIRE_MINUTES
from datetime import timedelta

def get_user_by_email(db: Session, email: str):
    return db.query(User).filter(User.email == email).first()

def get_user_by_phone(db: Session, phone: str):
    return db.query(User).filter(User.phone == phone).first()

def create_user(db: Session, email: str = None, phone: str = None, google_id: str = None, role: Role = Role.CITIZEN):
    user = User(
        email=email,
        phone=phone,
        google_id=google_id,
        role=role
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

def login_access_token(user: User):
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": str(user.id), "role": user.role.value},
        expires_delta=access_token_expires
    )
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user
    }

def authenticate_google_token(db: Session, token: str):
    # Mock Validation
    # In real world, verify token with Google API
    if not token:
        return None
    
    # Simulate extraction
    email = f"user_{token[:5]}@gmail.com"
    google_id = f"gid_{token}"
    
    user = db.query(User).filter(User.google_id == google_id).first()
    if not user:
        # Check by email
        user = get_user_by_email(db, email)
        if user:
            user.google_id = google_id
            db.commit()
        else:
            user = create_user(db, email=email, google_id=google_id)
            
    return user

def authenticate_otp_identifier(db: Session, identifier: str):
    # Check if email or phone
    is_email = "@" in identifier
    user = None
    if is_email:
        user = get_user_by_email(db, identifier)
        if not user:
            user = create_user(db, email=identifier)
    else:
        user = get_user_by_phone(db, identifier)
        if not user:
            user = create_user(db, phone=identifier)
    return user
