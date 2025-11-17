# app/schemas/pod_member.py
from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional

class PodMemberJoinRequest(BaseModel):
    user_id: int
    pod_id: int
    amount: Optional[int] = 0
    place_start: Optional[str] = None
    place_end: Optional[str] = None

class PodMemberResponse(BaseModel):
    pod_member_id: int
    user_id: int
    pod_id: int
    amount: int
    place_start: Optional[str]
    place_end: Optional[str]
    joined_at: datetime
    username: Optional[str] = None

    class Config:
        from_attributes = True
class PodMemberListResponse(BaseModel):
    pod_member_id: int
    user_id: int
    pod_id: int
    amount: int
    place_start: Optional[str]
    place_end: Optional[str]
    joined_at: datetime
    username: Optional[str] = None

    class Config:
        from_attributes = True