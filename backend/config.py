from typing import List, Union
from pydantic import AnyHttpUrl, field_validator
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "Civic Radar TN"
    API_V1_STR: str = "/api/v1"
    
    # CORS Configuration
    BACKEND_CORS_ORIGINS: List[AnyHttpUrl] = []

    @field_validator("BACKEND_CORS_ORIGINS", mode="before")
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> Union[List[str], str]:
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",")]
        elif isinstance(v, (list, str)):
            return v
        raise ValueError(v)

    # Database
    DATABASE_URL: str = "sqlite:///./civic_radar.db"

    # Auth
    SECRET_KEY: str = "change-me-in-production"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 10080  # 7 days

    # Google OAuth
    GOOGLE_CLIENT_ID: str = ""
    NEXT_PUBLIC_GOOGLE_CLIENT_ID: str = ""

    @field_validator("GOOGLE_CLIENT_ID", mode="before")
    def populate_google_client_id(cls, v, info):
        if not v and "NEXT_PUBLIC_GOOGLE_CLIENT_ID" in info.data:
            return info.data["NEXT_PUBLIC_GOOGLE_CLIENT_ID"]
        return v

    # Admin access control — comma-separated email domains and specific emails
    ADMIN_EMAIL_DOMAINS: str = "veltech.edu.in"
    ADMIN_EMAILS: str = ""  # e.g. "specific-admin@gmail.com,another@yahoo.com"

    class Config:
        case_sensitive = True
        env_file = ".env"

settings = Settings()
