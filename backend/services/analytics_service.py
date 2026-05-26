from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta
from typing import List, Optional
from backend.models import NumericRecord, BaselineStats, AnomalyEvent, SignalDefinition
from backend.analytics.baseline import BaselineModel
from backend.analytics.deviations import DeviationDetector
import logging

logger = logging.getLogger("civic_radar")

def run_baseline_computation(db: Session, signal_id: Optional[str] = None, region_id: Optional[str] = None):
    """
    Computes mean/std_dev for numeric records and updates BaselineStats.
    Can be scoped to a specific signal or region, or run globally.
    """
    query = db.query(
        NumericRecord.signal_id,
        NumericRecord.region_id,
        func.group_concat(NumericRecord.value) # SQLite specific approach for simplicity in demo
    ).group_by(NumericRecord.signal_id, NumericRecord.region_id)
    
    if signal_id:
        query = query.filter(NumericRecord.signal_id == signal_id)
    if region_id:
        query = query.filter(NumericRecord.region_id == region_id)
        
    results = query.all()
    count = 0
    
    # Note: In Postgres, use array_agg. For SQLite/Generic, better to iterate or fetch specific series.
    # To be database agnostic for this demo, we will do a simpler fetch loop if the dataset is small,
    # or rely on the fact that the prompt asked for "SQLite default".
    # However, `group_concat` returns a string. Let's do a more robust fetch loop to avoid string parsing issues.
    
    # 1. Identify Unique Signal/Region pairs
    distinct_pairs = db.query(NumericRecord.signal_id, NumericRecord.region_id).distinct()
    if signal_id:
        distinct_pairs = distinct_pairs.filter(NumericRecord.signal_id == signal_id)
    if region_id:
        distinct_pairs = distinct_pairs.filter(NumericRecord.region_id == region_id)
        
    pairs = distinct_pairs.all()

    for s_id, r_id in pairs:
        # Fetch last 1000 records for baseline to keep it responsive
        records = db.query(NumericRecord.value).filter(
            NumericRecord.signal_id == s_id, 
            NumericRecord.region_id == r_id
        ).order_by(NumericRecord.timestamp.desc()).limit(1000).all()
        
        values = [r[0] for r in records]
        
        mean, std = BaselineModel.compute(values)
        
        if mean is not None:
            # Upsert Baseline
            baseline = db.query(BaselineStats).filter(
                BaselineStats.signal_id == s_id,
                BaselineStats.region_id == r_id
            ).first()
            
            if not baseline:
                baseline = BaselineStats(signal_id=s_id, region_id=r_id)
                db.add(baseline)
            
            baseline.mean = mean
            baseline.std_dev = std
            baseline.computed_at = datetime.now()
            count += 1
            
    db.commit()
    return count

def run_deviation_detection(
    db: Session, 
    method: str = "zscore", 
    signal_id: Optional[str] = None,
    region_id: Optional[str] = None
):
    """
    Runs anomaly detection against computed baselines.
    """
    # Get baselines
    query = db.query(BaselineStats)
    if signal_id:
        query = query.filter(BaselineStats.signal_id == signal_id)
    if region_id:
        query = query.filter(BaselineStats.region_id == region_id)
        
    baselines = query.all()
    anomalies_detected = 0
    
    for baseline in baselines:
        # Fetch recent data (window depends on method)
        limit = 50 if method in ["cusum", "ewma", "changepoint"] else 1
        
        records = db.query(NumericRecord).filter(
            NumericRecord.signal_id == baseline.signal_id,
            NumericRecord.region_id == baseline.region_id
        ).order_by(NumericRecord.timestamp.desc()).limit(limit).all()
        
        if not records:
            continue
            
        # Chronological order for algorithms
        records_asc = sorted(records, key=lambda r: r.timestamp)
        values = [r.value for r in records_asc]
        latest_record = records_asc[-1]
        
        severity = None
        desc = ""
        
        if method == "zscore":
            severity = DeviationDetector.zscore(latest_record.value, baseline.mean, baseline.std_dev)
            desc = f"Z-Score anomaly. Value: {latest_record.value}, Mean: {baseline.mean:.2f}"
            
        elif method == "cusum":
            severity = DeviationDetector.cusum(values, baseline.mean, baseline.std_dev)
            desc = f"CUSUM drift detected."
            
        elif method == "ewma":
            severity = DeviationDetector.ewma(values, baseline.mean, baseline.std_dev)
            desc = f"EWMA shift detected."
            
        elif method == "sudden_drop":
            severity = DeviationDetector.sudden_drop(values)
            desc = f"Sudden drop detected."
            
        elif method == "changepoint":
            severity = DeviationDetector.changepoint(values)
            desc = f"Structural changepoint detected."

        if severity:
            # Check if anomaly already exists for this record to prevent dups
            exists = db.query(AnomalyEvent).filter(
                AnomalyEvent.signal_id == baseline.signal_id,
                AnomalyEvent.region_id == baseline.region_id,
                AnomalyEvent.timestamp == latest_record.timestamp
            ).first()
            
            if not exists:
                event = AnomalyEvent(
                    signal_id=baseline.signal_id,
                    region_id=baseline.region_id,
                    timestamp=latest_record.timestamp,
                    severity=severity,
                    description=desc
                )
                db.add(event)
                anomalies_detected += 1
                
    db.commit()
    return anomalies_detected
