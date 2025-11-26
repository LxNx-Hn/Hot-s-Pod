# Hot's POD - 프로젝트 최종 문서 (v3.6.3)

## 📋 프로젝트 개요

**프로젝트명**: Hot's POD  
**버전**: v3.6.3  
**개발 기간**: 2024.09 - 2025.01  
**개발자**: LxNx-Hn, Lh7721004  
**설명**: AI 자연어 검색 기반 오프라인 소모임(Pod) 플랫폼

---

## 🎯 핵심 기능

### 1. 사용자 관리
- **회원가입/로그인**: Kakao OAuth 2.0 소셜 로그인
- **프로필 관리**: 사용자 정보 조회/수정
- **회원 탈퇴**: 
  - 사용자 삭제 시 관련 데이터 정책:
    - Pod (본인이 생성한 모임) → CASCADE 삭제
    - Chat (채팅 메시지) → CASCADE 삭제
    - Comment (댓글) → SET NULL (탈퇴한 회원으로 표시)
    - Pod_Member (참가 기록) → SET NULL
    - Log (로그) → SET NULL

### 2. Pod(소모임) 관리
- **Pod 생성**: 제목, 내용, 장소, 시간, 카테고리 설정
- **Pod 조회**: 
  - 전체 목록 조회 (페이지네이션)
  - 상세 정보 조회
  - 검색 기능 (키워드, 카테고리, 장소)
- **Pod 수정**: **호스트 본인만 가능** (관리자도 본인 Pod만 수정)
- **Pod 삭제**: 호스트 또는 관리자 가능 (관리자는 모든 Pod 삭제 가능)
- **Pod 참가**: 즉시 참가 시스템 (승인 없음)

### 3. AI 검색 (RAG)
- **자연어 검색**: "강남에서 러닝하는 모임 있어?"
- **하이브리드 검색**:
  1. 키워드 분석 (장소, 카테고리)
  2. 벡터 유사도 검색 (ChromaDB)
  3. RDB 필터링 (MariaDB)
- **자동 벡터화**: Pod 생성/수정 시 자동으로 임베딩 생성
- **LLM 답변 생성**: 자연스러운 한국어 답변

### 4. 댓글 시스템
- **계층 구조**: 대댓글 지원 (무제한 depth)
- **댓글 작성**: Pod에 댓글 작성
- **댓글 수정**: **본인만 가능** (관리자도 타인 댓글 수정 불가)
- **댓글 삭제**: 
  - 본인 또는 관리자 가능
  - **소프트 삭제**: 대댓글이 있으면 "[삭제된 댓글입니다]" 표시 + user_id NULL
  - **완전 삭제**: 대댓글이 없으면 DB에서 삭제
- **수정 표시**: 수정된 댓글에 "(수정됨)" 표시
- **탈퇴 회원 처리**: 탈퇴한 사용자의 댓글은 "탈퇴한 회원"으로 표시

### 5. 실시간 채팅
- **WebSocket**: Pod별 독립적인 채팅방
- **메시지 저장**: 모든 메시지 DB에 영구 저장
- **실시간 브로드캐스팅**: 같은 Pod의 모든 사용자에게 즉시 전송

### 6. 마이페이지
- **내 정보**: 프로필 조회/수정
- **내가 만든 Pod**: 호스트로 있는 Pod 목록
- **참가 중인 Pod**: 멤버로 참가한 Pod 목록
- **회원 탈퇴**: 계정 삭제

---

## 🛠️ 기술 스택

### Backend
- **언어**: Python 3.11+
- **프레임워크**: FastAPI 0.104.1
- **ASGI 서버**: Uvicorn 0.24.0
- **데이터베이스**: MariaDB 10.6+
- **벡터 DB**: ChromaDB 0.4.18
- **AI/ML**: 
  - Sentence Transformers (jhgan/ko-srobert-multitask)
  - PyTorch
- **인증**: python-jose (JWT)
- **커넥션 풀**: DBUtils 3.0.3

