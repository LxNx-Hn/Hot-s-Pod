# app/schemas/pod.py
from pydantic import BaseModel, Field
from datetime import datetime
from typing import List, Optional

class PodCreateRequest(BaseModel):
    host_user_id: int
    event_time: datetime
    place: str = Field(..., max_length=255)
    title: str = Field(..., max_length=255)
    content: Optional[str] = None
    min_peoples: int
    max_peoples: int
    category_ids: List[int] = Field(..., min_items=0)

class PodResponse(BaseModel):
    pod_id: int
    host_user_id: int
    event_time: datetime
    place: str
    title: str
    content: Optional[str]
    min_peoples: int
    max_peoples: int
    current_member: int
    created_at: datetime
    updated_at: datetime
    host_username: Optional[str] = None

    class Config:
        from_attributes = True