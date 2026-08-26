from typing import Any

from google_sheet.connection import get_named_worksheet


SCHEDULE_SHEET_NAME = "일정관리"


# =========================================================
# 일정 Row -> API 데이터 변환
# =========================================================

def create_schedule_from_row(
    row: dict[str, Any],
) -> dict[str, Any] | None:
    schedule_id = str(
        row.get(
            "schedule_id",
            "",
        ),
    ).strip()

    # 일정ID 없는 행은 데이터로 보지 않음
    if not schedule_id:
        return None

    return {
        "scheduleId": schedule_id,

        "scheduleDate": str(
            row.get(
                "schedule_date",
                "",
            ),
        ).strip(),

        "startTime": str(
            row.get(
                "start_time",
                "",
            ),
        ).strip(),

        "scheduleType": str(
            row.get(
                "schedule_type",
                "",
            ),
        ).strip(),

        "studentId": str(
            row.get(
                "student_id",
                "",
            ),
        ).strip(),

        "studentName": str(
            row.get(
                "student_name",
                "",
            ),
        ).strip(),

        "title": str(
            row.get(
                "title",
                "",
            ),
        ).strip(),

        "memo": str(
            row.get(
                "memo",
                "",
            ),
        ).strip(),

        "teacherName": str(
            row.get(
                "teacher_name",
                "",
            ),
        ).strip(),

        "createdAt": str(
            row.get(
                "created_at",
                "",
            ),
        ).strip(),
    }


# =========================================================
# 일정관리 시트 조회
# =========================================================

def read_schedules() -> list[dict[str, Any]]:
    worksheet = get_named_worksheet(
        SCHEDULE_SHEET_NAME,
    )

    values = worksheet.get_all_values()

    # 1행 key
    # 2행 한글 설명
    # 따라서 최소 3행 이상 있어야 실제 데이터 존재
    if len(values) < 3:
        return []

    headers = [
        str(value).strip()
        for value in values[0]
    ]

    # 3행부터 실제 데이터
    data_rows = values[2:]

    schedules: list[dict[str, Any]] = []

    for row in data_rows:
        # 완전히 빈 행이면 제외
        if not any(
            str(value).strip()
            for value in row
        ):
            continue

        # 시트에서 마지막 빈 컬럼이 생략되어도
        # header 개수만큼 맞춰준다.
        normalized_row = (
            row
            + [""] * (
                len(headers)
                - len(row)
            )
        )

        record = dict(
            zip(
                headers,
                normalized_row,
            ),
        )

        schedule = create_schedule_from_row(
            record,
        )

        if schedule is None:
            continue

        schedules.append(
            schedule,
        )

    # 날짜 -> 시간 순으로 정렬
    schedules.sort(
        key=lambda item: (
            item.get(
                "scheduleDate",
                "",
            ),
            item.get(
                "startTime",
                "",
            ),
        ),
    )

    return schedules