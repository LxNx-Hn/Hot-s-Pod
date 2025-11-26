# app/service/user/user_service.py
from app.repository.user.user_command_repository import UserCommandRepository
from app.repository.user.user_query_repository import UserQueryRepository
from app.schemas.user import UserCreateRequest, UserResponse
from typing import Optional

class UserService:
    def __init__(self, command_repo: UserCommandRepository, query_repo: UserQueryRepository):
        self.command_repo = command_repo
        self.query_repo = query_repo
    
    def create_user(self, request: UserCreateRequest) -> int:
        return self.command_repo.create_user(request.username, request.phonenumber)
    
    def get_user(self, user_id: int) -> Optional[UserResponse]:
        user_data = self.query_repo.find_user_by_id(user_id)
        if user_data:
            return UserResponse(**user_data)
        return None
    
    def update_user(self, user_id: int, update_data: dict) -> bool:
        return self.command_repo.update_user(user_id, update_data)