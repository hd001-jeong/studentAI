from google_sheet.connection import get_worksheet


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