### Frontend
- **언어**: JavaScript (ES6+)
- **라이브러리**: React 18.3+
- **빌드 도구**: Vite
- **스타일링**: Tailwind CSS
- **상태 관리**: Redux Toolkit
- **HTTP 클라이언트**: Axios
- **라우팅**: React Router

### 배포
- **플랫폼**: Netlify (Frontend), 자체 서버 (Backend)
- **컨테이너**: Docker (선택)

---

## 📊 데이터베이스 스키마

### 주요 테이블

#### 1. User (사용자)
```sql
CREATE TABLE `user` (
  `user_id` INT NOT NULL AUTO_INCREMENT,
  `username` VARCHAR(100) NOT NULL,
  `phonenumber` VARCHAR(20) NULL,
  `is_admin` BOOLEAN DEFAULT FALSE,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`user_id`)
);
```

#### 2. Pod (소모임)
```sql
CREATE TABLE `pod` (
  `pod_id` INT NOT NULL AUTO_INCREMENT,
  `host_user_id` INT NOT NULL,
  `event_time` DATETIME NOT NULL,
  `place` VARCHAR(255) NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `content` TEXT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`pod_id`),
  FOREIGN KEY (`host_user_id`) REFERENCES `user`(`user_id`) ON DELETE CASCADE
);
```

#### 3. Comment (댓글)
```sql
CREATE TABLE `comment` (
  `comment_id` INT NOT NULL AUTO_INCREMENT,
  `pod_id` INT NOT NULL,
  `user_id` INT NULL,  -- NULL 허용 (소프트 삭제)
  `content` TEXT NOT NULL,
  `parent_comment_id` INT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`comment_id`),
  FOREIGN KEY (`pod_id`) REFERENCES `pod`(`pod_id`) ON DELETE CASCADE,
  FOREIGN KEY (`user_id`) REFERENCES `user`(`user_id`) ON DELETE SET NULL,
  FOREIGN KEY (`parent_comment_id`) REFERENCES `comment`(`comment_id`) ON DELETE CASCADE
);
```

#### 4. Chat (채팅)
```sql
CREATE TABLE `chat` (
  `chat_id` BIGINT NOT NULL AUTO_INCREMENT,
  `pod_id` INT NOT NULL,
  `user_id` INT NOT NULL,
  `content` TEXT NULL,
  `time` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`chat_id`),
  FOREIGN KEY (`pod_id`) REFERENCES `pod`(`pod_id`) ON DELETE CASCADE,
  FOREIGN KEY (`user_id`) REFERENCES `user`(`user_id`) ON DELETE CASCADE
);
```

#### 5. Pod_Member (참가 기록)
```sql
CREATE TABLE `pod_member` (
  `pod_member_id` INT NOT NULL AUTO_INCREMENT,
  `user_id` INT NULL,
  `pod_id` INT NOT NULL,
  `joined_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`pod_member_id`),
  FOREIGN KEY (`user_id`) REFERENCES `user`(`user_id`) ON DELETE SET NULL,
  FOREIGN KEY (`pod_id`) REFERENCES `pod`(`pod_id`) ON DELETE CASCADE
);
```

### CASCADE 정책 요약
| 테이블 | user_id 삭제 시 | pod_id 삭제 시 |
|--------|-----------------|----------------|
| Pod | CASCADE (Pod 삭제) | - |
| Chat | CASCADE (채팅 삭제) | CASCADE (채팅 삭제) |
| Comment | SET NULL (탈퇴 회원 표시) | CASCADE (댓글 삭제) |
| Pod_Member | SET NULL | CASCADE (참가 기록 삭제) |
| Log | SET NULL | - |

---

## 🔐 권한 시스템

### 권한 레벨
1. **일반 사용자**: Pod 조회, 참가, 댓글 작성
2. **Pod 호스트**: 본인 Pod 수정/삭제, 멤버 관리
3. **관리자**: 모든 Pod 삭제, 모든 댓글 삭제 (수정은 불가)

### 권한 규칙

| 기능 | 일반 사용자 | 호스트 | 관리자 |
|------|------------|--------|--------|
| Pod 생성 | ✅ | ✅ | ✅ |
| Pod 조회 | ✅ | ✅ | ✅ |
| Pod 수정 | ❌ | ✅ (본인만) | ❌ (본인만) |
| Pod 삭제 | ❌ | ✅ (본인만) | ✅ (전체) |
| 댓글 작성 | ✅ | ✅ | ✅ |
| 댓글 수정 | ✅ (본인만) | ✅ (본인만) | ❌ (본인만) |
| 댓글 삭제 | ✅ (본인만) | ✅ (본인만) | ✅ (전체) |
| 회원 탈퇴 | ✅ (본인만) | ✅ (본인만) | ✅ (본인만) |

### 권한 검증 함수

#### require_host_or_admin (호스트 또는 관리자)
```python
def require_host_or_admin(db: Connection, pod_id: int, user_id: int):
    """Pod 호스트 또는 관리자 권한 확인"""
    # Pod 삭제에 사용
