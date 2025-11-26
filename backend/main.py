# backend/main.py
import threading
import asyncio
from contextlib import asynccontextmanager
from app.core.config import settings
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import logging

# 모든 컨트롤러 import
from app.controller.user import user_controller
from app.controller.pod import pod_controller
from app.controller.oauth import oauth_controller
from app.controller.rag import rag_controller
from app.controller.comment import comment_controller
from app.controller.chat import chat_controller  
from app.controller.pod_member import pod_member_controller
from app.socket import websocket
from app.service.rag.rag_worker_service import RagWorkerService

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

rag_worker = None
worker_thread = None
shutdown_flag = False  # 추가

def run_rag_worker_in_thread():
    """RAG Worker를 별도 스레드에서 실행"""
    global rag_worker, shutdown_flag
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    
    try:
        rag_worker = RagWorkerService()
        logger.info("RAG Worker Service initialized")
        loop.run_until_complete(rag_worker.run_worker())
    except asyncio.CancelledError:
        logger.info("RAG worker cancelled")
    except Exception as e:
        logger.error(f"RAG worker error: {e}", exc_info=True)
    finally:
        try:
            loop.close()
            logger.info("RAG worker event loop closed")
        except Exception as e:
            logger.error(f"Error closing event loop: {e}")

@asynccontextmanager
async def lifespan(app: FastAPI):
    """애플리케이션 생명주기 관리"""
    global worker_thread, shutdown_flag
    logger.info("Application starting up...")
    
    # RAG Worker 시작
    shutdown_flag = False
    worker_thread = threading.Thread(target=run_rag_worker_in_thread, daemon=True)
    worker_thread.start()
    logger.info("RAG worker thread started")
    
    yield
    
    # Graceful Shutdown
    logger.info("Application shutting down...")
    shutdown_flag = True
    
    # Worker 종료 대기 (최대 5초)
    if worker_thread and worker_thread.is_alive():
        worker_thread.join(timeout=5)
        if worker_thread.is_alive():
            logger.warning("RAG worker did not stop in time")
        else:
            logger.info("RAG worker stopped gracefully")

app = FastAPI(
    title="Hot's POD API",
    description="AI 기반 오프라인 소모임 플랫폼 백엔드",
    version="3.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        settings.VITE_API_BASE_URL,
        "http://localhost:5173",
        "https://hot-s-pod.netlify.app",
        "https://hotspod.online"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 모든 라우터 등록
app.include_router(user_controller.router)
app.include_router(pod_controller.router)
app.include_router(oauth_controller.router)
app.include_router(rag_controller.router)
app.include_router(comment_controller.router)
app.include_router(chat_controller.router)
app.include_router(pod_member_controller.router)
app.include_router(websocket.router)

@app.get("/", tags=["Root"])
async def root():
    return {
        "message": "Welcome to Hot's POD API",
        "version": "3.0.0",
        "docs": "/docs",
        "oauth_login": "/oauth/kakao/login",
        "health": "/health"
    }

@app.get("/health", tags=["Health"])
async def health_check():
    return {
        "status": "healthy",
        "rag_worker": "running" if worker_thread and worker_thread.is_alive() else "stopped"
    }