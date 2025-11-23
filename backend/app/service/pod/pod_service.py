# app/service/pod/pod_service.py
from app.repository.pod.pod_command_repository import PodCommandRepository
from app.repository.pod.pod_query_repository import PodQueryRepository
from app.schemas.pod import PodCreateRequest, PodResponse, PodDetailResponse, PodListResponse
from typing import Optional, List

class PodService:
    def __init__(self, command_repo: PodCommandRepository, query_repo: PodQueryRepository):
        self.command_repo = command_repo
        self.query_repo = query_repo

    def create_pod(self, request: PodCreateRequest) -> int:
        return self.command_repo.create_pod(request)

    def get_pod(self, pod_id: int) -> Optional[PodResponse]:
        pod_data = self.query_repo.find_pod_by_id(pod_id)
        if pod_data:
            return PodResponse(**pod_data)
        return None
    def get_podDetail(self, pod_id: int) -> Optional[PodDetailResponse]:
        pod_data = self.query_repo.find_podDetail_by_id(pod_id)
        if pod_data:
            return PodDetailResponse(**pod_data)
        return None
    
    def list_all_pods(self, limit: int = 100, offset: int = 0) -> List[PodListResponse]:
        pods_data = self.query_repo.find_all_pods(limit, offset)
        return [PodListResponse(**pod) for pod in pods_data]
    
    def join_pod(self, pod_id: int, user_id: int) -> bool:
        return self.command_repo.join_pod(pod_id, user_id)
    def search_pod(self, query: str, limit: int = 100, offset: int = 0) -> List[PodListResponse]:
        pods_data = self.query_repo.find_pods_by_query(query, limit, offset)
        return [PodListResponse(**pod) for pod in pods_data]