```

#### require_owner_or_admin (본인 또는 관리자)
```python
def require_owner_or_admin(db: Connection, resource_user_id: int, current_user_id: int):
    """리소스 소유자 또는 관리자 권한 확인"""
    # 댓글 삭제에 사용
```

#### 호스트 본인만 (Pod 수정)
```python
# Pod 수정은 별도 로직으로 호스트 본인만 체크
if pod.host_user_id != user_id:
    raise HTTPException(403, "호스트만 Pod를 수정할 수 있습니다")
```

---

## 🕐 시간대 처리

### 문제 상황 (해결됨)
- **이슈**: 댓글 시간이 9시간 전으로 표시
- **원인**: DB가 UTC로 저장, 프론트엔드는 KST로 해석
- **해결**: DB 연결 시 시간대를 KST(+09:00)로 설정

### 해결 방법

#### Backend (database.py)
```python
setsession=['SET time_zone = "+09:00"']  # KST 시간대 설정
```

#### Frontend (time.js)
```javascript
export function toSeoulDate(input) {
  if (!input && input !== 0) return new Date();
  if (input instanceof Date) return input;
  const str = String(input);

  // Z나 +/-HH:MM 있으면 그대로 파싱
  if (/[zZ]$/.test(str) || /[+\-]\d{2}:?\d{2}$/.test(str)) {
    return new Date(str);
  }

  // YYYY-MM-DD HH:MM:SS 형식이면 +09:00 추가
  const isoLike = str.replace(' ', 'T');
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/.test(isoLike)) {
    return new Date(isoLike + '+09:00');
  }

  return new Date(str);
}
```

#### Frontend (podDetail/index.jsx)
```javascript
const time_delta_string = (string_time) => {
  const createdAt = toSeoulDate(string_time);  // DB 시간을 KST로 파싱
  const now = new Date();  // 브라우저 로컬 시간 (KST)
  const timeDelta = (now.getTime() - createdAt.getTime())/1000;
  
  // 계산 로직...
};
```

### 동작 흐름
```
1. DB 저장: CURRENT_TIMESTAMP → MariaDB가 KST로 저장
2. DB 조회: SELECT created_at → KST로 반환 (setsession 덕분)
3. 프론트엔드: toSeoulDate로 KST 파싱
4. 시간 계산: now (KST) - createdAt (KST) = 정확한 시간차
```

---

## 🚀 API 엔드포인트

### User API
| Method | Endpoint | 설명 | 인증 |
|--------|----------|------|------|
| POST | `/users/` | 사용자 생성 | ❌ |
| GET | `/users/me` | 현재 사용자 조회 | ✅ |
| GET | `/users/{user_id}` | 사용자 조회 | ❌ |
| PUT | `/users/me` | 사용자 정보 수정 | ✅ |
| DELETE | `/users/me` | 회원 탈퇴 | ✅ |

### OAuth API
| Method | Endpoint | 설명 | 인증 |
|--------|----------|------|------|
| GET | `/oauth/kakao/login` | 카카오 로그인 페이지 | ❌ |
| GET | `/oauth/kakao/callback` | 카카오 콜백 (자동) | ❌ |
| POST | `/oauth/refresh` | 토큰 갱신 | ✅ |
| POST | `/oauth/logout` | 로그아웃 | ✅ |

### Pod API
| Method | Endpoint | 설명 | 인증 |
|--------|----------|------|------|
| POST | `/pods/` | Pod 생성 | ✅ |
| GET | `/pods/` | Pod 목록 조회 | ❌ |
| GET | `/pods/search` | Pod 검색 | ❌ |
| GET | `/pods/detail/{pod_id}` | Pod 상세 조회 | ❌ |
| POST | `/pods/{pod_id}/join` | Pod 참가 | ✅ |
| PUT | `/pods/{pod_id}` | Pod 수정 (호스트만) | ✅ |
| DELETE | `/pods/{pod_id}` | Pod 삭제 (호스트/관리자) | ✅ |

### Comment API
| Method | Endpoint | 설명 | 인증 |
|--------|----------|------|------|
| POST | `/comments/` | 댓글 작성 | ✅ |
| GET | `/comments/pod/{pod_id}` | Pod 댓글 조회 | ❌ |
| GET | `/comments/{comment_id}` | 댓글 조회 | ❌ |
| PUT | `/comments/{comment_id}` | 댓글 수정 (본인만) | ✅ |
| DELETE | `/comments/{comment_id}` | 댓글 삭제 (본인/관리자) | ✅ |

### RAG API
| Method | Endpoint | 설명 | 인증 |
|--------|----------|------|------|
| POST | `/rag/search` | AI 자연어 검색 | ❌ |
| GET | `/rag/health` | RAG 시스템 상태 | ❌ |

### Chat API
| Method | Endpoint | 설명 | 인증 |
|--------|----------|------|------|
| POST | `/chat/` | 채팅 메시지 저장 | ✅ |
| GET | `/chat/pod/{pod_id}` | Pod 채팅 기록 조회 | ✅ |

### WebSocket
| Endpoint | 설명 | 인증 |
|----------|------|------|
| WS `/ws/chat/{pod_id}` | 실시간 채팅 연결 | ❌ |

### Pod Member API
| Method | Endpoint | 설명 | 인증 |
|--------|----------|------|------|
| POST | `/pod-members/join` | Pod 참가 | ✅ |
| DELETE | `/pod-members/{pod_id}/{user_id}` | Pod 탈퇴 | ✅ |
| GET | `/pod-members/pod/{pod_id}` | Pod 멤버 목록 | ❌ |
| GET | `/pod-members/user/{user_id}` | 사용자 참가 Pod | ❌ |
| GET | `/pod-members/host/{host_id}` | 호스트 Pod 목록 | ❌ |
| GET | `/pod-members/pod/{pod_id}/count` | Pod 멤버 수 | ❌ |
| GET | `/pod-members/pod/{pod_id}/user/{user_id}/is-member` | 참가 여부 확인 | ❌ |

---

## 📁 프로젝트 구조

```
Hot-s-Pod/
├── Backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py                    # FastAPI 진입점
│   │   ├── database.py                # DB 커넥션 풀 (KST 설정)
│   │   ├── core/
│   │   │   └── config.py              # 환경 변수
│   │   ├── utils/
│   │   │   ├── auth.py                # JWT 유틸
│   │   │   ├── permissions.py         # 권한 검증
│   │   │   └── cookies.py             # 쿠키 관리
│   │   ├── ddl/
│   │   │   └── DDL.py                 # DB 스키마
│   │   ├── schemas/                   # Pydantic 모델
│   │   │   ├── user.py
│   │   │   ├── pod.py
│   │   │   ├── comment.py
│   │   │   ├── chat.py
│   │   │   ├── oauth.py
│   │   │   ├── rag.py
│   │   │   └── pod_member.py
│   │   ├── repository/                # 데이터 접근 (CQRS)
│   │   │   ├── user/
│   │   │   │   ├── user_command_repository.py
│   │   │   │   └── user_query_repository.py
│   │   │   ├── pod/
│   │   │   ├── comment/
│   │   │   ├── chat/
│   │   │   ├── oauth/
│   │   │   ├── rag/
│   │   │   └── pod_member/
│   │   ├── service/                   # 비즈니스 로직
│   │   │   ├── user/
│   │   │   │   └── user_service.py
│   │   │   ├── pod/
│   │   │   ├── comment/
│   │   │   ├── chat/
│   │   │   ├── oauth/
│   │   │   ├── rag/
│   │   │   │   ├── rag_service.py
│   │   │   │   └── rag_worker_service.py
│   │   │   └── pod_member/
│   │   ├── controller/                # API 엔드포인트
│   │   │   ├── user/
│   │   │   │   └── user_controller.py
│   │   │   ├── pod/
│   │   │   │   └── pod_controller.py
│   │   │   ├── comment/
│   │   │   │   └── comment_controller.py
│   │   │   ├── chat/
│   │   │   ├── oauth/
│   │   │   ├── rag/
│   │   │   ├── pod_member/
│   │   │   └── debug_controller.py
│   │   └── socket/
│   │       └── websocket.py           # WebSocket 채팅
│   ├── models/
│   │   ├── embedding_model.py
│   │   └── llm_model.py
│   ├── chroma_db_data/                # 벡터 DB 저장소
│   ├── init_db.py                     # DB 초기화
│   ├── requirements.txt
│   └── Dockerfile
│
├── Frontend/
│   ├── pages/
│   │   ├── login/
│   │   │   └── index.jsx              # 로그인 페이지
│   │   ├── main/
│   │   │   └── index.jsx              # 메인 페이지
│   │   ├── search/
│   │   │   └── index.jsx              # 검색 페이지
│   │   ├── podDetail/
│   │   │   └── index.jsx              # Pod 상세 + 채팅
│   │   ├── myPage/
│   │   │   └── index.jsx              # 마이페이지
│   │   ├── myPods/
│   │   │   └── index.jsx              # 내 Pod 관리
│   │   └── oauth/
│   │       └── callback.jsx           # OAuth 콜백
│   ├── src/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   ├── api/
│   │   │   ├── api.js                 # API 클라이언트
│   │   │   └── logout.js
│   │   ├── components/
│   │   │   ├── common/                # 공통 컴포넌트
│   │   │   ├── pod/                   # Pod 관련 컴포넌트
│   │   │   └── units/                 # UI 유닛
│   │   ├── queries/                   # React Query 훅
│   │   │   ├── useMe.js
│   │   │   ├── useMessage.js
│   │   │   ├── useCreatePod.js
│   │   │   ├── usePodJoin.js
│   │   │   └── usePodLeave.js
│   │   ├── utils/
│   │   │   └── time.js                # 시간 유틸 (toSeoulDate)
│   │   └── images/
│   ├── redux/
│   │   ├── store.js
│   │   └── slices/
│   │       ├── userSlice.js
│   │       ├── podSlice.js
│   │       ├── chatSlice.js
│   │       └── commentSlice.js
│   ├── styles/
│   │   └── global.css
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
│
├── netlify/
│   └── functions/
│       └── proxy.js                   # Netlify 프록시
├── .github/
│   └── workflows/
│       └── deploy.yml                 # CI/CD (선택)
├── README.md
├── LICENSE
└── netlify.toml
```

---

## 🏗️ 아키텍처 패턴

### 1. 계층 구조 (Layered Architecture)
```
Controller (API) → Service (비즈니스 로직) → Repository (데이터 접근) → Database
```

### 2. CQRS (Command Query Responsibility Segregation)
- **Command Repository**: 쓰기 작업 (INSERT, UPDATE, DELETE)
- **Query Repository**: 읽기 작업 (SELECT)

**장점:**
- 읽기/쓰기 독립적 최적화
- 확장성 향상
- 테스트 용이

### 3. 의존성 주입 (Dependency Injection)
```python
@router.get("/pods/{pod_id}")
async def get_pod(
    pod_id: int,
    pod_service: PodService = Depends(get_pod_service)  # DI
):
    return pod_service.get_pod(pod_id)
