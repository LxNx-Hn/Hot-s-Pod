# app/database.py
import pymysql
from dbutils.pooled_db import PooledDB
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)

class DatabaseConnectionPool:
    _pool = None

    @classmethod
    def get_pool(cls):
        if cls._pool is None:
            try:
                cls._pool = PooledDB(
                    creator=pymysql,
                    maxconnections=10,
                    mincached=2,
                    maxcached=5,
                    maxshared=3,
                    blocking=True,
                    maxusage=None,
                    setsession=['SET time_zone = "+09:00"'],  # KST 시간대 설정
                    ping=1,
                    host=settings.DATABASE_HOST,
                    port=settings.DATABASE_PORT,
                    user=settings.DATABASE_USER,
                    password=settings.DATABASE_PASSWORD,
                    database=settings.DATABASE_NAME,
                    charset='utf8mb4',
                    cursorclass=pymysql.cursors.DictCursor,
                    autocommit=False
                )
                logger.info("Database connection pool created")
            except Exception as e:
                logger.error(f"Failed to create connection pool: {e}")
                raise
        return cls._pool

def get_db_connection():
    pool = DatabaseConnectionPool.get_pool()
    connection = None
    try:
        connection = pool.connection()
        yield connection
    finally:
        if connection:
            connection.close()