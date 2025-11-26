# app/repository/chat/chat_command_repository.py
from pymysql.connections import Connection
from app.schemas.chat import ChatMessageCreate

class ChatCommandRepository:
    def __init__(self, db: Connection):
        self.db = db
    
    def create_message(self, message_data: ChatMessageCreate) -> int:
        """채팅 저장"""
        with self.db.cursor() as cursor:
            sql = """
                INSERT INTO chat (pod_id, user_id, content)
                VALUES (%s, %s, %s)
            """
            cursor.execute(sql, (
                message_data.pod_id,
                message_data.user_id,
                message_data.content
            ))
            self.db.commit()
            return cursor.lastrowid