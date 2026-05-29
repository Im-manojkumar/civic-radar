from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, DateTime, Text, Float, Enum as SqEnum, Index, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid
import enum
from backend.db import Base

# Enums
class Role(str, enum.Enum):
    CITIZEN = "CITIZEN"
    ADMIN = "ADMIN"

class RegionType(str, enum.Enum):
    STATE = "STATE"
    DISTRICT = "DISTRICT"
    TALUK = "TALUK"
    BLOCK = "BLOCK"
    PANCHAYAT_WARD = "PANCHAYAT_WARD"

class IssueStatus(str, enum.Enum):
    OPEN = "OPEN"
    IN_PROGRESS = "IN_PROGRESS"
    RESOLVED = "RESOLVED"

class Urgency(str, enum.Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"

class AlertStatus(str, enum.Enum):
    NEW = "NEW"
    ACKNOWLEDGED = "ACKNOWLEDGED"
    RESOLVED = "RESOLVED"

# Helpers
def generate_uuid():
    return str(uuid.uuid4())

# Auth Models
class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=generate_uuid)
    email = Column(String, unique=True, index=True, nullable=True)
    name = Column(String, nullable=True)
    avatar_url = Column(String, nullable=True)
    phone = Column(String, unique=True, index=True, nullable=True)
    google_id = Column(String, unique=True, nullable=True)
    role = Column(SqEnum(Role), default=Role.CITIZEN)
    language_preference = Column(String, default="en")
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    issues = relationship("Issue", back_populates="reporter")
    alerts = relationship("Alert", back_populates="assigned_to")
    actions = relationship("ReviewAction", back_populates="user")
    uploads = relationship("NGOReportUploadLog", back_populates="user")

class OTPRequest(Base):
    __tablename__ = "otp_requests"

    id = Column(String, primary_key=True, default=generate_uuid)
    identifier = Column(String, index=True) # Email or Phone
    otp_hash = Column(String, nullable=False)
    expires_at = Column(DateTime(timezone=True), nullable=False)
    verified = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

# Region & Policy
class Region(Base):
    __tablename__ = "regions"

    id = Column(String, primary_key=True, default=generate_uuid)
    name = Column(String, nullable=False, index=True)
    type = Column(SqEnum(RegionType), nullable=False)
    parent_id = Column(String, ForeignKey("regions.id"), nullable=True)
    geometry = Column(JSON, nullable=True) # GeoJSON

    parent = relationship("Region", remote_side=[id], backref="children")
    issues = relationship("Issue", back_populates="region")
    numeric_records = relationship("NumericRecord", back_populates="region")
    text_records = relationship("TextRecord", back_populates="region")

class Sector(Base):
    __tablename__ = "sectors"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    name = Column(String, unique=True, index=True)
    description = Column(Text, nullable=True)
    
    policies = relationship("Policy", back_populates="sector")
    signals = relationship("SignalDefinition", back_populates="sector")

class Policy(Base):
    __tablename__ = "policies"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    sector_id = Column(String, ForeignKey("sectors.id"))
    title = Column(String, nullable=False)
    content = Column(Text)
    effective_date = Column(DateTime)
    
    sector = relationship("Sector", back_populates="policies")

# Core Issue Tracking (Citizen Facing)
class Issue(Base):
    __tablename__ = "issues"

    id = Column(String, primary_key=True, default=generate_uuid)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    category = Column(String, index=True) # Linked to Sector.name conceptually
    urgency = Column(SqEnum(Urgency), default=Urgency.MEDIUM)
    status = Column(SqEnum(IssueStatus), default=IssueStatus.OPEN)
    location = Column(String) # Raw text address
    lat = Column(Float, nullable=True)
    lng = Column(Float, nullable=True)
    
    reporter_id = Column(String, ForeignKey("users.id"), nullable=True)
    region_id = Column(String, ForeignKey("regions.id"), nullable=True)
    
    ai_analysis = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    reporter = relationship("User", back_populates="issues")
    region = relationship("Region", back_populates="issues")

