import os
from typing import Optional, List
from pydantic_settings import BaseSettings
from dotenv import load_dotenv

load_dotenv()

class Settings(BaseSettings):
    # App
    APP_NAME: str = "Hot's POD"
    APP_VERSION: str = "3.0.0"
    DEBUG: bool = False

    # Database
    DATABASE_HOST: str
    DATABASE_PORT: int = 3306
    DATABASE_USER: str
    DATABASE_PASSWORD: str
    DATABASE_NAME: str

    # Kakao OAuth
    KAKAO_REST_API_KEY: Optional[str] = None
    KAKAO_REDIRECT_URI: Optional[str] = None
    KAKAO_CLIENT_SECRET: Optional[str] = None
    VITE_API_BASE_URL: Optional[str] = None

    # Frontend URL
    FRONTEND_URL: str = "http://localhost:5173"
    
    # Cookie Domain (크로스 도메인 쿠키 공유용, 예: ".runpod.net" 또는 None)
    COOKIE_DOMAIN: Optional[str] = None

    JWT_SECRET_KEY: str
    JWT_ALGORITHM: str = "HS256"
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    # LLM & Embedding Models
    LOCAL_LLM_MODEL_NAME: str = "K-intelligence/Midm-2.0-Mini-Instruct"
    EMBEDDING_MODEL_NAME: str = "jhgan/ko-sroberta-multitask"

    # Vector DB
    CHROMA_DB_PATH: str = "./chroma_db_data"

    # 경주시 주요 지역 키워드 - 코드에서만 관리 (설정 아님)
    PLACE_KEYWORDS: List[str] = [
        '황성동', '석장동', '성건동', '용강동', '월성동',
        '교동', '구황동', '남산동', '도지동', '동방동',
        '배반동', '보문동',
        '경주역', '경주시외버스터미널', '경주고속버스터미널',
        '보문관광단지', '보문단지', '불국사', '석굴암',
        '첨성대', '대릉원', '안압지', '동궁과월지',
        '황리단길', '경주월드', '경주타워',
        '동국대', '동국대학교', '서라벌대', '위덕대',
        '감포읍', '안강읍', '건천읍', '외동읍',
        '양북면', '양남면', '내남면', '산내면'
    ]
    
    # Optional services
    REDIS_ENABLED: bool = False
    REDIS_HOST: Optional[str] = None
    REDIS_PORT: Optional[int] = None

    # Feature flags
    FEATURE_RAG_ENABLED: bool = True
    FEATURE_RATE_LIMITING: bool = False

    # CORS
    CORS_ORIGINS: Optional[str] = None
    
    # Netlify Production Domains (하드코딩)
    NETLIFY_DOMAINS: List[str] = [
        "https://hot-s-pod.netlify.app",
        "https://hotspot.online",
        "https://www.hotspot.online"
    ]

    model_config = {
        "env_file": ".env",
        "env_file_encoding": "utf-8",
        "extra": "ignore",
    }

settings = Settings()