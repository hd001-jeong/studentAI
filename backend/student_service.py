from google_sheet_service import (
    read_students_from_sheet,
    read_teachers_from_sheet,
    update_lesson_record_in_sheet,
)


def read_students(
    teacher_code: str,
):
    return read_students_from_sheet(
        teacher_code,
    )


def login_teacher(
    teacher_name: str,
    password: str,
):
    teachers = read_teachers_from_sheet()

    for teacher in teachers:
        if (
            str(teacher.get("teacherName", "")).strip()
            == str(teacher_name).strip()
            and str(teacher.get("password", "")).strip()
            == str(password).strip()
            and str(teacher.get("activeYn", "")).strip().upper() == "Y"
        ):
            return {
                "teacherCode": teacher.get("teacherCode"),
                "teacherName": teacher.get("teacherName"),
            }

    return None


def update_lesson_record(
    record_id: str,
    record: dict,
):
    return update_lesson_record_in_sheet(
        record_id,
        record,
    )