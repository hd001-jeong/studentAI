from fastapi import APIRouter, HTTPException

from services.next.class_service import (
    read_class_students,
    read_next_classes,
    read_today_classes,
)


router = APIRouter(
    prefix="/next/classes",
    tags=["NEXT Classes"],
)


@router.get("")
def get_next_classes(
    teacherName: str,
):
    try:
        return read_next_classes(
            teacherName,
        )

    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=str(error),
        ) from error

@router.get("/today")
def get_today_classes(
    teacherName: str,
    dayOfWeek: int,
):
    try:
        return read_today_classes(
            teacherName,
            dayOfWeek,
        )

    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=str(error),
        ) from error

@router.get("/{class_id}/students")
def get_class_students(
    class_id: int,
):
    try:
        return read_class_students(
            class_id,
        )

    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=str(error),
        ) from error