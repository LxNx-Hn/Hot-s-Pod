# app/controller/pod/pod_controller.py
from fastapi import APIRouter, Depends, HTTPException, Query, Request
from pymysql.connections import Connection
from app.database import get_db_connection
from app.repository.pod.pod_command_repository import PodCommandRepository
from app.repository.pod.pod_query_repository import PodQueryRepository
from app.service.pod.pod_service import PodService
from app.schemas.pod import PodCreateRequest, PodUpdateRequest, PodResponse, PodDetailResponse, PodListResponse
from app.utils.permissions import get_user_from_token, require_host_or_admin
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
   # Pod 생성 (트리거로 자동 RAG 큐 추가)
    try:
        pod_id = pod_service.create_pod(pod_data)
        return {"pod_id": pod_id, "message": "Pod created successfully"}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception:
        raise HTTPException(status_code=500, detail="Pod 생성 중 오류가 발생했습니다.")



@router.get("/search", response_model=List[PodListResponse])
async def get_pod(
    query: str,
    limit: int = Query(100, ge=1, le=1000),
    offset: int = Query(0, ge=0),
    pod_service: PodService = Depends(get_pod_service)
):
    """Pod 검색 조회"""
    pod = pod_service.search_pod(query,limit,offset)
    if not pod:
        raise HTTPException(status_code=404, detail="Pod not found")
    return pod
@router.get("/detail/{pod_id}", response_model=PodDetailResponse)
async def get_pod(
    pod_id: int,
    pod_service: PodService = Depends(get_pod_service)
):
    """Pod 상세 조회"""
    pod = pod_service.get_podDetail(pod_id)
    if not pod:
        raise HTTPException(status_code=404, detail="Pod not found")
    return pod
@router.get("/", response_model=List[PodListResponse])
async def list_pods(
    limit: int = Query(100, ge=1, le=1000),
    offset: int = Query(0, ge=0),
    pod_service: PodService = Depends(get_pod_service)
):
    """Pod 목록 조회"""
    return pod_service.list_all_pods(limit, offset)


@router.get("", response_model=List[PodListResponse])
async def list_pods_no_slash(
    limit: int = Query(100, ge=1, le=1000),
    offset: int = Query(0, ge=0),
    pod_service: PodService = Depends(get_pod_service)
):
    """Pod 목록 조회 (no trailing slash) - `/pods` 요청 대응"""
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

@router.put("/{pod_id}", response_model=dict)
async def update_pod(
    pod_id: int,
    pod_data: PodUpdateRequest,
    request: Request,
    db: Connection = Depends(get_db_connection),
    pod_service: PodService = Depends(get_pod_service)
):
    """수정 (호스트 본인만 가능)"""
    user_payload = get_user_from_token(request)
    user_id = user_payload.get('user_id')
    
    # Pod 조회
    pod = pod_service.get_pod(pod_id)
    if not pod:
        raise HTTPException(status_code=404, detail="Pod를 찾을 수 없습니다")
    
    # 호스트 본인만 수정 가능
    if pod.host_user_id != user_id:
        raise HTTPException(status_code=403, detail="호스트만 Pod를 수정할 수 있습니다")
    
    # 수정할 데이터만 dict로 변환
    update_data = pod_data.model_dump(exclude_unset=True)
    if not update_data:
        raise HTTPException(status_code=400, detail="수정할 내용이 없습니다")
    
    success = pod_service.update_pod(pod_id, update_data)
    if not success:
        raise HTTPException(status_code=404, detail="Pod를 찾을 수 없거나 수정에 실패했습니다")
    
    return {"message": "Pod가 성공적으로 수정되었습니다"}

@router.delete("/{pod_id}", response_model=dict)
async def delete_pod(
    pod_id: int,
    request: Request,
    db: Connection = Depends(get_db_connection),
    pod_service: PodService = Depends(get_pod_service)
):
    """Pod 삭제 (호스트 또는 관리자만 가능)"""
    user_payload = get_user_from_token(request)
    user_id = user_payload.get('user_id')
    
    # 호스트 또는 관리자 권한 확인
    require_host_or_admin(db, pod_id, user_id)
    
    success = pod_service.delete_pod(pod_id)
    if not success:
        raise HTTPException(status_code=404, detail="Pod를 찾을 수 없거나 삭제에 실패했습니다")
    
    return {"message": "Pod가 성공적으로 삭제되었습니다"}