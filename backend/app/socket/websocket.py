# app/socket/websocket.py
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from typing import Dict, List
import json
import logging
from app.database import DatabaseConnectionPool
from app.repository.chat.chat_command_repository import ChatCommandRepository
from app.schemas.chat import ChatMessageCreate

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/ws", tags=["WebSocket"])

#사실 여기가 젤 어질어질했음.. 이건 천천히 공부하죠
class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, List[WebSocket]] = {}
    
    async def connect(self, websocket: WebSocket, pod_id: str):
        await websocket.accept()
        
        if pod_id not in self.active_connections:
            self.active_connections[pod_id] = []
        
        self.active_connections[pod_id].append(websocket)
        logger.info(f"Client connected to pod {pod_id}")
    
    def disconnect(self, websocket: WebSocket, pod_id: str):
        if pod_id in self.active_connections:
            try:
                self.active_connections[pod_id].remove(websocket)
                logger.info(f"Client disconnected from pod {pod_id}")
                
                if not self.active_connections[pod_id]:
                    del self.active_connections[pod_id]
            except ValueError:
                pass
    
    async def broadcast(self, message: dict, pod_id: str, exclude: WebSocket = None):
        if pod_id in self.active_connections:
            disconnected = []
            
            for connection in self.active_connections[pod_id]:
                if connection != exclude:
                    try:
                        await connection.send_json(message)
                    except Exception as e:
                        logger.error(f"Failed to send message: {e}")
                        disconnected.append(connection)
            
            for conn in disconnected:
                self.disconnect(conn, pod_id)

manager = ConnectionManager()

@router.websocket("/chat/{pod_id}")
async def websocket_chat_endpoint(websocket: WebSocket, pod_id: str):
    await manager.connect(websocket, pod_id)
    
    db = None  # None 초기화
    try:
        db = DatabaseConnectionPool.get_pool().connection()
        chat_repo = ChatCommandRepository(db)
        
        try:
            while True:
                data = await websocket.receive_text()
                
                try:
                    message = json.loads(data)
                    message['pod_id'] = pod_id
                    
                    try:
                        chat_message = ChatMessageCreate(
                            pod_id=int(pod_id),
                            user_id=message['user_id'],
                            content=message['content']
                        )
                        chat_id = chat_repo.create_message(chat_message)
                        message['chat_id'] = chat_id
                        logger.info(f"Message saved: chat_id={chat_id}")
                        
                        await manager.broadcast(message, pod_id, exclude=websocket)
                    except Exception as e:
                        logger.error(f"Failed to save message: {e}")
                        await websocket.send_json({"error": "메시지 저장 실패"})
                    
                except json.JSONDecodeError:
                    await websocket.send_json({"error": "Invalid JSON format"})
        
        except WebSocketDisconnect:
            manager.disconnect(websocket, pod_id)
            
            await manager.broadcast({
                "type": "system",
                "content": "A user has left the chat",
                "pod_id": pod_id
            }, pod_id)
    
    finally:
        if db is not None:  # None 체크
            db.close()
            logger.info(f"DB connection closed for pod {pod_id}")