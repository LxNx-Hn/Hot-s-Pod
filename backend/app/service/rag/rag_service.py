# app/service/rag/rag_service.py
import logging
import chromadb
from app.core.config import settings
from app.repository.rag.rag_query_repository import RagQueryRepository
from typing import List, Dict, Any
from models.embedding_model import embedding_instance

logger = logging.getLogger(__name__)
#드디어 제가 할줄아는게 나왔네요 너무 기뻐요 행복해요 즐거워요 신나요 짜릿해요 

class RagService: #친절한 주석 < -RAG서비스
    def __init__(self):
        logger.info("Initializing RagService...")
        self.embedding_model = embedding_instance
        self.chroma_client = chromadb.PersistentClient(path=settings.CHROMA_DB_PATH)
        self.collection = self.chroma_client.get_or_create_collection(
            name="hots_pod_collection",
            metadata={"hnsw:space": "cosine"}
        )
        logger.info("ChromaDB collection ready")

    def search(self, query: str, rag_query_repo: RagQueryRepository) -> List[Dict[str, Any]]: #이게 검색임
        logger.info(f"RAG Search: '{query}'")
        all_categories = rag_query_repo.get_all_categories()  #대충뭔지 알겠죠? 다 가져오는겁니다
        # 카테고리를 길이순으로 정렬해서 더 구체적인(긴) 카테고리부터 매칭
        sorted_categories = sorted(all_categories, key=lambda x: -len(x['category_name']))
        found_category_id = None
        for cat in sorted_categories:
            if cat['category_name'] in query:
                found_category_id = cat['category_id'] #이거까지는 규칙기반 매핑이에요. 왜? 금쪽이 사용자가 선택하니까!
                logger.info(f"Matched category: {cat['category_name']} (ID: {cat['category_id']})")
                break
        place_keyword = None
        for keyword in settings.PLACE_KEYWORDS: #이거 CONFIG에 있는 키워드 사전인데, 규칙기반 매핑하고 시작하면 진짜 개빨라서 채택함
            if keyword in query:
                place_keyword = keyword
                break
        #대충 석장 들어가면 다 같은단어로 본다거나, 신경주역, 경주역 이런거 굳이 유사도검색없이 키워드 서칭할수있게해줌
        query_vector = self.embedding_model.encode(query).tolist() #벡터화 입니당
        results = self.collection.query( #이때 이미 질문기준으로 뒤에 워커파일이 유사도높은걸 가져와서 이거만 하면됩니당
            query_embeddings=[query_vector],
            n_results=20 #이게 출력되는 개순데, 이전에는 3개했었는데. 프렌들리 AI쓰면되니까 일단 늘려둠
        )       
        if not results['ids'] or not results['ids'][0]:
            logger.warning("No vector search results") # 진짜 예외처리 안하는데 코파일럿이 이거보고 죽일라해서 넣음
            return []
        
        # 유사도 임계값 필터링 (distance가 낮을수록 유사, 0.85 이상이면 관련없다고 판단)
        SIMILARITY_THRESHOLD = 0.85
        retrieved_pod_ids = []
        distances = results['distances'][0] if results['distances'] else []
        
        for idx, (id_str, distance) in enumerate(zip(results['ids'][0], distances)):
            if distance < SIMILARITY_THRESHOLD:
                retrieved_pod_ids.append(int(id_str))
                logger.debug(f"POD {id_str}: distance={distance:.4f} (PASS)")
            else:
                logger.debug(f"POD {id_str}: distance={distance:.4f} (FILTERED OUT)")
        
        if not retrieved_pod_ids:
            logger.info("No PODs passed similarity threshold")
            return []
            
        # 벡터검색으로 찾은 pod 들인데 이제 RDB필터링을 해봅시다
        # RDB필터링이 뭐냐면 벡터검색은 그냥 유사도 높은거 찾는거라서, 사용자가 장소나 카테고리 조건을 넣었을때 그걸 반영못함
        # 그래서 RDB에서 다시 필터링하는 과정이 필요함
        logger.info(f"Found {len(retrieved_pod_ids)} candidates")
        logger.info(f"Vector search POD IDs: {retrieved_pod_ids}")
        logger.info(f"Place keyword: {place_keyword}, Category ID: {found_category_id}")
        final_pods = rag_query_repo.filter_pods(
            pod_ids=retrieved_pod_ids,
            place_keyword=place_keyword,
            category_id=found_category_id
        )
        #이렇게요
        logger.info(f"Final results: {len(final_pods)} pods") #최종결과 로그
        return final_pods

    def generate_answer(self, query: str, context_pods: List[Dict[str, Any]]) -> str: # LLM호출부입니다 뭐 여기서부턴 별거없어요
        """LLM을 사용하여 답변 생성"""
        if not context_pods:
            return "죄송합니다, 관련된 소모임을 찾을 수 없습니다." # 텍스트 이것들은 GPT한테 맡길께요.. 지금 쓰면 좋은말을 못할거같네요

        context_str = "다음은 관련 소모임입니다:\n\n"
        for i, pod in enumerate(context_pods[:5], 1):
            context_str += f"[{i}번]\n"
            context_str += f"- 제목: {pod['title']}\n"
            context_str += f"- 장소: {pod['place']}\n"
            context_str += f"- 일시: {pod['event_time']}\n\n"
        
        return self._generate_with_local_llm(query, context_str)
            
    def _generate_with_local_llm(self, query: str, context_str: str) -> str:
        from models.llm_model import llm_instance
        
        messages = [
            {
                "role": "system", 
                "content": "당신은 Hot's POD의 친절한 AI 어시스턴트입니다. 소모임 정보를 바탕으로 자연스럽게 답변하세요."
            },
            {
                "role": "user", 
                "content": f"""다음은 검색된 소모임 정보입니다:

                {context_str}

                질문: {query}

                위 정보를 바탕으로 답변해주세요."""
            }
        ]
        
        response = llm_instance.generate_response(messages, max_new_tokens=128, do_sample=True)
        return response