# app/controller/chat/chat_controller.py
from fastapi import APIRouter, Depends, HTTPException, Query
from pymysql.connections import Connection
from app.database import get_db_connection
from app.repository.chat.chat_command_repository import ChatCommandRepository
from app.repository.chat.chat_query_repository import ChatQueryRepository
from app.service.chat.chat_service import ChatService
from app.schemas.chat import ChatMessageCreate, ChatMessageResponse
from typing import List, Optional

router = APIRouter(prefix="/chat", tags=["Chat"])
#공식문서 보니까 생각보다 할만해서 그냥 짬, 검토는 필요함
def get_chat_service(db: Connection = Depends(get_db_connection)) -> ChatService:
    command_repo = ChatCommandRepository(db)
    query_repo = ChatQueryRepository(db)
    return ChatService(command_repo, query_repo)

@router.post("/", response_model=dict, status_code=201)
async def save_chat_message(
    message_data: ChatMessageCreate,
    chat_service: ChatService = Depends(get_chat_service)
):
    """채팅 메시지 저장"""
    try:
        chat_id = chat_service.save_message(message_data)
        return {"chat_id": chat_id, "message": "Message saved successfully"}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception:
        raise HTTPException(status_code=500, detail="메시지 저장 중 오류가 발생했습니다.")

@router.get("/pod/{pod_id}", response_model=List[ChatMessageResponse])
async def get_pod_messages(
    pod_id: int,
    limit: int = Query(100, ge=1, le=500),
    before_chat_id: Optional[int] = Query(None),
    chat_service: ChatService = Depends(get_chat_service)
):
    """
    Pod의 채팅 메시지 조회 (페이징)
    
    - before_chat_id: 이 ID 이전의 메시지 조회 (무한 스크롤용)
    """
    return chat_service.get_pod_messages(pod_id, limit, before_chat_id)