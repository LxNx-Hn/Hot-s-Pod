# app/utils/cookies.py
from fastapi import Response

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
):
    response.set_cookie(
        key="access_token",
        value=token,
        httponly=True,
        secure=secure,
        samesite=samesite,
        path=path,
        max_age=max_age,
    )

def set_refresh_cookie(
    response: Response,
    token: str,
    *,
    days: int = 14,
    samesite: str = SAMESITE_DEFAULT,
    secure: bool = SECURE_DEFAULT,
    path: str = "/oauth/refresh",
):
    response.set_cookie(
        key="refresh_token",
        value=token,
        httponly=True,
        secure=secure,
        samesite=samesite,
        path=path,
        max_age=days * 24 * 3600,
    )

def clear_auth_cookies(response: Response):
    response.delete_cookie("access_token", path="/")
    response.delete_cookie("refresh_token", path="/oauth/refresh")
