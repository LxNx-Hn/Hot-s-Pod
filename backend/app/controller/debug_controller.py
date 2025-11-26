from fastapi import APIRouter, Request, Response

router = APIRouter(prefix="/debug", tags=["Debug"])


@router.get("/set_test_cookie")
async def set_test_cookie(response: Response):
    # 테스트용 쿠키를 설정. SameSite=None, Secure로 설정하여 cross-site 전송을 허용
    response.set_cookie(
        key="test_cookie",
        value="1",
        httponly=False,
        secure=True,
        samesite="None",
        path="/",
        max_age=60,
    )
    return {"ok": True, "message": "test_cookie set"}


@router.get("/echo")
async def echo_request(request: Request):
    # 서버가 실제로 받은 쿠키와 일부 헤더를 반환 (디버깅용)
    headers = {k: v for k, v in request.headers.items() if k.lower() in ["origin", "host", "cookie", "referer"]}
    return {"cookies": dict(request.cookies), "headers": headers}
