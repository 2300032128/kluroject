import numpy as np
from typing import List, Union
from sklearn.feature_extraction.text import TfidfVectorizer
from app.core.config import settings

class EmbeddingService:
    def __init__(self):
        self.api_key = settings.GEMINI_API_KEY
        self.client = None
        self.vectorizer = TfidfVectorizer(stop_words='english')
        
        if self.api_key and not settings.DEMO_MODE:
            try:
                from google import genai
                self.client = genai.Client(api_key=self.api_key)
                print("[EmbeddingService] Gemini API Embedding Client initialized.")
            except Exception as e:
                print(f"[EmbeddingService] Gemini Embedding init fallback: {e}")

    def embed_text(self, text: str) -> List[float]:
        if self.client:
            try:
                res = self.client.models.embed_content(
                    model="text-embedding-004",
                    contents=text,
                )
                if res and res.embedding and res.embedding.values:
                    return list(res.embedding.values)
            except Exception as e:
                print(f"[EmbeddingService] Gemini Embedding API error: {e}. Fallback to local vector.")

        # Fallback / DEMO_MODE feature vector encoding
        return self._generate_local_embedding(text)

    def _generate_local_embedding(self, text: str) -> List[float]:
        """
        Creates a normalized 64-dimensional feature vector based on text character & keyword hashes.
        """
        vec = np.zeros(64, dtype=float)
        words = text.lower().split()
        for idx, word in enumerate(words):
            h = hash(word) % 64
            vec[h] += 1.0 / (idx + 1)
        norm = np.linalg.norm(vec)
        if norm > 0:
            vec = vec / norm
        return vec.tolist()

embedding_service = EmbeddingService()
