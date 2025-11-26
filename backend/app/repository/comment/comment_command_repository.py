# app/repository/comment/comment_command_repository.py
from pymysql.connections import Connection
import pymysql
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
            try:
                cursor.execute(sql, (
                    comment_data.pod_id,
                    comment_data.user_id,
                    comment_data.content,
                    comment_data.parent_comment_id
                ))
                self.db.commit()
                return cursor.lastrowid
            except pymysql.err.IntegrityError as e:
                # FK 위반 등 무결성 에러는 클라이언트 잘못으로 400으로 처리하도록 상위에서 ValueError로 변환
                self.db.rollback()
                raise ValueError(f"Invalid data for comment: {str(e)}")
            except Exception:
                self.db.rollback()
                raise
    
    def delete_comment(self, comment_id: int) -> bool:
        """댓글 삭제"""
        with self.db.cursor() as cursor:
            sql = "DELETE FROM comment WHERE comment_id = %s"
            cursor.execute(sql, (comment_id,))
            self.db.commit()
            return cursor.rowcount > 0