# app/controller/oauth/oauth_controller.py
import requests
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry
from fastapi import APIRouter, HTTPException, Depends, Query, Request, Response, status
from fastapi.responses import RedirectResponse, JSONResponse
from pymysql.connections import Connection
from app.database import get_db_connection
from app.service.oauth.oauth_service import OAuthService
from app.utils.auth import create_access_token, decode_access_token
from app.core.config import settings
from datetime import timedelta
from app.utils.cookies import set_access_cookie, set_refresh_cookie, clear_auth_cookies


SAMESITE = "None"   # 백/프론트 서버가 다르므로 None 필수
SECURE   = True     # None 사용 시 Secure 필수 (HTTPS)
router = APIRouter(prefix='/oauth', tags=['OAuth'])
# 어우씨 여기 하나도 모르겠다 ㅋㅋㅋ
@router.get("/kakao/login")
async def kakao_login():
    kakao_auth_url = (
        f"https://kauth.kakao.com/oauth/authorize"
        f"?client_id={settings.KAKAO_REST_API_KEY}"
        f"&redirect_uri={settings.KAKAO_REDIRECT_URI}"
        f"&response_type=code"
    )
    return RedirectResponse(url=kakao_auth_url)
@router.get("/kakao/callback")
async def kakao_callback(
    code: str = Query(None, description="카카오 인가 코드"),
    error: str = Query(None, description="카카오 에러 코드"),
    error_description: str = Query(None, description="카카오 에러 설명"),
    db: Connection = Depends(get_db_connection)
):
    try:
        # 에러가 있으면 프론트엔드로 리다이렉트
        if error:
            print(f"[oauth] 카카오 에러: {error} - {error_description}")
            # 로그인 페이지로 바로 보내기
            redirect_url = f"{settings.FRONTEND_URL}/login?error={error}&message={error_description or ''}"
            return RedirectResponse(url=redirect_url, status_code=302)
        
        # code가 없으면 에러
        if not code:
            raise HTTPException(status_code=422, detail="인가 코드가 필요합니다.")
        
        # 준비: requests 세션 + 재시도 정책
        session = requests.Session()
        retries = Retry(total=3, backoff_factor=0.5, status_forcelist=[429, 500, 502, 503, 504], allowed_methods=["POST", "GET"])
        adapter = HTTPAdapter(max_retries=retries)
        session.mount("https://", adapter)
        session.mount("http://", adapter)

        # 1) 토큰 교환
        token_data = {
            "grant_type": "authorization_code",
            "client_id": settings.KAKAO_REST_API_KEY,
            "redirect_uri": settings.KAKAO_REDIRECT_URI,
            "code": code,
            "client_secret": settings.KAKAO_CLIENT_SECRET
        }
        token_response = session.post(
            "https://kauth.kakao.com/oauth/token",
            headers={"Content-Type": "application/x-www-form-urlencoded;charset=utf-8"},
            data=token_data,
            timeout=30
        )
        # 디버그 로그
        print("[oauth] token_status =", token_response.status_code)
        if token_response.status_code != 200:
            print("[oauth] token_body =", token_response.text)
        token_response.raise_for_status()
        tokens = token_response.json()

        # 2) 프로필 조회
        profile_response = session.get(
            "https://kapi.kakao.com/v2/user/me",
            headers={"Authorization": f"Bearer {tokens['access_token']}"},
            timeout=30
        )
        print("[oauth] profile_status =", profile_response.status_code)
        if profile_response.status_code != 200:
            print("[oauth] profile_body  =", profile_response.text)
        profile_response.raise_for_status()
        kakao_profile = profile_response.json()

        # 3) 서비스 로그인/회원가입
        print("[oauth] before service.login_or_register")
        oauth_service = OAuthService(db)
        user_info = oauth_service.kakao_login_or_register(kakao_profile, tokens)
        print("[oauth] after service, user_info =", user_info)
        user_id = user_info["user_id"]
        username = user_info["username"]

        # 4) JWT 생성
        print("[oauth] before create_access_token")
        access_token = create_access_token(
            data={"user_id": user_id, "username": username},
            expires_delta=timedelta(minutes=settings.JWT_ACCESS_TOKEN_EXPIRE_MINUTES)
        )
        refresh_token = create_access_token(
            data={"user_id": user_id, "type": "refresh"},
            expires_delta=timedelta(days=14)
        )

        # 5) 쿠키 + 리다이렉트
        redirect_url = f"{settings.FRONTEND_URL}/oauth/callback?ok=1"
        resp = RedirectResponse(url=redirect_url, status_code=302)
        # domain을 절대 설정하지 않음 (각 브라우저별로 독립적인 쿠키)
        set_access_cookie(resp, access_token, samesite=SAMESITE, secure=SECURE)
        set_refresh_cookie(resp, refresh_token, samesite=SAMESITE, secure=SECURE)
        print(f"[oauth] set cookies (NO DOMAIN) & redirect -> {redirect_url}")
        return resp

    except requests.exceptions.RequestException as e:
        print("[oauth] requests error =", repr(e))
        # 외부 OAuth 제공자와의 통신 실패는 게이트웨이 오류(502)로 처리
        raise HTTPException(status_code=502, detail="카카오 API 연결 실패: 외부 인증 서버와 통신할 수 없습니다.")
    except Exception as e:
        import traceback; traceback.print_exc()
        print("[oauth] internal error =", repr(e))
        raise HTTPException(status_code=500, detail="서버 오류가 발생했습니다.")

@router.post("/refresh")
async def refresh_token(request: Request, response: Response):
    cookie = request.cookies.get("refresh_token")
    if not cookie:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="No refresh token")

    payload = decode_access_token(cookie)
    if payload.get("type") != "refresh":
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token")

    user_id = payload.get("user_id")
    if not user_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid payload")

    new_access = create_access_token(
        data={"user_id": user_id},
        expires_delta=timedelta(minutes=settings.JWT_ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    set_access_cookie(response, new_access, samesite=SAMESITE, secure=SECURE)
    return {"ok": True}


@router.post("/logout")
async def logout(request: Request, response: Response):
    try:
        clear_auth_cookies(response)
        return {"message": "로그아웃 성공"}
    except Exception as e:
        print(f"[oauth] logout error: {e}")
        raise HTTPException(status_code=400, detail="로그아웃 처리 중 오류가 발생했습니다.")