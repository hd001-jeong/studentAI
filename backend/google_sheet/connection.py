import json

import gspread
from google.oauth2.service_account import Credentials

from config import (
    GOOGLE_CREDENTIALS_FILE,
    GOOGLE_CREDENTIALS_JSON,
    GOOGLE_SHEET_ID,
    GOOGLE_WORKSHEET,
)


SCOPES = [
    "https://www.googleapis.com/auth/spreadsheets",
    "https://www.googleapis.com/auth/drive",
]


# =========================================================
# Google 인증
# =========================================================

def create_google_credentials() -> Credentials:
    """
    배포 환경에서는 환경변수 JSON을 사용하고,
    로컬에서는 서비스 계정 JSON 파일을 사용한다.
    """
    if GOOGLE_CREDENTIALS_JSON:
        credentials_info = json.loads(
            GOOGLE_CREDENTIALS_JSON,
        )

        return Credentials.from_service_account_info(
            credentials_info,
            scopes=SCOPES,
        )

    if not GOOGLE_CREDENTIALS_FILE.exists():
        raise FileNotFoundError(
            "Google 서비스 계정 파일을 찾을 수 없습니다: "
            f"{GOOGLE_CREDENTIALS_FILE}"
        )

    return Credentials.from_service_account_file(
        GOOGLE_CREDENTIALS_FILE,
        scopes=SCOPES,
    )


# =========================================================
# Spreadsheet 연결
# =========================================================

def get_spreadsheet():
    credentials = create_google_credentials()

    client = gspread.authorize(
        credentials,
    )

    return client.open_by_key(
        GOOGLE_SHEET_ID,
    )


def get_worksheet():
    spreadsheet = get_spreadsheet()

    return spreadsheet.worksheet(
        GOOGLE_WORKSHEET,
    )


def get_named_worksheet(
    sheet_name: str,
):
    spreadsheet = get_spreadsheet()

    return spreadsheet.worksheet(
        sheet_name,
    )