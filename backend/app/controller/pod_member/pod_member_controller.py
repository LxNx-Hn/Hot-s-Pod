# app/controller/pod_member/pod_member_controller.py
from fastapi import APIRouter, Depends, HTTPException
from pymysql.connections import Connection
from app.database import get_db_connection
from app.repository.pod_member.pod_member_command_repository import PodMemberCommandRepository
from app.repository.pod_member.pod_member_query_repository import PodMemberQueryRepository
from app.service.pod_member.pod_member_service import PodMemberService
from app.schemas.pod_member import PodMemberJoinRequest, PodMemberResponse
from typing import List

router = APIRouter(prefix="/pod-members", tags=["Pod Members"])

def get_pod_member_service(db: Connection = Depends(get_db_connection)) -> PodMemberService:
    command_repo = PodMemberCommandRepository(db)
    query_repo = PodMemberQueryRepository(db)
    return PodMemberService(command_repo, query_repo)

@router.post("/join", response_model=dict, status_code=201)
async def join_pod(
    join_data: PodMemberJoinRequest,
    service: PodMemberService = Depends(get_pod_member_service)
):
    """Pod 참가"""
    try:
        member_id = service.join_pod(join_data)
        return {"pod_member_id": member_id, "message": "Successfully joined the pod"}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception:
        raise HTTPException(status_code=500, detail="Pod 참가 중 오류가 발생했습니다.")

@router.delete("/{pod_id}/{user_id}", response_model=dict)
async def leave_pod(
    pod_id: int,
    user_id: int,
    service: PodMemberService = Depends(get_pod_member_service)
):
    """Pod 탈퇴"""
    success = service.leave_pod(pod_id, user_id)
    if not success:
        raise HTTPException(status_code=404, detail="Not a member of this pod")
    return {"message": "Successfully left the pod"}

@router.get("/pod/{pod_id}", response_model=List[PodMemberResponse])
async def get_pod_members(
    pod_id: int,
    service: PodMemberService = Depends(get_pod_member_service)
):
    """Pod 참가자 목록 조회"""
    return service.get_pod_members(pod_id)

@router.get("/user/{user_id}", response_model=List[dict])
async def get_user_pods(
    user_id: int,
    service: PodMemberService = Depends(get_pod_member_service)
):
    """사용자가 참가한 Pod 목록"""
    return service.get_user_pods(user_id)

@router.get("/host/{host_id}", response_model=List[dict])
async def get_host_user_pods(
    host_id: int,
    service: PodMemberService = Depends(get_pod_member_service)
):
    """사용자가 생성한 Pod 목록"""
    return service.get_user_hosted_pods(host_id)

@router.get("/pod/{pod_id}/count", response_model=dict)
async def get_member_count(
    pod_id: int,
    service: PodMemberService = Depends(get_pod_member_service)
):
    """Pod 참가자 수"""
    count = service.get_member_count(pod_id)
    return {"pod_id": pod_id, "member_count": count}

@router.get("/pod/{pod_id}/user/{user_id}/is-member", response_model=dict)
async def check_membership(
    pod_id: int,
    user_id: int,
    service: PodMemberService = Depends(get_pod_member_service)
):
    """참가자 여부 확인"""
    is_member = service.is_member(pod_id, user_id)
    return {"pod_id": pod_id, "user_id": user_id, "is_member": is_member}