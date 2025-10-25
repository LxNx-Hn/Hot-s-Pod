# app/repository/rag/rag_query_repository.py
from pymysql.connections import Connection
import json
from typing import List, Dict, Any, Optional

class RagQueryRepository: #RAG할때 쓰는 전용 쿼리 
    def __init__(self, db: Connection):
        self.db = db
    def get_pod_details_for_vectorizing(self, pod_id: int) -> Optional[Dict[str, Any]]:
        with self.db.cursor() as cursor:
            cursor.callproc('sp_GetPodDetailsForVectorizing', (pod_id,))
            return cursor.fetchone()
    def filter_pods(
        self, 
        pod_ids: List[int], 
        place_keyword: Optional[str], 
        category_id: Optional[int]
    ) -> List[Dict[str, Any]]:
        if not pod_ids:
            return []        
        pod_ids_json = json.dumps(pod_ids)       
        with self.db.cursor() as cursor:
            cursor.callproc('sp_FilterPods', (pod_ids_json, place_keyword, category_id))
            return cursor.fetchall()
    def get_all_categories(self) -> List[Dict[str, Any]]:
        with self.db.cursor() as cursor:
            cursor.callproc('sp_GetAllCategories')
            return cursor.fetchall()