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
            if not res:
                return None
            sql = "SELECT profile_picture FROM kakaoapi WHERE user_id = %s"
            cursor.execute(sql, (user_id,))
            kakao_data = cursor.fetchone()
            
            # profile_picture_enabled가 False면 placeholder 사용
            if res.get("profile_picture_enabled", True):
                res["profile_picture"] = kakao_data.get("profile_picture", "http://img1.kakaocdn.net/thumb/R640x640.q70/?fname=http://t1.kakaocdn.net/account_images/default_profile.jpeg") if kakao_data else "http://img1.kakaocdn.net/thumb/R640x640.q70/?fname=http://t1.kakaocdn.net/account_images/default_profile.jpeg"
            else:
                res["profile_picture"] = "http://img1.kakaocdn.net/thumb/R640x640.q70/?fname=http://t1.kakaocdn.net/account_images/default_profile.jpeg"
            
            return res