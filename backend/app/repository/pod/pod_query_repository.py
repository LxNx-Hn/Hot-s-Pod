# app/repository/pod/pod_query_repository.py
from pymysql.connections import Connection
from typing import Optional, Dict, Any, List

class PodQueryRepository:
    def __init__(self, db: Connection):
        self.db = db

    def find_pod_by_id(self, pod_id: int) -> Optional[Dict[str, Any]]:
        with self.db.cursor() as cursor:
            sql = """
                SELECT p.*, u.username AS host_username
                FROM Pod p
                JOIN User u ON p.host_user_id = u.user_id
                WHERE p.pod_id = %s
            """
            cursor.execute(sql, (pod_id,))
            return cursor.fetchone()
    
    def find_all_pods(self, limit: int = 100, offset: int = 0) -> List[Dict[str, Any]]:
        with self.db.cursor() as cursor:
            sql = """
            SELECT 
                p.*, 
                u.username AS host_username,
                COUNT(pm.user_id) AS current_member
                FROM Pod p
                JOIN User u ON p.host_user_id = u.user_id
                LEFT JOIN Pod_Member pm ON p.pod_id = pm.pod_id
                GROUP BY p.pod_id
                ORDER BY p.event_time DESC
                LIMIT %s OFFSET %s
            """
            cursor.execute(sql, (limit, offset))
            return cursor.fetchall()
    def find_pods_by_query(self, query, limit: int = 100, offset: int = 0) -> List[Dict[str, Any]]:
        with self.db.cursor() as cursor:
            sql = """
            SELECT 
                p.*, 
                u.username AS host_username,
                COUNT(DISTINCT pm.user_id) AS current_member
                FROM Pod p
                JOIN User u ON p.host_user_id = u.user_id
                LEFT JOIN Pod_Member pm ON p.pod_id = pm.pod_id
                LEFT JOIN CategoryLink cl ON p.pod_id = cl.pod_id
                LEFT JOIN Category c ON cl.category_id = c.category_id
                WHERE
                    p.title LIKE %s
                OR
                    p.content LIKE %s
                OR
                    p.place LIKE %s
                OR
                    c.category_name LIKE %s
                GROUP BY p.pod_id
                ORDER BY p.event_time DESC
                LIMIT %s OFFSET %s
            """
            cursor.execute(sql,(f'%{query}%',f'%{query}%',f'%{query}%',f'%{query}%',limit,offset))
            return cursor.fetchall()