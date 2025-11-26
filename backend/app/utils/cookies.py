# app/utils/cookies.py
from fastapi import Response
from typing import Optional

# 백/프론트 서버가 다른 경우 (크로스 오리진)
SAMESITE_DEFAULT = "None"   # 다른 도메인 간 쿠키 전송 허용
SECURE_DEFAULT   = True     # None 사용 시 HTTPS 필수

def set_access_cookie(
    response: Response,
    token: str,
    *,
    max_age: int = 30 * 60,
    samesite: str = SAMESITE_DEFAULT,
    secure: bool = SECURE_DEFAULT,
    path: str = "/",
    domain: Optional[str] = None,
):
    cookie_params = {
        "key": "access_token",
        "value": token,
        "httponly": True,
        "secure": secure,
        "samesite": samesite,
        "path": path,
        "max_age": max_age,
    }
    # domain이 지정되면 추가 (크로스 도메인 쿠키 공유용)
    if domain:
        cookie_params["domain"] = domain
    
    response.set_cookie(**cookie_params)

def set_refresh_cookie(
    response: Response,
    token: str,
    *,
    days: int = 14,
    samesite: str = SAMESITE_DEFAULT,
    secure: bool = SECURE_DEFAULT,
    path: str = "/",  # path를 /로 변경하여 모든 경로에서 접근 가능
    domain: Optional[str] = None,
):
    cookie_params = {
        "key": "refresh_token",
        "value": token,
        "httponly": True,
        "secure": secure,
        "samesite": samesite,
        "path": path,
        "max_age": days * 24 * 3600,
    }
    # domain이 지정되면 추가 (크로스 도메인 쿠키 공유용)
    if domain:
        cookie_params["domain"] = domain
    
    response.set_cookie(**cookie_params)

def clear_auth_cookies(response: Response, domain: Optional[str] = None):
    # domain을 절대 사용하지 않음 (보안 강화)
    response.delete_cookie("access_token", path="/")
    response.delete_cookie("refresh_token", path="/")
