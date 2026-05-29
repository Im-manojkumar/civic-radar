from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend.db import get_db
from backend.schemas.auth import Token, OTPRequestSchema, OTPVerifySchema, GoogleLoginSchema, UserResponse
from backend.services import auth_service, otp_service
from backend.security.jwt import get_current_active_user
from backend.models import User

router = APIRouter()

@router.post("/auth/google", response_model=Token)
def google_login(payload: GoogleLoginSchema, db: Session = Depends(get_db)):
    try:
        user = auth_service.authenticate_google_token(db, payload.token)
        if not user:
            raise HTTPException(status_code=400, detail="User could not be verified")
        return auth_service.login_access_token(user)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/auth/request-otp")
def request_otp(payload: OTPRequestSchema, db: Session = Depends(get_db)):
    otp_service.create_otp(db, payload.identifier)
    return {"message": "OTP sent (check logs for dev)"}

@router.post("/auth/verify-otp", response_model=Token)
def verify_otp(payload: OTPVerifySchema, db: Session = Depends(get_db)):
    is_valid = otp_service.verify_otp(db, payload.identifier, payload.code)
    if not is_valid:
        raise HTTPException(status_code=400, detail="Invalid or expired OTP")
    
    user = auth_service.authenticate_otp_identifier(db, payload.identifier)
    return auth_service.login_access_token(user)

@router.get("/auth/me", response_model=UserResponse)
def read_users_me(current_user: User = Depends(get_current_active_user)):
    return current_user
