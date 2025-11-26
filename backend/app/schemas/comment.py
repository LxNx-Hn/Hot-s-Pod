# app/schemas/comment.py
from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, List

class CommentCreateRequest(BaseModel):
    pod_id: int
    user_id: int
    content: str = Field(..., min_length=1)
    parent_comment_id: Optional[int] = None

class CommentResponse(BaseModel):
    comment_id: int
    pod_id: int
    user_id: Optional[int] = None  # 삭제된 댓글은 NULL
    content: str
    parent_comment_id: Optional[int]
    created_at: datetime
    updated_at: Optional[datetime] = None
    username: Optional[str] = None

    class Config:
        from_attributes = True

class CommentWithReplies(CommentResponse):
    replies: List['CommentWithReplies'] = []