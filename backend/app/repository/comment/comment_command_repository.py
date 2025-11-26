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
    
    def update_comment(self, comment_id: int, content: str) -> bool:
        """댓글 내용 수정"""
        with self.db.cursor() as cursor:
            sql = "UPDATE comment SET content = %s WHERE comment_id = %s"
            cursor.execute(sql, (content, comment_id))
            self.db.commit()
            return cursor.rowcount > 0
    
    def delete_comment(self, comment_id: int) -> bool:
        """댓글 소프트 삭제 (내용과 사용자 정보 변경)"""
        with self.db.cursor() as cursor:
            # 자식 댓글이 있으면 내용만 삭제, 없으면 완전 삭제
            check_sql = "SELECT COUNT(*) as child_count FROM comment WHERE parent_comment_id = %s"
            cursor.execute(check_sql, (comment_id,))
            result = cursor.fetchone()
            
            if result['child_count'] > 0:
                # 자식이 있으면 소프트 삭제 (user_id는 NULL로 변경)
                sql = "UPDATE comment SET content = '[삭제된 댓글입니다]', user_id = NULL WHERE comment_id = %s"
            else:
                # 자식이 없으면 완전 삭제
                sql = "DELETE FROM comment WHERE comment_id = %s"
            
            cursor.execute(sql, (comment_id,))
            self.db.commit()
            return cursor.rowcount > 0
    
    def update_comment(self, comment_id: int, content: str) -> bool:
        """댓글 내용 수정"""
        with self.db.cursor() as cursor:
            sql = "UPDATE comment SET content = %s WHERE comment_id = %s"
            cursor.execute(sql, (content, comment_id))
            self.db.commit()
            return cursor.rowcount > 0