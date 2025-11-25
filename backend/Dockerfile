# Hot's POD Backend Dockerfile
FROM python:3.11-slim

# 작업 디렉토리 설정
WORKDIR /app

# 시스템 패키지 업데이트 및 필수 도구 설치 (MariaDB 포함)
RUN apt-get update && apt-get install -y \
    curl \
    mariadb-server \
    mariadb-client \
    && rm -rf /var/lib/apt/lists/*

# MariaDB 데이터 디렉토리 생성 및 권한 설정
RUN mkdir -p /var/run/mysqld && \
    chown -R mysql:mysql /var/run/mysqld && \
    chmod 777 /var/run/mysqld

# requirements.txt 복사 및 패키지 설치
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# 애플리케이션 코드 복사
COPY . .

# ChromaDB 데이터 디렉토리 생성
RUN mkdir -p /app/chroma_db_data

# 포트 8000 노출
EXPOSE 8000

# 환경변수 설정
ENV PYTHONUNBUFFERED=1
ENV NVIDIA_VISIBLE_DEVICES=all
ENV DATABASE_HOST=127.0.0.1

# 헬스체크 추가
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

# 시작 스크립트 생성
RUN echo '#!/bin/bash\n\
set -e\n\
\n\
echo "Starting Hot'\''s POD Backend..."\n\
echo "Database: $DATABASE_HOST:$DATABASE_PORT/$DATABASE_NAME"\n\
\n\
# MariaDB 시작\n\
echo "Starting MariaDB..."\n\
service mariadb start\n\
sleep 5\n\
\n\
# MariaDB 초기 설정\n\
echo "Configuring MariaDB..."\n\
mysql -u root <<-EOSQL\n\
    ALTER USER '\''root'\''@'\''localhost'\'' IDENTIFIED BY '\''${DATABASE_PASSWORD}'\'';\n\
    CREATE DATABASE IF NOT EXISTS ${DATABASE_NAME} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;\n\
    CREATE USER IF NOT EXISTS '\''${DATABASE_USER}'\''@'\''%'\'' IDENTIFIED BY '\''${DATABASE_PASSWORD}'\'';\n\
    GRANT ALL PRIVILEGES ON ${DATABASE_NAME}.* TO '\''${DATABASE_USER}'\''@'\''%'\'';\n\
    FLUSH PRIVILEGES;\n\
EOSQL\n\
\n\
# DB 초기화 (필요시)\n\
if [ "$INIT_DB" = "true" ]; then\n\
  echo "Initializing database schema..."\n\
  python init_db.py\n\
fi\n\
\n\
echo "Starting uvicorn server..."\n\
exec uvicorn main:app --host 0.0.0.0 --port 8000' > /app/start.sh && \
    chmod +x /app/start.sh
RUN sed -i '2i\
# 시작 스크립트 실행
CMD ["/bin/bash", "/app/start.sh"]
