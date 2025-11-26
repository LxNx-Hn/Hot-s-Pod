# app/controller/rag/rag_controller.py
from fastapi import APIRouter, Depends, HTTPException
from pymysql.connections import Connection
from threading import Lock
from app.database import get_db_connection
from app.repository.rag.rag_query_repository import RagQueryRepository
from app.service.rag.rag_service import RagService
from app.schemas.rag import RagSearchRequest, RagSearchResponse
from app.schemas.pod import PodResponse
from app.core.config import settings

router = APIRouter(prefix="/rag", tags=["RAG Search"])

_rag_service_singleton = None
_singleton_lock = Lock()

def get_rag_service_singleton() -> RagService:
    global _rag_service_singleton
    
    if _rag_service_singleton is None:
        with _singleton_lock:
            if _rag_service_singleton is None:
                _rag_service_singleton = RagService()
    
    return _rag_service_singleton

@router.post("/search", response_model=RagSearchResponse)
async def search_pods_with_rag(
    request: RagSearchRequest,
    db: Connection = Depends(get_db_connection)
):
    """
    RAG구조입니다.. 룰루랄라
    
    1. 키워드 분석
    2. 벡터 유사도 검색
    3. RDB 필터링
    4. LLM 답변 생성
    """
    try:
        # 싱글톤
        rag_service = get_rag_service_singleton()    
        # 요청별로 독립적인 repository 생성 (Thread-Safe)
        rag_query_repo = RagQueryRepository(db)
        # Repository를 명시적으로 전달 (필수 파라미터)
        retrieved_pods_data = rag_service.search(request.query, rag_query_repo)
        llm_answer = rag_service.generate_answer(request.query, retrieved_pods_data)      
        retrieved_pods = [PodResponse(**pod) for pod in retrieved_pods_data]
        return RagSearchResponse(
            llm_answer=llm_answer,
            retrieved_pods=retrieved_pods,
            total_found=len(retrieved_pods) # 주석쓰기 귀찮네요..
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        import traceback
        print(f"RAG 에러 상세: {str(e)}")
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"RAG 검색 중 오류가 발생했습니다: {str(e)}")

@router.get("/health", response_model=dict)
async def rag_health_check():
    """RAG 시스템 상태 확인"""
    try:
        rag_service = get_rag_service_singleton()
        collection_count = rag_service.collection.count()
        
        return {
            "status": "healthy",
            "embedding_model": settings.EMBEDDING_MODEL_NAME,
            "vector_db_count": collection_count,
            "vector_db_path": settings.CHROMA_DB_PATH
        }
    except Exception:
        raise HTTPException(status_code=503, detail="RAG 시스템이 응답하지 않습니다.")