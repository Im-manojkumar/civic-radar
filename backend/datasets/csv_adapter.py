import csv
import os
from typing import Iterator
from datetime import datetime
from backend.datasets.base import BaseDatasetAdapter
from backend.schemas.dataset import DatasetMetadata, NumericDataRow, TextDataRow

class CsvDataAdapter(BaseDatasetAdapter):
    """
    Handles CSV parsing for data files within the dataset package.
    """

    def validate_structure(self) -> bool:
        # Check if at least one data file exists if expected
        num_path = os.path.join(self.path, "numeric.csv")
        txt_path = os.path.join(self.path, "text.csv")
        return os.path.exists(num_path) or os.path.exists(txt_path)

    def load_metadata(self) -> DatasetMetadata:
        raise NotImplementedError("CsvDataAdapter does not handle metadata. Use JsonMetadataAdapter or FolderDataset.")

    def stream_numeric_data(self) -> Iterator[NumericDataRow]:
        file_path = os.path.join(self.path, "numeric.csv")
        if not os.path.exists(file_path):
            return

        with open(file_path, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                # Validation happens here via Pydantic model
                # Timestamps in CSV expected to be ISO 8601 or strictly handled here
                yield NumericDataRow(
                    signal_id=row['signal_id'],
                    region_id=row['region_id'],
                    timestamp=row['timestamp'], # Pydantic parses ISO strings automatically
                    value=float(row['value'])
                )

    def stream_text_data(self) -> Iterator[TextDataRow]:
        file_path = os.path.join(self.path, "text.csv")
        if not os.path.exists(file_path):
            return

        with open(file_path, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                yield TextDataRow(
                    signal_id=row['signal_id'],
                    region_id=row['region_id'],
                    timestamp=row['timestamp'],
                    value=str(row['value'])
                )
