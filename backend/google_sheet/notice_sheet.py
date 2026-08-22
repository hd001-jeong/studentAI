import gspread

from google_sheet.connection import get_worksheet


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

    cleaned_school_name = str(
        school_name,
    ).strip()

    cleaned_grade = str(
        grade,
    ).strip()

    weeks: list[str] = []

    for row in rows:
        row_school_name = str(
            row.get(
                "소속학교명(자동)",
                "",
            )
        ).strip()

        row_grade = str(
            row.get(
                "학년(자동)",
                "",
            )
        ).strip()

        if row_school_name != cleaned_school_name:
            continue

        if row_grade != cleaned_grade:
            continue

        week = str(
            row.get(
                "주차",
                "",
            )
        ).strip()

        if not week:
            continue

        if week in weeks:
            continue

        weeks.append(
            week,
        )

    return weeks


# =========================================================
# 학교 / 학년 / 주차별 공지사항 조회
# =========================================================

def read_notice_from_sheet(
    school_name: str,
    grade: str,
    week_label: str,
) -> dict[str, str]:
    worksheet = get_worksheet()

    rows = worksheet.get_all_records(
        default_blank="",
    )

    cleaned_school_name = str(
        school_name,
    ).strip()

    cleaned_grade = str(
        grade,
    ).strip()

    cleaned_week_label = str(
        week_label,
    ).strip()

    for row in rows:
        row_school_name = str(
            row.get(
                "소속학교명(자동)",
                "",
            )
        ).strip()

        row_grade = str(
            row.get(
                "학년(자동)",
                "",
            )
        ).strip()

        row_week_label = str(
            row.get(
                "주차",
                "",
            )
        ).strip()

        if row_school_name != cleaned_school_name:
            continue

        if row_grade != cleaned_grade:
            continue

        if row_week_label != cleaned_week_label:
            continue

        notice = str(
            row.get(
                "Notice",
                "",
            )
        ).strip()

        return {
            "schoolName": cleaned_school_name,
            "grade": cleaned_grade,
            "weekLabel": cleaned_week_label,
            "notice": notice,
        }

    return {
        "schoolName": cleaned_school_name,
        "grade": cleaned_grade,
        "weekLabel": cleaned_week_label,
        "notice": "",
    }


# =========================================================
# 학교 / 학년 / 주차별 공지사항 수정
# =========================================================

def update_notice_in_sheet(
    school_name: str,
    grade: str,
    week_label: str,
    notice: str,
) -> dict[str, str]:
    worksheet = get_worksheet()

    rows = worksheet.get_all_records(
        default_blank="",
    )

    headers = worksheet.row_values(
        1,
    )

    if "Notice" not in headers:
        raise ValueError(
            "Notice 컬럼을 찾을 수 없습니다."
        )

    notice_column_index = (
        headers.index("Notice") + 1
    )

    cleaned_school_name = str(
        school_name,
    ).strip()

    cleaned_grade = str(
        grade,
    ).strip()

    cleaned_week_label = str(
        week_label,
    ).strip()

    cleaned_notice = str(
        notice,
    ).strip()

    cells_to_update = []

    for row_index, row in enumerate(
        rows,
        start=2,
    ):
        row_school_name = str(
            row.get(
                "소속학교명(자동)",
                "",
            )
        ).strip()

        row_grade = str(
            row.get(
                "학년(자동)",
                "",
            )
        ).strip()

        row_week_label = str(
            row.get(
                "주차",
                "",
            )
        ).strip()

        if row_school_name != cleaned_school_name:
            continue

        if row_grade != cleaned_grade:
            continue

        if row_week_label != cleaned_week_label:
            continue

        cells_to_update.append(
            {
                "range": gspread.utils.rowcol_to_a1(
                    row_index,
                    notice_column_index,
                ),
                "values": [
                    [
                        cleaned_notice,
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
        "notice": cleaned_notice,
    }
def read_notice_history_from_sheet(
    school_name: str,
    grade: str,
) -> list[dict[str, str]]:
    worksheet = get_worksheet()

    rows = worksheet.get_all_records(
        default_blank="",
    )

    cleaned_school_name = str(
        school_name,
    ).strip()

    cleaned_grade = str(
        grade,
    ).strip()

    history: list[dict[str, str]] = []

    seen_weeks: set[str] = set()

    for row in rows:
        row_school_name = str(
            row.get(
                "소속학교명(자동)",
                "",
            )
        ).strip()

        row_grade = str(
            row.get(
                "학년(자동)",
                "",
            )
        ).strip()

        if row_school_name != cleaned_school_name:
            continue

        if row_grade != cleaned_grade:
            continue

        week_label = str(
            row.get(
                "주차",
                "",
            )
        ).strip()

        notice = str(
            row.get(
                "Notice",
                "",
            )
        ).strip()

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