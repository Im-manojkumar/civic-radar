import os
import logging
from typing import List, Optional, Dict, Iterator
from backend.datasets.base import BaseDatasetAdapter
from backend.datasets.json_adapter import JsonMetadataAdapter
from backend.datasets.csv_adapter import CsvDataAdapter
from backend.schemas.dataset import DatasetMetadata, NumericDataRow, TextDataRow

logger = logging.getLogger("civic_radar")

class FolderDataset(BaseDatasetAdapter):
    """
    Composite adapter that uses JSON for metadata and CSV for data.
    Represents a full dataset package on disk.
    """
    def __init__(self, path: str):
        super().__init__(path)
        self.json_handler = JsonMetadataAdapter(path)
        self.csv_handler = CsvDataAdapter(path)

    def validate_structure(self) -> bool:
        return self.json_handler.validate_structure()

    def load_metadata(self) -> DatasetMetadata:
        return self.json_handler.load_metadata()

    def stream_numeric_data(self) -> Iterator[NumericDataRow]:
        return self.csv_handler.stream_numeric_data()

    def stream_text_data(self) -> Iterator[TextDataRow]:
        return self.csv_handler.stream_text_data()


class DatasetRegistry:
    """
    Manages discovery of datasets in the `datasets/` directory.
    """
    def __init__(self, root_dir: str = "datasets"):
        self.root_dir = root_dir
        self._datasets: Dict[str, FolderDataset] = {}

    def discover(self) -> List[DatasetMetadata]:
        """
        Scans the root directory for valid dataset packages.
        Returns metadata for all found datasets.
        """
        found_metadata = []
        self._datasets = {}

        if not os.path.exists(self.root_dir):
            logger.warning(f"Dataset root directory {self.root_dir} does not exist.")
            return []

        for entry in os.scandir(self.root_dir):
            if entry.is_dir():
                try:
                    ds = FolderDataset(entry.path)
                    if ds.validate_structure():
                        meta = ds.load_metadata()
                        # Ensure directory name matches ID or just index by ID
                        self._datasets[meta.dataset_id] = ds
                        found_metadata.append(meta)
                except Exception as e:
                    logger.error(f"Failed to load dataset at {entry.path}: {e}")
        
        return found_metadata

    def get_dataset(self, dataset_id: str) -> Optional[FolderDataset]:
        """
        Retrieve a specific dataset adapter by ID.
        """
        if dataset_id not in self._datasets:
            # Try to lazy load if not found (in case of new files)
            self.discover()
            
        return self._datasets.get(dataset_id)

# Singleton instance
registry = DatasetRegistry()