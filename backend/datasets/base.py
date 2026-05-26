from abc import ABC, abstractmethod
from typing import Iterator, List
from backend.schemas.dataset import DatasetMetadata, NumericDataRow, TextDataRow

class BaseDatasetAdapter(ABC):
    """
    Abstract Interface for a Dataset Component.
    Enforces structure for reading metadata and data streams.
    """
    
    def __init__(self, path: str):
        self.path = path

    @abstractmethod
    def validate_structure(self) -> bool:
        """Check if required files exist."""
        pass

    @abstractmethod
    def load_metadata(self) -> DatasetMetadata:
        """Parse and return dataset.json"""
        pass

    @abstractmethod
    def stream_numeric_data(self) -> Iterator[NumericDataRow]:
        """Yield validated numeric records."""
        pass

    @abstractmethod
    def stream_text_data(self) -> Iterator[TextDataRow]:
        """Yield validated text records."""
        pass