# Signals & Analytics
class SignalDefinition(Base):
    __tablename__ = "signal_definitions"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    name = Column(String, nullable=False) # e.g. "Groundwater Level"
    description = Column(Text)
    sector_id = Column(String, ForeignKey("sectors.id"))
    unit = Column(String) # e.g. "meters"
    frequency = Column(String) # e.g. "daily"

    sector = relationship("Sector", back_populates="signals")
    numeric_records = relationship("NumericRecord", back_populates="signal")
    text_records = relationship("TextRecord", back_populates="signal")

class NumericRecord(Base):
    __tablename__ = "numeric_records"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    signal_id = Column(String, ForeignKey("signal_definitions.id"))
    region_id = Column(String, ForeignKey("regions.id"))
    timestamp = Column(DateTime(timezone=True), index=True)
    value = Column(Float, nullable=False)

    signal = relationship("SignalDefinition", back_populates="numeric_records")
    region = relationship("Region", back_populates="numeric_records")

    __table_args__ = (
        Index('idx_numeric_ts_region', 'timestamp', 'region_id'),
    )

class TextRecord(Base):
    __tablename__ = "text_records"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    signal_id = Column(String, ForeignKey("signal_definitions.id"))
    region_id = Column(String, ForeignKey("regions.id"))
    timestamp = Column(DateTime(timezone=True), index=True)
    value = Column(Text, nullable=False)

    signal = relationship("SignalDefinition", back_populates="text_records")
    region = relationship("Region", back_populates="text_records")
    
    __table_args__ = (
        Index('idx_text_ts_region', 'timestamp', 'region_id'),
    )

class BaselineStats(Base):
    __tablename__ = "baseline_stats"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    signal_id = Column(String, ForeignKey("signal_definitions.id"))
    region_id = Column(String, ForeignKey("regions.id"))
    mean = Column(Float)
    std_dev = Column(Float)
    computed_at = Column(DateTime(timezone=True), server_default=func.now())

class AnomalyEvent(Base):
    __tablename__ = "anomaly_events"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    signal_id = Column(String, ForeignKey("signal_definitions.id"))
    region_id = Column(String, ForeignKey("regions.id"))
    timestamp = Column(DateTime(timezone=True))
    severity = Column(Float)
    description = Column(Text)
    
    alerts = relationship("Alert", back_populates="anomaly")

class Alert(Base):
    __tablename__ = "alerts"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    anomaly_id = Column(String, ForeignKey("anomaly_events.id"))
    status = Column(SqEnum(AlertStatus), default=AlertStatus.NEW)
    assigned_to_id = Column(String, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    anomaly = relationship("AnomalyEvent", back_populates="alerts")
    assigned_to = relationship("User", back_populates="alerts")
    recommendations = relationship("Recommendation", back_populates="alert")

class Recommendation(Base):
    __tablename__ = "recommendations"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    alert_id = Column(String, ForeignKey("alerts.id"))
    content = Column(Text) # AI generated text
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    alert = relationship("Alert", back_populates="recommendations")

# Governance
class ReviewAction(Base):
    __tablename__ = "review_actions"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("users.id"))
    entity_type = Column(String) # "Issue", "Alert", "Policy"
    entity_id = Column(String)
    action = Column(String) # "APPROVED", "REJECTED", "COMMENTED"
    comments = Column(Text, nullable=True)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
    
    user = relationship("User", back_populates="actions")

class NGOReportUploadLog(Base):
    __tablename__ = "ngo_report_logs"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("users.id"))
    filename = Column(String)
    upload_time = Column(DateTime(timezone=True), server_default=func.now())
    status = Column(String) # "PROCESSING", "DONE"
    
    user = relationship("User", back_populates="uploads")

class SurveySubmissionLog(Base):
    __tablename__ = "survey_logs"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    survey_id = Column(String)
    region_id = Column(String, ForeignKey("regions.id"))
    submitted_at = Column(DateTime(timezone=True), server_default=func.now())
