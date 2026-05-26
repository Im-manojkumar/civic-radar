from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta
from typing import Dict, Any, List, Tuple
import json

from backend.models import AnomalyEvent, Issue, TextRecord, SignalDefinition, BaselineStats
from backend.analytics.nlp import NLPProcessor

class FusionEngine:
    """
    Synthesizes multi-modal data (Numeric + Text) to assess Policy/Sector health.
    """

    @staticmethod
    def calculate_policy_health(
        db: Session, 
        region_id: str, 
        sector_id: str, 
        window_days: int = 7
    ) -> Dict[str, Any]:
        """
        Computes a 0-100 Health Score based on:
        1. Recent Anomaly Events (Severity penalties)
        2. NLP Sentiment from Issues (Negative sentiment penalties)
        3. Issue Volume spikes
        """
        start_date = datetime.now() - timedelta(days=window_days)
        
        # 1. Fetch Numeric Anomalies for this Sector
        # Join Anomaly -> Signal -> Sector
        anomalies = db.query(AnomalyEvent).join(SignalDefinition).filter(
            AnomalyEvent.region_id == region_id,
            AnomalyEvent.timestamp >= start_date,
            SignalDefinition.sector_id == sector_id
        ).all()
        
        # 2. Fetch NLP Data (Issues)
        # Note: In a real app, we'd filter Issues by Category mapped to Sector. 
        # Here we assume category roughly matches or we rely on explicit mapping.
        # For demo, we fetch all issues in region and filter by "relevant" keywords if needed,
        # or assume strictly linked if schema supported it. 
        # We'll fetch all issues for the region for now as a proxy for "Civic Health".
        issues = db.query(Issue).filter(
            Issue.region_id == region_id,
            Issue.created_at >= start_date
        ).all()
        
        # --- Scoring Logic ---
        score = 100.0
        evidence = {
            "numeric_anomalies": [],
            "nlp_insights": [],
            "sentiment_score": 0.0,
            "total_reports": len(issues)
        }
        
        # Penalty: Numeric Anomalies
        max_anomaly_severity = 0.0
        for a in anomalies:
            severity = a.severity if a.severity else 0
            max_anomaly_severity = max(max_anomaly_severity, severity)
            penalty = min(severity * 5, 30) # Cap penalty per anomaly
            score -= penalty
            evidence["numeric_anomalies"].append(f"Signal {a.signal_id} deviation: {severity:.2f} sigma")
        
        # Penalty: NLP Sentiment & Volume
        if issues:
            sentiments = []
            for i in issues:
                text = f"{i.title} {i.description}"
                s = NLPProcessor.compute_sentiment(text)
                sentiments.append(s)
            
            avg_sentiment = sum(sentiments) / len(sentiments)
            evidence["sentiment_score"] = round(avg_sentiment, 2)
            
            if avg_sentiment < 0:
                score -= (abs(avg_sentiment) * 20) # Up to 20 points penalty for pure negativity
                evidence["nlp_insights"].append(f"Negative citizen sentiment ({avg_sentiment:.2f})")
            
            # Volume penalty (e.g. > 10 issues is bad)
            if len(issues) > 10:
                score -= 10
                evidence["nlp_insights"].append(f"High issue volume ({len(issues)} reports)")
        
        # Clamp Score
        score = max(0.0, min(100.0, score))
        
        # Determine Severity Label
        if score < 40:
            severity_label = "CRITICAL"
        elif score < 70:
            severity_label = "HIGH"
        elif score < 90:
            severity_label = "MEDIUM"
        else:
            severity_label = "LOW"
            
        # Determine Confidence (Data Density)
        data_points = len(anomalies) + len(issues)
        if data_points > 50:
            confidence = "HIGH"
        elif data_points > 10:
            confidence = "MEDIUM"
        else:
            confidence = "LOW"
            
        return {
            "score": round(score, 1),
            "severity": severity_label,
            "confidence": confidence,
            "evidence": evidence,
            "primary_anomaly": anomalies[0] if anomalies else None
        }

    @staticmethod
    def generate_recommendations(severity: str, evidence: Dict) -> List[str]:
        """
        Maps fusion results to actionable recommendations.
        """
        recs = []
        if severity == "CRITICAL":
            recs.append("Immediate deployment of inspection team required.")
            recs.append("Notify Sector Head and District Collector.")
        elif severity == "HIGH":
            recs.append("Schedule maintenance check within 24 hours.")
            recs.append("Review recent citizen complaints for specific locations.")
        
        if any("Water" in s for s in evidence['numeric_anomalies']):
            recs.append("Check valve pressure and contamination levels.")
        
        if evidence['sentiment_score'] < -0.5:
            recs.append("Initiate public awareness campaign to address grievances.")
            
        if not recs:
            recs.append("Monitor situation. No immediate action required.")
            
        return recs
