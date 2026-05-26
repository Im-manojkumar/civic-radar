from sqlalchemy.orm import Session
from fastapi import UploadFile
import csv
import codecs
from datetime import datetime
from backend.models import NGOReportUploadLog, NumericRecord, SignalDefinition, Region, User
from backend.schemas.ngo_report import NGOReportUploadResponse
import logging

logger = logging.getLogger("civic_radar")

def trigger_partial_recompute(region_ids: set):
    """
    Triggers recomputation for a set of regions affected by the batch upload.
    """
    for rid in region_ids:
        logger.info(f"Triggering partial analytics recomputation for Region: {rid}")

def process_upload(db: Session, user: User, file: UploadFile):
    # 1. Create Log Entry
    upload_log = NGOReportUploadLog(
        user_id=user.id,
        filename=file.filename,
        status="PROCESSING"
    )
    db.add(upload_log)
    db.commit()

    affected_regions = set()
    rows_processed = 0
    errors = 0
    
    try:
        # Decode file stream to string
        csv_reader = csv.DictReader(codecs.iterdecode(file.file, 'utf-8'))
        
        # Pre-fetch valid IDs to avoid N+1 queries during loop
        valid_regions = {r[0] for r in db.query(Region.id).all()}
        valid_signals = {s[0] for s in db.query(SignalDefinition.id).all()}

        for row in csv_reader:
            # Expected CSV headers: signal_id, region_id, value, timestamp (optional)
            sig_id = row.get('signal_id')
            reg_id = row.get('region_id')
            val = row.get('value')
            ts_str = row.get('timestamp')

            if not (sig_id and reg_id and val):
                errors += 1
                continue

            if sig_id not in valid_signals:
                logger.warning(f"Invalid signal_id in CSV: {sig_id}")
                errors += 1
                continue
                
            if reg_id not in valid_regions:
                logger.warning(f"Invalid region_id in CSV: {reg_id}")
                errors += 1
                continue
            
            # Handle timestamp
            try:
                ts = datetime.fromisoformat(ts_str) if ts_str else datetime.now()
                value_float = float(val)
            except ValueError:
                errors += 1
                continue
            
            # Ingest Record
            record = NumericRecord(
                signal_id=sig_id,
                region_id=reg_id,
                timestamp=ts,
                value=value_float
            )
            db.add(record)
            affected_regions.add(reg_id)
            rows_processed += 1
        
        # 2. Update Log and Commit
        upload_log.status = "DONE" if errors == 0 else "DONE_WITH_ERRORS"
        db.commit()
        
        # 3. Trigger Updates
        if affected_regions:
            trigger_partial_recompute(affected_regions)
            
        logger.info(f"NGO Upload processed. Rows: {rows_processed}, Errors: {errors}")
        
    except Exception as e:
        db.rollback()
        upload_log.status = f"FAILED: {str(e)}"
        db.commit()
        logger.error(f"NGO Upload failed: {e}")
        raise e

    return NGOReportUploadResponse(
        log_id=upload_log.id,
        filename=file.filename,
        rows_processed=rows_processed,
        status=upload_log.status
    )
