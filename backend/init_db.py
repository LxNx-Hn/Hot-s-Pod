# backend/init_db.py
import os
from dotenv import load_dotenv
import pymysql
from app.ddl.DDL import execute_ddl
# 경고: 이 스크립트는 데이터베이스를 초기화합니다
# 모든 데이터가 삭제될 수 있으니 주의하세요!

def main():
    """데이터베이스 초기화 및 DDL 실행"""
    load_dotenv()
    
    print("경고: 데이터베이스를 초기화하려고 합니다!")
    print(f"대상 DB: {os.getenv('DATABASE_NAME', 'hots_pod_db')}")
    
    # 환경변수 INIT_DB가 true면 자동 실행 (Docker용)
    if os.getenv('INIT_DB', '').lower() != 'true':
        confirm = input("정말로 계속하시겠습니까? (yes/no): ")
        if confirm.lower() != 'yes':
            print("취소되었습니다.")
            return
    
    try:
        # DB 연결
        connection = pymysql.connect(
            host=os.getenv("DATABASE_HOST", "127.0.0.1"),
            port=int(os.getenv("DATABASE_PORT", "3306")),
            user=os.getenv("DATABASE_USER"),
            password=os.getenv("DATABASE_PASSWORD"),
            db=os.getenv("DATABASE_NAME", "hots_pod_db"),
            charset='utf8mb4',
            cursorclass=pymysql.cursors.DictCursor
        )
        print("Database connection established")
        
        # DDL 실행
        execute_ddl(connection)
        
        connection.close()
        print("Database initialization completed!")
        
    except Exception as e:
        print(f"Error: {e}")
        raise

if __name__ == "__main__":
    main()