```

---

## 🔧 환경 변수 (.env)

```bash
# MariaDB
DATABASE_HOST=127.0.0.1
DATABASE_PORT=3306
DATABASE_USER=hots_pod_user
DATABASE_PASSWORD=your_password_here
DATABASE_NAME=hots_pod_db

# Kakao OAuth
KAKAO_REST_API_KEY=your_kakao_rest_api_key
KAKAO_REDIRECT_URI=http://localhost:8000/oauth/kakao/callback
KAKAO_CLIENT_SECRET=

# JWT
JWT_SECRET_KEY=your-secret-key-change-this
JWT_ALGORITHM=HS256
JWT_ACCESS_TOKEN_EXPIRE_MINUTES=30

# AI (선택)
LLM_PROVIDER=API
LLM_API_KEY=sk-your-api-key
LLM_API_URL=https://api.friendly-ai.com/v1/chat/completions

# Vector DB
CHROMA_DB_PATH=./chroma_db_data
EMBEDDING_MODEL_NAME=jhgan/ko-srobert-multitask
```

---

## 🚀 배포 가이드

### 1. 로컬 개발 환경

#### Backend
```bash
# 1. 가상 환경 생성
cd Backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# 2. 의존성 설치
pip install -r requirements.txt

# 3. DB 초기화
python init_db.py

