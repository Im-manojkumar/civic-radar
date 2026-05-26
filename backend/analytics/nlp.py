import re
import numpy as np
from typing import List, Dict, Tuple
from collections import Counter
# Assuming scikit-learn is available for the requested TF-IDF + KMeans feature
# If not, this would need to be replaced with a naive implementation
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.cluster import KMeans

class NLPProcessor:
    
    TAMIL_UNICODE_RANGE = (0x0B80, 0x0BFF)
    
    FAILURE_KEYWORDS = {
        "delay": ["late", "wait", "delay", "pending", "slow", "தாமதம்", "காத்திரு", "மெதுவாக"],
        "denial": ["reject", "deny", "denied", "refuse", "no", "மறுப்பு", "நிராகரி"],
        "quality": ["broken", "bad", "poor", "damage", "leak", "மோசமான", "உடைந்தது", "கசிவு"],
        "access": ["road", "closed", "remote", "reach", "way", "access", "வழி", "சாலை", "தூரம்"],
        "awareness": ["know", "info", "information", "aware", "details", "தகவல்", "தெரியாது"],
        "corruption": ["bribe", "money", "pay", "cash", "commission", "ஊழல்", "லஞ்சம்", "பணம்"]
    }

    SENTIMENT_POSITIVE = ["good", "great", "fast", "thanks", "resolved", "நன்று", "நன்றி", "விரைவு"]
    SENTIMENT_NEGATIVE = ["bad", "worst", "slow", "angry", "fail", "மோசம்", "கோபம்", "தோல்வி"]

    @staticmethod
    def detect_language(text: str) -> str:
        """
        Simple heuristic: check for Tamil unicode characters.
        """
        if not text:
            return "en"
        
        tamil_char_count = sum(1 for char in text if NLPProcessor.TAMIL_UNICODE_RANGE[0] <= ord(char) <= NLPProcessor.TAMIL_UNICODE_RANGE[1])
        if tamil_char_count > 0:
            return "ta"
        return "en"

    @staticmethod
    def categorize_failure_type(text: str) -> str:
        """
        Categorize into delay, denial, quality, access, awareness, corruption based on keywords.
        Returns 'other' if no match.
        """
        text_lower = text.lower()
        for category, keywords in NLPProcessor.FAILURE_KEYWORDS.items():
            if any(k in text_lower for k in keywords):
                return category
        return "other"

    @staticmethod
    def compute_sentiment(text: str) -> float:
        """
        Returns a score between -1.0 (Negative) and 1.0 (Positive).
        Simple keyword counting approach.
        """
        text_lower = text.lower()
        pos_score = sum(1 for w in NLPProcessor.SENTIMENT_POSITIVE if w in text_lower)
        neg_score = sum(1 for w in NLPProcessor.SENTIMENT_NEGATIVE if w in text_lower)
        
        total = pos_score + neg_score
        if total == 0:
            return 0.0
        
        return (pos_score - neg_score) / total

    @staticmethod
    def cluster_topics(texts: List[str], num_clusters: int = 5) -> List[Dict]:
        """
        Uses TF-IDF and KMeans to cluster texts and extract top terms per cluster.
        """
        if not texts or len(texts) < num_clusters:
            return []

        try:
            vectorizer = TfidfVectorizer(max_df=0.5, min_df=2, stop_words='english', max_features=1000)
            tfidf_matrix = vectorizer.fit_transform(texts)
            
            km = KMeans(n_clusters=num_clusters, init='k-means++', max_iter=100, n_init=1)
            km.fit(tfidf_matrix)
            
            order_centroids = km.cluster_centers_.argsort()[:, ::-1]
            terms = vectorizer.get_feature_names_out()
            
            clusters = []
            for i in range(num_clusters):
                top_terms = [terms[ind] for ind in order_centroids[i, :5]]
                clusters.append({
                    "cluster_id": i,
                    "top_terms": top_terms,
                    "count": int(np.sum(km.labels_ == i))
                })
            
            return clusters
        except Exception as e:
            # Fallback for sparse data or import errors
            return [{"cluster_id": 0, "top_terms": ["insufficient", "data"], "count": len(texts)}]

    @staticmethod
    def compute_keyword_surge(current_texts: List[str], previous_texts: List[str], top_n: int = 10) -> List[Dict]:
        """
        Compares word frequencies between two periods to find surging keywords.
        """
        def get_freq(t_list):
            words = []
            for t in t_list:
                # Basic tokenization
                words.extend(re.findall(r'\w+', t.lower()))
            return Counter(words)

        curr_freq = get_freq(current_texts)
        prev_freq = get_freq(previous_texts)
        
        surges = []
        # Filter for words present in current set with significant count
        for word, count in curr_freq.most_common(100):
            if len(word) < 4: continue # Skip small words
            
            prev_count = prev_freq.get(word, 0)
            # Avoid division by zero, assume base 1
            prev_norm = max(prev_count, 1)
            
            growth = ((count - prev_count) / prev_norm) * 100
            
            if growth > 20: # Only return if growth > 20%
                surges.append({
                    "keyword": word,
                    "current_count": count,
                    "previous_count": prev_count,
                    "growth_percent": round(growth, 1)
                })
        
        # Sort by growth
        surges.sort(key=lambda x: x['growth_percent'], reverse=True)
        return surges[:top_n]
