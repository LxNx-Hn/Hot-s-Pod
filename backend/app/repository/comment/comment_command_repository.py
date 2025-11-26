# app/repository/comment/comment_command_repository.py
from pymysql.connections import Connection
from app.schemas.comment import CommentCreateRequest

class CommentCommandRepository:
    def __init__(self, db: Connection):
        self.db = db
    
    def create_comment(self, comment_data: CommentCreateRequest) -> int:
        #댓글
        with self.db.cursor() as cursor:
            sql = """
                INSERT INTO comment (pod_id, user_id, content, parent_comment_id)
                VALUES (%s, %s, %s, %s)
            """
            cursor.execute(sql, (
                comment_data.pod_id,
                comment_data.user_id,
                comment_data.content,
                comment_data.parent_comment_id
            ))
            self.db.commit()
            return cursor.lastrowid
    
    def delete_comment(self, comment_id: int) -> bool:
        """댓글 삭제"""
        with self.db.cursor() as cursor:
            sql = "DELETE FROM comment WHERE comment_id = %s"
            cursor.execute(sql, (comment_id,))
            self.db.commit()
            return cursor.rowcount > 0