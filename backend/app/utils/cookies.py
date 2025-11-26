# app/utils/cookies.py
from fastapi import Response
from typing import Optional

# 로컬 개발용 기본값 (배포 시: SAMESITE="None", SECURE=True 권장)
SAMESITE_DEFAULT = "None"   # 프론트/백 오리진이 다르면 "None"
SECURE_DEFAULT   = False    # http 로컬 테스트만 False, https 배포는 True

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
    response.delete_cookie("access_token", path="/", domain=domain)
    response.delete_cookie("refresh_token", path="/", domain=domain)
