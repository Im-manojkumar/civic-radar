import json
import os
from backend.datasets.base import BaseDatasetAdapter
from backend.schemas.dataset import DatasetMetadata, NumericDataRow, TextDataRow
from typing import Iterator

class JsonMetadataAdapter(BaseDatasetAdapter):
    """
    Responsible strictly for Metadata handling via JSON.
    Example usage: used via composition or inheritance in the main FolderAdapter.
    """

    def validate_structure(self) -> bool:
        return os.path.exists(os.path.join(self.path, "dataset.json"))

    def load_metadata(self) -> DatasetMetadata:
        file_path = os.path.join(self.path, "dataset.json")
        if not os.path.exists(file_path):
            raise FileNotFoundError(f"Metadata file not found at {file_path}")

        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        # Pydantic validation
        return DatasetMetadata(**data)

    # Stubs for base class compliance if used standalone
    def stream_numeric_data(self) -> Iterator[NumericDataRow]:
        yield from []

    def stream_text_data(self) -> Iterator[TextDataRow]:
        yield from []
