# app/repository/rag/rag_command_repository.py
from pymysql.connections import Connection
from typing import List, Dict, Any

#차피 RAG 조작하는거 내가할거같아서 그냥 줄공백 없이 우다다붙일예정, 친절한 주석도 이번이 마지막일 가능성 높음
class RagCommandRepository:
    def __init__(self, db: Connection):
        self.db = db

    def get_pending_jobs(self, limit: int = 10) -> List[Dict[str, Any]]:

        #대기 중인 작업 가져오기
        jobs = []
        with self.db.cursor() as cursor:
            try:
                sql_select = """
                    SELECT queue_id, pod_id, action_type 
                    FROM vectorsyncqueue 
                    WHERE status = 'pending' 
                    ORDER BY created_at ASC 
                    LIMIT %s 
                    FOR UPDATE SKIP LOCKED
                """
                cursor.execute(sql_select, (limit,))
                jobs = cursor.fetchall()
                if not jobs:
                    return []
                queue_ids = [job['queue_id'] for job in jobs]
                
                # SQL Injection 방지 <- 제미나이 피셜입니다
                # The 'placeholders' string is constructed from a fixed pattern (%s repeated)
                # and does not include user input, so this f-string usage is safe.
                # Do not modify to include user input directly.
                placeholders = ','.join(['%s'] * len(queue_ids))
                update_sql = "UPDATE vectorsyncqueue SET status = %s WHERE queue_id IN ({})".format(placeholders)
                cursor.execute(update_sql, ('processing', *queue_ids))
                self.db.commit()
                return jobs
            except Exception as e:
                self.db.rollback()
                raise e
    def delete_job(self, queue_id: int):
        """작업 삭제"""
        with self.db.cursor() as cursor:
            sql = "DELETE FROM vectorsyncqueue WHERE queue_id = %s"
            cursor.execute(sql, (queue_id,))
            self.db.commit()
    def update_job_status(self, queue_id: int, status: str = 'failed'):
        """작업 상태 업데이트"""
        with self.db.cursor() as cursor:
            sql = "UPDATE vectorsyncqueue SET status = %s, retry_count = retry_count + 1 WHERE queue_id = %s"
            cursor.execute(sql, (status, queue_id))
            self.db.commit()