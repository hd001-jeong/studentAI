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
# 공통 변환 함수
# =========================================================

def to_number_or_none(
    value: Any,
) -> int | None:
    """
    빈 값 -> None
    숫자 -> int
    """
    cleaned_value = str(value).strip()

    if cleaned_value == "":
        return None

    try:
        return int(float(cleaned_value))
    except ValueError:
        return None


def to_week_number(
    value: Any,
) -> int:
    """
    예:
    1       -> 1
    1주     -> 1
    1주차   -> 1
    8월4주  -> 4
    """
    cleaned_value = str(value).strip()

    match = re.search(
        r"(\d+)\s*주(?:차)?",
        cleaned_value,
    )

    if match:
        return int(
            match.group(1),
        )

    try:
        return int(
            cleaned_value,
        )
    except ValueError:
        return 0


def create_achievement_item(
    name: Any,
    achievement: Any,
) -> dict[str, Any]:
    return {
        "name": str(name).strip(),
        "achievement": to_number_or_none(
            achievement,
        ),
    }


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


# =========================================================
# 선생님 로그인용
# =========================================================

def read_teachers_from_sheet() -> list[dict[str, str]]:
    """
    teachers 워크시트에서 로그인 정보를 읽는다.
    """
    worksheet = get_named_worksheet(
        "teachers",
    )

    rows = worksheet.get_all_records(
        default_blank="",
    )

    teachers: list[dict[str, str]] = []

    for row in rows:
        teachers.append(
            {
                "teacherCode": str(
                    row.get(
                        "teacherCode",
                        "",
                    ),
                ).strip(),

                "teacherName": str(
                    row.get(
                        "teacherName",
                        "",
                    ),
                ).strip(),

                "password": str(
                    row.get(
                        "password",
                        "",
                    ),
                ).strip(),

                "activeYn": str(
                    row.get(
                        "activeYn",
                        "",
                    ),
                ).strip(),
            }
        )

    return teachers


# =========================================================
# 학생 Select 목록 조회
# =========================================================

def read_student_options_from_sheet(
    teacher_name: str,
) -> list[dict[str, str]]:
    """
    담당 선생님의 학생 목록만 반환한다.

    같은 학생이 여러 주차에 존재해도
    studentId 기준으로 한 번만 반환한다.
    """
    worksheet = get_worksheet()

    rows = worksheet.get_all_records(
        default_blank="",
    )

    cleaned_teacher_name = str(
        teacher_name,
    ).strip()

    students: dict[
        str,
        dict[str, str],
    ] = {}

    for row in rows:
        row_teacher_name = str(
            row.get(
                "담당 선생님",
                "",
            ),
        ).strip()

        if row_teacher_name != cleaned_teacher_name:
            continue

        student_id = str(
            row.get(
                "학생ID(자동)",
                "",
            ),
        ).strip()

        if not student_id:
            continue

        # 같은 학생은 한 번만
        if student_id in students:
            continue

        students[student_id] = {
            "studentId": student_id,

            "studentName": str(
                row.get(
                    "학생이름(자동)",
                    "",
                ),
            ).strip(),

            "schoolName": str(
                row.get(
                    "소속학교명(자동)",
                    "",
                ),
            ).strip(),

            "grade": str(
                row.get(
                    "학년(자동)",
                    "",
                ),
            ).strip(),

            "teacherName": row_teacher_name,
        }

    return list(
        students.values(),
    )


# =========================================================
# recordId 생성
# =========================================================

def get_record_id_from_row(
    row: dict[str, Any],
) -> str:
    """
    구글시트의 통합행번호를 recordId로 사용한다.

    통합행번호가 없는 경우에만 fallback ID를 만든다.
    """

    integrated_row_number = str(
        row.get(
            "통합행번호(자동, 건드리지 마세요)",
            "",
        ),
    ).strip()

    if integrated_row_number:
        return integrated_row_number

    student_id = str(
        row.get(
            "학생ID(자동)",
            "",
        ),
    ).strip()

    number = to_number_or_none(
        row.get(
            "번호",
            "",
        ),
    )

    if student_id and number is not None:
        return (
            f"{student_id}-{number}"
        )

    if student_id:
        return student_id

    return ""


# =========================================================
# 선택 학생의 수업 기록 조회
# =========================================================

