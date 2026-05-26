from typing import List
from backend.schemas.ai import IssueAnalysisResponse

def analyze_issue_deterministic(description: str) -> IssueAnalysisResponse:
    """
    Analyzes the issue description using rule-based keywords to determine category and urgency.
    This serves as a safe, deterministic fallback or initial implementation before full LLM integration.
    """
    text = description.lower()
    
    # Defaults
    category = "Other"
    urgency = "Low"
    confidence = 0.70
    actions = ["Review by General Administration"]
    
    # Rule-based Classification
    if any(w in text for w in ["water", "leak", "pipe", "tap", "drinking", "supply"]):
        category = "Water Supply"
        actions = ["Check local valve pressure", "Assign to Water Board Engineer", "Verify recent maintenance logs"]
        if any(w in text for w in ["burst", "flood", "dirty", "contaminated", "no water"]):
            urgency = "High"
            confidence = 0.90
            if "burst" in text:
                urgency = "Critical"
                actions.insert(0, "Dispatch Emergency Repair Crew")

    elif any(w in text for w in ["road", "pothole", "tar", "asphalt", "bump", "street"]):
        category = "Roads"
        actions = ["Schedule Site Inspection", "Check road warranty status"]
        if any(w in text for w in ["accident", "deep", "sinkhole", "danger"]):
            urgency = "High"
            confidence = 0.85
    
    elif any(w in text for w in ["garbage", "trash", "waste", "bin", "dustbin", "smell", "stink"]):
        category = "Sanitation"
        actions = ["Notify Waste Management Contractor", "Schedule extra clearance round"]
        if "dead" in text or "overflow" in text:
            urgency = "High"

    elif any(w in text for w in ["light", "dark", "pole", "electricity", "power", "current", "wire"]):
        category = "Electricity"
        actions = ["Check Streetlight Grid", "Assign to TNEB"]
        if any(w in text for w in ["spark", "shock", "fire", "hanging"]):
            urgency = "Critical"
            actions.insert(0, "Cut Power Supply to Sector")
            confidence = 0.95

    elif any(w in text for w in ["traffic", "jam", "signal", "blocked", "congestion"]):
        category = "Traffic"
        actions = ["Notify Traffic Police", "Check Signal Timing"]
        urgency = "Medium"

    # Generate Summary and Title
    title = f"{category} Issue reported"
    summary = f"Citizen reported a {category.lower()} issue. Automated analysis suggests {urgency.lower()} priority intervention."

    return IssueAnalysisResponse(
        category=category,
        urgency=urgency,
        title=title,
        summary=summary,
        confidence=confidence,
        recommended_actions=actions
    )

def generate_admin_insights_mock(issues: List[dict]) -> str:
    """
    Generates a mock strategic insight based on issue counts.
    """
    if not issues:
        return "No data available for analysis."
    
    # Simple counting
    high_urgency = sum(1 for i in issues if i.get('urgency') in ['High', 'Critical'])
    total = len(issues)
    ratio = high_urgency / total if total > 0 else 0

    if ratio > 0.3:
        return f"Alert: {int(ratio*100)}% of recent reports are High/Critical urgency. Immediate resource reallocation to rapid response teams is recommended."
    else:
        return "Operations are stable. Most reported issues are routine. Suggest focusing on preventive maintenance for Road infrastructure."