import json
import re
from typing import Any

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


def create_google_credentials() -> Credentials:
    """
    배포 환경에서는 환경변수의 JSON을 사용하고,
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


def get_spreadsheet():
    """
    서비스 계정으로 Google Spreadsheet에 접속한다.

    로컬에서는 서비스 계정 JSON 파일을 사용하고,
    배포 환경에서는 GOOGLE_CREDENTIALS_JSON 환경변수를 사용한다.
    """
    credentials = create_google_credentials()

    client = gspread.authorize(credentials)

    return client.open_by_key(
        GOOGLE_SHEET_ID,
    )


def get_worksheet():
    """
    config.py의 GOOGLE_WORKSHEET에 지정된 기본 워크시트를 반환한다.
    """
    spreadsheet = get_spreadsheet()

    return spreadsheet.worksheet(
        GOOGLE_WORKSHEET,
    )


def get_named_worksheet(sheet_name: str):
    """
    전달받은 이름의 워크시트를 반환한다.
    """
    spreadsheet = get_spreadsheet()

    return spreadsheet.worksheet(sheet_name)


def read_teachers_from_sheet() -> list[dict[str, str]]:
    """
    teachers 워크시트에서 선생님 로그인 정보를 읽는다.
    """
    worksheet = get_named_worksheet("teachers")

    rows = worksheet.get_all_records(
        default_blank="",
    )

    teachers: list[dict[str, str]] = []

    for row in rows:
        teachers.append(
            {
                "teacherCode": str(
                    row.get("teacherCode", ""),
                ).strip(),
                "teacherName": str(
                    row.get("teacherName", ""),
                ).strip(),
                "password": str(
                    row.get("password", ""),
                ).strip(),
                "activeYn": str(
                    row.get("activeYn", ""),
                ).strip(),
            }
        )

    return teachers


def read_students_from_sheet(
    teacher_code: str,
) -> list[dict[str, Any]]:
    """
    Google Sheet 데이터를 읽고,
    로그인한 선생님의 수업 기록만 LessonRecord 구조로 반환한다.
    """
    worksheet = get_worksheet()

    rows = worksheet.get_all_records(
        default_blank="",
    )

    records: list[dict[str, Any]] = []

    cleaned_teacher_code = str(teacher_code).strip()

    for row in rows:
        row_teacher_code = str(
            row.get("선생님코드", ""),
        ).strip()

        # 로그인한 선생님의 데이터가 아니면 제외
        if row_teacher_code != cleaned_teacher_code:
            continue

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
            "teacherCode": row_teacher_code,

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


def update_lesson_record_in_sheet(
    record_id: str,
    record: dict,
) -> dict:
    """
    recordId에 해당하는 한 행의 수업 기록을 수정한다.
    """
    worksheet = get_worksheet()

    rows = worksheet.get_all_records(
        default_blank="",
    )

    headers = worksheet.row_values(1)

    for row_index, row in enumerate(
        rows,
        start=2,
    ):
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

        if current_record_id != record_id:
            continue

        homeworks = record.get(
            "homeworks",
            [],
        )

        daily_evaluations = record.get(
            "dailyEvaluations",
            [],
        )

        values_by_header = {
            "주차": record.get("weekLabel", ""),
            "진도": record.get("progress", ""),
            "날짜": record.get("lessonDate", ""),

            "숙제1": (
                homeworks[0].get("name", "")
                if len(homeworks) > 0
                else ""
            ),
            "숙제1 성취도": (
                homeworks[0].get("achievement", "")
                if len(homeworks) > 0
                else ""
            ),

            "숙제2": (
                homeworks[1].get("name", "")
                if len(homeworks) > 1
                else ""
            ),
            "숙제2 성취도": (
                homeworks[1].get("achievement", "")
                if len(homeworks) > 1
                else ""
            ),

            "숙제3": (
                homeworks[2].get("name", "")
                if len(homeworks) > 2
                else ""
            ),
            "숙제3 성취도": (
                homeworks[2].get("achievement", "")
                if len(homeworks) > 2
                else ""
            ),

            "당일1": (
                daily_evaluations[0].get("name", "")
                if len(daily_evaluations) > 0
                else ""
            ),
            "당일1 성취도": (
                daily_evaluations[0].get("achievement", "")
                if len(daily_evaluations) > 0
                else ""
            ),

            "당일2": (
                daily_evaluations[1].get("name", "")
                if len(daily_evaluations) > 1
                else ""
            ),
            "당일2 성취도": (
                daily_evaluations[1].get("achievement", "")
                if len(daily_evaluations) > 1
                else ""
            ),

            "당일3": (
                daily_evaluations[2].get("name", "")
                if len(daily_evaluations) > 2
                else ""
            ),
            "당일3 성취도": (
                daily_evaluations[2].get("achievement", "")
                if len(daily_evaluations) > 2
                else ""
            ),

            "복습 테스트": record.get(
                "reviewTest",
                "",
            ),
            "복습 문항 개수": record.get(
                "reviewQuestionCount",
                "",
            ),
            "복습 맞은 개수": record.get(
                "reviewCorrectCount",
                "",
            ),
            "복습 테스트 점수(자동)": record.get(
                "reviewTestScore",
                "",
            ),
            "복습 피드백": record.get(
                "reviewFeedback",
                "",
            ),

            "암기반1": record.get(
                "memorizationClass1",
                "",
            ),
            "암기반2": record.get(
                "memorizationClass2",
                "",
            ),
            "암기반 성취도": record.get(
                "memorizationAchievement",
                "",
            ),

            "쌤 한마디": record.get(
                "teacherComment",
                "",
            ),
            "Notice": record.get(
                "notice",
                "",
            ),
        }

        cells_to_update = []

        for header, value in values_by_header.items():
            if header not in headers:
                continue

            column_index = headers.index(header) + 1

            if value is None:
                value = ""

            cells_to_update.append(
                {
                    "range": gspread.utils.rowcol_to_a1(
                        row_index,
                        column_index,
                    ),
                    "values": [[value]],
                },
            )

        worksheet.batch_update(
            cells_to_update,
        )

        return record

    raise ValueError(
        f"수업 기록을 찾을 수 없습니다: {record_id}",
    )