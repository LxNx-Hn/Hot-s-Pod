# app/controller/comment/comment_controller.py
from fastapi import APIRouter, Depends, HTTPException
from pymysql.connections import Connection
from app.database import get_db_connection
from app.repository.comment.comment_command_repository import CommentCommandRepository
from app.repository.comment.comment_query_repository import CommentQueryRepository
from app.service.comment.comment_service import CommentService
from app.schemas.comment import CommentCreateRequest, CommentResponse, CommentWithReplies
from typing import List

router = APIRouter(prefix="/comments", tags=["Comments"])
# 60% 코파일럿 생성, 검토필수임
def get_comment_service(db: Connection = Depends(get_db_connection)) -> CommentService:
    command_repo = CommentCommandRepository(db)
    query_repo = CommentQueryRepository(db)
    return CommentService(command_repo, query_repo)

@router.post("/", response_model=dict, status_code=201)
async def create_comment(
    comment_data: CommentCreateRequest,
    comment_service: CommentService = Depends(get_comment_service)
):
    """댓글 생성"""
    try:
        comment_id = comment_service.create_comment(comment_data)
        return {"comment_id": comment_id, "message": "Comment created successfully"}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception:
        raise HTTPException(status_code=500, detail="댓글 생성 중 오류가 발생했습니다.")

@router.get("/{comment_id}", response_model=CommentResponse)
async def get_comment(
    comment_id: int,
    comment_service: CommentService = Depends(get_comment_service)
):
    """댓글 조회"""
    comment = comment_service.get_comment(comment_id)
    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")
    return comment

@router.get("/pod/{pod_id}", response_model=List[CommentWithReplies])
async def get_pod_comments(
    pod_id: int,
    comment_service: CommentService = Depends(get_comment_service)
):
    """Pod의 모든 댓글 조회 (계층 구조)"""
    return comment_service.get_pod_comments(pod_id)

@router.delete("/{comment_id}", response_model=dict)
async def delete_comment(
    comment_id: int,
    comment_service: CommentService = Depends(get_comment_service)
):
    """댓글 삭제"""
    success = comment_service.delete_comment(comment_id)
    if not success:
        raise HTTPException(status_code=404, detail="Comment not found")
    return {"message": "Comment deleted successfully"}