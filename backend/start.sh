#!/bin/bash
set -e

echo "========================================="
echo "Starting Hot's POD Backend..."
echo "========================================="

# 환경변수 출력 (디버깅용)
echo "Environment Variables:"
echo "DATABASE_HOST: ${DATABASE_HOST:-NOT_SET}"
echo "DATABASE_PORT: ${DATABASE_PORT:-NOT_SET}"
echo "DATABASE_NAME: ${DATABASE_NAME:-NOT_SET}"
echo "DATABASE_USER: ${DATABASE_USER:-NOT_SET}"
echo "KAKAO_REDIRECT_URI: ${KAKAO_REDIRECT_URI:-NOT_SET}"
echo "FRONTEND_URL: ${FRONTEND_URL:-NOT_SET}"
echo "INIT_DB: ${INIT_DB:-NOT_SET}"
echo "========================================="

# 기본값 설정
DATABASE_HOST=${DATABASE_HOST:-127.0.0.1}
DATABASE_PORT=${DATABASE_PORT:-3306}
DATABASE_NAME=${DATABASE_NAME:-hots_pod_db}
DATABASE_USER=${DATABASE_USER:-hots_pod_user}
DATABASE_PASSWORD=${DATABASE_PASSWORD:-2114}
INIT_DB=${INIT_DB:-true}

echo "Database: ${DATABASE_HOST}:${DATABASE_PORT}/${DATABASE_NAME}"

# MariaDB 시작
echo "Starting MariaDB..."
service mariadb start
sleep 5

# MariaDB 초기 설정
echo "Configuring MariaDB..."
mysql -u root <<-EOSQL
    ALTER USER 'root'@'localhost' IDENTIFIED BY '${DATABASE_PASSWORD}';
    CREATE DATABASE IF NOT EXISTS \`${DATABASE_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
    CREATE USER IF NOT EXISTS '${DATABASE_USER}'@'%' IDENTIFIED BY '${DATABASE_PASSWORD}';
    GRANT ALL PRIVILEGES ON \`${DATABASE_NAME}\`.* TO '${DATABASE_USER}'@'%';
    FLUSH PRIVILEGES;
EOSQL

# DB 초기화 (필요시)
if [ "$INIT_DB" = "true" ]; then
  echo "Initializing database schema..."
  python init_db.py
fi

echo "Starting uvicorn server..."
exec uvicorn main:app --host 0.0.0.0 --port 8000
