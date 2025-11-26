# app/repository/comment/comment_query_repository.py
from pymysql.connections import Connection
from typing import Optional, Dict, Any, List

class CommentQueryRepository:
    def __init__(self, db: Connection):
        self.db = db
    
    def find_comment_by_id(self, comment_id: int) -> Optional[Dict[str, Any]]:
        """댓글 조회"""
        with self.db.cursor() as cursor:
            sql = """
                SELECT c.*, u.username
                FROM comment c
                JOIN user u ON c.user_id = u.user_id
                WHERE c.comment_id = %s
            """
            cursor.execute(sql, (comment_id,))
            return cursor.fetchone()
    
    def find_comments_by_pod(self, pod_id: int) -> List[Dict[str, Any]]:
        """특정 Pod의 모든 댓글 조회"""
        with self.db.cursor() as cursor:
            sql = """
                SELECT c.*, u.username
                FROM comment c
                JOIN user u ON c.user_id = u.user_id
                WHERE c.pod_id = %s
                ORDER BY c.created_at ASC
            """
            cursor.execute(sql, (pod_id,))
            return cursor.fetchall()