# 4. 서버 실행
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

#### Frontend
```bash
# 1. 의존성 설치
cd Frontend
npm install

# 2. 개발 서버 실행
npm run dev

# 3. 빌드
npm run build
```

### 2. 프로덕션 배포

#### Backend (Docker)
```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY ./app /app/app
EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

```bash
docker build -t hotspod-backend .
docker run -d -p 8000:8000 --env-file .env hotspod-backend
```

#### Frontend (Netlify)
```toml
# netlify.toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

---

## 🐛 알려진 이슈 및 해결 방법

### 1. 댓글 시간 9시간 오차 ✅ 해결됨
- **문제**: 댓글 시간이 9시간 전으로 표시
- **원인**: DB 시간대 미설정
- **해결**: `database.py`에서 `setsession=['SET time_zone = "+09:00"']` 추가
- **버전**: v3.6.3에서 수정

### 2. 대댓글 삭제 시 에러 ✅ 해결됨
- **문제**: `IntegrityError: Column 'user_id' cannot be null`
- **원인**: DDL에서 `user_id INT NOT NULL`로 설정
- **해결**: `user_id INT NULL`로 변경하여 소프트 삭제 지원
- **버전**: v3.6.2에서 수정

### 3. Pod 수정 권한 혼란 ✅ 해결됨
- **문제**: 관리자가 모든 Pod 수정 가능
- **원인**: `require_host_or_admin` 사용
- **해결**: Pod 수정은 호스트 본인만 가능하도록 로직 변경
- **버전**: v3.6.2에서 수정

