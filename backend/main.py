from typing import Any
from config import FRONTEND_URL

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from student_service import (
    login_teacher,
    read_students,
    update_lesson_record,
)


app = FastAPI()


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        FRONTEND_URL,
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class TeacherLoginRequest(BaseModel):
    teacherName: str
    password: str


class AchievementItemRequest(BaseModel):
    name: str
    achievement: int | None = None


class LessonRecordUpdateRequest(BaseModel):
    recordId: str

    number: int | None = None
    category: str = ""

    weekNumber: int
    weekLabel: str
    progress: str
    lessonDate: str

    studentId: str
    studentName: str
    schoolName: str
    grade: str
    teacherName: str
    teacherCode: str = ""

    homeworks: list[AchievementItemRequest]
    dailyEvaluations: list[AchievementItemRequest]

    homeworkAchievement: int | None = None
    homeworkGrade: str = ""

    dailyAchievement: int | None = None
    dailyGrade: str = ""

    reviewTest: str = ""
    reviewQuestionCount: int | None = None
    reviewCorrectCount: int | None = None
    reviewTestScore: int | None = None
    reviewFeedback: str = ""

    memorizationClass1: str = ""
    memorizationClass2: str = ""
    memorizationAchievement: str | None = None

    teacherComment: str = ""
    notice: str = ""


@app.post("/login")
def login(
    request: TeacherLoginRequest,
) -> dict[str, str]:
    teacher = login_teacher(
        request.teacherName,
        request.password,
    )

    if teacher is None:
        raise HTTPException(
            status_code=401,
            detail="선생님 이름 또는 비밀번호가 올바르지 않습니다.",
        )

    return teacher


@app.get("/students")
def get_students(
    teacherCode: str,
):
    return read_students(
        teacherCode,
    )


@app.put("/students/{record_id}")
def update_student_record(
    record_id: str,
    request: LessonRecordUpdateRequest,
) -> dict[str, Any]:
    try:
        return update_lesson_record(
            record_id,
            request.model_dump(),
        )
    except ValueError as error:
        raise HTTPException(
            status_code=404,
            detail=str(error),
        ) from error