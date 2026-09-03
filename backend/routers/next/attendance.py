from fastapi import APIRouter, HTTPException

from schemas.next.attendance import NextAttendanceCreateRequest
from services.next.attendance_service import (
    create_next_attendance,
    read_next_attendance,
)


router = APIRouter(
    prefix="/next/attendance",
    tags=["NEXT Attendance"],
)


@router.get("")
def get_next_attendance(
    teacherName: str,
    attendanceDate: str,
):
    try:
        return read_next_attendance(
            teacherName,
            attendanceDate,
        )

    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=str(error),
        ) from error


@router.post("")
def create_next_attendance_api(
    request: NextAttendanceCreateRequest,
):
    try:
        return create_next_attendance(
            {
                "class_id": request.classId,
                "student_id": request.studentId,
                "attendance_date": request.attendanceDate,
                "status": request.status,
                "memo": request.memo,
            }
        )

    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=str(error),
        ) from error