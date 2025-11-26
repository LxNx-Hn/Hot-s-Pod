# app/utils/permissions.py
"""
Permission check utilities for admin and host operations
"""
from fastapi import HTTPException, Request
from app.utils.auth import decode_access_token
from pymysql.connections import Connection


def get_user_from_token(request: Request) -> dict:
    """JWT 토큰에서 사용자 정보 추출"""
    token = request.cookies.get("access_token")
    if not token:
        raise HTTPException(status_code=401, detail="로그인이 필요합니다")
    
    try:
        payload = decode_access_token(token)
        return payload
    except Exception:
        raise HTTPException(status_code=401, detail="유효하지 않은 토큰입니다")


def is_admin(db: Connection, user_id: int) -> bool:
    """사용자가 관리자인지 확인"""
    with db.cursor() as cursor:
        sql = "SELECT is_admin FROM user WHERE user_id = %s"
        cursor.execute(sql, (user_id,))
        result = cursor.fetchone()
        return result and result.get('is_admin', False)


def is_pod_host(db: Connection, pod_id: int, user_id: int) -> bool:
    """사용자가 해당 팟의 호스트인지 확인"""
    with db.cursor() as cursor:
        sql = "SELECT host_user_id FROM pod WHERE pod_id = %s"
        cursor.execute(sql, (pod_id,))
        result = cursor.fetchone()
        return result and result['host_user_id'] == user_id


def require_admin(db: Connection, user_id: int) -> None:
    """관리자 권한 필수 (없으면 403 에러)"""
    if not is_admin(db, user_id):
        raise HTTPException(status_code=403, detail="관리자 권한이 필요합니다")


def require_host_or_admin(db: Connection, pod_id: int, user_id: int) -> None:
    """호스트 또는 관리자 권한 필수"""
    if not (is_pod_host(db, pod_id, user_id) or is_admin(db, user_id)):
        raise HTTPException(status_code=403, detail="호스트 또는 관리자 권한이 필요합니다")


def require_owner_or_admin(db: Connection, resource_user_id: int, current_user_id: int) -> None:
    """본인 또는 관리자 권한 필수 (댓글 삭제용)"""
    if resource_user_id != current_user_id and not is_admin(db, current_user_id):
        raise HTTPException(status_code=403, detail="본인 또는 관리자만 삭제할 수 있습니다")
