# app/repository/chat/chat_query_repository.py
from pymysql.connections import Connection
from typing import List, Dict, Any

class ChatQueryRepository:
    def __init__(self, db: Connection):
        self.db = db
    
    def find_messages_by_pod(
        self, 
        pod_id: int, 
        limit: int = 100, 
        before_chat_id: int = None
    ) -> List[Dict[str, Any]]:
        """Pod 채팅조회"""
        with self.db.cursor() as cursor:
            if before_chat_id:
                sql = """
                    SELECT c.*, COALESCE(u.username, '탈퇴한 회원') as username
                    FROM chat c
                    LEFT JOIN user u ON c.user_id = u.user_id
                    WHERE c.pod_id = %s AND c.chat_id < %s
                    ORDER BY c.time DESC
                    LIMIT %s
                """
                cursor.execute(sql, (pod_id, before_chat_id, limit))
            else:
                sql = """
                    SELECT c.*, COALESCE(u.username, '탈퇴한 회원') as username
                    FROM chat c
                    LEFT JOIN user u ON c.user_id = u.user_id
                    WHERE c.pod_id = %s
                    ORDER BY c.time DESC
                    LIMIT %s
                """
                cursor.execute(sql, (pod_id, limit))
            
            results = cursor.fetchall()
            return list(reversed(results))