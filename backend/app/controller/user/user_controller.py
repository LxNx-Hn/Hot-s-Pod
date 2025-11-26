# app/controller/user/user_controller.py
from fastapi import APIRouter, Depends, HTTPException, Query, Request
from pymysql.connections import Connection
from app.database import get_db_connection
from app.repository.user.user_command_repository import UserCommandRepository
from app.repository.user.user_query_repository import UserQueryRepository
from app.service.user.user_service import UserService
from app.schemas.user import UserCreateRequest, UserUpdateRequest, UserResponse
from app.utils.auth import get_current_user_id
from app.utils.auth import get_current_user_id_from_cookie
from app.utils.permissions import get_user_from_token
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
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception:
        raise HTTPException(status_code=500, detail="사용자 생성 중 오류가 발생했습니다.")

@router.get("/me", response_model=UserResponse)
async def get_my_profile(
    current_user_id: int = Depends(get_current_user_id_from_cookie),
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

@router.put("/me", response_model=dict)
async def update_my_profile(
    request: Request,
    update_data: UserUpdateRequest,
    service: UserService = Depends(get_user_service)
):
    """현재 로그인한 사용자 프로필 수정"""
    user_payload = get_user_from_token(request)
    user_id = user_payload.get('user_id')
    
    # 수정할 데이터만 dict로 변환
    update_dict = update_data.model_dump(exclude_unset=True)
    if not update_dict:
        raise HTTPException(status_code=400, detail="수정할 내용이 없습니다")
    
    success = service.update_user(user_id, update_dict)
    if not success:
        raise HTTPException(status_code=500, detail="프로필 수정에 실패했습니다")
    
    return {"message": "프로필이 성공적으로 수정되었습니다"}