from google_sheet.connection import get_named_worksheet


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