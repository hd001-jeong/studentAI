from typing import Any

import gspread

from google_sheet.connection import get_worksheet


# =========================================================
# 주차별 수업 관리 필드 ↔ 구글시트 컬럼명
# =========================================================

WEEKLY_COLUMN_MAP = {
    "notice": "Notice",
    "lessonDate": "날짜",
    "progress": "진도",
    "daily1": "당일1",
    "daily2": "당일2",
    "daily3": "당일3",
    "homework1": "숙제1",
    "homework2": "숙제2",
    "homework3": "숙제3",
    "reviewTest": "복습 테스트",
    "reviewQuestionCount": "복습 문항 개수",
    "memorization1": "암기반1",
    "memorization2": "암기반2",
}


# =========================================================
# 문자열 정리
# =========================================================

def clean_value(
    value: Any,
) -> str:
    return str(
        value if value is not None else ""
    ).strip()


# =========================================================
# 학교 / 학년 / 주차 조건 확인
# =========================================================

def is_target_row(
    row: dict[str, Any],
    school_name: str,
    grade: str,
    week_label: str | None = None,
) -> bool:
    row_school_name = clean_value(
        row.get(
            "소속학교명(자동)",
            "",
        )
    )

    row_grade = clean_value(
        row.get(
            "학년(자동)",
            "",
        )
    )

    if row_school_name != school_name:
        return False

    if row_grade != grade:
        return False

    if week_label is not None:
        row_week_label = clean_value(
            row.get(
                "주차",
                "",
            )
        )

        if row_week_label != week_label:
            return False

    return True


# =========================================================
# 복습 문항 개수 정리
# =========================================================

def clean_review_question_count(
    value: Any,
) -> int | None:
    cleaned_value = clean_value(
        value,
    )

    if not cleaned_value:
        return None

    try:
        return int(
            float(cleaned_value)
        )
    except (TypeError, ValueError):
        return None


# =========================================================
# 학교 / 학년별 주차 목록 조회
# =========================================================

def read_notice_weeks_from_sheet(
    school_name: str,
    grade: str,
) -> list[str]:
    worksheet = get_worksheet()

    rows = worksheet.get_all_records(
        default_blank="",
    )

    cleaned_school_name = clean_value(
        school_name,
    )

    cleaned_grade = clean_value(
        grade,
    )

    weeks: list[str] = []

    for row in rows:
        if not is_target_row(
            row,
            cleaned_school_name,
            cleaned_grade,
        ):
            continue

        week = clean_value(
            row.get(
                "주차",
                "",
            )
        )

        if not week:
            continue

        if week in weeks:
            continue

        weeks.append(
            week,
        )

    return weeks


# =========================================================
# 학교 / 학년 / 주차별 수업 정보 조회
# =========================================================

def read_notice_from_sheet(
    school_name: str,
    grade: str,
    week_label: str,
) -> dict[str, Any]:
    worksheet = get_worksheet()

    rows = worksheet.get_all_records(
        default_blank="",
    )

    cleaned_school_name = clean_value(
        school_name,
    )

    cleaned_grade = clean_value(
        grade,
    )

    cleaned_week_label = clean_value(
        week_label,
    )

    for row in rows:
        if not is_target_row(
            row,
            cleaned_school_name,
            cleaned_grade,
            cleaned_week_label,
        ):
            continue

        return {
            "schoolName": cleaned_school_name,
            "grade": cleaned_grade,
            "weekLabel": cleaned_week_label,

            "notice": clean_value(
                row.get(
                    WEEKLY_COLUMN_MAP["notice"],
                    "",
                )
            ),

            "lessonDate": clean_value(
                row.get(
                    WEEKLY_COLUMN_MAP["lessonDate"],
                    "",
                )
            ),

            "progress": clean_value(
                row.get(
                    WEEKLY_COLUMN_MAP["progress"],
                    "",
                )
            ),

            "daily1": clean_value(
                row.get(
                    WEEKLY_COLUMN_MAP["daily1"],
                    "",
                )
            ),

            "daily2": clean_value(
                row.get(
                    WEEKLY_COLUMN_MAP["daily2"],
                    "",
                )
            ),

            "daily3": clean_value(
                row.get(
                    WEEKLY_COLUMN_MAP["daily3"],
                    "",
                )
            ),

            "homework1": clean_value(
                row.get(
                    WEEKLY_COLUMN_MAP["homework1"],
                    "",
                )
            ),

            "homework2": clean_value(
                row.get(
                    WEEKLY_COLUMN_MAP["homework2"],
                    "",
                )
            ),

            "homework3": clean_value(
                row.get(
                    WEEKLY_COLUMN_MAP["homework3"],
                    "",
                )
            ),

            "reviewTest": clean_value(
                row.get(
                    WEEKLY_COLUMN_MAP["reviewTest"],
                    "",
                )
            ),

            "reviewQuestionCount": clean_review_question_count(
                row.get(
                    WEEKLY_COLUMN_MAP["reviewQuestionCount"],
                    "",
                )
            ),

            "memorization1": clean_value(
                row.get(
                    WEEKLY_COLUMN_MAP["memorization1"],
                    "",
                )
            ),

            "memorization2": clean_value(
                row.get(
                    WEEKLY_COLUMN_MAP["memorization2"],
                    "",
                )
            ),
        }

    return {
        "schoolName": cleaned_school_name,
        "grade": cleaned_grade,
        "weekLabel": cleaned_week_label,

        "notice": "",

        "lessonDate": "",
        "progress": "",

        "daily1": "",
        "daily2": "",
        "daily3": "",

        "homework1": "",
        "homework2": "",
        "homework3": "",

        "reviewTest": "",
        "reviewQuestionCount": None,

        "memorization1": "",
        "memorization2": "",
    }


