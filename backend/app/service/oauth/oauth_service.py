# app/service/oauth/oauth_service.py
from pymysql.connections import Connection
from app.repository.oauth.oauth_command_repository import OAuthCommandRepository
from app.repository.oauth.oauth_query_repository import OAuthQueryRepository
from app.repository.user.user_command_repository import UserCommandRepository
from typing import Dict, Any

#선생님 잘부탁합니다.. 읽어는 보겠는데요.. 써본적이 없어서 이게 맞는지 모르겠어요. 
#만약 이게 틀렸다면 다른 oauth도 개판일겁니다
class OAuthService:
    def __init__(self, db: Connection):
        self.db = db
        self.oauth_command = OAuthCommandRepository(db)
        self.oauth_query = OAuthQueryRepository(db)
        self.user_command = UserCommandRepository(db)
    
    def kakao_login_or_register(
        self, 
        kakao_profile: Dict[str, Any], 
        tokens: Dict[str, str]
    ) -> Dict[str, Any]:
        k_id = kakao_profile['id']
        
        # 보안 로그: 카카오 ID 확인
        print(f"[SECURITY] Kakao login attempt - k_id: {k_id}")
        
        # properties 또는 kakao_account에서 닉네임 가져오기
        if 'properties' in kakao_profile:
            user_name = kakao_profile['properties'].get('nickname', '사용자')
            profile_picture = kakao_profile['properties'].get('profile_image', '')
        elif 'kakao_account' in kakao_profile and 'profile' in kakao_profile['kakao_account']:
            user_name = kakao_profile['kakao_account']['profile'].get('nickname', '사용자')
            profile_picture = kakao_profile['kakao_account']['profile'].get('profile_image_url', '')
        else:
            user_name = f"사용자{k_id}"
            profile_picture = ""
        
        existing_user = self.oauth_query.find_user_by_kakao_id(k_id)
        
        if existing_user:
            user_id = existing_user['user_id']
            is_new_user = False
            print(f"[SECURITY] Existing user found - user_id: {user_id}, username: {existing_user.get('username')}")
            # 기존 사용자의 닉네임이 user 테이블에 없으면 업데이트
            if not existing_user.get('username') or existing_user['username'].startswith('사용자'):
                self.user_command.update_username(user_id, user_name)
        else:
            user_id = self.user_command.create_user(username=user_name)
            is_new_user = True
            print(f"[SECURITY] New user created - user_id: {user_id}, k_id: {k_id}")
        
        self.oauth_command.upsert_kakao_user(
            k_id=k_id,
            user_id=user_id,
            access_token=tokens.get('access_token', ''),
            refresh_token=tokens.get('refresh_token', ''),
            user_name=user_name,
            profile_picture=profile_picture
        )
        
        return {
            "user_id": user_id,
            "username": user_name,
            "is_new_user": is_new_user,
            "profile_picture": profile_picture
        }