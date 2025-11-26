# app/schemas/pod.py
from pydantic import BaseModel, Field
from datetime import datetime
from typing import List, Optional

class PodComment(BaseModel):
    comment_id: int
    user_id: Optional[int] = None  # 삭제된 댓글은 NULL
    username: Optional[str] = None  # 삭제된 댓글은 NULL
    profile_picture: Optional[str] = None
    content: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    parent_comment_id: Optional[int] = None

class PodCategory(BaseModel):
    category_link_id: int
    category_id: int

class PodMember(BaseModel):
    pod_member_id: int
    user_id: int
    username: str
    profile_picture: Optional[str] = None
    amount: int
    joined_at: datetime
class PodCreateRequest(BaseModel):
    host_user_id: int
    event_time: datetime
    place: Optional[str] = Field(None, max_length=255)
    place_detail: str = Field(..., max_length=255)
    title: str = Field(..., max_length=255)
    content: Optional[str] = None
    min_peoples: int
    max_peoples: int
    category_ids: List[int] = Field(..., min_items=0)

class PodUpdateRequest(BaseModel):
    event_time: Optional[datetime] = None
    place: Optional[str] = Field(None, max_length=255)
    place_detail: Optional[str] = Field(None, max_length=255)
    title: Optional[str] = Field(None, max_length=255)
    content: Optional[str] = None
    min_peoples: Optional[int] = None
    max_peoples: Optional[int] = None

class PodResponse(BaseModel):
    pod_id: int
    host_user_id: int
    event_time: datetime
    place: Optional[str]
    place_detail: str
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
class PodListResponse(BaseModel):
    pod_id: int
    host_user_id: int
    event_time: datetime
    place: Optional[str]
    place_detail: str
    title: str
    content: Optional[str]
    min_peoples: int
    max_peoples: int
    current_member: int
    created_at: datetime
    updated_at: datetime
    host_username: Optional[str] = None
    category_ids: List[int] = None
    class Config:
        from_attributes = True
class PodDetailResponse(BaseModel):
    pod_id: int
    host_user_id: int
    event_time: datetime
    place: Optional[str]
    place_detail: str
    title: str
    content: Optional[str]
    min_peoples: int
    max_peoples: int
    updated_at: datetime
    host_username: Optional[str] = None
    created_at: datetime
    comments: List[PodComment] = []
    categories: List[PodCategory] = []
    members: List[PodMember] = []
    current_member: int

    class Config:
        from_attributes = True