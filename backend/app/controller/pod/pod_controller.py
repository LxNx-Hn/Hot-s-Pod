# app/controller/pod/pod_controller.py
from fastapi import APIRouter, Depends, HTTPException, Query
from pymysql.connections import Connection
from app.database import get_db_connection
from app.repository.pod.pod_command_repository import PodCommandRepository
from app.repository.pod.pod_query_repository import PodQueryRepository
from app.service.pod.pod_service import PodService
from app.schemas.pod import PodCreateRequest, PodResponse
from typing import List

router = APIRouter(prefix="/pods", tags=["Pods"])

def get_pod_service(db: Connection = Depends(get_db_connection)) -> PodService:
    command_repo = PodCommandRepository(db)
    query_repo = PodQueryRepository(db)
    return PodService(command_repo, query_repo)

@router.post("/", response_model=dict, status_code=201)
async def create_pod(
    pod_data: PodCreateRequest,
    pod_service: PodService = Depends(get_pod_service)
):
    """
    Pod 생성 (트리거로 자동 RAG 큐 추가)
    """
    try:
        pod_id = pod_service.create_pod(pod_data)
        return {"pod_id": pod_id, "message": "Pod created successfully"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/{pod_id}", response_model=PodResponse)
async def get_pod(
    pod_id: int,
    pod_service: PodService = Depends(get_pod_service)
):
    """Pod 상세 조회"""
    pod = pod_service.get_pod(pod_id)
    if not pod:
        raise HTTPException(status_code=404, detail="Pod not found")
    return pod

@router.get("/", response_model=List[PodResponse])
async def list_pods(
    limit: int = Query(100, ge=1, le=1000),
    offset: int = Query(0, ge=0),
    pod_service: PodService = Depends(get_pod_service)
):
    """Pod 목록 조회"""
    return pod_service.list_all_pods(limit, offset)

@router.post("/{pod_id}/join", response_model=dict)
async def join_pod(
    pod_id: int,
    user_id: int,
    pod_service: PodService = Depends(get_pod_service)
):
    """Pod 참가"""
    success = pod_service.join_pod(pod_id, user_id)
    if not success:
        raise HTTPException(status_code=400, detail="Failed to join pod")
    return {"message": "Successfully joined the pod"}