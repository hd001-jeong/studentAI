from typing import Any

from config import FRONTEND_URL

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from google_sheet.schedule import read_schedules

from student_service import (
    create_weekly_data,
    login_teacher,
    read_lesson_records,
    read_lesson_records_batch,
    read_notice,
    read_notice_history,
    read_notice_weeks,
    read_students,
    update_lesson_record,
    update_notice,
)

from routers.next.students import router as next_students_router
from routers.next.lesson_records import router as next_lesson_records_router

app = FastAPI()


allowed_origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    FRONTEND_URL.rstrip("/"),
]


app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# =========================================================
# Router
# =========================================================

app.include_router(next_students_router)
app.include_router(next_lesson_records_router)


# =========================================================
# Request Models
# =========================================================

class TeacherLoginRequest(BaseModel):
    teacherName: str
    password: str


class AchievementItemRequest(BaseModel):
    name: str
    achievement: int | None = None


class LessonRecordsBatchRequest(BaseModel):
    teacherName: str
    studentIds: list[str]


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
    homeworks: list[AchievementItemRequest]
    dailyEvaluations: list[AchievementItemRequest]
    homeworkAchievement: int | None = None
    homeworkGrade: str = ""
    dailyAchievement: int | None = None
    dailyGrade: str = ""
    reviewTest: str = ""
    reviewQuestionCount: int | None = None

    # 복습 맞은 개수는 소수점 허용
    # 예: 3.1, 7.9
    reviewCorrectCount: float | None = None

    reviewTestScore: int | None = None
    reviewFeedback: str = ""
    memorizationClass1: str = ""
    memorizationClass2: str = ""
    memorizationAchievement: str | None = None
    teacherComment: str = ""
    notice: str = ""


# =========================================================
# 주차별 수업 관리 수정 Request
# =========================================================

class NoticeUpdateRequest(BaseModel):
    schoolName: str
    grade: str
    weekLabel: str
    notice: str = ""
    lessonDate: str = ""
    progress: str = ""
    daily1: str = ""
    daily2: str = ""
    daily3: str = ""
    homework1: str = ""
    homework2: str = ""
    homework3: str = ""
    reviewTest: str = ""
    reviewQuestionCount: int | None = None
    memorization1: str = ""
    memorization2: str = ""


# =========================================================
# 주차 데이터 생성 Request
# =========================================================

class WeeklyDataStudentRequest(BaseModel):
    studentId: str
    studentName: str
    schoolName: str
    grade: str


class WeeklyDataCreateRequest(BaseModel):
    schoolName: str
    grade: str
    weekLabel: str
    lessonDate: str
    teacherName: str

    progress: str = ""

    daily1: str = ""
    daily2: str = ""
    daily3: str = ""

    homework1: str = ""
    homework2: str = ""
    homework3: str = ""

    reviewTest: str = ""
    reviewQuestionCount: int | None = None

    memorization1: str = ""
    memorization2: str = ""

    notice: str = ""

    students: list[WeeklyDataStudentRequest]


# =========================================================
# 선생님 로그인
# =========================================================

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


# =========================================================
# 학생 Select 목록 조회
# =========================================================

@app.get("/students")
def get_students(
    teacherName: str,
):
    try:
        return read_students(
            teacherName,
        )

    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=str(error),
        ) from error


# =========================================================
# 선택한 학생의 수업 기록 조회
# =========================================================

@app.get("/students/{student_id}/records")
def get_student_records(
    student_id: str,
    teacherName: str,
):
    try:
        return read_lesson_records(
            teacherName,
            student_id,
        )

    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=str(error),
        ) from error


# =========================================================
# 여러 학생의 수업 기록 일괄 조회
# =========================================================

@app.post("/students/records/batch")
def get_student_records_batch(
    request: LessonRecordsBatchRequest,
):
    try:
        return read_lesson_records_batch(
            request.teacherName,
            request.studentIds,
        )

    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=str(error),
        ) from error


# =========================================================
# 주차 데이터 생성
# =========================================================

@app.post("/students/weekly-data")
def create_weekly_data_api(
    request: WeeklyDataCreateRequest,
) -> dict[str, Any]:

    try:
        return create_weekly_data(
            request.model_dump(),
        )

    except ValueError as error:
        raise HTTPException(
            status_code=400,
            detail=str(error),
        ) from error

    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=str(error),
        ) from error


# =========================================================
# 수업 기록 수정
# =========================================================

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

    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=str(error),
        ) from error


# =========================================================
# 일정 목록 조회
# =========================================================

@app.get("/schedules")
def get_schedules():
    try:
        return read_schedules()

    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=str(error),
        ) from error


# =========================================================
# 학교 / 학년별 주차 목록 조회
# =========================================================

@app.get("/notices/weeks")
def get_notice_weeks(
    schoolName: str,
    grade: str,
):
    try:
        return read_notice_weeks(
            schoolName,
            grade,
        )

    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=str(error),
        ) from error


# =========================================================
# 학교 / 학년별 최근 공지사항 조회
# =========================================================

@app.get("/notices/history")
def get_notice_history(
    schoolName: str,
    grade: str,
):
    try:
        return read_notice_history(
            schoolName,
            grade,
        )

    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=str(error),
        ) from error


# =========================================================
# 학교 / 학년 / 주차별 수업 정보 조회
# =========================================================

@app.get("/notices")
def get_notice(
    schoolName: str,
    grade: str,
    weekLabel: str,
):
    try:
        return read_notice(
            schoolName,
            grade,
            weekLabel,
        )

    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=str(error),
        ) from error


# =========================================================
# 학교 / 학년 / 주차별 수업 정보 수정
# =========================================================

@app.put("/notices")
def update_notice_api(
    request: NoticeUpdateRequest,
):
    try:
        return update_notice(
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