# app/repository/pod/pod_query_repository.py
from pymysql.connections import Connection
from typing import Optional, Dict, Any, List
import json

class PodQueryRepository:
    def __init__(self, db: Connection):
        self.db = db

    def find_pod_by_id(self, pod_id: int) -> Optional[Dict[str, Any]]:
        with self.db.cursor() as cursor:
            sql = """
                SELECT p.*, u.username AS host_username
                FROM pod p
                JOIN user u ON p.host_user_id = u.user_id
                WHERE p.pod_id = %s
            """
            cursor.execute(sql, (pod_id,))
            return cursor.fetchone()
    # DTO 수정 필요
    def find_podDetail_by_id(self, pod_id: int) -> Optional[Dict[str, Any]]:
        with self.db.cursor() as cursor:
            sql = """
            SELECT
                p.*,
                u.username AS host_username,
                comAgg.comments,
                catAgg.categories,
                pmAgg.members,
                COUNT(pm.user_id) AS current_member
            FROM pod p
            JOIN user u ON p.host_user_id = u.user_id
            LEFT JOIN pod_member pm ON p.pod_id = pm.pod_id

            LEFT JOIN (
                SELECT
                    c.pod_id,
                    JSON_ARRAYAGG(
                        JSON_OBJECT(
                            'comment_id',         c.comment_id,
                            'parent_comment_id',  c.parent_comment_id,
                            'user_id',            c.user_id,
                            'username',           cu.username,
                            'profile_picture',    ka.profile_picture,
                            'content',            c.content,
                            'created_at',         c.created_at
                        )
                    ) AS comments
                FROM comment c
                JOIN user cu
                    ON cu.user_id = c.user_id
                LEFT JOIN kakaoapi ka
                    ON ka.user_id = c.user_id
                WHERE c.pod_id = %s
                GROUP BY c.pod_id
            ) comAgg ON comAgg.pod_id = p.pod_id

            LEFT JOIN (
                SELECT
                    cl.pod_id,
                    JSON_ARRAYAGG(
                        JSON_OBJECT(
                            'category_link_id', cl.category_link_id,
                            'category_id',      cl.category_id
                        )
                    ) AS categories
                FROM categorylink cl
                WHERE cl.pod_id = %s
                GROUP BY cl.pod_id
            ) catAgg ON catAgg.pod_id = p.pod_id

            LEFT JOIN (
                SELECT
                    pm2.pod_id,
                    JSON_ARRAYAGG(
                        JSON_OBJECT(
                            'pod_member_id',   pm2.pod_member_id,
                            'user_id',         pm2.user_id,
                            'username',        u2.username,
                            'profile_picture', ka2.profile_picture,
                            'amount',          pm2.amount,
                            'joined_at',       pm2.joined_at
                        )
                    ) AS members
                FROM pod_member pm2
                JOIN user u2
                    ON u2.user_id = pm2.user_id
                LEFT JOIN kakaoapi ka2
                    ON ka2.user_id = pm2.user_id
                GROUP BY pm2.pod_id
            ) pmAgg ON pmAgg.pod_id = p.pod_id

            WHERE p.pod_id = %s
            GROUP BY p.pod_id;
            """
            cursor.execute(sql, (pod_id, pod_id, pod_id,))
            response = cursor.fetchone()
            if response is None:
                return None

            comments_json = response.get("comments")
            categories_json = response.get("categories")
            members_json = response.get("members")

            response["comments"] = json.loads(comments_json) if comments_json else []
            response["categories"] = json.loads(categories_json) if categories_json else []
            response["members"] = json.loads(members_json) if members_json else []
            return response
    
    def find_all_pods(self, limit: int = 100, offset: int = 0) -> List[Dict[str, Any]]:
        with self.db.cursor() as cursor:
            sql = """
            SELECT
                p.*,
                u.username AS host_username,
                COALESCE(pmAgg.current_member, 0) AS current_member,
                clAgg.category_ids
            FROM pod p
            JOIN user u ON p.host_user_id = u.user_id
            LEFT JOIN (
                SELECT pod_id, COUNT(*) AS current_member
                FROM pod_member
                GROUP BY pod_id
            ) pmAgg ON pmAgg.pod_id = p.pod_id
            LEFT JOIN (
                SELECT pod_id, JSON_ARRAYAGG(category_id) AS category_ids
                FROM categorylink
                GROUP BY pod_id
            ) clAgg ON clAgg.pod_id = p.pod_id
            ORDER BY p.event_time DESC
            LIMIT %s OFFSET %s;
            """
            cursor.execute(sql, (limit, offset))
            response = cursor.fetchall()
            for i in response:
                i['category_ids'] = json.loads(i['category_ids']) if i['category_ids'] else []
            return response
    def find_pods_by_query(self, query, limit: int = 100, offset: int = 0) -> List[Dict[str, Any]]:
        with self.db.cursor() as cursor:
            sql = """
            SELECT 
                p.*,
                u.username AS host_username,
                (
                    SELECT COUNT(DISTINCT pm.user_id)
                    FROM pod_member pm
                    WHERE pm.pod_id = p.pod_id
                ) AS current_member,
                COALESCE(
                    (
                        SELECT JSON_ARRAYAGG(sub.category_id)
                        FROM (
                            SELECT DISTINCT c2.category_id
                            FROM categorylink cl2
                            JOIN category c2 
                                ON c2.category_id = cl2.category_id
                            WHERE cl2.pod_id = p.pod_id
                        ) AS sub
                    ),
                    JSON_ARRAY()
                ) AS category_ids

            FROM pod p
            JOIN user u 
                ON p.host_user_id = u.user_id

            WHERE
                p.title   LIKE %s
            OR p.content LIKE %s
            OR p.place   LIKE %s
            OR p.place_detail LIKE %s
            OR EXISTS (
                    SELECT 1
                    FROM categorylink cl3
                    JOIN category c3 
                        ON c3.category_id = cl3.category_id
                    WHERE cl3.pod_id = p.pod_id
                    AND c3.category_name LIKE %s
            )

            ORDER BY p.event_time DESC
            LIMIT %s OFFSET %s;
            """
            cursor.execute(sql,(f'%{query}%',f'%{query}%',f'%{query}%',f'%{query}%',f'%{query}%',limit,offset))
            response = cursor.fetchall()
            for i in response:
                i['category_ids'] = json.loads(i['category_ids']) if i['category_ids'] else []
            return response