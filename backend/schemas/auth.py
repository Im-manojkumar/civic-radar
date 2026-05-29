from pydantic import BaseModel
from typing import Optional

class Token(BaseModel):
    access_token: str
    token_type: str
    user: Optional["UserResponse"] = None

class TokenData(BaseModel):
    user_id: str | None = None
    role: str | None = None

class OTPRequestSchema(BaseModel):
    identifier: str  # Email or Phone

class OTPVerifySchema(BaseModel):
    identifier: str
    code: str

class GoogleLoginSchema(BaseModel):
    token: str  # Google ID token from frontend

class UserResponse(BaseModel):
    id: str
    email: str | None = None
    name: str | None = None
    avatar_url: str | None = None
    phone: str | None = None
    role: str
    is_active: bool

    class Config:
        from_attributes = True

# Update forward ref
Token.model_rebuild()
