# app/core/config.py
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
    DATABASE_HOST: str = "127.0.0.1"
    DATABASE_PORT: int = 3306
    DATABASE_USER: str = "hots_pod_user"
    DATABASE_PASSWORD: str = "change-me"
    DATABASE_NAME: str = "hots_pod_db"

    # Kakao OAuth
    KAKAO_REST_API_KEY: Optional[str] = None
    KAKAO_REDIRECT_URI: Optional[str] = None
    KAKAO_CLIENT_SECRET: Optional[str] = None
    VITE_API_BASE_URL: Optional[str] = None

    # JWT
    JWT_SECRET_KEY: str = "change-this-in-production"
    JWT_ALGORITHM: str = "HS256"
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    # LLM / RAG
    LLM_PROVIDER: str = "DISABLED"
    #API / LOCAL /DISABLED

    # API 모드 설정
    LLM_API_KEY: Optional[str] = None
    LLM_API_URL: Optional[str] = None
    LLM_MODEL_NAME: Optional[str] = None
    
    # LOCAL 모드 설정
    LOCAL_LLM_MODEL_NAME: Optional[str] = None
    LOCAL_LLM_DEVICE: str = "auto"
    LOCAL_LLM_LOAD_IN_8BIT: bool = True

    # Vector DB & Embedding
    CHROMA_DB_PATH: str = "./chroma_db_data"
    EMBEDDING_MODEL_NAME: Optional[str] = None

    # 경주시 주요 지역 키워드
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

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"

settings = Settings()