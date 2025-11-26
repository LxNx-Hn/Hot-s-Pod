# repository/oauth/oauth_query_repository.py
from pymysql import Connection
from typing import Optional, Dict, Any

class OAuthQueryRepository:
    def __init__(self, db: Connection):
        self.db = db
    
    def find_user_by_kakao_id(self, k_id: int) -> Optional[Dict[str, Any]]:
        """카카오 ID로 사용자 조회"""
        with self.db.cursor() as cursor:
            sql = """
                SELECT 
                    u.user_id, 
                    u.username, 
                    u.phonenumber,
                    u.created_at,
                    k.k_id,
                    k.user_name,
                    k.profile_picture
                FROM user u
                JOIN kakaoapi k ON u.user_id = k.user_id
                WHERE k.k_id = %s
            """
            cursor.execute(sql, (k_id,))
            return cursor.fetchone()