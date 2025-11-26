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
    
    def update_user(self, user_id: int, update_data: dict) -> bool:
        """사용자 정보 업데이트 (본인만 가능)"""
        with self.db.cursor() as cursor:
            update_fields = []
            values = []
            
            if 'username' in update_data:
                update_fields.append("username = %s")
                values.append(update_data['username'])
            if 'phonenumber' in update_data:
                update_fields.append("phonenumber = %s")
                values.append(update_data['phonenumber'])
            if 'profile_picture_enabled' in update_data:
                update_fields.append("profile_picture_enabled = %s")
                values.append(update_data['profile_picture_enabled'])
            
            if not update_fields:
                return False
            
            values.append(user_id)
            sql = f"UPDATE user SET {', '.join(update_fields)} WHERE user_id = %s"
            cursor.execute(sql, values)
            self.db.commit()
            return cursor.rowcount > 0
