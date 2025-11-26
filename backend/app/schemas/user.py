# app/schemas/user.py
from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional

class UserCreateRequest(BaseModel):
    username: str = Field(..., min_length=1, max_length=100)
    phonenumber: Optional[str] = Field(None, max_length=20)

class UserUpdateRequest(BaseModel):
    username: Optional[str] = Field(None, min_length=1, max_length=100)
    phonenumber: Optional[str] = Field(None, max_length=20)
    profile_picture_enabled: Optional[bool] = None

class UserResponse(BaseModel):
    user_id: int
    username: str
    phonenumber: Optional[str]
    profile_picture: str
    is_admin: bool = False
    profile_picture_enabled: bool = True
    created_at: datetime

    class Config:
        from_attributes = True