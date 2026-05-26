from sqlalchemy.orm import Session
from datetime import datetime
from typing import List, Optional
import json

from backend.models import Alert, AlertStatus, Recommendation, User, AnomalyEvent, SignalDefinition
from backend.analytics.fusion import FusionEngine
from backend.schemas.alerts import AlertResponse, EvidenceSchema

def generate_alert_for_sector(db: Session, region_id: str, sector_id: str) -> Optional[Alert]:
    """
    Runs Fusion Engine. If health score is low, creates or updates an Alert.
    """
    fusion_result = FusionEngine.calculate_policy_health(db, region_id, sector_id)
    
    # Threshold for Alert Generation
    if fusion_result['score'] < 70:
        # Check if open alert exists for this context
        # We need to find an alert linked to an anomaly in this sector/region
        # This is complex with current schema. We simplify:
        # Check if ANY open alert exists for the primary anomaly found.
        
        primary_anomaly = fusion_result['primary_anomaly']
        
        if not primary_anomaly:
            # If no numeric anomaly exists, we can't create an Alert in current schema (FK constraint).
            # We assume Fusion implies Numeric deviation exists for now.
            return None
            
        existing_alert = db.query(Alert).filter(
            Alert.anomaly_id == primary_anomaly.id,
            Alert.status != AlertStatus.RESOLVED
        ).first()
        
        if existing_alert:
            return existing_alert
            
        # Create New Alert
        new_alert = Alert(
            anomaly_id=primary_anomaly.id,
            status=AlertStatus.NEW
        )
        db.add(new_alert)
        db.commit()
        db.refresh(new_alert)
        
        # Add Recommendations
        recs = FusionEngine.generate_recommendations(fusion_result['severity'], fusion_result['evidence'])
        for r_text in recs:
            rec = Recommendation(alert_id=new_alert.id, content=r_text)
            db.add(rec)
        
        db.commit()
        return new_alert
    
    return None

def get_alerts_enriched(db: Session, region_id: Optional[str] = None) -> List[AlertResponse]:
    """
    Fetches alerts and enriches them with on-the-fly Fusion data.
    """
    query = db.query(Alert).join(AnomalyEvent).join(SignalDefinition)
    
    if region_id:
        query = query.filter(AnomalyEvent.region_id == region_id)
        
    alerts_db = query.all()
    results = []
    
    for alert in alerts_db:
        # Re-run fusion to get latest score/evidence for display
        # We derive sector_id and region_id from the linked anomaly
        anomaly = alert.anomaly
        signal = anomaly.signal
        
        fusion = FusionEngine.calculate_policy_health(
            db, 
            region_id=anomaly.region_id, 
            sector_id=signal.sector_id
        )
        
        # Recommendations
        rec_texts = [r.content for r in alert.recommendations]
        
        results.append(AlertResponse(
            id=alert.id,
            status=alert.status.value,
            created_at=alert.created_at,
            policy_health_score=fusion['score'],
            severity_label=fusion['severity'],
            confidence=fusion['confidence'],
            evidence=EvidenceSchema(
                numeric_anomalies=fusion['evidence']['numeric_anomalies'],
                nlp_insights=fusion['evidence']['nlp_insights'],
                sentiment_score=fusion['evidence']['sentiment_score'],
                total_reports=fusion['evidence']['total_reports']
            ),
            recommendations=rec_texts,
            region_id=anomaly.region_id,
            sector_id=signal.sector_id
        ))
        
    return results

def get_alert_detail(db: Session, alert_id: str) -> Optional[AlertResponse]:
    alert = db.query(Alert).filter(Alert.id == alert_id).first()
    if not alert:
        return None
        
    anomaly = alert.anomaly
    signal = anomaly.signal
    
    fusion = FusionEngine.calculate_policy_health(
        db, 
        region_id=anomaly.region_id, 
        sector_id=signal.sector_id
    )
    
    return AlertResponse(
        id=alert.id,
        status=alert.status.value,
        created_at=alert.created_at,
        policy_health_score=fusion['score'],
        severity_label=fusion['severity'],
        confidence=fusion['confidence'],
        evidence=EvidenceSchema(
            numeric_anomalies=fusion['evidence']['numeric_anomalies'],
            nlp_insights=fusion['evidence']['nlp_insights'],
            sentiment_score=fusion['evidence']['sentiment_score'],
            total_reports=fusion['evidence']['total_reports']
        ),
        recommendations=[r.content for r in alert.recommendations],
        region_id=anomaly.region_id,
        sector_id=signal.sector_id
    )

def review_alert(db: Session, alert_id: str, user_id: str, action: str, comments: str):
    alert = db.query(Alert).filter(Alert.id == alert_id).first()
    if not alert:
        return False
    
    if action == "ACKNOWLEDGE":
        alert.status = AlertStatus.ACKNOWLEDGED
        alert.assigned_to_id = user_id
    elif action == "RESOLVE":
        alert.status = AlertStatus.RESOLVED
    
    # Assuming we might want to log the review action in ReviewAction table (from models.py)
    # but strictly adhering to requested scope, we just update status.
    # Optionally we could add a recommendation note.
    
    db.commit()
    return True
