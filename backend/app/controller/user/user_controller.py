# app/controller/user/user_controller.py
from fastapi import APIRouter, Depends, HTTPException, Query
from pymysql.connections import Connection
from app.database import get_db_connection
from app.repository.user.user_command_repository import UserCommandRepository
from app.repository.user.user_query_repository import UserQueryRepository
from app.service.user.user_service import UserService
from app.schemas.user import UserCreateRequest, UserResponse
from app.utils.auth import get_current_user_id
from typing import List

router = APIRouter(prefix="/users", tags=["Users"])

def get_user_service(db: Connection = Depends(get_db_connection)) -> UserService:
    command_repo = UserCommandRepository(db)
    query_repo = UserQueryRepository(db)
    return UserService(command_repo, query_repo)

@router.post("/", response_model=dict, status_code=201)
async def create_user(
    request: UserCreateRequest,
    service: UserService = Depends(get_user_service)
):
    """새 사용자 생성"""
    try:
        user_id = service.create_user(request)
        return {"user_id": user_id, "message": "User created successfully"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/me", response_model=UserResponse)
async def get_my_profile(
    current_user_id: int = Depends(get_current_user_id),
    service: UserService = Depends(get_user_service)
):
    """현재 로그인한 사용자 정보 조회 (JWT 인증 필요)"""
    user = service.get_user(current_user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.get("/{user_id}", response_model=UserResponse)
async def get_user(
    user_id: int,
    service: UserService = Depends(get_user_service)
):
    """사용자 조회"""
    user = service.get_user(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user