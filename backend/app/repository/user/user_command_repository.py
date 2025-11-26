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
