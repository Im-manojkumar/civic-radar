import math
from typing import List, Optional

class DeviationDetector:
    
    @staticmethod
    def zscore(value: float, mean: float, std_dev: float, threshold: float = 3.0) -> Optional[float]:
        """
        Returns severity (z-score value) if anomaly detected, else None.
        """
        if std_dev == 0:
            return None
        z = (value - mean) / std_dev
        if abs(z) > threshold:
            return z
        return None

    @staticmethod
    def cusum(values: List[float], mean: float, std_dev: float, drift: float = 1, threshold: float = 5) -> Optional[float]:
        """
        Cumulative Sum Control Chart (Upper/Lower).
        Returns max severity if threshold breached.
        """
        if not values or std_dev == 0:
            return None
            
        # Simplified tabular CUSUM
        k = drift * std_dev / 2
        h = threshold * std_dev
        
        c_plus = 0
        c_minus = 0
        max_severity = 0.0
        breached = False

        for x in values:
            c_plus = max(0, c_plus + (x - mean) - k)
            c_minus = max(0, c_minus - (x - mean) - k)
            
            if c_plus > h:
                breached = True
                max_severity = max(max_severity, c_plus / std_dev)
            if c_minus > h:
                breached = True
                max_severity = max(max_severity, c_minus / std_dev)

        return max_severity if breached else None

    @staticmethod
    def ewma(values: List[float], mean: float, std_dev: float, lambda_: float = 0.2, threshold_sigma: float = 3.0) -> Optional[float]:
        """
        Exponentially Weighted Moving Average.
        Returns severity if last point exceeds control limits.
        """
        if not values:
            return None
            
        z = mean
        control_limit = threshold_sigma * std_dev * math.sqrt(lambda_ / (2 - lambda_))
        
        last_metric = 0.0
        
        for x in values:
            z = lambda_ * x + (1 - lambda_) * z
            last_metric = abs(z - mean)
            
        if last_metric > control_limit:
            return (z - mean) / std_dev # normalized severity
        return None

    @staticmethod
    def sudden_drop(values: List[float], drop_percent: float = 0.3) -> Optional[float]:
        """
        Detects if the last value dropped significantly compared to the average of previous window.
        """
        if len(values) < 2:
            return None
            
        current = values[-1]
        previous = values[:-1]
        avg_prev = sum(previous) / len(previous)
        
        if avg_prev == 0:
            return None
            
        drop_magnitude = (avg_prev - current) / avg_prev
        
        if drop_magnitude >= drop_percent:
            return drop_magnitude
        return None

    @staticmethod
    def changepoint(values: List[float], window_size: int = 5, threshold_ratio: float = 1.5) -> Optional[float]:
        """
        Simple Mean-Shift detection. Compares two adjacent windows.
        """
        n = len(values)
        if n < window_size * 2:
            return None
            
        # Compare last window vs window before it
        w2 = values[-window_size:]
        w1 = values[-2*window_size:-window_size]
        
        mean1 = sum(w1) / len(w1) if w1 else 0
        mean2 = sum(w2) / len(w2) if w2 else 0
        
        if mean1 == 0:
            return None
            
        ratio = abs(mean2 - mean1) / abs(mean1)
        
        if ratio > threshold_ratio:
            return ratio
        return None
