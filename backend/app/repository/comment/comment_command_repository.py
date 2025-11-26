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
            try:
                # 부모 댓글 ID 조회 (대댓글인 경우 부모 확인용)
                parent_sql = "SELECT parent_comment_id FROM comment WHERE comment_id = %s"
                cursor.execute(parent_sql, (comment_id,))
                parent_result = cursor.fetchone()
                parent_comment_id = parent_result['parent_comment_id'] if parent_result else None
                
                # 자식 댓글이 있으면 내용만 삭제, 없으면 완전 삭제
                check_sql = "SELECT COUNT(*) as child_count FROM comment WHERE parent_comment_id = %s"
                cursor.execute(check_sql, (comment_id,))
                result = cursor.fetchone()
                
                if result['child_count'] > 0:
                    # 자식이 있으면 소프트 삭제 (user_id, updated_at을 NULL로 변경)
                    sql = "UPDATE comment SET content = '[사용자가 댓글을 삭제했습니다]', user_id = NULL, updated_at = NULL WHERE comment_id = %s"
                else:
                    # 자식이 없으면 완전 삭제
                    sql = "DELETE FROM comment WHERE comment_id = %s"
                
                cursor.execute(sql, (comment_id,))
                affected_rows = cursor.rowcount
                
                # 대댓글을 삭제한 경우, 부모 댓글의 남은 자식 확인 (재귀적으로)
                if parent_comment_id:
                    self._check_and_delete_orphan_parent(cursor, parent_comment_id)
                
                # 모든 작업이 성공하면 한 번에 commit
                self.db.commit()
                return affected_rows > 0
            except Exception:
                self.db.rollback()
                raise
    
    def _check_and_delete_orphan_parent(self, cursor, parent_comment_id: int):
        """부모 댓글이 소프트 삭제 상태이고 자식이 없으면 완전 삭제 (재귀적)"""
        # 부모 댓글 정보 조회 (user_id와 그 부모의 parent_comment_id)
        parent_check_sql = "SELECT user_id, parent_comment_id FROM comment WHERE comment_id = %s"
        cursor.execute(parent_check_sql, (parent_comment_id,))
        parent = cursor.fetchone()
        
        if not parent:
            return  # 부모가 이미 삭제됨
        
        # user_id가 NULL이면 소프트 삭제된 상태
        if parent['user_id'] is None:
            # 남은 자식 댓글 개수 확인
            child_count_sql = "SELECT COUNT(*) as child_count FROM comment WHERE parent_comment_id = %s"
            cursor.execute(child_count_sql, (parent_comment_id,))
            child_result = cursor.fetchone()
            
            # 자식이 없으면 부모도 완전 삭제
            if child_result['child_count'] == 0:
                grandparent_id = parent['parent_comment_id']  # 조부모 ID 저장
                delete_parent_sql = "DELETE FROM comment WHERE comment_id = %s"
                cursor.execute(delete_parent_sql, (parent_comment_id,))
                # commit은 최상위 delete_comment에서 한 번만 수행
                
                # 조부모가 있으면 재귀적으로 확인
                if grandparent_id:
                    self._check_and_delete_orphan_parent(cursor, grandparent_id)