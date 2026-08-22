import gspread

from google_sheet.connection import get_worksheet


# =========================================================
# 학교 / 학년별 공지사항 조회
# =========================================================

def read_notice_from_sheet(
    school_name: str,
    grade: str,
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

        notice = str(
            row.get(
                "Notice",
                "",
            )
        ).strip()

        return {
            "schoolName": cleaned_school_name,
            "grade": cleaned_grade,
            "notice": notice,
        }

    return {
        "schoolName": cleaned_school_name,
        "grade": cleaned_grade,
        "notice": "",
    }


# =========================================================
# 학교 / 학년별 공지사항 수정
# =========================================================

def update_notice_in_sheet(
    school_name: str,
    grade: str,
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

        if row_school_name != cleaned_school_name:
            continue

        if row_grade != cleaned_grade:
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
            "해당 학교/학년 학생 데이터를 찾을 수 없습니다."
        )

    worksheet.batch_update(
        cells_to_update,
    )

    return {
        "schoolName": cleaned_school_name,
        "grade": cleaned_grade,
        "notice": cleaned_notice,
    }