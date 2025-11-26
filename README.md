# Hot's POD - AI 기반 오프라인 소모임 플랫폼
 
<div align="center">

![Version](https://img.shields.io/badge/version-3.6.2-blue.svg)
![Python](https://img.shields.io/badge/python-3.11+-green.svg)
![FastAPI](https://img.shields.io/badge/FastAPI-0.104.1-009688.svg)
![React](https://img.shields.io/badge/React-18.3+-61DAFB.svg)
![MariaDB](https://img.shields.io/badge/MariaDB-10.6+-003545.svg)
![License](https://img.shields.io/badge/license-Apache-red.svg)

**자연어 검색으로 찾는 완벽한 소모임**

[시작하기](#-빠른-시작) · [문서](#-api-문서) · [아키텍처](#-시스템-아키텍처) · [기여하기](#-기여-가이드)

</div>

---

## 📋 목차

- [프로젝트 소개](#-프로젝트-소개)
- [핵심 기능](#-핵심-기능)
- [기술 스택](#-기술-스택)
- [시스템 아키텍처](#-시스템-아키텍처)
- [빠른 시작](#-빠른-시작)
- [프로젝트 구조](#-프로젝트-구조)
- [API 문서](#-api-문서)
- [데이터베이스](#-데이터베이스)
- [보안](#-보안)
- [성능 최적화](#-성능-최적화)
- [배포](#-배포)
- [트러블슈팅](#-트러블슈팅)
- [기여 가이드](#-기여-가이드)
- [라이선스](#-라이선스)

---

## 🎯 프로젝트 소개

**Hot's POD**는 AI 기반 자연어 검색으로 오프라인 소모임을 찾고, 참여하고, 관리할 수 있는 플랫폼입니다.

### 주요 특징

- 🤖 **AI 자연어 검색**: "강남에서 러닝하는 모임 있어?" → AI가 이해하고 추천
- 🔍 **하이브리드 검색**: 키워드 + 벡터 유사도 + RDB 필터링
- 💬 **실시간 채팅**: WebSocket 기반 Pod별 채팅방
- 🔐 **소셜 로그인**: Kakao OAuth 2.0 인증
- 🚀 **자동 동기화**: DB 트리거 기반 실시간 벡터 인덱싱

### 사용 시나리오

```
사용자: "이번 주 금요일에 석장동에서 경주역 가는 택시 같이 탈 사람있나?"
   ↓
일반 검색: 장소(석장동) OR 카테고리(택시) OR 시간(금요일) 필터링 검색
   ↓
[참가하기 버튼] 클릭 → 즉시 참가 완료
```

```
사용자: "이번 주 금요일에 석장동에서 경주역 가는 택시 같이 탈 사람있나?"
   ↓
AI 검색: 장소(석장동) + 카테고리(택시) + 시간(금요일) 분석
   ↓
결과: "이번 주 금요일 오전 9시에 석장동에서 경주역으로 가는 
      '경주역 가는 택시 같이 타실 분' 모임이 있습니다!"
   ↓
[참가하기 버튼] 클릭 → 즉시 참가 완료
```

---

## ✨ 핵심 기능

<details>
<summary><b>1. RAG 기반 AI 검색 (클릭하여 펼치기)</b></summary>

### RAG (Retrieval-Augmented Generation)

**3단계 하이브리드 검색:**

```
1️⃣ 키워드 분석
   - 장소: "석장동", "경주역", "황성동" 등 추출
   - 카테고리: "택시", "술", "공부", "영화" 등 매칭

2️⃣ 벡터 유사도 검색 (ChromaDB)
   - 사용자 질문을 768차원 벡터로 변환
   - 코사인 유사도로 상위 20개 Pod 검색

3️⃣ RDB 필터링 (MariaDB)
   - 장소/카테고리/시간 조건으로 정밀 필터링
   - 최종 결과 반환
```

**LLM 답변 생성:**
- 검색 결과를 컨텍스트로 제공
- 자연스러운 한국어 답변 생성
- Friendly AI API 또는 로컬 LLM 지원

**자동 벡터화:**
```sql
-- Pod 생성/수정 시 트리거 자동 발동
CREATE TRIGGER trg_pod_after_insert
AFTER INSERT ON Pod
BEGIN
    INSERT INTO VectorSyncQueue 
    VALUES (NEW.pod_id, 'upsert', 'pending');
END;
```

</details>

<details>
<summary><b>2. 소모임(Pod) 관리</b></summary>

### Pod 생명주기

```
생성 → 참가자 모집 → 채팅 → 이벤트 진행 → 후기
```

**기능:**
- ✅ Pod CRUD (생성/조회/수정/삭제)
- ✅ 다중 카테고리 지정
- ✅ 참가자 관리 (승인/거절)
- ✅ 댓글 시스템 (계층 구조)
- ✅ 실시간 채팅 (WebSocket)
- ✅ 참가자 수 제한 (선택)

**저장 프로시저 사용:**
```sql
-- Pod + CategoryLink 트랜잭션으로 생성
CALL sp_CreatePod(
    host_user_id,
    event_time,
    place,
    title,
    content,
    '[1, 3, 5]'  -- category_ids (JSON)
);
```

</details>

<details>
<summary><b>3. 인증 및 권한 관리</b></summary>

### Kakao OAuth 2.0 로그인

**플로우:**
```
1. 사용자 → "카카오 로그인" 클릭
2. 카카오 서버 → 인증 페이지
3. 사용자 → 동의 및 로그인
4. 백엔드 → 카카오 API로 사용자 정보 조회
5. 백엔드 → User 테이블 자동 생성 (신규) 또는 조회 (기존)
6. 백엔드 → JWT 토큰 발급
7. 클라이언트 → JWT를 localStorage에 저장
8. 이후 모든 API → Authorization: Bearer <JWT>
```

**JWT 구조:**
```json
{
  "user_id": 5,
  "username": "홍길동",
  "exp": 1730707929,
  "iat": 1730706129
}
```

**보안:**
- ✅ JWT 서명 검증 (HS256)
- ✅ 만료 시간 체크
- ⚠️ Refresh Token 미구현 (추후 추가 권장)

</details>

<details>
<summary><b>4. 실시간 채팅</b></summary>

### WebSocket 기반 실시간 통신

**특징:**
- Pod별 독립적인 채팅방
- 메시지 영구 저장 (Chat 테이블)
- 연결 관리자 (ConnectionManager)

**메시지 형식:**
```json
{
  "user_id": 1,
  "username": "홍길동",
  "content": "안녕하세요!",
  "timestamp": "2025-10-25T08:12:09",
  "pod_id": "1"
}
```

**브로드캐스팅:**
```python
# 메시지 전송 → 같은 Pod의 모든 클라이언트에게 전달
await manager.broadcast(message, pod_id, exclude=sender)
```

**제한사항:**
- ⚠️ 단일 서버만 지원 (멀티 서버는 Redis Pub/Sub 필요)

</details>

<details>
<summary><b>5. 댓글 시스템</b></summary>

### 계층 구조 댓글

**특징:**
- 대댓글 지원 (재귀 구조)
- 자기 참조 (parent_comment_id)

**응답 구조:**
```json
{
  "comment_id": 1,
  "content": "좋은 모임이네요!",
  "replies": [
    {
      "comment_id": 2,
      "content": "맞아요!",
      "replies": []
    }
  ]
}
```

</details>

---

## 🛠️ 기술 스택

### Backend

| 카테고리 | 기술 | 버전 | 용도 |
|---------|------|------|------|
| **프레임워크** | FastAPI | 0.104.1 | REST API 서버 |
| **언어** | Python | 3.11+ | 백엔드 로직 |
| **ASGI 서버** | Uvicorn | 0.24.0 | 비동기 처리 |

### Database

| 기술 | 버전 | 용도 |
|------|------|------|
| **MariaDB** | 10.6+ | 관계형 데이터 저장 |
| **ChromaDB** | 0.4.18 | 벡터 데이터 저장 |
| **DBUtils** | 3.0.3 | 커넥션 풀 관리 |

### AI/ML

| 기술 | 용도 |
|------|------|
| **Sentence Transformers** | 텍스트 임베딩 (jhgan/ko-srobert-multitask) |
| **PyTorch** | 딥러닝 프레임워크 |
| **Transformers** | LLM 모델 로딩 (선택) |

### Authentication

| 기술 | 용도 |
|------|------|
| **python-jose** | JWT 토큰 생성/검증 |
| **passlib** | 비밀번호 해싱 (선택) |

### 추가 라이브러리

| 라이브러리 | 용도 |
|----------|------|
| **pydantic-settings** | 환경 변수 관리 |
| **python-dotenv** | .env 파일 로드 |
| **requests** | HTTP 클라이언트 (OAuth API 호출) |

---

## 🏗️ 시스템 아키텍처

<details>
<summary><b>전체 시스템 구조도 (클릭하여 펼치기)</b></summary>

```
┌─────────────────────────────────────────────────────────┐
│                    클라이언트 (Web/Mobile)               │
│  - React/Vue/Flutter                                     │
│  - JWT 토큰 관리                                         │
│  - WebSocket 연결                                        │
└────────────────────┬────────────────────────────────────┘
                     │ HTTP / WebSocket
                     ▼
┌─────────────────────────────────────────────────────────┐
│                   FastAPI 서버 (main.py)                 │
│  ┌────────────────────────────────────────────────────┐ │
│  │  Controller Layer (REST API)                       │ │
│  │  - user_controller                                 │ │
│  │  - pod_controller                                  │ │
│  │  - oauth_controller                                │ │
│  │  - rag_controller                                  │ │
│  │  - comment_controller                              │ │
│  │  - chat_controller                                 │ │
│  │  - pod_member_controller                           │ │
│  │  - websocket (채팅)                                │ │
│  └──────────────────┬─────────────────────────────────┘ │
│                     │                                    │
│  ┌────────────────────────────────────────────────────┐ │
│  │  Service Layer (비즈니스 로직)                      │ │
│  │  - 도메인 규칙 검증                                │ │
│  │  - 트랜잭션 관리                                    │ │
│  │  - 크로스 도메인 호출                               │ │
│  └──────────────────┬─────────────────────────────────┘ │
│                     │                                    │
│  ┌────────────────────────────────────────────────────┐ │
│  │  Repository Layer (데이터 접근)                    │ │
│  │  - Command Repository (쓰기)                       │ │
│  │  - Query Repository (읽기)                         │ │
│  │  - CQRS 패턴 적용                                  │ │
│  └──────────────────┬─────────────────────────────────┘ │
└────────────────────┬────────────────────────────────────┘
                     │
        ┌────────────┴──────────┐
        ▼                       ▼
┌─────────────────┐    ┌─────────────────────┐
│    MariaDB      │    │     ChromaDB        │
│  (관계형 DB)    │    │   (벡터 DB)        │
│                 │    │                     │
│ - User          │    │ - Pod 임베딩       │
│ - Pod           │◄───┤ - 코사인 유사도     │
│ - Comment       │동기화│ - HNSW 인덱스      │
│ - Chat          │    │                     │
│ - VectorSyncQueue│   │                     │
└────────┬────────┘    └─────────────────────┘
         │
         │ 폴링 (1초마다)
         ▼
┌─────────────────────────────────────────────┐
│     RAG Worker (백그라운드 스레드)          │
│  - VectorSyncQueue 폴링                     │
│  - Pod 텍스트 조회                          │
│  - SentenceTransformer 임베딩               │
│  - ChromaDB 자동 업데이트                   │
└─────────────────────────────────────────────┘
```

</details>

<details>
<summary><b>CQRS 패턴 (Command Query Responsibility Segregation)</b></summary>

### 명령과 조회 분리

```
┌─────────────────────────────────────────────┐
│  Controller → Service → Repository          │
└─────────────────────────────────────────────┘

Repository 계층이 두 가지로 분리:

1️⃣ Command Repository (쓰기)
   - create_user()
   - update_pod()
   - delete_comment()
   
2️⃣ Query Repository (읽기)
   - find_user_by_id()
   - find_all_pods()
   - get_pod_members()
```

**장점:**
- ✅ 읽기/쓰기 독립적 최적화
- ✅ 확장성 (Read Replica 사용 가능)
- ✅ 테스트 용이성
- ✅ 책임 분리

**예시:**
```python
# Service에서 사용
class PodService:
    def __init__(self, command_repo, query_repo):
        self.command_repo = command_repo  # 쓰기 전용
        self.query_repo = query_repo      # 읽기 전용
    
    def create_pod(self, data):
        # 쓰기 작업
        pod_id = self.command_repo.create_pod(data)
        return pod_id
    
    def get_pod(self, pod_id):
        # 읽기 작업
        return self.query_repo.find_pod_by_id(pod_id)
```

</details>

<details>
<summary><b>RAG 시스템 상세 구조</b></summary>

### RAG (Retrieval-Augmented Generation) Pipeline

```
사용자 질의: "강남에서 러닝하는 모임 있어?"
   │
   ▼
┌─────────────────────────────────────────────┐
│ 1단계: 키워드 분석 (10ms)                   │
│  - 장소: "강남"                             │
│  - 카테고리: "러닝" (category_id=3)         │
└──────────────────┬──────────────────────────┘
                   ▼
┌─────────────────────────────────────────────┐
│ 2단계: 임베딩 생성 (50ms)                   │
│  SentenceTransformer.encode(query)          │
│  → [0.13, -0.44, 0.79, ..., 0.21] (768차원)│
└──────────────────┬──────────────────────────┘
                   ▼
┌─────────────────────────────────────────────┐
│ 3단계: 벡터 검색 (100ms)                    │
│  ChromaDB.query(query_vector, n=20)         │
│  → 코사인 유사도 상위 20개                  │
│  → pod_ids = [4, 1, 7, ...]                │
└──────────────────┬──────────────────────────┘
                   ▼
┌─────────────────────────────────────────────┐
│ 4단계: RDB 필터링 (50ms)                    │
│  CALL sp_FilterPods(                        │
│    pod_ids,                                 │
│    place_keyword="강남",                    │
│    category_id=3                            │
│  )                                          │
│  → final_pods = [Pod #4]                   │
└──────────────────┬──────────────────────────┘
                   ▼
┌─────────────────────────────────────────────┐
│ 5단계: LLM 답변 생성 (500ms)                │
│  - 컨텍스트 구성 (Pod 정보)                 │
│  - LLM API 호출                             │
│  - 자연어 답변 생성                         │
└──────────────────┬──────────────────────────┘
                   ▼
            최종 응답 (총 710ms)
```

### 자동 벡터화 워커

```
┌─────────────────────────────────────────────┐
│  DB 트리거 (Pod INSERT/UPDATE/DELETE)       │
└──────────────────┬──────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────┐
│  VectorSyncQueue 테이블                     │
│  ┌───────────────────────────────────────┐  │
│  │ queue_id | pod_id | action | status  │  │
│  │ 15       | 4      | upsert | pending │  │
│  └───────────────────────────────────────┘  │
└──────────────────┬──────────────────────────┘
                   │ 폴링 (1초마다)
                   ▼
┌─────────────────────────────────────────────┐
│  RAG Worker (백그라운드 스레드)             │
│  1. SELECT ... FOR UPDATE (락)              │
│  2. status='processing' 변경                │
│  3. Pod 텍스트 조회                         │
│  4. 임베딩 생성                             │
│  5. ChromaDB upsert                         │
│  6. DELETE FROM VectorSyncQueue             │
└──────────────────┬──────────────────────────┘
                   ▼
            완료 (2-3초 소요)
```

</details>

---

## 🚀 빠른 시작

<details>
<summary><b>1. 사전 요구사항</b></summary>

### 필수 소프트웨어

- **Python**: 3.11 이상
- **MariaDB**: 10.6 이상
- **Git**: 최신 버전

### 선택 소프트웨어

- **Docker**: 컨테이너 배포 시
- **Redis**: 캐싱/세션 관리 시 (선택)

### 계정 준비

- [카카오 개발자 계정](https://developers.kakao.com/)
- [Friendly AI API 키](https://www.friendly-ai.com/) (선택)

</details>

<details>
<summary><b>2. MariaDB 설정</b></summary>

### 설치

```bash
# Ubuntu/Debian
sudo apt-get update
sudo apt-get install mariadb-server

# macOS
brew install mariadb

# 시작
sudo systemctl start mariadb  # Linux
brew services start mariadb   # macOS
```

### 데이터베이스 생성

```bash
# MariaDB 접속
sudo mysql -u root -p
```

```sql
-- 사용자 생성
CREATE USER 'hots_pod_user'@'localhost' IDENTIFIED BY 'HotsPod2024!Secure';

-- 데이터베이스 생성
CREATE DATABASE IF NOT EXISTS hots_pod_db 
CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 권한 부여
GRANT ALL PRIVILEGES ON hots_pod_db.* TO 'hots_pod_user'@'localhost';
FLUSH PRIVILEGES;

-- 확인
SHOW DATABASES;
EXIT;
```

### 접속 테스트

```bash
mysql -u hots_pod_user -p hots_pod_db
# 비밀번호: HotsPod2024!Secure
```

</details>

<details open>
<summary><b>3. 프로젝트 설치</b></summary>

### 클론 및 가상 환경 생성

```bash
# 1. 리포지토리 클론
git clone https://github.com/yourusername/hots-pod-project.git
cd hots-pod-project/backend

# 2. 가상 환경 생성
python -m venv venv

# 3. 가상 환경 활성화
# Linux/macOS:
source venv/bin/activate

# Windows:
venv\Scripts\activate

# 4. pip 업그레이드
pip install --upgrade pip

# 5. 의존성 설치
pip install -r requirements.txt
```

### 환경 변수 설정

```bash
# .env 파일 생성
cp .env.example .env

# .env 파일 수정
nano .env
```

```.env
# MariaDB
DATABASE_HOST=127.0.0.1
DATABASE_PORT=3306
DATABASE_USER=hots_pod_user
DATABASE_PASSWORD=HotsPod2024!Secure
DATABASE_NAME=hots_pod_db

# Kakao OAuth (카카오 개발자에서 발급)
KAKAO_REST_API_KEY=your_kakao_rest_api_key_here
KAKAO_REDIRECT_URI=http://localhost:8000/oauth/kakao/callback
KAKAO_CLIENT_SECRET=

# JWT (랜덤 문자열로 변경)
JWT_SECRET_KEY=super-secret-jwt-key-change-this-in-production
JWT_ALGORITHM=HS256
JWT_ACCESS_TOKEN_EXPIRE_MINUTES=30

# AI (선택)
LLM_PROVIDER=API
LLM_API_KEY=sk-your-api-key-here
LLM_API_URL=https://api.friendly-ai.com/v1/chat/completions

# Vector DB
CHROMA_DB_PATH=./chroma_db_data
EMBEDDING_MODEL_NAME=jhgan/ko-srobert-multitask
```

### 데이터베이스 초기화

```bash
# DDL 실행 (테이블 생성)
python init_db.py
```

**출력 예시:**
```
🔄 Executing DDL scripts...
✅ DDL execution completed!
✅ Database initialization completed!
```

### 서버 실행

```bash
# 개발 서버 실행
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**출력 예시:**
```
INFO:     Uvicorn running on http://0.0.0.0:8000
INFO:     🚀 Application starting up...
INFO:     ✅ Embedding model loaded: jhgan/ko-srobert-multitask
INFO:     ✅ ChromaDB collection ready
INFO:     ✅ RAG worker thread started
INFO:     🚀 RAG Worker started. Polling VectorSyncQueue...
INFO:     Application startup complete.
```

### 접속 확인

- **API 문서**: http://localhost:8000/docs
- **헬스 체크**: http://localhost:8000/health
- **OAuth 로그인**: http://localhost:8000/oauth/kakao/login

</details>

<details>
<summary><b>4. 카카오 개발자 설정</b></summary>

### 앱 생성

1. [카카오 개발자 콘솔](https://developers.kakao.com/console/app) 접속
2. "애플리케이션 추가하기" 클릭
3. 앱 이름 입력 (예: Hot's POD)
4. 회사명 입력 (선택)

### REST API 키 확인

1. 생성한 앱 선택
2. "앱 키" 메뉴에서 **REST API 키** 복사
3. `.env` 파일의 `KAKAO_REST_API_KEY`에 입력

### 플랫폼 설정

1. "플랫폼" 메뉴 선택
2. "Web 플랫폼 등록" 클릭
3. 사이트 도메인: `http://localhost:8000` 입력

### Redirect URI 설정

1. "카카오 로그인" 메뉴 선택
2. "활성화 설정" ON
3. "Redirect URI" 등록: `http://localhost:8000/oauth/kakao/callback`

### 동의 항목 설정

1. "카카오 로그인" → "동의 항목" 선택
2. 필수 동의: **닉네임** (필수 동의)
3. 선택 동의: **프로필 사진** (선택 동의)

### 테스트

```bash
# 브라우저에서 접속
http://localhost:8000/oauth/kakao/login

# 카카오 로그인 후 콜백 확인
# 성공 시 JWT 토큰 반환
```

</details>

---

## 📁 프로젝트 구조

<details>
<summary><b>전체 디렉토리 구조 (클릭하여 펼치기)</b></summary>

```
hots-pod-project/backend/
├── .env                          # 환경 변수 (Git 제외)
├── .gitignore                    # Git 제외 파일
├── requirements.txt              # Python 의존성
├── init_db.py                    # DB 초기화 스크립트
├── README.md                     # 📖 이 문서
│
└── app/
    ├── __init__.py
    ├── main.py                   # 🚀 FastAPI 진입점
    ├── database.py               # 💾 DB 커넥션 풀
    │
    ├── core/
    │   ├── __init__.py
    │   └── config.py             # ⚙️ 환경 변수 로드
    │
    ├── utils/
    │   ├── __init__.py
    │   └── auth.py               # 🔐 JWT 유틸리티
    │
    ├── ddl/
    │   ├── __init__.py
    │   └── DDL.py                # 📊 데이터베이스 스키마
    │
    ├── schemas/                  # 📝 Pydantic 모델
    │   ├── __init__.py
    │   ├── user.py
    │   ├── pod.py
    │   ├── oauth.py
    │   ├── rag.py
    │   ├── comment.py
    │   ├── chat.py
    │   └── pod_member.py
    │
    ├── repository/               # 🗄️ 데이터 접근 계층 (CQRS)
    │   ├── __init__.py
    │   ├── user/
    │   │   ├── __init__.py
    │   │   ├── user_command_repository.py
    │   │   └── user_query_repository.py
    │   ├── pod/
    │   ├── oauth/
    │   ├── rag/
    │   ├── comment/
    │   ├── chat/
    │   └── pod_member/
    │
    ├── service/                  # 💼 비즈니스 로직 계층
    │   ├── __init__.py
    │   ├── user/
    │   │   ├── __init__.py
    │   │   └── user_service.py
    │   ├── pod/
    │   ├── oauth/
    │   ├── rag/
    │   │   ├── rag_service.py
    │   │   └── rag_worker_service.py
    │   ├── comment/
    │   ├── chat/
    │   └── pod_member/
    │
    ├── controller/               # 🎮 API 엔드포인트
    │   ├── __init__.py
    │   ├── user/
    │   │   ├── __init__.py
    │   │   └── user_controller.py
    │   ├── pod/
    │   ├── oauth/
    │   ├── rag/
    │   ├── comment/
    │   ├── chat/
    │   └── pod_member/
    │
    └── socket/                   # 🔌 WebSocket
        ├── __init__.py
        └── websocket.py
```

</details>

<details>
<summary><b>계층별 역할</b></summary>

### 1. Controller Layer (컨트롤러)

**역할**: HTTP 요청/응답 처리

```python
@router.post("/pods/")
async def create_pod(pod_data: PodCreateRequest):
    # 1. 요청 검증 (Pydantic 자동)
    # 2. Service 호출
    pod_id = pod_service.create_pod(pod_data)
    # 3. 응답 반환
    return {"pod_id": pod_id}
```

**책임:**
- ✅ 요청 파라미터 검증
- ✅ 응답 직렬화
- ✅ HTTP 상태 코드 관리
- ❌ 비즈니스 로직 포함 금지

---

### 2. Service Layer (서비스)

**역할**: 비즈니스 로직 처리

```python
class PodService:
    def create_pod(self, request):
        # 1. 비즈니스 규칙 검증
        if request.event_time < datetime.now():
            raise ValueError("Event time must be future")
        
        # 2. Repository 호출
        pod_id = self.command_repo.create_pod(request)
        
        # 3. 추가 로직 (로깅, 알림 등)
        logger.info(f"Pod created: {pod_id}")
        
        return pod_id
```

**책임:**
- ✅ 도메인 규칙 적용
- ✅ 트랜잭션 관리
- ✅ 에러 처리
- ✅ 크로스 도메인 호출
- ❌ HTTP/DB 직접 접근 금지

---

### 3. Repository Layer (리포지토리)

**역할**: 데이터 접근 추상화

**Command Repository (쓰기):**
```python
class PodCommandRepository:
    def create_pod(self, pod_data):
        sql = "INSERT INTO Pod (...) VALUES (%s, %s, ...)"
        cursor.execute(sql, (...))
        self.db.commit()
        return cursor.lastrowid
```

**Query Repository (읽기):**
```python
class PodQueryRepository:
    def find_pod_by_id(self, pod_id):
        sql = "SELECT * FROM Pod WHERE pod_id = %s"
        cursor.execute(sql, (pod_id,))
        return cursor.fetchone()
```

**책임:**
- ✅ SQL 쿼리 실행
- ✅ 저장 프로시저 호출
- ✅ 결과 매핑
- ❌ 비즈니스 로직 포함 금지

</details>

---

## 📖 API 문서

<details>
<summary><b>User API</b></summary>

### 사용자 생성

```http
POST /users/
Content-Type: application/json

{
  "username": "홍길동",
  "phonenumber": "010-1234-5678"
}
```

**응답:**
```json
{
  "user_id": 5,
  "message": "User created successfully"
}
```

---

### 사용자 조회

```http
GET /users/{user_id}
```

**응답:**
```json
{
  "user_id": 5,
  "username": "홍길동",
  "phonenumber": "010-1234-5678",
  "created_at": "2025-10-25T08:12:09"
}
```

---

### 현재 사용자 조회 (인증 필요)

```http
GET /users/me
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

</details>

<details>
<summary><b>Pod API</b></summary>

### Pod 생성

```http
POST /pods/
Content-Type: application/json

{
  "host_user_id": 1,
  "event_time": "2025-11-20T14:00:00",
  "place": "강남역 3번 출구",
  "title": "주말 러닝 모임",
  "content": "같이 한강 러닝해요!",
  "category_ids": [3, 1]
}
```

**응답:**
```json
{
  "pod_id": 4,
  "message": "Pod created successfully"
}
```

**부수 효과:**
- ✅ `VectorSyncQueue`에 자동 추가 (트리거)
- ✅ RAG Worker가 2-3초 후 벡터화

---

### Pod 조회

```http
GET /pods/{pod_id}
```

**응답:**
```json
{
  "pod_id": 4,
  "host_user_id": 1,
  "host_username": "테스트유저1",
  "event_time": "2025-11-20T14:00:00",
  "place": "강남역 3번 출구",
  "title": "주말 러닝 모임",
  "content": "같이 한강 러닝해요!",
  "created_at": "2025-10-25T08:12:09",
  "updated_at": "2025-10-25T08:12:09"
}
```

---

### Pod 목록 조회

```http
GET /pods/?limit=10&offset=0
```

---

### Pod 참가

```http
POST /pods/{pod_id}/join
Content-Type: application/json

{
  "user_id": 5
}
```

**응답:**
```json
{
  "message": "Successfully joined the pod"
}
```

</details>

<details>
<summary><b>OAuth API</b></summary>

### 카카오 로그인

```http
GET /oauth/kakao/login
```

**동작:**
1. 카카오 로그인 페이지로 리디렉션
2. 사용자 로그인 및 동의
3. `/oauth/kakao/callback`으로 리디렉션

---

### 카카오 콜백 (자동)

```http
GET /oauth/kakao/callback?code=XXXXX
```

**응답:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "user": {
    "user_id": 5,
    "username": "홍길동",
    "profile_picture": "http://...",
    "is_new_user": true
  }
}
```

**사용법:**
```javascript
// 클라이언트에서 토큰 저장
localStorage.setItem('access_token', response.access_token);

// 이후 API 호출 시
fetch('/api/endpoint', {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('access_token')}`
  }
});
```

</details>

<details>
<summary><b>RAG API</b></summary>

### AI 검색

```http
POST /rag/search
Content-Type: application/json

{
  "query": "강남에서 러닝하는 모임 있어?",
  "user_id": 5
}
```

**응답:**
```json
{
  "llm_answer": "네, 강남역 근처에서 진행되는 러닝 모임이 있습니다! '주말 러닝 모임'이 11월 20일 오후 2시에 강남역 3번 출구에서 모이며, 현재 3명이 참가 중입니다. 초보자도 환영한다고 하니 편하게 참가하세요!",
  "retrieved_pods": [
    {
      "pod_id": 4,
      "title": "주말 러닝 모임",
      "place": "강남역 3번 출구",
      "event_time": "2025-11-20T14:00:00",
      "host_username": "테스트유저1"
    }
  ],
  "total_found": 1
}
```

**처리 시간:**
- 평균: ~700ms
- 키워드 분석: 10ms
- 벡터 검색: 100ms
- RDB 필터링: 50ms
- LLM 답변: 500ms

---

### RAG 상태 확인

```http
GET /rag/health
```

**응답:**
```json
{
  "status": "healthy",
  "embedding_model": "jhgan/ko-srobert-multitask",
  "llm_provider": "API",
  "vector_db_count": 127,
  "vector_db_path": "./chroma_db_data"
}
```

</details>

<details>
<summary><b>Comment API</b></summary>

### 댓글 생성

```http
POST /comments/
Content-Type: application/json

{
  "pod_id": 4,
  "user_id": 5,
  "content": "저도 참가하고 싶어요!",
  "parent_comment_id": null
}
```

---

### Pod 댓글 조회 (계층 구조)

```http
GET /comments/pod/{pod_id}
```

**응답:**
```json
[
  {
    "comment_id": 1,
    "content": "좋은 모임이네요!",
    "username": "홍길동",
    "created_at": "2025-10-25T08:12:09",
    "replies": [
      {
        "comment_id": 2,
        "content": "맞아요!",
        "username": "김철수",
        "replies": []
      }
    ]
  }
]
```

</details>

<details>
<summary><b>WebSocket API</b></summary>

### 실시간 채팅 연결

```javascript
// 클라이언트 코드
const ws = new WebSocket('ws://localhost:8000/ws/chat/4');

// 연결 성공
ws.onopen = () => {
  console.log('채팅방 연결됨');
};

// 메시지 전송
ws.send(JSON.stringify({
  user_id: 5,
  username: "홍길동",
  content: "안녕하세요!",
  timestamp: new Date().toISOString()
}));

// 메시지 수신
ws.onmessage = (event) => {
  const message = JSON.parse(event.data);
  console.log(`${message.username}: ${message.content}`);
};

// 연결 종료
ws.onclose = () => {
  console.log('채팅방 연결 종료');
};
```

</details>

---

## 💾 데이터베이스

<details>
<summary><b>ERD (Entity Relationship Diagram)</b></summary>

```
┌─────────────┐        ┌─────────────┐
│    User     │◄───────┤  KakaoAPI   │
│─────────────│        │─────────────│
│ user_id PK  │        │ k_id PK     │
│ username    │        │ user_id FK  │
│ phonenumber │        │ access_token│
│ created_at  │        │ ...         │
└──────┬──────┘        └─────────────┘
       │
       │ 1:N
       │
┌──────▼──────┐        ┌──────────────┐
│    Pod      │◄───────┤ CategoryLink │
│─────────────│        │──────────────│
│ pod_id PK   │        │ pod_id FK    │
│ host_user FK│        │ category_id FK│
│ event_time  │        └──────┬───────┘
│ place       │               │
│ title       │        ┌──────▼──────┐
│ content     │        │  Category   │
└──────┬──────┘        │─────────────│
       │               │ category_id │
       │ 1:N           │ name        │
       │               └─────────────┘
┌──────▼──────────┐
│  Pod_Member     │
│─────────────────│
│ pod_member_id PK│
│ user_id FK      │
│ pod_id FK       │
│ joined_at       │
└─────────────────┘

┌──────▼──────────┐
│    Comment      │
│─────────────────│
│ comment_id PK   │
│ pod_id FK       │
│ user_id FK      │
│ parent_id FK    │ ← 자기 참조
│ content         │
└─────────────────┘

┌──────▼──────────┐
│     Chat        │
│─────────────────│
│ chat_id PK      │
│ pod_id FK       │
│ user_id FK      │
│ content         │
│ time            │
└─────────────────┘

┌──────────────────┐
│ VectorSyncQueue  │ ← RAG 전용
│──────────────────│
│ queue_id PK      │
│ pod_id           │
│ action_type      │
│ status           │
└──────────────────┘
```

</details>

<details>
<summary><b>주요 테이블 스키마</b></summary>

### User (사용자)

```sql
CREATE TABLE User (
  user_id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(100) NOT NULL,
  phonenumber VARCHAR(20) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

### Pod (소모임)

```sql
CREATE TABLE Pod (
  pod_id INT AUTO_INCREMENT PRIMARY KEY,
  host_user_id INT NOT NULL,
  event_time DATETIME NOT NULL,
  place VARCHAR(255) NOT NULL,
  title VARCHAR(255) NOT NULL,
  content TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (host_user_id) REFERENCES User(user_id) ON DELETE CASCADE,
  INDEX (event_time),
  INDEX (place)
);
```

---

### VectorSyncQueue (RAG 큐)

```sql
CREATE TABLE VectorSyncQueue (
  queue_id BIGINT AUTO_INCREMENT PRIMARY KEY,
  pod_id INT NOT NULL,
  action_type ENUM('upsert', 'delete') NOT NULL,
  status ENUM('pending', 'processing', 'failed') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  retry_count INT DEFAULT 0,
  INDEX (status, created_at)
);
```

</details>

<details>
<summary><b>트리거 (Triggers)</b></summary>

### Pod 생성 시 자동 벡터화

```sql
CREATE TRIGGER trg_pod_after_insert
AFTER INSERT ON Pod
FOR EACH ROW
BEGIN
    INSERT INTO VectorSyncQueue (pod_id, action_type, status, created_at)
    VALUES (NEW.pod_id, 'upsert', 'pending', CURRENT_TIMESTAMP);
END;
```

---

### Pod 수정 시 재벡터화

```sql
CREATE TRIGGER trg_pod_after_update
AFTER UPDATE ON Pod
FOR EACH ROW
BEGIN
    IF OLD.title != NEW.title 
       OR OLD.content != NEW.content 
       OR OLD.place != NEW.place THEN
        INSERT INTO VectorSyncQueue (pod_id, action_type, status, created_at)
        VALUES (NEW.pod_id, 'upsert', 'pending', CURRENT_TIMESTAMP);
    END IF;
END;
```

---

### Pod 삭제 시 벡터 삭제

```sql
CREATE TRIGGER trg_pod_after_delete
AFTER DELETE ON Pod
FOR EACH ROW
BEGIN
    INSERT INTO VectorSyncQueue (pod_id, action_type, status, created_at)
    VALUES (OLD.pod_id, 'delete', 'pending', CURRENT_TIMESTAMP);
END;
```

</details>

<details>
<summary><b>저장 프로시저 (Stored Procedures)</b></summary>

### sp_CreatePod (Pod 생성)

```sql
CREATE PROCEDURE sp_CreatePod(
    IN in_host_user_id INT,
    IN in_event_time DATETIME,
    IN in_place VARCHAR(255),
    IN in_title VARCHAR(255),
    IN in_content TEXT,
    IN in_category_ids JSON
)
BEGIN
    DECLARE new_pod_id INT;
    DECLARE _index INT DEFAULT 0;
    DECLARE _length INT;

    START TRANSACTION;

    -- Pod 생성
    INSERT INTO Pod (host_user_id, event_time, place, title, content)
    VALUES (in_host_user_id, in_event_time, in_place, in_title, in_content);
    
    SET new_pod_id = LAST_INSERT_ID();
    SET _length = JSON_LENGTH(in_category_ids);

    -- CategoryLink 반복 생성
    WHILE _index < _length DO
        INSERT INTO CategoryLink (pod_id, category_id)
        VALUES (new_pod_id, JSON_EXTRACT(in_category_ids, CONCAT('$[', _index, ']')));
        
        SET _index = _index + 1;
    END WHILE;

    COMMIT;

    SELECT new_pod_id AS pod_id;
END;
```

**장점:**
- ✅ 트랜잭션 보장 (Pod + CategoryLink 원자성)
- ✅ 네트워크 왕복 감소
- ✅ 비즈니스 로직 캡슐화

</details>

---

## 🔒 보안

<details>
<summary><b>SQL Injection 방지</b></summary>

### Parameterized Query 사용

```python
# ✅ 안전한 코드 (현재 프로젝트)
def find_user_by_id(self, user_id: int):
    sql = "SELECT * FROM User WHERE user_id = %s"
    cursor.execute(sql, (user_id,))  # 파라미터 분리
    return cursor.fetchone()

# ❌ 위험한 코드 (사용 안 함)
def find_user_by_id_UNSAFE(self, user_id):
    sql = f"SELECT * FROM User WHERE user_id = {user_id}"  # 직접 삽입
    cursor.execute(sql)  # SQL Injection 취약!
```

### 공격 시나리오 테스트

```bash
# 공격 시도
curl "http://localhost:8000/users/1%20OR%201=1"

# 결과: 400 Bad Request (Pydantic 검증 실패)
# "value is not a valid integer"
```

**방어 장치:**
1. ✅ Parameterized Query (모든 Repository)
2. ✅ Pydantic 타입 검증
3. ✅ FastAPI 자동 타입 변환
4. ✅ 저장 프로시저 안전 패턴

</details>

<details>
<summary><b>JWT 인증</b></summary>

### 토큰 생성

```python
from app.utils.auth import create_access_token

token = create_access_token(
    data={"user_id": 5, "username": "홍길동"},
    expires_delta=timedelta(minutes=30)
)
```

### 토큰 검증

```python
from app.utils.auth import get_current_user_id

@router.get("/protected")
async def protected_route(user_id: int = Depends(get_current_user_id)):
    # user_id는 JWT에서 자동 추출됨
    return {"user_id": user_id}
```

### 보안 권장사항

```python
# ⚠️ 개발 환경
JWT_SECRET_KEY=super-secret-key-change-this

# ✅ 운영 환경
JWT_SECRET_KEY=$(openssl rand -hex 32)
# → a8f3j29dk3f8j2d9f8j3d9f8j2d9f8j3d9f8j2d9f8j3d9f8
```

</details>

<details>
<summary><b>CORS 설정</b></summary>

### 개발 환경 (현재)

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # ⚠️ 모든 도메인 허용
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### 운영 환경 (권장)

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://hotspod.com",
        "https://www.hotspod.com",
        "https://app.hotspod.com"
    ],  # ✅ 특정 도메인만
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["Authorization", "Content-Type"],
)
```

</details>

<details>
<summary><b>입력 검증</b></summary>

### Pydantic 자동 검증

```python
from pydantic import BaseModel, Field

class CommentCreateRequest(BaseModel):
    pod_id: int  # ✅ 정수만 허용
    user_id: int
    content: str = Field(..., min_length=1, max_length=1000)  # ✅ 길이 제한
    
    @validator('content')
    def sanitize_content(cls, v):
        import html
        return html.escape(v.strip())  # ✅ XSS 방지
```

### FastAPI 타입 검증

```python
@router.get("/{user_id}")
async def get_user(user_id: int):  # ✅ int 강제
    # /users/abc → 400 Bad Request
    ...
```

</details>

---

## ⚡ 성능 최적화

<details>
<summary><b>DB 커넥션 풀</b></summary>

### DBUtils.PooledDB 사용

```python
_pool = PooledDB(
    creator=pymysql,
    maxconnections=10,   # 최대 10개 동시 연결
    mincached=2,         # 최소 2개 캐시
    maxcached=5,         # 최대 5개 캐시
    maxshared=3,         # 최대 3개 공유
    blocking=True,       # 풀 고갈 시 대기
    ping=1,              # 자동 재연결
    ...
)
```

**장점:**
- ✅ 연결 재사용 (오버헤드 감소)
- ✅ 동시 요청 처리
- ✅ 자동 재연결

</details>

<details>
<summary><b>RAG 검색 최적화</b></summary>

### 벡터 검색 속도

```python
# ChromaDB HNSW 인덱스
collection = chroma_client.get_or_create_collection(
    name="hots_pod_collection",
    metadata={
        "hnsw:space": "cosine",
        "hnsw:construction_ef": 200,  # 정확도 향상
        "hnsw:M": 16                  # 연결 수
    }
)
```

**성능:**
- 100개 벡터: ~5ms
- 10,000개 벡터: ~20ms
- 100만개 벡터: ~100ms

---

### LLM 캐싱 (추후 추가 권장)

```python
import hashlib
import redis

redis_client = redis.Redis()

def search(self, query: str):
    # 쿼리 해시
    query_hash = hashlib.md5(query.encode()).hexdigest()
    cache_key = f"rag:{query_hash}"
    
    # 캐시 확인
    cached = redis_client.get(cache_key)
    if cached:
        return json.loads(cached)  # 5ms
    
    # 실제 검색
    results = self._do_search(query)  # 700ms
    
    # 캐시 저장 (10분)
    redis_client.setex(cache_key, 600, json.dumps(results))
    return results
```

</details>

<details>
<summary><b>인덱스 최적화</b></summary>

### 주요 인덱스

```sql
-- Pod 테이블
CREATE INDEX IDX_Pod_event_time ON Pod(event_time);
CREATE INDEX IDX_Pod_place ON Pod(place);

-- Comment 테이블
CREATE INDEX IDX_Comment_pod ON Comment(pod_id, created_at);

-- Chat 테이블
CREATE INDEX IDX_Chat_pod_time ON Chat(pod_id, time);

-- VectorSyncQueue 테이블
CREATE INDEX IDX_VectorSyncQueue_status ON VectorSyncQueue(status, created_at);
```

**효과:**
- Pod 목록 조회: 500ms → 10ms
- 댓글 조회: 200ms → 5ms
- 큐 폴링: 100ms → 2ms

</details>

---

## 🚢 배포

<details>
<summary><b>Docker Compose 배포</b></summary>

### docker-compose.yml

```yaml
version: '3.8'

services:
  mariadb:
    image: mariadb:10.11
    container_name: hots_pod_mariadb
    environment:
      MYSQL_ROOT_PASSWORD: rootpassword
      MYSQL_DATABASE: hots_pod_db
      MYSQL_USER: hots_pod_user
      MYSQL_PASSWORD: HotsPod2024!Secure
    ports:
      - "3306:3306"
    volumes:
      - mariadb_data:/var/lib/mysql
      - ./init.sql:/docker-entrypoint-initdb.d/init.sql
    networks:
      - hots_pod_network

  backend:
    build: .
    container_name: hots_pod_backend
    command: uvicorn app.main:app --host 0.0.0.0 --port 8000
    ports:
      - "8000:8000"
    volumes:
      - ./app:/app/app
      - ./chroma_db_data:/app/chroma_db_data
    environment:
      - DATABASE_HOST=mariadb
      - DATABASE_PORT=3306
      - DATABASE_USER=hots_pod_user
      - DATABASE_PASSWORD=HotsPod2024!Secure
      - DATABASE_NAME=hots_pod_db
      - LLM_PROVIDER=${LLM_PROVIDER}
      - LLM_API_KEY=${LLM_API_KEY}
      - LLM_API_URL=${LLM_API_URL}
    depends_on:
      - mariadb
    networks:
      - hots_pod_network

volumes:
  mariadb_data:

networks:
  hots_pod_network:
    driver: bridge
```

### Dockerfile

```dockerfile
FROM python:3.11-slim

WORKDIR /app

# 시스템 패키지
RUN apt-get update && apt-get install -y \
    gcc g++ build-essential \
    && rm -rf /var/lib/apt/lists/*

# Python 의존성
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 애플리케이션 코드
COPY ./app /app/app

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port","8000"]
```

### 실행 명령어

```bash
# 빌드 및 실행
docker-compose up -d --build

# 로그 확인
docker-compose logs -f backend

# 서비스 상태 확인
docker-compose ps

# 종료
docker-compose down

# 데이터 포함 완전 삭제
docker-compose down -v
```

</details>

<details>
<summary><b>Nginx 리버스 프록시</b></summary>

### nginx.conf

```nginx
upstream backend {
    server backend:8000;
}

server {
    listen 80;
    server_name hotspod.com www.hotspod.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name hotspod.com www.hotspod.com;
    
    ssl_certificate /etc/nginx/ssl/cert.pem;
    ssl_certificate_key /etc/nginx/ssl/key.pem;
    
    # 보안 헤더
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    
    # API 라우팅
    location / {
        proxy_pass http://backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # WebSocket 라우팅
    location /ws/ {
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_read_timeout 86400;
    }
    
    # 파일 업로드 크기 제한
    client_max_body_size 10M;
}
```

### docker-compose.yml에 Nginx 추가

```yaml
  nginx:
    image: nginx:alpine
    container_name: hots_pod_nginx
    restart: always
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - backend
    networks:
      - hots_pod_network
```

</details>

<details>
<summary><b>환경별 설정</b></summary>

### .env.development

```bash
# 개발 환경
DATABASE_HOST=localhost
DATABASE_PORT=3306
JWT_SECRET_KEY=dev-secret-key
LLM_PROVIDER=API
CORS_ORIGINS=["http://localhost:3000", "http://localhost:5173"]
DEBUG=True
```

### .env.production

```bash
# 운영 환경
DATABASE_HOST=production-db.example.com
DATABASE_PORT=3306
JWT_SECRET_KEY=prod-very-long-random-key-a8f3j29dk3f8j2d9f8j3d9f8j2d9f8
LLM_PROVIDER=API
CORS_ORIGINS=["https://hotspod.com", "https://www.hotspod.com"]
DEBUG=False
```

### 환경별 실행

```bash
# 개발
export ENV=development
uvicorn app.main:app --reload

# 운영
export ENV=production
gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker
```

</details>

<details>
<summary><b>CI/CD (GitHub Actions)</b></summary>

### .github/workflows/deploy.yml

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Set up Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.11'
      
      - name: Install dependencies
        run: |
          pip install -r requirements.txt
          pip install pytest pytest-cov
      
      - name: Run tests
        run: |
          pytest tests/ --cov=app --cov-report=xml
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3

  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy to server
        env:
          SSH_PRIVATE_KEY: ${{ secrets.SSH_PRIVATE_KEY }}
          HOST: ${{ secrets.HOST }}
          USER: ${{ secrets.USER }}
        run: |
          echo "$SSH_PRIVATE_KEY" > key.pem
          chmod 600 key.pem
          
          ssh -i key.pem $USER@$HOST << 'EOF'
            cd /app/hots-pod-project/backend
            git pull origin main
            docker-compose down
            docker-compose up -d --build
            docker-compose logs -f backend &
          EOF
```

</details>

---

## 🐛 트러블슈팅

<details>
<summary><b>일반적인 문제 해결</b></summary>

### 1. ModuleNotFoundError

**문제:**
```bash
ModuleNotFoundError: No module named 'app'
```

**해결:**
```bash
# PYTHONPATH 설정
export PYTHONPATH=$PYTHONPATH:$(pwd)

# 또는 app 상위 디렉토리에서 실행
cd hots-pod-project/backend
python -m uvicorn app.main:app --reload
```

---

### 2. DB 연결 실패

**문제:**
```bash
pymysql.err.OperationalError: (2003, "Can't connect to MySQL server")
```

**해결:**
```bash
# MariaDB 시작 확인
sudo systemctl status mariadb

# .env 파일 확인
cat .env | grep DATABASE

# 접속 테스트
mysql -u hots_pod_user -p hots_pod_db

# 방화벽 확인
sudo ufw allow 3306
```

---

### 3. ChromaDB 경로 오류

**문제:**
```bash
PermissionError: [Errno 13] Permission denied: './chroma_db_data'
```

**해결:**
```bash
mkdir -p chroma_db_data
chmod 755 chroma_db_data

# 또는 .env에서 경로 변경
CHROMA_DB_PATH=/var/lib/hots_pod/chroma_db_data
```

---

### 4. SentenceTransformers 다운로드 느림

**문제:**
```bash
# 모델 다운로드 시간 오래 걸림
```

**해결:**
```python
# 수동 다운로드
python -c "from sentence_transformers import SentenceTransformer; SentenceTransformer('jhgan/ko-srobert-multitask')"

# 또는 모델 파일 직접 배치
mkdir -p ~/.cache/torch/sentence_transformers
# 모델 파일 복사
```

---

### 5. RAG Worker 시작 실패

**문제:**
```bash
❌ RAG worker error: No module named 'torch'
```

**해결:**
```bash
# PyTorch 재설치
pip uninstall torch
pip install torch==2.1.1

# CUDA 버전 확인 (GPU 사용 시)
nvidia-smi

# CPU 전용 설치
pip install torch==2.1.1+cpu -f https://download.pytorch.org/whl/torch_stable.html
```

</details>

<details>
<summary><b>성능 이슈</b></summary>

### 1. 느린 RAG 검색

**증상:** 검색 시간 > 2초

**진단:**
```bash
# 로그 확인
tail -f app.log | grep "RAG Search"

# 벡터 DB 카운트 확인
curl http://localhost:8000/rag/health
```

**해결:**
```python
# 1. 벡터 검색 개수 축소
results = self.collection.query(
    query_embeddings=[query_vector],
    n_results=10  # 20 → 10으로 축소
)

# 2. LLM 타임아웃 설정
response = requests.post(
    settings.LLM_API_URL,
    json=data,
    timeout=10  # 30 → 10으로 축소
)

# 3. 캐싱 추가 (Redis)
```

---

### 2. DB 커넥션 부족

**증상:**
```bash
pymysql.err.OperationalError: (1040, 'Too many connections')
```

**해결:**
```python
# database.py 수정
_pool = PooledDB(
    creator=pymysql,
    maxconnections=20,  # 10 → 20으로 증가
    mincached=5,        # 2 → 5로 증가
    maxcached=10,
    ...
)
```

```sql
-- MariaDB 설정 변경
SET GLOBAL max_connections = 200;
```

---

### 3. WebSocket 메모리 누수

**증상:** 서버 메모리 사용량 계속 증가

**진단:**
```python
# websocket.py에 로그 추가
logger.info(f"Active connections: {len(manager.active_connections)}")
```

**해결:**
```python
# 연결 종료 시 정리 강화
async def disconnect(self, websocket, pod_id):
    try:
        self.active_connections[pod_id].remove(websocket)
        await websocket.close()  # 명시적 종료
    except:
        pass
    finally:
        if pod_id in self.active_connections and not self.active_connections[pod_id]:
            del self.active_connections[pod_id]
```

</details>

<details>
<summary><b>보안 이슈</b></summary>

### 1. JWT 토큰 탈취

**증상:** 다른 사용자가 내 계정으로 접근

**해결:**
```python
# 1. 토큰 만료 시간 단축
JWT_ACCESS_TOKEN_EXPIRE_MINUTES=15  # 30 → 15

# 2. Refresh Token 추가
def create_refresh_token(data: dict):
    expire = datetime.utcnow() + timedelta(days=7)
    to_encode = data.copy()
    to_encode.update({"exp": expire, "type": "refresh"})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

# 3. IP 검증
@router.get("/protected")
async def protected(request: Request, user_id: int = Depends(get_current_user_id)):
    stored_ip = redis_client.get(f"user:{user_id}:ip")
    if stored_ip != request.client.host:
        raise HTTPException(401, "IP mismatch")
```

---

### 2. SQL Injection 재확인

**테스트:**
```bash
# 공격 시도
curl -X POST http://localhost:8000/comments/ \
  -H "Content-Type: application/json" \
  -d '{"pod_id":1,"user_id":1,"content":"'; DROP TABLE User; --"}'

# 결과 확인
mysql -u hots_pod_user -p hots_pod_db -e "SHOW TABLES;"
```

**예방:**
```python
# 모든 Repository에서 확인
# ✅ 이렇게 되어있는지 확인
cursor.execute(sql, (param1, param2))

# ❌ 이런 코드 절대 없어야 함
cursor.execute(f"SELECT * FROM ... WHERE id = {user_input}")
```

</details>

---

## 🤝 기여 가이드

<details>
<summary><b>개발 환경 설정</b></summary>

### 1. Fork 및 Clone

```bash
# 1. GitHub에서 Fork
# 2. Clone
git clone https://github.com/yourusername/hots-pod-project.git
cd hots-pod-project/backend

# 3. Upstream 추가
git remote add upstream https://github.com/original/hots-pod-project.git
```

### 2. 브랜치 생성

```bash
# 기능 개발
git checkout -b feature/add-notification-system

# 버그 수정
git checkout -b fix/rag-search-timeout

# 문서 수정
git checkout -b docs/update-readme
```

### 3. 코드 스타일

```bash
# Black (자동 포매팅)
pip install black
black app/

# Flake8 (린팅)
pip install flake8
flake8 app/ --max-line-length=120

# isort (import 정렬)
pip install isort
isort app/
```

### 4. 테스트 작성

```python
# tests/test_user_service.py
import pytest
from app.service.user.user_service import UserService

def test_create_user():
    # Given
    mock_repo = MockUserCommandRepository()
    service = UserService(mock_repo, None)
    
    # When
    user_id = service.create_user({"username": "test"})
    
    # Then
    assert user_id > 0
```

### 5. 커밋 메시지 규칙

```bash
# 형식
<type>: <subject>

<body>

<footer>

# 타입
feat: 새로운 기능
fix: 버그 수정
docs: 문서 수정
style: 코드 포매팅
refactor: 리팩토링
test: 테스트 추가
chore: 빌드/설정 변경

# 예시
feat: Add notification system

- Implement NotificationService
- Add push notification API
- Integrate with FCM

Closes #123
```

### 6. Pull Request

```bash
# 1. 커밋
git add .
git commit -m "feat: Add notification system"

# 2. 푸시
git push origin feature/add-notification-system

# 3. GitHub에서 PR 생성
```

**PR 체크리스트:**
- [ ] 테스트 작성 완료
- [ ] 문서 업데이트 완료
- [ ] 코드 스타일 준수
- [ ] 기존 테스트 통과
- [ ] 리뷰어 지정

</details>

<details>
<summary><b>코드 리뷰 가이드</b></summary>

### 리뷰 시 확인 사항

**1. 아키텍처:**
- [ ] 계층 분리 준수 (Controller → Service → Repository)
- [ ] CQRS 패턴 적용 (Command/Query 분리)
- [ ] 의존성 방향 올바름

**2. 보안:**
- [ ] SQL Injection 방지 (Parameterized Query)
- [ ] 입력 검증 (Pydantic)
- [ ] 인증/인가 적용

**3. 성능:**
- [ ] N+1 쿼리 없음
- [ ] 적절한 인덱스 사용
- [ ] 불필요한 데이터 로드 없음

**4. 테스트:**
- [ ] 단위 테스트 작성
- [ ] 통합 테스트 작성 (선택)
- [ ] 커버리지 80% 이상

**5. 문서:**
- [ ] Docstring 작성
- [ ] README 업데이트
- [ ] API 문서 생성 (Swagger)

</details>

---

## 📊 프로젝트 통계

<details>
<summary><b>코드 메트릭스</b></summary>

### 파일 수

| 카테고리 | 개수 |
|---------|------|
| Controller | 7개 |
| Service | 7개 |
| Repository | 14개 (Command + Query) |
| Schemas | 7개 |
| 총 Python 파일 | ~40개 |
| 총 라인 수 | ~5,000줄 |

### 데이터베이스

| 항목 | 개수 |
|------|------|
| 테이블 | 10개 |
| 트리거 | 3개 |
| 저장 프로시저 | 4개 |
| 인덱스 | 15개+ |

### API 엔드포인트

| 모듈 | 엔드포인트 수 |
|------|--------------|
| User | 3개 |
| Pod | 4개 |
| OAuth | 3개 |
| RAG | 2개 |
| Comment | 4개 |
| Chat | 2개 |
| PodMember | 6개 |
| WebSocket | 1개 |
| **총합** | **25개** |

</details>

---

## 📚 추가 자료

<details>
<summary><b>관련 문서</b></summary>

### 공식 문서

- [FastAPI 공식 문서](https://fastapi.tiangolo.com/)
- [Pydantic 문서](https://docs.pydantic.dev/)
- [MariaDB 문서](https://mariadb.org/documentation/)
- [ChromaDB 문서](https://docs.trychroma.com/)
- [Sentence Transformers](https://www.sbert.net/)

### 참고 자료

- [Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [CQRS Pattern](https://martinfowler.com/bliki/CQRS.html)
- [RAG (Retrieval-Augmented Generation)](https://arxiv.org/abs/2005.11401)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)

### 튜토리얼

- [FastAPI Tutorial](https://fastapi.tiangolo.com/tutorial/)
- [Python Async/Await](https://realpython.com/async-io-python/)
- [WebSocket 가이드](https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API)

</details>

---

## 🗺️ 로드맵

<details>
<summary><b>향후 계획</b></summary>

### v3.1.0 (2025 Q1)

- [ ] Redis 캐싱 추가
- [ ] Rate Limiting 구현
- [ ] Refresh Token 지원
- [ ] 파일 업로드 (프로필 사진, Pod 이미지)

### v3.2.0 (2025 Q2)

- [ ] 알림 시스템 (FCM)
- [ ] 이메일 인증
- [ ] 소셜 공유 (카카오톡, 페이스북)
- [ ] 관리자 대시보드

### v4.0.0 (2025 Q3)

- [ ] 결제 시스템 (토스페이먼츠)
- [ ] 리뷰 시스템
- [ ] AI 추천 알고리즘
- [ ] 마이크로서비스 분리

</details>

---

## 📞 문의 및 지원

<details>
<summary><b>연락처</b></summary>

### 버그 리포트

```markdown
**환경:**
- OS: Ubuntu 22.04
- Python: 3.11.5
- MariaDB: 10.11.2

**재현 방법:**
1. `/pods/` 엔드포인트 호출
2. category_ids에 빈 배열 전달
3. 500 에러 발생

**예상 동작:**
400 Bad Request 반환

**실제 동작:**
500 Internal Server Error

**로그:**
[첨부 파일]
```

</details>

---

## 📄 라이선스

```
Apache License
```

---

<div align="center">

**Made with ❤️ by LxNx-Hn, Lh7721004**

⭐ 이 프로젝트가 도움이 되셨다면 Star를 눌러주세요!

[맨 위로 가기](#hots-pod---ai-기반-오프라인-소모임-플랫폼)

</div>
