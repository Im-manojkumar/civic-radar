from sqlalchemy.orm import Session
from sqlalchemy import and_
from datetime import datetime, timedelta
from typing import Optional, List
import json

from backend.models import Issue, TextRecord
from backend.analytics.nlp import NLPProcessor

class NLPService:
    
    @staticmethod
    def run_batch_classification(db: Session, limit: int = 100):
        """
        Classify unanalyzed issues/records with Language, Failure Type, and Sentiment.
        Updates the DB records in place (using ai_analysis column for storage).
        """
        # 1. Process Issues
        issues = db.query(Issue).filter(Issue.ai_analysis == None).limit(limit).all()
        count = 0
        
        for issue in issues:
            full_text = f"{issue.title} {issue.description}"
            
            lang = NLPProcessor.detect_language(full_text)
            sentiment = NLPProcessor.compute_sentiment(full_text)
            fail_type = NLPProcessor.categorize_failure_type(full_text)
            
            analysis_data = {
                "language": lang,
                "sentiment_score": sentiment,
                "failure_type": fail_type,
                "analyzed_at": datetime.now().isoformat()
            }
            
            issue.ai_analysis = json.dumps(analysis_data)
            count += 1
        
        db.commit()
        return count

    @staticmethod
    def get_aggregated_insights(
        db: Session, 
        start_date: datetime, 
        end_date: datetime,
        region_id: Optional[str] = None,
        policy_id: Optional[str] = None
    ):
        """
        Aggregates NLP metrics: Failure Distribution, Sentiment Trend, Topic Clusters, Surges.
        """
        # Fetch relevant text data
        # We combine Issue descriptions and TextRecords for a holistic view
        
        # 1. Fetch Issues
        query = db.query(Issue).filter(Issue.created_at >= start_date, Issue.created_at <= end_date)
        if region_id:
            query = query.filter(Issue.region_id == region_id)
        # Note: policy_id filtering would require a join with Sector/Policy, omitted for brevity/schema constraints
            
        issues = query.all()
        issue_texts = [f"{i.title} {i.description}" for i in issues]
        
        # 2. Fetch TextRecords
        t_query = db.query(TextRecord).filter(TextRecord.timestamp >= start_date, TextRecord.timestamp <= end_date)
        if region_id:
            t_query = t_query.filter(TextRecord.region_id == region_id)
        text_records = t_query.all()
        record_texts = [r.value for r in text_records]
        
        all_texts = issue_texts + record_texts
        
        if not all_texts:
            return {"message": "No data for this period"}

        # 3. Calculate Failure Distribution (using on-the-fly categorization for current set)
        failures = []
        sentiments = []
        for text in all_texts:
            failures.append(NLPProcessor.categorize_failure_type(text))
            sentiments.append(NLPProcessor.compute_sentiment(text))
            
        failure_dist = dict(Counter(failures))
        avg_sentiment = sum(sentiments) / len(sentiments) if sentiments else 0

        # 4. Topic Clustering
        clusters = NLPProcessor.cluster_topics(all_texts, num_clusters=min(5, len(all_texts)))
        
        # 5. Keyword Surges
        # Get previous period data
        duration = end_date - start_date
        prev_start = start_date - duration
        
        prev_issues = db.query(Issue).filter(Issue.created_at >= prev_start, Issue.created_at < start_date).all()
        prev_texts = [f"{i.title} {i.description}" for i in prev_issues]
        
        surges = NLPProcessor.compute_keyword_surge(all_texts, prev_texts)

        return {
            "period": {"start": start_date, "end": end_date},
            "total_documents": len(all_texts),
            "average_sentiment": round(avg_sentiment, 2),
            "failure_distribution": failure_dist,
            "topic_clusters": clusters,
            "keyword_surges": surges
        }
