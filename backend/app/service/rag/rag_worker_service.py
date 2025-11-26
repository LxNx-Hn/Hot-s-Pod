# app/service/rag/rag_worker_service.py
import asyncio
import logging
import chromadb
from app.core.config import settings
from app.database import DatabaseConnectionPool
from app.repository.rag.rag_command_repository import RagCommandRepository
from app.repository.rag.rag_query_repository import RagQueryRepository
from models.embedding_model import embedding_instance

logger = logging.getLogger(__name__)

#이건 백그라운드에서 마리아 DB데이터 그 뭐냐 트리거 그거 발동하면 크로마로 넘겨주는 친구입니다
class RagWorkerService:
    def __init__(self):
        logger.info("Initializing RAG Worker...")        
        self.embedding_model = embedding_instance        
        self.chroma_client = chromadb.PersistentClient(path=settings.CHROMA_DB_PATH)
        self.collection = self.chroma_client.get_or_create_collection(
            name="hots_pod_collection",
            metadata={"hnsw:space": "cosine"} # 여기서 코사인유사도 검색, 원래는 딴거 막 넣어야하는데 귀찮음이슈.. 나중에 차차하는걸로
        )       
        logger.info("RAG Worker initialized") # 뭐 여기까지 셋업하는거에요 볼필요없어요

    async def run_worker(self):
        logger.info("RAG Worker started")
        
        while True:   #무한루프 돌면서 계속 일감체크, 메모리문제 걱정되긴하는데, 임베딩모델이 경량화된거라 괜찮을거같기도하고..
                #근데 이거 무한루프 아니면 안돌아감 ㅋㅋㅋ , 그냥 서버에서 램하나 더꼽는게 맞음
            db = None
            try: #트리거 감지하는거임
                db = DatabaseConnectionPool.get_pool().connection()
                rag_command_repo = RagCommandRepository(db)
                rag_query_repo = RagQueryRepository(db)               
                jobs = rag_command_repo.get_pending_jobs(limit=5)             
                if jobs:
                    logger.info(f"Found {len(jobs)} jobs")
                    for job in jobs:
                        await self.process_job(job, rag_command_repo, rag_query_repo)
                else:
                    await asyncio.sleep(2)
                
            except Exception as e:
                logger.error(f"Worker error: {e}")
                await asyncio.sleep(5)
            finally:
                if db is not None:
                    db.close() 
    #새로생긴팟이 있으면 유사도 벡터화해서 크로마DB에 넣어주는거임, 반대로 삭제된거는 지우기
    async def process_job(self, job: dict, rag_command_repo: RagCommandRepository, rag_query_repo: RagQueryRepository):
        queue_id = job['queue_id']
        pod_id = job['pod_id']
        action_type = job['action_type']      
        logger.info(f"Processing job {queue_id}: {action_type} for pod_id {pod_id}")        
        try:
            if action_type == 'upsert':
                await self._process_upsert(pod_id, rag_query_repo)
            elif action_type == 'delete':
                await self._process_delete(pod_id)         
            rag_command_repo.delete_job(queue_id)
            logger.info(f"Job {queue_id} completed")           
        except Exception as e:
            logger.error(f"Job {queue_id} failed: {e}")
            rag_command_repo.update_job_status(queue_id, 'failed')

    async def _process_upsert(self, pod_id: int, rag_query_repo: RagQueryRepository): # 업서트처리
        pod_details = rag_query_repo.get_pod_details_for_vectorizing(pod_id)      
        if not pod_details:
            raise ValueError(f"Pod {pod_id} not found")   
        text_to_embed = ( #벡터화할 텍스트 구성 
            f"제목: {pod_details.get('title', '')}\n"
            f"내용: {pod_details.get('content', '')}\n"
            f"장소: {pod_details.get('place', '')}\n"
            f"날짜: {pod_details.get('event_time', '')}\n"
            f"정원: {pod_details.get('min_peoples', '')}~{pod_details.get('max_peoples', '')}명\n"
            f"카테고리: {pod_details.get('categories', '')}"
        ) #오해하지마세요 이거 벡터화할 텍스트 만드는거에요
        
        vector = self.embedding_model.encode(text_to_embed).tolist() #벡터화 <- 이거 끝나면 이제 사람이 못읽음
        
        self.collection.upsert(
            ids=[str(pod_id)],
            embeddings=[vector],
            metadatas=[{'pod_id': pod_id, 'title': pod_details.get('title', '')}],
            documents=[text_to_embed]
        ) # 이제 벡터 DB에 넣어줌
        
        logger.info(f"Vector upserted for pod_id {pod_id}")

    async def _process_delete(self, pod_id: int): # 삭제처리
        try:
            self.collection.delete(ids=[str(pod_id)]) #지우는거 , 아까 팟 id는 키로 남겨둬서 지우기 편함
            logger.info(f"Vector deleted for pod_id {pod_id}")
        except Exception as e:
            logger.warning(f"Delete failed for pod_id {pod_id}: {e}")