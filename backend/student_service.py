from typing import Any

from google_sheet_service import (
    read_notice_from_sheet,
    read_student_options_from_sheet,
    read_student_records_from_sheet,
    read_student_records_batch_from_sheet,
    read_teachers_from_sheet,
    update_lesson_record_in_sheet,
    update_notice_in_sheet,
)


# 학생 Select 목록 조회
def read_students(
    teacher_name: str,
) -> list[dict[str, str]]:
    return read_student_options_from_sheet(
        teacher_name,
    )


# 선택한 학생의 수업 기록 조회
def read_lesson_records(
    teacher_name: str,
    student_id: str,
) -> list[dict[str, Any]]:
    return read_student_records_from_sheet(
        teacher_name,
        student_id,
    )

def read_lesson_records_batch(
    teacher_name: str,
    student_ids: list[str],
) -> dict[str, list[dict[str, Any]]]:
    return read_student_records_batch_from_sheet(
        teacher_name,
        student_ids,
    )


# 선생님 로그인
def login_teacher(
    teacher_name: str,
    password: str,
):
    teachers = read_teachers_from_sheet()

    for teacher in teachers:
        if (
            str(
                teacher.get(
                    "teacherName",
                    "",
                )
            ).strip()
            == str(teacher_name).strip()
            and str(
                teacher.get(
                    "password",
                    "",
                )
            ).strip()
            == str(password).strip()
            and str(
                teacher.get(
                    "activeYn",
                    "",
                )
            ).strip().upper()
            == "Y"
        ):
            return {
                "teacherCode": teacher.get(
                    "teacherCode"
                ),
                "teacherName": teacher.get(
                    "teacherName"
                ),
            }

    return None


# 수업 기록 수정
def update_lesson_record(
    record_id: str,
    record: dict,
):
    return update_lesson_record_in_sheet(
        record_id,
        record,
    )

# 학교 / 학년별 공지사항 조회
def read_notice(
    school_name: str,
    grade: str,
) -> dict[str, str]:
    return read_notice_from_sheet(
        school_name,
        grade,
    )


# 학교 / 학년별 공지사항 수정
def update_notice(
    school_name: str,
    grade: str,
    notice: str,
) -> dict[str, str]:
    return update_notice_in_sheet(
        school_name,
        grade,
        notice,
    )