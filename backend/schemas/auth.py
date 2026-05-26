from pydantic import BaseModel
from typing import Optional
from ..models import Role

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    user_id: str | None = None
    role: str | None = None

class OTPRequestSchema(BaseModel):
    identifier: str  # Email or Phone

class OTPVerifySchema(BaseModel):
    identifier: str
    code: str

class GoogleLoginSchema(BaseModel):
    token: str

class UserResponse(BaseModel):
    id: str
    email: str | None = None
    phone: str | None = None
    role: Role
    is_active: bool

    class Config:
        from_attributes = True