---

## 📈 버전 히스토리

### v3.6.3 (2025-01-18)
- ✅ DB 시간대를 KST(+09:00)로 설정
- ✅ 댓글 시간 표시 9시간 오차 완전 해결

### v3.6.2 (2025-01-18)
- ✅ `comment.user_id` NULL 허용 (소프트 삭제)
- ✅ Pod 수정 권한: 호스트 본인만
- ✅ Pod 삭제 권한: 호스트 또는 관리자
- ✅ 댓글 시간 표시 로직 개선 시도

### v3.6.0 (2025-01-17)
- ✅ 회원 탈퇴 기능 추가
- ✅ Pod 수정 기능 추가
- ✅ 댓글 수정 UI 개선
- ✅ 수정된 댓글 표시 기능
- ✅ 탈퇴 회원 처리 (LEFT JOIN)
- ✅ MyPod 캐시 무효화

### v3.0.0 ~ v3.5.0
- RAG 기반 AI 검색 시스템 구현
- WebSocket 실시간 채팅 구현
- Kakao OAuth 로그인 통합
- 댓글 계층 구조 구현
- CQRS 패턴 적용

---

## 🧪 테스트

### 수동 테스트 체크리스트

#### 1. 사용자 관리
- [ ] 카카오 로그인
- [ ] 프로필 조회
- [ ] 프로필 수정
- [ ] 회원 탈퇴
- [ ] 탈퇴 후 댓글 "탈퇴한 회원" 표시 확인

