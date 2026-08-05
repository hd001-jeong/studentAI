"""
Student Service

프론트에서 학생 데이터를 요청하면
여기서 어떤 저장소(CSV, Google Sheet, DB)를 사용할지 결정한다.
"""
from google_sheet_service import (
    read_students_from_sheet,
    update_homework1_achievement,
)


def read_students():
    return read_students_from_sheet()


def update_homework1(
    record_id: str,
    achievement: int,
):
    return update_homework1_achievement(
        record_id,
        achievement,
    )
