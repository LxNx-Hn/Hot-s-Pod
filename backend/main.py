# backend/main.py
# uvicorn main:app --reload --host 127.0.0.1 --port 8000
import threading
import asyncio
from contextlib import asynccontextmanager
from app.core.config import settings
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import logging

from app.controller.user import user_controller
from app.controller.pod import pod_controller
from app.controller.oauth import oauth_controller
from app.controller.rag import rag_controller
from app.service.rag.rag_worker_service import RagWorkerService
from app.controller.comment import comment_controller
from app.controller.chat import chat_controller  
from app.controller.pod_member import pod_member_controller
from app.socket import websocket


logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

rag_worker = None
worker_thread = None

def run_rag_worker_in_thread():
    """RAG Worker를 별도 스레드에서 실행"""
    global rag_worker
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
    global worker_thread
    logger.info("Application starting up...")
    
    if settings.FEATURE_RAG_ENABLED:
        worker_thread = threading.Thread(target=run_rag_worker_in_thread, daemon=True)
        worker_thread.start()
        logger.info("RAG worker thread started")
    else:
        logger.info("RAG feature is disabled")
    
    yield
    
    logger.info("Application shutting down...")
    
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

# 서버 실행 방법:
# 1. Backend 폴더로 이동: cd C:\Users\KiKi\Desktop\DataBaseProject\Hot-s-Pod\Backend
# 2. 콘다 환경 활성화: conda activate hots_pod
# 3. 서버 실행: python -m uvicorn main:app --host 0.0.0.0 --port 8000