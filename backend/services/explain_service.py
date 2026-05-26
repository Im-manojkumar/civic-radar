from sqlalchemy.orm import Session
from backend.services import alert_service
from backend.llm import gemini_client

def explain_alert(db: Session, alert_id: str) -> str:
    """
    Generates a natural language explanation for why an alert was triggered.
    Uses Gemini if available, otherwise constructs a deterministic fallback string.
    """
    # 1. Fetch rich alert data (re-using existing service to get fusion evidence)
    alert_data = alert_service.get_alert_detail(db, alert_id)
    if not alert_data:
        raise ValueError("Alert not found")

    # 2. Prepare Data for Prompt
    numeric_evidence = "\n- ".join(alert_data.evidence.numeric_anomalies) if alert_data.evidence.numeric_anomalies else "No specific numeric deviations."
    nlp_evidence = "\n- ".join(alert_data.evidence.nlp_insights) if alert_data.evidence.nlp_insights else "No specific text patterns."
    recs = "\n- ".join(alert_data.recommendations) if alert_data.recommendations else "No specific recommendations."

    # 3. Construct Prompt
    prompt = f"""
    You are a Policy Analyst for the Tamil Nadu State Government.
    Explain the following Civic Alert to a District Collector in a professional, concise manner (max 3 sentences).

    Alert Context:
    - Severity: {alert_data.severity_label}
    - Health Score: {alert_data.policy_health_score}/100
    - Confidence: {alert_data.confidence}

    Evidence Collected:
    - Numeric Data:
    - {numeric_evidence}
    - Citizen Feedback (NLP):
    - {nlp_evidence}
    - Sentiment Score: {alert_data.evidence.sentiment_score}

    System Recommendations:
    - {recs}

    Task:
    Summarize the root cause of this alert and justify the severity level based on the evidence.
    """

    # 4. Call Gemini
    explanation = gemini_client.generate_alert_explanation(prompt)

    # 5. Fallback if Gemini fails or no key
    if not explanation:
        explanation = (
            f"Alert triggered with {alert_data.severity_label} severity (Score: {alert_data.policy_health_score}). "
            f"Primary factors include {len(alert_data.evidence.numeric_anomalies)} numeric deviations and "
            f"a sentiment score of {alert_data.evidence.sentiment_score}. "
            f"Review attached evidence for details."
        )

    return explanation
