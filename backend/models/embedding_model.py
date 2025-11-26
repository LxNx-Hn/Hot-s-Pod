from sentence_transformers import SentenceTransformer
from app.core.config import settings

class EmbeddingModel:
    def __init__(self):
        self.embedder = SentenceTransformer(settings.EMBEDDING_MODEL_NAME)
    
    def encode(self, texts, convert_to_numpy=True, show_progress_bar=False):
        return self.embedder.encode(texts, convert_to_numpy=convert_to_numpy, show_progress_bar=show_progress_bar)

embedding_instance = EmbeddingModel()