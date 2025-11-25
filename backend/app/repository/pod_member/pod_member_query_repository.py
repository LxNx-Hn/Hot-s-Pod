# app/repository/pod_member/pod_member_query_repository.py
from pymysql.connections import Connection
from typing import List, Dict, Any
import json

class PodMemberQueryRepository:
    def __init__(self, db: Connection):
        self.db = db
    
    def find_members_by_pod(self, pod_id: int) -> List[Dict[str, Any]]:
        """Pod의 모든 참가자 조회"""
        with self.db.cursor() as cursor:
            sql = """
                SELECT pm.*, u.username, u.phonenumber
                FROM pod_member pm
                JOIN user u ON pm.user_id = u.user_id
                WHERE pm.pod_id = %s
                ORDER BY pm.joined_at ASC
            """
            cursor.execute(sql, (pod_id,))
            return cursor.fetchall()
    
    def find_pods_by_user(self, user_id: int) -> List[Dict[str, Any]]:
        """사용자가 참가한 모든 Pod 조회"""
        with self.db.cursor() as cursor:
            sql = """
                SELECT
                    p.*,
                    pm.joined_at,
                    pm.amount,
                    m.current_member,
                    catAgg.categories AS 'category_ids'
                FROM pod p
                JOIN pod_member pm
                    ON p.pod_id = pm.pod_id
                AND pm.user_id = %s
                JOIN (
                    SELECT pod_id, COUNT(*) AS current_member
                    FROM Pod_Member
                    GROUP BY pod_id
                ) m
                    ON m.pod_id = p.pod_id
                LEFT JOIN (
                    SELECT
                        pc.pod_id,
                        JSON_ARRAYAGG(
                            c.category_id
                        ) AS categories
                    FROM categorylink pc
                    JOIN category c
                    ON c.category_id = pc.category_id
                    GROUP BY pc.pod_id
                ) catAgg
                    ON catAgg.pod_id = p.pod_id
                ORDER BY p.event_time DESC;
            """
            cursor.execute(sql, (user_id,))
            response = cursor.fetchall()
            for i in response:
                i['category_ids'] = json.loads(i['category_ids']) if i['category_ids'] else []
            return response
    def find_pods_by_hostuser(self, host_user_id: int) -> List[Dict[str, Any]]:
        """사용자가 생성한 모든 Pod 조회"""
        with self.db.cursor() as cursor:
            sql = """
                SELECT
                    p.*,
                    COALESCE(m.current_member, 0) AS current_member,
                    catAgg.categories AS 'category_ids'
                FROM pod p
                LEFT JOIN (
                    SELECT pod_id, COUNT(*) AS current_member
                    FROM Pod_Member
                    GROUP BY pod_id
                ) m
                    ON m.pod_id = p.pod_id
                LEFT JOIN (
                    SELECT
                        pc.pod_id,
                        JSON_ARRAYAGG(
                            c.category_id
                        ) AS categories
                    FROM categorylink pc
                    JOIN category c
                    ON c.category_id = pc.category_id
                    GROUP BY pc.pod_id
                ) catAgg
                    ON catAgg.pod_id = p.pod_id
                WHERE p.host_user_id = %s
                ORDER BY p.event_time DESC;
            """
            cursor.execute(sql, (host_user_id,))
            response = cursor.fetchall()
            for i in response:
                i['category_ids'] = json.loads(i['category_ids']) if i['category_ids'] else []
            return response
    
    def is_member(self, pod_id: int, user_id: int) -> bool:
        """사용자가 Pod 참가자인지 확인"""
        with self.db.cursor() as cursor:
            sql = "SELECT 1 FROM pod_member WHERE pod_id = %s AND user_id = %s"
            cursor.execute(sql, (pod_id, user_id))
            return cursor.fetchone() is not None
    
    def get_member_count(self, pod_id: int) -> int:
        """Pod 참가자 수 조회"""
        with self.db.cursor() as cursor:
            sql = "SELECT COUNT(*) as count FROM pod_member WHERE pod_id = %s"
            cursor.execute(sql, (pod_id,))
            result = cursor.fetchone()
            return result['count'] if result else 0