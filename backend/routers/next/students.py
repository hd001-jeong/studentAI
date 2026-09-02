from fastapi import APIRouter, HTTPException

from services.next.student_service import (
    create_next_student,
    read_next_student_count,
    read_next_students,
)
from schemas.next.student import NextStudentCreateRequest


router = APIRouter(
    prefix="/next/students",
    tags=["NEXT Students"],
)


@router.get("")
def get_next_students(
    teacherName: str,
):
    try:
        return read_next_students(
            teacherName,
        )

    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=str(error),
        ) from error


@router.get("/count")
def get_next_student_count(
    teacherName: str,
):
    try:
        count = read_next_student_count(
            teacherName,
        )

        return {
            "count": count,
        }

    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=str(error),
        ) from error


@router.post("")
def create_next_student_api(
    request: NextStudentCreateRequest,
):
    try:
        return create_next_student(
            {
                "student_code": request.studentCode,
                "student_name": request.studentName,
                "school_name": request.schoolName,
                "grade": request.grade,
                "teacher_name": request.teacherName,
            }
        )

    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=str(error),
        ) from error