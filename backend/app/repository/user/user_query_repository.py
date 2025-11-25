# app/repository/user/user_query_repository.py
from pymysql.connections import Connection
from typing import Optional, Dict, Any

class UserQueryRepository:
    def __init__(self, db: Connection):
        self.db = db
    
    def find_user_by_id(self, user_id: int) -> Optional[Dict[str, Any]]:
        with self.db.cursor() as cursor:
            sql = "SELECT * FROM user WHERE user_id = %s"
            cursor.execute(sql, (user_id,))
            res = cursor.fetchone()
            sql = "SELECT profile_picture FROM kakaoapi WHERE user_id = %s"
            cursor.execute(sql, (user_id,))
            res["profile_picture"] = cursor.fetchone()["profile_picture"]
            return res