#### 2. Pod 관리
- [ ] Pod 생성
- [ ] Pod 목록 조회
- [ ] Pod 상세 조회
- [ ] Pod 검색 (키워드, 카테고리)
- [ ] Pod 수정 (호스트 본인만)
- [ ] Pod 삭제 (호스트 또는 관리자)
- [ ] Pod 참가

#### 3. 댓글
- [ ] 댓글 작성
- [ ] 대댓글 작성
- [ ] 댓글 수정 (본인만)
- [ ] 댓글 삭제 (대댓글 있음 → 소프트 삭제)
- [ ] 댓글 삭제 (대댓글 없음 → 완전 삭제)
- [ ] 관리자 댓글 삭제
- [ ] 수정된 댓글 "(수정됨)" 표시 확인
- [ ] **댓글 시간 표시 정확도 확인** (9시간 오차 없음)

#### 4. 채팅
- [ ] 채팅방 연결
- [ ] 메시지 전송
- [ ] 실시간 수신
- [ ] 채팅 기록 조회

#### 5. AI 검색
- [ ] 자연어 검색
- [ ] 검색 결과 정확도
- [ ] LLM 답변 품질

---

## 📞 문의 및 기여

### 개발자
- **LxNx-Hn**: [GitHub](https://github.com/LxNx-Hn)
- **Lh7721004**: [GitHub](https://github.com/Lh7721004)

### 버그 리포트
GitHub Issues에 다음 정보 포함:
1. 환경 (OS, Python/Node 버전)
2. 재현 방법
3. 예상 동작 vs 실제 동작
4. 로그/스크린샷

### 기여 방법
1. Fork 프로젝트
2. Feature 브랜치 생성 (`git checkout -b feature/AmazingFeature`)
3. 커밋 (`git commit -m 'feat: Add AmazingFeature'`)
4. 푸시 (`git push origin feature/AmazingFeature`)
5. Pull Request 생성

---

## 📄 라이선스

Apache License 2.0

---

## ✅ 최종 검증 체크리스트

### Backend
- [x] DB 시간대 KST 설정 (`setsession` 확인)
- [x] `comment.user_id` NULL 허용
- [x] Pod 수정 권한: 호스트 본인만
- [x] Pod 삭제 권한: 호스트 또는 관리자
- [x] 댓글 수정 권한: 본인만
- [x] 댓글 삭제 권한: 본인 또는 관리자
- [x] 소프트 삭제 로직 (대댓글 있음)
- [x] CASCADE 정책 (Pod/Chat 삭제, Comment/Log SET NULL)

### Frontend
- [x] 시간 표시 로직 (`toSeoulDate` + `new Date()`)
- [x] 댓글 수정 UI
- [x] 수정됨 표시
- [x] 탈퇴한 회원 표시
- [x] Pod 수정 모달

### 배포
- [x] v3.6.3 태그 생성
- [x] GitHub 푸시 완료
- [ ] Backend 재배포 (docker restart 또는 재빌드)
- [ ] Frontend 재배포 (Netlify 자동 배포 또는 수동 빌드)
- [ ] 프로덕션 환경 테스트

---

**문서 작성 일시**: 2025-01-18  
**최종 업데이트**: v3.6.3  
**문서 버전**: 1.0.0