def read_student_records_from_sheet(
    teacher_name: str,
    student_id: str,
) -> list[dict[str, Any]]:
    """
    학생 Select에서 선택한 studentId에 해당하는
    수업 기록만 반환한다.
    """
    worksheet = get_worksheet()

    rows = worksheet.get_all_records(
        default_blank="",
    )

    records: list[
        dict[str, Any]
    ] = []

    cleaned_teacher_name = str(
        teacher_name,
    ).strip()

    cleaned_student_id = str(
        student_id,
    ).strip()

    for row in rows:
        row_teacher_name = str(
            row.get(
                "담당 선생님",
                "",
            ),
        ).strip()

        if row_teacher_name != cleaned_teacher_name:
            continue

        row_student_id = str(
            row.get(
                "학생ID(자동)",
                "",
            ),
        ).strip()

        if row_student_id != cleaned_student_id:
            continue

        number = to_number_or_none(
            row.get(
                "번호",
                "",
            ),
        )

        record_id = get_record_id_from_row(
            row,
        )

        if not record_id:
            continue

        record = {
            "recordId": record_id,

            "number": number,

            "category": str(
                row.get(
                    "구분",
                    "",
                ),
            ).strip(),

            "weekNumber": to_week_number(
                row.get(
                    "주차",
                    "",
                ),
            ),

            "weekLabel": str(
                row.get(
                    "주차",
                    "",
                ),
            ).strip(),

            "progress": str(
                row.get(
                    "진도",
                    "",
                ),
            ).strip(),

            "lessonDate": str(
                row.get(
                    "날짜",
                    "",
                ),
            ).strip(),

            "studentId": row_student_id,

            "studentName": str(
                row.get(
                    "학생이름(자동)",
                    "",
                ),
            ).strip(),

            "schoolName": str(
                row.get(
                    "소속학교명(자동)",
                    "",
                ),
            ).strip(),

            "grade": str(
                row.get(
                    "학년(자동)",
                    "",
                ),
            ).strip(),

            "teacherName": row_teacher_name,

            # 숙제
            "homeworks": [
                create_achievement_item(
                    row.get(
                        "숙제1",
                        "",
                    ),
                    row.get(
                        "숙제1 성취도",
                        "",
                    ),
                ),
                create_achievement_item(
                    row.get(
                        "숙제2",
                        "",
                    ),
                    row.get(
                        "숙제2 성취도",
                        "",
                    ),
                ),
                create_achievement_item(
                    row.get(
                        "숙제3",
                        "",
                    ),
                    row.get(
                        "숙제3 성취도",
                        "",
                    ),
                ),
            ],

            # 당일 평가
            "dailyEvaluations": [
                create_achievement_item(
                    row.get(
                        "당일1",
                        "",
                    ),
                    row.get(
                        "당일1 성취도",
                        "",
                    ),
                ),
                create_achievement_item(
                    row.get(
                        "당일2",
                        "",
                    ),
                    row.get(
                        "당일2 성취도",
                        "",
                    ),
                ),
                create_achievement_item(
                    row.get(
                        "당일3",
                        "",
                    ),
                    row.get(
                        "당일3 성취도",
                        "",
                    ),
                ),
            ],

            # 숙제 자동 계산값
            "homeworkAchievement": (
                to_number_or_none(
                    row.get(
                        "숙제 성취도(자동)",
                        "",
                    ),
                )
            ),

            "homeworkGrade": str(
                row.get(
                    "숙제 등급(자동)",
                    "",
                ),
            ).strip(),

            # 당일 자동 계산값
            "dailyAchievement": (
                to_number_or_none(
                    row.get(
                        "당일 성취도(자동)",
                        "",
                    ),
                )
            ),

            "dailyGrade": str(
                row.get(
                    "당일 등급(자동)",
                    "",
                ),
            ).strip(),

            # 복습 테스트
            "reviewTest": str(
                row.get(
                    "복습 테스트",
                    "",
                ),
            ).strip(),

            "reviewQuestionCount": (
                to_number_or_none(
                    row.get(
                        "복습 문항 개수",
                        "",
                    ),
                )
            ),

            "reviewCorrectCount": (
                to_number_or_none(
                    row.get(
                        "복습 맞은 개수",
                        "",
                    ),
                )
            ),

            "reviewTestScore": (
                to_number_or_none(
                    row.get(
                        "복습 테스트 점수(자동)",
                        "",
                    ),
                )
            ),

            "reviewFeedback": str(
                row.get(
                    "복습 피드백",
                    "",
                ),
            ).strip(),

            # 암기반
            "memorizationClass1": str(
                row.get(
                    "암기반1",
                    "",
                ),
            ).strip(),

            "memorizationClass2": str(
                row.get(
                    "암기반2",
                    "",
                ),
            ).strip(),

            "memorizationAchievement": (
                str(
                    row.get(
                        "암기반 성취도",
                        "",
                    ),
                ).strip()
                or None
            ),

            # 코멘트
            "teacherComment": str(
                row.get(
                    "쌤 한마디",
                    "",
                ),
            ).strip(),

            "notice": str(
                row.get(
                    "Notice",
                    "",
                ),
            ).strip(),
        }

        records.append(
            record,
        )

    return records


