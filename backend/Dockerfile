FROM python:3.11-slim

# Hot's POD Backend Dockerfile

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

# 환경변수 파일 복사 (먼저 복사)
COPY .env /app/.env

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

# 시작 스크립트 복사 및 실행 권한 부여
COPY start.sh /app/start.sh
RUN chmod +x /app/start.sh

CMD ["/bin/bash", "/app/start.sh"]
