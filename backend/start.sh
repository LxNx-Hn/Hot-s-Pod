#!/bin/bash
set -e

# .env 파일 로드
if [ -f "/app/.env" ]; then
  echo "Loading environment variables from .env file..."
  set -a
  source /app/.env
  set +a
fi

echo "Starting Hot's POD Backend..."
echo "Database: ${DATABASE_HOST}:${DATABASE_PORT}/${DATABASE_NAME}"

# 환경변수 확인
if [ -z "$DATABASE_NAME" ]; then
  echo "ERROR: DATABASE_NAME is not set!"
  exit 1
fi

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
