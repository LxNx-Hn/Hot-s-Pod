# app/repository/oauth/oauth_command_repository.py
from pymysql.connections import Connection

class OAuthCommandRepository:
    def __init__(self, db: Connection):
        self.db = db
    
    def upsert_kakao_user(
        self, 
        k_id: int, 
        user_id: int, 
        access_token: str, 
        refresh_token: str,
        user_name: str,
        profile_picture: str
    ) -> None:
        with self.db.cursor() as cursor:
            sql = """
                INSERT INTO kakaoapi 
                    (k_id, user_id, access_token, refresh_token, user_name, profile_picture)
                VALUES (%s, %s, %s, %s, %s, %s)
                ON DUPLICATE KEY UPDATE
                    access_token = VALUES(access_token),
                    refresh_token = VALUES(refresh_token),
                    user_name = VALUES(user_name),
                    profile_picture = VALUES(profile_picture)
            """
            cursor.execute(sql, (k_id, user_id, access_token, refresh_token, user_name, profile_picture))
            self.db.commit()