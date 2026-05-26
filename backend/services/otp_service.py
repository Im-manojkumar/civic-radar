import random
import string
from datetime import datetime, timedelta, timezone
from sqlalchemy.orm import Session
from backend.models import OTPRequest
from passlib.context import CryptContext
import logging

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
logger = logging.getLogger("civic_radar")

OTP_EXPIRE_MINUTES = 10

def generate_otp_code() -> str:
    return "".join(random.choices(string.digits, k=6))

def hash_otp(otp: str) -> str:
    return pwd_context.hash(otp)

def verify_otp_hash(otp: str, hashed_otp: str) -> bool:
    return pwd_context.verify(otp, hashed_otp)

def create_otp(db: Session, identifier: str) -> str:
    code = generate_otp_code()
    hashed = hash_otp(code)
    expires = datetime.now(timezone.utc) + timedelta(minutes=OTP_EXPIRE_MINUTES)
    
    otp_request = OTPRequest(
        identifier=identifier,
        otp_hash=hashed,
        expires_at=expires,
        verified=False
    )
    db.add(otp_request)
    db.commit()
    db.refresh(otp_request)
    
    # DEV MODE: Print OTP
    logger.info(f"============ DEV OTP for {identifier}: {code} ============")
    
    return code

def verify_otp(db: Session, identifier: str, code: str) -> bool:
    # Find latest unverified, unexpired OTP
    now = datetime.now(timezone.utc)
    otp_record = db.query(OTPRequest).filter(
        OTPRequest.identifier == identifier,
        OTPRequest.verified == False,
        OTPRequest.expires_at > now
    ).order_by(OTPRequest.created_at.desc()).first()

    if not otp_record:
        return False

    if verify_otp_hash(code, otp_record.otp_hash):
        otp_record.verified = True
        db.commit()
        return True
    
    return False
