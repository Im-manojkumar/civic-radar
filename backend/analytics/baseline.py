import statistics
from typing import List, Tuple, Optional

class BaselineModel:
    """
    Computes statistical baseline metrics for a time series.
    """
    
    @staticmethod
    def compute(values: List[float]) -> Tuple[Optional[float], Optional[float]]:
        """
        Returns (mean, std_dev). 
        Returns (None, None) if insufficient data.
        """
        if not values or len(values) < 2:
            return None, None
            
        try:
            mean_val = statistics.mean(values)
            std_dev_val = statistics.stdev(values)
            return mean_val, std_dev_val
        except statistics.StatisticsError:
            return None, None
