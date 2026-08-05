from typing import Any

import gspread
from google.oauth2.service_account import Credentials
import re
from config import (
    GOOGLE_CREDENTIALS,
    GOOGLE_SHEET_ID,
    GOOGLE_WORKSHEET,
)


SCOPES = [
    "https://www.googleapis.com/auth/spreadsheets",
    "https://www.googleapis.com/auth/drive",
]


def to_number_or_none(value: str) -> int | None:
    """
    Google Sheet의 문자열 값을 숫자로 변환한다.

    빈 값은 None으로 반환한다.
    그래야 프론트에서 '미입력'으로 표시할 수 있다.
    """
    cleaned_value = str(value).strip()

    if cleaned_value == "":
        return None

    try:
        return int(float(cleaned_value))
    except ValueError:
        return None


def to_week_number(value: str) -> int:
    """
    다음 형식에서 주차 숫자를 추출한다.

    예:
    1       -> 1
    1주     -> 1
    1주차   -> 1
    5월1주  -> 1
    6월 3주 -> 3
    """
    cleaned_value = str(value).strip()

    match = re.search(r"(\d+)\s*주(?:차)?", cleaned_value)

    if match:
        return int(match.group(1))

    try:
        return int(cleaned_value)
    except ValueError:
        return 0


def create_achievement_item(
    name: str,
    achievement: str,
) -> dict[str, Any]:
    """
    숙제와 당일평가에서 공통으로 사용하는 구조를 만든다.
    """
    return {
        "name": str(name).strip(),
        "achievement": to_number_or_none(achievement),
    }


def get_worksheet():
    """
    서비스 계정으로 Google Sheet에 접속하고
    지정한 워크시트를 반환한다.
    """
    credentials = Credentials.from_service_account_file(
        GOOGLE_CREDENTIALS,
        scopes=SCOPES,
    )

    client = gspread.authorize(credentials)

    spreadsheet = client.open_by_key(
        GOOGLE_SHEET_ID,
    )

    return spreadsheet.worksheet(
        GOOGLE_WORKSHEET,
    )


def read_students_from_sheet() -> list[dict[str, Any]]:
    """
    Google Sheet 전체 데이터를 읽어서
    React의 LessonRecord 구조로 변환한다.
    """
    worksheet = get_worksheet()

    rows = worksheet.get_all_records(
        default_blank="",
    )

    records: list[dict[str, Any]] = []

    for row in rows:
        number = to_number_or_none(
            row.get("번호", ""),
        )

        student_id = str(
            row.get("학생ID(자동)", ""),
        ).strip()

        record_id = (
            f"R{number:03d}"
            if number is not None
            else student_id
        )

        record = {
            "recordId": record_id,

            "number": number,
            "category": str(
                row.get("구분", ""),
            ).strip(),

            "weekNumber": to_week_number(
                row.get("주차", ""),
            ),
            "weekLabel": str(
                row.get("주차", ""),
            ).strip(),
            "progress": str(
                row.get("진도", ""),
            ).strip(),
            "lessonDate": str(
                row.get("날짜", ""),
            ).strip(),

            "studentId": student_id,
            "studentName": str(
                row.get("학생이름(자동)", ""),
            ).strip(),
            "schoolName": str(
                row.get("소속학교명(자동)", ""),
            ).strip(),
            "grade": str(
                row.get("학년(자동)", ""),
            ).strip(),
            "teacherName": str(
                row.get("담당 선생님", ""),
            ).strip(),

            "homeworks": [
                create_achievement_item(
                    row.get("숙제1", ""),
                    row.get("숙제1 성취도", ""),
                ),
                create_achievement_item(
                    row.get("숙제2", ""),
                    row.get("숙제2 성취도", ""),
                ),
                create_achievement_item(
                    row.get("숙제3", ""),
                    row.get("숙제3 성취도", ""),
                ),
            ],

            "dailyEvaluations": [
                create_achievement_item(
                    row.get("당일1", ""),
                    row.get("당일1 성취도", ""),
                ),
                create_achievement_item(
                    row.get("당일2", ""),
                    row.get("당일2 성취도", ""),
                ),
                create_achievement_item(
                    row.get("당일3", ""),
                    row.get("당일3 성취도", ""),
                ),
            ],

            "homeworkAchievement": to_number_or_none(
                row.get("숙제 성취도(자동)", ""),
            ),
            "homeworkGrade": str(
                row.get("숙제 등급 (자동)", ""),
            ).strip(),

            "dailyAchievement": to_number_or_none(
                row.get("당일 성취도(자동)", ""),
            ),
            "dailyGrade": str(
                row.get("당일 등급(자동)", ""),
            ).strip(),

            "reviewTest": str(
                row.get("복습 테스트", ""),
            ).strip(),
            "reviewQuestionCount": to_number_or_none(
                row.get("복습 문항 개수", ""),
            ),
            "reviewCorrectCount": to_number_or_none(
                row.get("복습 맞은 개수", ""),
            ),
            "reviewTestScore": to_number_or_none(
                row.get("복습 테스트 점수(자동)", ""),
            ),
            "reviewFeedback": str(
                row.get("복습 피드백", ""),
            ).strip(),

            "memorizationClass1": str(
                row.get("암기반1", ""),
            ).strip(),
            "memorizationClass2": str(
                row.get("암기반2", ""),
            ).strip(),
            "memorizationAchievement": (
                str(
                    row.get("암기반 성취도", ""),
                ).strip()
                or None
            ),

            "teacherComment": str(
                row.get("쌤 한마디", ""),
            ).strip(),
            "notice": str(
                row.get("Notice", ""),
            ).strip(),
        }

        records.append(record)

    return records

def update_homework1_achievement(
    record_id: str,
    achievement: int,
) -> dict:
    """
    recordId에 해당하는 행을 찾아
    숙제1 성취도만 수정한다.
    """
    worksheet = get_worksheet()

    rows = worksheet.get_all_records(
        default_blank="",
    )

    for index, row in enumerate(rows, start=2):
        number = to_number_or_none(
            row.get("번호", ""),
        )

        current_record_id = (
            f"R{number:03d}"
            if number is not None
            else str(
                row.get("학생ID(자동)", ""),
            ).strip()
        )

        if current_record_id == record_id:
            headers = worksheet.row_values(1)

            column_index = headers.index(
                "숙제1 성취도",
            ) + 1

            worksheet.update_cell(
                index,
                column_index,
                achievement,
            )

            return {
                "recordId": record_id,
                "homework1Achievement": achievement,
            }

    raise ValueError(
        f"수업 기록을 찾을 수 없습니다: {record_id}"
    )