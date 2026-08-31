from typing import Any

from google_sheet.lesson_sheet import (
    read_student_records_batch_from_sheet,
    read_student_records_from_sheet,
    update_lesson_record_in_sheet,
)

from google_sheet.notice_sheet import (
    read_notice_from_sheet,
    read_notice_history_from_sheet,
    read_notice_weeks_from_sheet,
    update_notice_in_sheet,
)

from google_sheet.student_sheet import (
    read_student_options_from_sheet,
)

from google_sheet.teacher_sheet import (
    read_teachers_from_sheet,
)

from google_sheet.weekly_data_sheet import (
    create_weekly_data_in_sheet,
)


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