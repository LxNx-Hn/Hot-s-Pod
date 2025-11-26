# app/service/pod_member/pod_member_service.py
from app.repository.pod_member.pod_member_command_repository import PodMemberCommandRepository
from app.repository.pod_member.pod_member_query_repository import PodMemberQueryRepository
from app.schemas.pod_member import PodMemberJoinRequest, PodMemberResponse
from typing import List

class PodMemberService:
    def __init__(self, command_repo: PodMemberCommandRepository, query_repo: PodMemberQueryRepository):
        self.command_repo = command_repo
        self.query_repo = query_repo
    
    def join_pod(self, join_data: PodMemberJoinRequest, skip_check: bool = False) -> int:
        """Pod 참가"""
        # 중복 참가 확인 (skip_check가 True면 생략 - 관리자용)
        if not skip_check and self.query_repo.is_member(join_data.pod_id, join_data.user_id):
            raise ValueError("Already a member of this pod")
        
        return self.command_repo.join_pod(join_data)
    
    def leave_pod(self, pod_id: int, user_id: int) -> bool:
        """Pod 탈퇴"""
        return self.command_repo.leave_pod(pod_id, user_id)
    
    def get_pod_members(self, pod_id: int) -> List[PodMemberResponse]:
        """Pod 참가자 목록"""
        members_data = self.query_repo.find_members_by_pod(pod_id)
        return [PodMemberResponse(**member) for member in members_data]
    
    def get_user_pods(self, user_id: int) -> List[dict]:
        """사용자가 참가한 Pod 목록"""
        return self.query_repo.find_pods_by_user(user_id)
    def get_user_hosted_pods(self, user_id: int) -> List[dict]:
        """사용자가 생성한 Pod 목록"""
        return self.query_repo.find_pods_by_hostuser(user_id)
    
    def get_member_count(self, pod_id: int) -> int:
        """참가자 수"""
        return self.query_repo.get_member_count(pod_id)
    
    def is_member(self, pod_id: int, user_id: int) -> bool:
        """참가자 여부 확인"""
        return self.query_repo.is_member(pod_id, user_id)