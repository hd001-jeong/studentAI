from fastapi import APIRouter, HTTPException

from schemas.next.lesson import NextLessonRecordCreateRequest
from services.next.lesson_service import (
    create_next_lesson_record,
    delete_next_lesson_record,
    read_next_lesson_records,
    update_next_lesson_record,
)


router = APIRouter(
    prefix="/next/lesson-records",
    tags=["NEXT Lesson Records"],
)


@router.get("")
def get_lesson_records(
    studentId: int,
    teacherName: str,
):
    try:
        return read_next_lesson_records(
            studentId,
            teacherName,
        )

    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=str(error),
        ) from error


@router.post("")
def create_lesson_record(
    request: NextLessonRecordCreateRequest,
):
    try:
        return create_next_lesson_record(
            request.model_dump()
        )

    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=str(error),
        ) from error


@router.put("/{lesson_record_id}")
def update_lesson_record(
    lesson_record_id: int,
    request: NextLessonRecordCreateRequest,
):
    try:
        return update_next_lesson_record(
            lesson_record_id,
            request.model_dump(),
        )

    except ValueError as error:
        raise HTTPException(
            status_code=404,
            detail=str(error),
        ) from error

    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=str(error),
        ) from error


@router.delete("/{lesson_record_id}")
def delete_lesson_record(
    lesson_record_id: int,
):
    try:
        return delete_next_lesson_record(
            lesson_record_id,
        )

    except ValueError as error:
        raise HTTPException(
            status_code=404,
            detail=str(error),
        ) from error

    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=str(error),
        ) from error