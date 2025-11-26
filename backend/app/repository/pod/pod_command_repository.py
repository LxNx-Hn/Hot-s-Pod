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
    
    def update_pod(self, pod_id: int, pod_data: dict) -> bool:
        """Pod 수정 (호스트 또는 관리자만 가능)"""
        with self.db.cursor() as cursor:
            update_fields = []
            values = []
            
            if 'event_time' in pod_data:
                update_fields.append("event_time = %s")
                values.append(pod_data['event_time'])
            if 'place' in pod_data:
                update_fields.append("place = %s")
                values.append(pod_data['place'])
            if 'place_detail' in pod_data:
                update_fields.append("place_detail = %s")
                values.append(pod_data['place_detail'])
            if 'title' in pod_data:
                update_fields.append("title = %s")
                values.append(pod_data['title'])
            if 'content' in pod_data:
                update_fields.append("content = %s")
                values.append(pod_data['content'])
            if 'min_peoples' in pod_data:
                update_fields.append("min_peoples = %s")
                values.append(pod_data['min_peoples'])
            if 'max_peoples' in pod_data:
                update_fields.append("max_peoples = %s")
                values.append(pod_data['max_peoples'])
            
            if not update_fields:
                return False
            
            values.append(pod_id)
            sql = f"UPDATE pod SET {', '.join(update_fields)} WHERE pod_id = %s"
            cursor.execute(sql, values)
            self.db.commit()
            return cursor.rowcount > 0
    
    def delete_pod(self, pod_id: int) -> bool:
        """Pod 삭제 (호스트 또는 관리자만 가능)"""
        with self.db.cursor() as cursor:
            sql = "DELETE FROM pod WHERE pod_id = %s"
            cursor.execute(sql, (pod_id,))
            self.db.commit()
            return cursor.rowcount > 0