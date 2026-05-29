import logging
from sqlalchemy.orm import Session
from backend.models import User, Role
from backend.config import settings
from backend.security.jwt import create_access_token, ACCESS_TOKEN_EXPIRE_MINUTES
from datetime import timedelta

logger = logging.getLogger("civic_radar")

def get_user_by_email(db: Session, email: str):
    return db.query(User).filter(User.email == email).first()

def get_user_by_phone(db: Session, phone: str):
    return db.query(User).filter(User.phone == phone).first()

def determine_role(email: str) -> Role:
    """Determine user role based on email domain or specific whitelist."""
    if not email:
        return Role.CITIZEN
    
    email_lower = email.lower()
    
    # Check specific admin emails
    if settings.ADMIN_EMAILS:
        admin_emails = [e.strip().lower() for e in settings.ADMIN_EMAILS.split(",") if e.strip()]
        if email_lower in admin_emails:
            return Role.ADMIN
    
    # Check admin email domains
    if settings.ADMIN_EMAIL_DOMAINS:
        admin_domains = [d.strip().lower() for d in settings.ADMIN_EMAIL_DOMAINS.split(",") if d.strip()]
        email_domain = email_lower.split("@")[-1] if "@" in email_lower else ""
        if email_domain in admin_domains:
            return Role.ADMIN
    
    return Role.CITIZEN

def create_user(db: Session, email: str = None, phone: str = None, 
                google_id: str = None, name: str = None, avatar_url: str = None,
                role: Role = None):
    if role is None:
        role = determine_role(email) if email else Role.CITIZEN
    
    user = User(
        email=email,
        phone=phone,
        google_id=google_id,
        name=name,
        avatar_url=avatar_url,
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
        "user": {
            "id": str(user.id),
            "email": user.email,
            "name": user.name,
            "avatar_url": user.avatar_url,
            "role": user.role.value if hasattr(user.role, 'value') else user.role,
            "is_active": user.is_active
        }
    }

def authenticate_google_token(db: Session, token: str):
    """Verify Google ID token and return/create user."""
    try:
        from google.oauth2 import id_token
        from google.auth.transport import requests as google_requests
        
        # Verify the token with Google
        idinfo = id_token.verify_oauth2_token(
            token, 
            google_requests.Request(), 
            settings.GOOGLE_CLIENT_ID
        )
        
        email = idinfo.get("email", "")
        name = idinfo.get("name", "")
        picture = idinfo.get("picture", "")
        google_id = idinfo.get("sub", "")
        
        logger.info(f"Google auth: verified token for {email}")
        
    except ImportError:
        # Fallback if google-auth not installed — decode JWT manually
        logger.warning("google-auth not installed, using fallback token parsing")
        import json, base64
        try:
            # Decode the payload (second part of JWT)
            payload = token.split(".")[1]
            # Add padding
            payload += "=" * (4 - len(payload) % 4)
            decoded = json.loads(base64.urlsafe_b64decode(payload))
            email = decoded.get("email", "")
            name = decoded.get("name", "")
            picture = decoded.get("picture", "")
            google_id = decoded.get("sub", "")
        except Exception as e:
            logger.error(f"Token decode failed: {e}")
            return None
    except Exception as e:
        logger.error(f"Google token verification failed: {e}")
        return None
    
    if not email:
        return None
    
    # Find or create user
    user = db.query(User).filter(User.google_id == google_id).first()
    if not user:
        user = get_user_by_email(db, email)
        if user:
            # Update existing user with Google info
            user.google_id = google_id
            user.name = name or user.name
            user.avatar_url = picture or user.avatar_url
            user.role = determine_role(email)
            db.commit()
            db.refresh(user)
        else:
            # Create new user
            role = determine_role(email)
            user = create_user(
                db, email=email, google_id=google_id,
                name=name, avatar_url=picture, role=role
            )
    else:
        # Update profile info on each login
        user.name = name or user.name
        user.avatar_url = picture or user.avatar_url
        user.role = determine_role(email)
        db.commit()
        db.refresh(user)
    
    return user

def authenticate_otp_identifier(db: Session, identifier: str):
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
