# app/repository/pod/pod_command_repository.py
from pymysql.connections import Connection
from app.schemas.pod import PodCreateRequest
import json

class PodCommandRepository:
    def __init__(self, db: Connection):
        self.db = db

    def create_pod(self, pod_data: PodCreateRequest) -> int:
        category_ids_json = json.dumps([0] + pod_data.category_ids)
        
        with self.db.cursor() as cursor:
            cursor.callproc('sp_CreatePod', (
                pod_data.host_user_id,
                pod_data.event_time,
                pod_data.place,
                pod_data.place_detail,
                pod_data.title,
                pod_data.content,
                pod_data.min_peoples,
                pod_data.max_peoples,
                category_ids_json
            ))
            result = cursor.fetchone()
            self.db.commit()
            
            if result:
                new_id = result['pod_id']
                try:
                    self.join_pod(new_id, pod_data.host_user_id)
                except Exception:
                    pass
                return new_id
            raise Exception("Failed to create pod")
    
    def join_pod(self, pod_id: int, user_id: int) -> bool:
        with self.db.cursor() as cursor:
            try:
                sql = "INSERT INTO pod_member (user_id, pod_id) VALUES (%s, %s)"
                cursor.execute(sql, (user_id, pod_id))
                self.db.commit()
                return True
            except Exception:
                self.db.rollback()
                return False