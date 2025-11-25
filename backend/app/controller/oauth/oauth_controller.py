# app/controller/oauth/oauth_controller.py
import requests
from fastapi import APIRouter, HTTPException, Depends, Query, Request, Response, status
from fastapi.responses import RedirectResponse, JSONResponse
from pymysql.connections import Connection
from app.database import get_db_connection
from app.service.oauth.oauth_service import OAuthService
from app.utils.auth import create_access_token, decode_access_token
from app.core.config import settings
from datetime import timedelta
from app.utils.cookies import set_access_cookie, set_refresh_cookie, clear_auth_cookies


SAMESITE = "None"   # 프론트/백 다른 도메인이므로 "None" 필수
SECURE   = True     # HTTPS 환경이므로 True
router = APIRouter(prefix='/oauth', tags=['OAuth'])
# 어우씨 여기 하나도 모르겠다 ㅋㅋㅋ
@router.get("/kakao/login")
async def kakao_login():
    kakao_auth_url = (
        f"https://kauth.kakao.com/oauth/authorize"
        f"?client_id={settings.KAKAO_REST_API_KEY}"
        f"&redirect_uri={settings.KAKAO_REDIRECT_URI}"
        f"&response_type=code"
        f"&prompt=none"  # 이미 로그인되어 있으면 자동 인증
    )
    return RedirectResponse(url=kakao_auth_url)
@router.get("/kakao/callback")
async def kakao_callback(
    code: str = Query(..., description="카카오 인가 코드"),
    db: Connection = Depends(get_db_connection)
):
    try:
        # 1) 토큰 교환
        token_data = {
            "grant_type": "authorization_code",
            "client_id": settings.KAKAO_REST_API_KEY,
            "redirect_uri": settings.KAKAO_REDIRECT_URI,
            "code": code,
            "client_secret": settings.KAKAO_CLIENT_SECRET
        }
        token_response = requests.post(
            "https://kauth.kakao.com/oauth/token",
            headers={"Content-Type": "application/x-www-form-urlencoded;charset=utf-8"},
            data=token_data,
            timeout=10
        )
        # 디버그 로그
        print("[oauth] token_status =", token_response.status_code)
        if token_response.status_code != 200:
            print("[oauth] token_body =", token_response.text)
        token_response.raise_for_status()
        tokens = token_response.json()

        # 2) 프로필 조회
        profile_response = requests.get(
            "https://kapi.kakao.com/v2/user/me",
            headers={"Authorization": f"Bearer {tokens['access_token']}"},
            timeout=10
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
        set_access_cookie(resp, access_token, samesite=SAMESITE, secure=SECURE)
        set_refresh_cookie(resp, refresh_token, samesite=SAMESITE, secure=SECURE)
        print("[oauth] set cookies & redirect ->", redirect_url)
        return resp

    except requests.exceptions.RequestException as e:
        print("[oauth] requests error =", repr(e))
        raise HTTPException(status_code=400, detail="카카오 로그인 처리 중 오류가 발생했습니다.")
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
async def logout(request: Request,response: Response):
    try:
        # logout_response = requests.post(
        #     "https://kapi.kakao.com/v1/user/logout",
        #     headers={"Authorization": f"Bearer {access_token}"},
        #     timeout=10
        # )
        # logout_response.raise_for_status()
        response.delete_cookie("access_token")
        return {"message": "로그아웃 성공"}
    except requests.exceptions.RequestException:
        raise HTTPException(status_code=400, detail="카카오 로그아웃 처리 중 오류가 발생했습니다.")