# =========================================================
# 학교 / 학년 / 주차별 수업 정보 수정
# =========================================================

def update_notice_in_sheet(
    data: dict[str, Any],
) -> dict[str, Any]:
    worksheet = get_worksheet()

    rows = worksheet.get_all_records(
        default_blank="",
    )

    headers = worksheet.row_values(
        1,
    )

    cleaned_school_name = clean_value(
        data.get(
            "schoolName",
            "",
        )
    )

    cleaned_grade = clean_value(
        data.get(
            "grade",
            "",
        )
    )

    cleaned_week_label = clean_value(
        data.get(
            "weekLabel",
            "",
        )
    )

    # =====================================================
    # 필요한 컬럼 존재 여부 확인
    # =====================================================

    missing_columns = []

    for column_name in WEEKLY_COLUMN_MAP.values():
        if column_name not in headers:
            missing_columns.append(
                column_name,
            )

    if missing_columns:
        raise ValueError(
            "구글시트에서 다음 컬럼을 찾을 수 없습니다: "
            + ", ".join(missing_columns)
        )

    # =====================================================
    # 컬럼 번호 계산
    # =====================================================

    column_indexes: dict[str, int] = {}

    for field_name, column_name in WEEKLY_COLUMN_MAP.items():
        column_indexes[field_name] = (
            headers.index(
                column_name
            )
            + 1
        )

    # =====================================================
    # 저장할 값 정리
    # =====================================================

    review_question_count = data.get(
        "reviewQuestionCount"
    )

    cleaned_data = {
        "notice": clean_value(
            data.get(
                "notice",
                "",
            )
        ),

        "lessonDate": clean_value(
            data.get(
                "lessonDate",
                "",
            )
        ),

        "progress": clean_value(
            data.get(
                "progress",
                "",
            )
        ),

        "daily1": clean_value(
            data.get(
                "daily1",
                "",
            )
        ),

        "daily2": clean_value(
            data.get(
                "daily2",
                "",
            )
        ),

        "daily3": clean_value(
            data.get(
                "daily3",
                "",
            )
        ),

        "homework1": clean_value(
            data.get(
                "homework1",
                "",
            )
        ),

        "homework2": clean_value(
            data.get(
                "homework2",
                "",
            )
        ),

        "homework3": clean_value(
            data.get(
                "homework3",
                "",
            )
        ),

        "reviewTest": clean_value(
            data.get(
                "reviewTest",
                "",
            )
        ),

        "reviewQuestionCount": (
            int(
                review_question_count
            )
            if review_question_count is not None
            else ""
        ),

        "memorization1": clean_value(
            data.get(
                "memorization1",
                "",
            )
        ),

        "memorization2": clean_value(
            data.get(
                "memorization2",
                "",
            )
        ),
    }

    cells_to_update = []

    # =====================================================
    # 같은 학교 / 학년 / 주차의 모든 학생 행 수정
    # =====================================================

    for row_index, row in enumerate(
        rows,
        start=2,
    ):
        if not is_target_row(
            row,
            cleaned_school_name,
            cleaned_grade,
            cleaned_week_label,
        ):
            continue

        for field_name, value in cleaned_data.items():
            column_index = column_indexes[
                field_name
            ]

            cells_to_update.append(
                {
                    "range": gspread.utils.rowcol_to_a1(
                        row_index,
                        column_index,
                    ),
                    "values": [
                        [
                            value,
                        ]
                    ],
                }
            )

    if not cells_to_update:
        raise ValueError(
            "해당 학교/학년/주차 학생 데이터를 찾을 수 없습니다."
        )

    worksheet.batch_update(
        cells_to_update,
    )

    return {
        "schoolName": cleaned_school_name,
        "grade": cleaned_grade,
        "weekLabel": cleaned_week_label,

        "notice": cleaned_data["notice"],

        "lessonDate": cleaned_data["lessonDate"],
        "progress": cleaned_data["progress"],

        "daily1": cleaned_data["daily1"],
        "daily2": cleaned_data["daily2"],
        "daily3": cleaned_data["daily3"],

        "homework1": cleaned_data["homework1"],
        "homework2": cleaned_data["homework2"],
        "homework3": cleaned_data["homework3"],

        "reviewTest": cleaned_data["reviewTest"],
        "reviewQuestionCount": (
            review_question_count
            if review_question_count is not None
            else None
        ),

        "memorization1": cleaned_data["memorization1"],
        "memorization2": cleaned_data["memorization2"],
    }


# =========================================================
# 학교 / 학년별 최근 공지사항 조회
# =========================================================

def read_notice_history_from_sheet(
    school_name: str,
    grade: str,
) -> list[dict[str, str]]:
    worksheet = get_worksheet()

    rows = worksheet.get_all_records(
        default_blank="",
    )

    cleaned_school_name = clean_value(
        school_name,
    )

    cleaned_grade = clean_value(
        grade,
    )

    history: list[dict[str, str]] = []

    seen_weeks: set[str] = set()

    for row in rows:
        if not is_target_row(
            row,
            cleaned_school_name,
            cleaned_grade,
        ):
            continue

        week_label = clean_value(
            row.get(
                "주차",
                "",
            )
        )

        notice = clean_value(
            row.get(
                "Notice",
                "",
            )
        )

        if not week_label:
            continue

        if not notice:
            continue

        if week_label in seen_weeks:
            continue

        seen_weeks.add(
            week_label,
        )

        history.append(
            {
                "weekLabel": week_label,
                "notice": notice,
            }
        )

    history.reverse()

    return history[:5]