import sys
sys.path.insert(0, 'C:\\Users\\KiKi\\Desktop\\DataBaseProject\\Hot-s-Pod\\Backend')

print("Loading models...")
from models.embedding_model import embedding_instance
print("✅ Embedding model loaded")

from models.llm_model import llm_instance  
print("✅ LLM model loaded")

print("All models loaded successfully!")
