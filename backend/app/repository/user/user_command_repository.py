# app/repository/user/user_command_repository.py
from pymysql.connections import Connection
from typing import Optional

class UserCommandRepository:
    def __init__(self, db: Connection):
        self.db = db
    
    def create_user(self, username: str, phonenumber: Optional[str] = None) -> int:
        with self.db.cursor() as cursor:
            sql = "INSERT INTO user (username, phonenumber) VALUES (%s, %s)"
            cursor.execute(sql, (username, phonenumber))
            self.db.commit()
            return cursor.lastrowid
    
    def update_username(self, user_id: int, username: str) -> None:
        """사용자 닉네임 업데이트"""
        with self.db.cursor() as cursor:
            sql = "UPDATE user SET username = %s WHERE user_id = %s"
            cursor.execute(sql, (username, user_id))
            self.db.commit()
