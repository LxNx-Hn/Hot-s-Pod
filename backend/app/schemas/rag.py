# app/schemas/rag.py
from pydantic import BaseModel, Field
from typing import List
from app.schemas.pod import PodListResponse
from typing import Optional

class RagSearchRequest(BaseModel):
    query: str = Field(..., min_length=1, max_length=500)
    user_id: Optional[int] = None

class RagSearchResponse(BaseModel):
    llm_answer: str
    retrieved_pods: List[PodListResponse]
    total_found: int