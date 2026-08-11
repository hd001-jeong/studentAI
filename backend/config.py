import os
from pathlib import Path


BASE_DIR = Path(__file__).resolve().parent


# 로컬 개발용 서비스 계정 JSON 파일 경로
GOOGLE_CREDENTIALS_FILE = (
    BASE_DIR
    / "credentials"
    / "google-service-account.json"
)


# Render 배포 환경변수에 넣을 서비스 계정 JSON 문자열
GOOGLE_CREDENTIALS_JSON = os.getenv(
    "GOOGLE_CREDENTIALS_JSON",
    "",
)


GOOGLE_SHEET_ID = os.getenv(
    "GOOGLE_SHEET_ID",
    "1IGshnCyIrDllp9E1GaH21WllSVuSpXpmYT7bW0QOmqc",
)


GOOGLE_WORKSHEET = os.getenv(
    "GOOGLE_WORKSHEET",
    "박현민",
)


FRONTEND_URL = os.getenv(
    "FRONTEND_URL",
    "http://localhost:5173",
)