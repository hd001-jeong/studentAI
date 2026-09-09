from google_sheet.connection import get_named_worksheet


def read_student_options_from_sheet(
    teacher_name: str,
) -> list[dict[str, str]]:
    """
    학생목록(동기화) 시트에서 학생 목록을 조회한다.
    """

    worksheet = get_named_worksheet(
        "학생목록(동기화)",
    )

    rows = worksheet.get_all_records(
        default_blank="",
    )

    students: list[dict[str, str]] = []

    for row in rows:
        student_id = str(
            row.get(
                "학생ID",
                "",
            ),
        ).strip()

        if not student_id:
            continue

        students.append(
            {
                "studentId": student_id,

                "studentName": str(
                    row.get(
                        "이름",
                        "",
                    ),
                ).strip(),

                "schoolName": str(
                    row.get(
                        "소속학교명",
                        "",
                    ),
                ).strip(),

                "grade": str(
                    row.get(
                        "학년",
                        "",
                    ),
                ).strip(),

                # 기존 StudentSummary 구조 호환
                "teacherName": str(
                    teacher_name,
                ).strip(),
            }
        )

    return students