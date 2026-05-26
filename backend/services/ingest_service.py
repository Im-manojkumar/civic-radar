import os
import shutil
import zipfile
import tempfile
import json
import logging
from sqlalchemy.orm import Session
from fastapi import UploadFile, HTTPException
from backend.models import NumericRecord, TextRecord, SignalDefinition, Sector, Region
from backend.datasets.registry import registry
from backend.schemas.ingest import IngestResult, DirectNumericIngest, DirectTextIngest

logger = logging.getLogger("civic_radar")

def list_datasets():
    return registry.discover()

def handle_upload(file: UploadFile):
    # Create datasets dir if not exists
    os.makedirs("datasets", exist_ok=True)
    
    with tempfile.TemporaryDirectory() as tmpdir:
        zip_path = os.path.join(tmpdir, "upload.zip")
        with open(zip_path, "wb") as f:
            shutil.copyfileobj(file.file, f)
            
        try:
            with zipfile.ZipFile(zip_path, 'r') as zip_ref:
                zip_ref.extractall(tmpdir)
        except zipfile.BadZipFile:
            raise HTTPException(status_code=400, detail="Invalid zip file")
            
        # Find dataset.json
        dataset_json_path = None
        extract_root = None
        
        # Walk to find dataset.json in case it's in a subfolder
        for root, dirs, files in os.walk(tmpdir):
            if "dataset.json" in files:
                dataset_json_path = os.path.join(root, "dataset.json")
                extract_root = root
                break
        
        if not dataset_json_path:
            raise HTTPException(status_code=400, detail="dataset.json not found in zip")
            
        try:
            with open(dataset_json_path, 'r', encoding='utf-8') as f:
                meta = json.load(f)
                dataset_id = meta.get("dataset_id")
        except Exception:
             raise HTTPException(status_code=400, detail="Invalid dataset.json")

        if not dataset_id:
             raise HTTPException(status_code=400, detail="dataset_id missing in metadata")

        # Move to datasets/id
        target_dir = os.path.join("datasets", dataset_id)
        if os.path.exists(target_dir):
            shutil.rmtree(target_dir) # Overwrite
        
        shutil.copytree(extract_root, target_dir)
        
    return {"status": "uploaded", "dataset_id": dataset_id}

def load_dataset_into_db(db: Session, dataset_id: str) -> IngestResult:
    dataset = registry.get_dataset(dataset_id)
    if not dataset:
        raise HTTPException(status_code=404, detail=f"Dataset {dataset_id} not found")

    try:
        meta = dataset.load_metadata()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to load metadata: {str(e)}")

    # 1. Ensure Sector
    sector = db.query(Sector).filter(Sector.id == meta.sector_id).first()
    if not sector:
        # Create minimal sector if not exists
        sector = Sector(id=meta.sector_id, name=f"Sector {meta.sector_id}", description=f"Imported from dataset {meta.dataset_id}")
        db.add(sector)
        db.commit()

    # 2. Sync Signals
    for sig in meta.signals:
        existing_sig = db.query(SignalDefinition).filter(SignalDefinition.id == sig.id).first()
        if not existing_sig:
            new_sig = SignalDefinition(
                id=sig.id,
                name=sig.name,
                description=sig.description,
                sector_id=meta.sector_id,
                unit=sig.unit,
                frequency=sig.frequency
            )
            db.add(new_sig)
        else:
            # Update metadata
            existing_sig.name = sig.name
            existing_sig.unit = sig.unit
    db.commit()

    total_records = 0
    success_count = 0
    error_count = 0

    # Cache regions to avoid N+1 queries
    existing_region_ids = {r[0] for r in db.query(Region.id).all()}

    # 3. Ingest Numeric
    try:
        for row in dataset.stream_numeric_data():
            total_records += 1
            if row.region_id not in existing_region_ids:
                error_count += 1
                continue
            
            record = NumericRecord(
                signal_id=row.signal_id,
                region_id=row.region_id,
                timestamp=row.timestamp,
                value=row.value
            )
            db.add(record)
            success_count += 1
            
            if success_count % 1000 == 0:
                db.commit()
    except Exception as e:
        logger.error(f"Error streaming numeric data: {e}")
        # If parsing fails inside adapter loop
        pass

    # 4. Ingest Text
    try:
        for row in dataset.stream_text_data():
            total_records += 1
            if row.region_id not in existing_region_ids:
                error_count += 1
                continue
            
            record = TextRecord(
                signal_id=row.signal_id,
                region_id=row.region_id,
                timestamp=row.timestamp,
                value=row.value
            )
            db.add(record)
            success_count += 1
            
            if success_count % 1000 == 0:
                db.commit()
    except Exception as e:
        logger.error(f"Error streaming text data: {e}")
        pass

    db.commit()

    score = (success_count / total_records * 100) if total_records > 0 else 100.0
    
    return IngestResult(
        total_records=total_records,
        success_count=success_count,
        error_count=error_count,
        quality_score=score,
        summary=f"Ingested {success_count} records. Skipped {error_count} due to missing regions or errors."
    )

def ingest_numeric_single(db: Session, data: DirectNumericIngest):
    # Validate FKs
    if not db.query(SignalDefinition).filter(SignalDefinition.id == data.signal_id).first():
        raise HTTPException(status_code=400, detail="Invalid signal_id")
    if not db.query(Region).filter(Region.id == data.region_id).first():
        raise HTTPException(status_code=400, detail="Invalid region_id")
        
    record = NumericRecord(
        signal_id=data.signal_id,
        region_id=data.region_id,
        timestamp=data.timestamp,
        value=data.value
    )
    db.add(record)
    db.commit()
    return {"status": "ok", "id": record.id}

def ingest_text_single(db: Session, data: DirectTextIngest):
    if not db.query(SignalDefinition).filter(SignalDefinition.id == data.signal_id).first():
        raise HTTPException(status_code=400, detail="Invalid signal_id")
    if not db.query(Region).filter(Region.id == data.region_id).first():
        raise HTTPException(status_code=400, detail="Invalid region_id")

    record = TextRecord(
        signal_id=data.signal_id,
        region_id=data.region_id,
        timestamp=data.timestamp,
        value=data.value
    )
    db.add(record)
    db.commit()
    return {"status": "ok", "id": record.id}