# =========================================================
# 기존 함수 호환용
# =========================================================

def read_students_from_sheet(
    teacher_name: str,
) -> list[dict[str, Any]]:
    """
    기존 코드 호환용.

    앞으로는 read_student_options_from_sheet,
    read_student_records_from_sheet를 사용한다.
    """
    return read_student_options_from_sheet(
        teacher_name,
    )


# =========================================================
# 수업 기록 수정
# =========================================================

def update_lesson_record_in_sheet(
    record_id: str,
    record: dict,
) -> dict:
    """
    recordId에 해당하는 수업기록 한 행을 수정한다.
    """
    worksheet = get_worksheet()

    rows = worksheet.get_all_records(
        default_blank="",
    )

    headers = worksheet.row_values(
        1,
    )

    for row_index, row in enumerate(
        rows,
        start=2,
    ):
        current_record_id = (
            get_record_id_from_row(
                row,
            )
        )

        if current_record_id != str(
            record_id,
        ).strip():
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
            # 기본 정보
            "주차": record.get(
                "weekLabel",
                "",
            ),

            "진도": record.get(
                "progress",
                "",
            ),

            "날짜": record.get(
                "lessonDate",
                "",
            ),

            # 숙제1
            "숙제1": (
                homeworks[0].get(
                    "name",
                    "",
                )
                if len(homeworks) > 0
                else ""
            ),

            "숙제1 성취도": (
                homeworks[0].get(
                    "achievement",
                    "",
                )
                if len(homeworks) > 0
                else ""
            ),

            # 숙제2
            "숙제2": (
                homeworks[1].get(
                    "name",
                    "",
                )
                if len(homeworks) > 1
                else ""
            ),

            "숙제2 성취도": (
                homeworks[1].get(
                    "achievement",
                    "",
                )
                if len(homeworks) > 1
                else ""
            ),

            # 숙제3
            "숙제3": (
                homeworks[2].get(
                    "name",
                    "",
                )
                if len(homeworks) > 2
                else ""
            ),

            "숙제3 성취도": (
                homeworks[2].get(
                    "achievement",
                    "",
                )
                if len(homeworks) > 2
                else ""
            ),

            # 당일1
            "당일1": (
                daily_evaluations[0].get(
                    "name",
                    "",
                )
                if len(
                    daily_evaluations
                ) > 0
                else ""
            ),

            "당일1 성취도": (
                daily_evaluations[0].get(
                    "achievement",
                    "",
                )
                if len(
                    daily_evaluations
                ) > 0
                else ""
            ),

            # 당일2
            "당일2": (
                daily_evaluations[1].get(
                    "name",
                    "",
                )
                if len(
                    daily_evaluations
                ) > 1
                else ""
            ),

            "당일2 성취도": (
                daily_evaluations[1].get(
                    "achievement",
                    "",
                )
                if len(
                    daily_evaluations
                ) > 1
                else ""
            ),

            # 당일3
            "당일3": (
                daily_evaluations[2].get(
                    "name",
                    "",
                )
                if len(
                    daily_evaluations
                ) > 2
                else ""
            ),

            "당일3 성취도": (
                daily_evaluations[2].get(
                    "achievement",
                    "",
                )
                if len(
                    daily_evaluations
                ) > 2
                else ""
            ),

            # 복습
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

            "복습 피드백": record.get(
                "reviewFeedback",
                "",
            ),

            # 암기반
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

            # 코멘트
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

        for (
            header,
            value,
        ) in values_by_header.items():

            if header not in headers:
                continue

            column_index = (
                headers.index(
                    header,
                )
                + 1
            )

            if value is None:
                value = ""

            cells_to_update.append(
                {
                    "range": (
                        gspread.utils.rowcol_to_a1(
                            row_index,
                            column_index,
                        )
                    ),
                    "values": [
                        [
                            value,
                        ]
                    ],
                }
            )

        if cells_to_update:
            worksheet.batch_update(
                cells_to_update,
            )

        return record

    raise ValueError(
        "수업 기록을 찾을 수 없습니다: "
        f"{record_id}"
    )