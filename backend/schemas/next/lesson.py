from pydantic import BaseModel, Field


class NextEvaluationItemRequest(BaseModel):
    name: str = ""
    achievement: int | None = None


class NextReviewTestRequest(BaseModel):
    name: str = ""
    questionCount: int | None = None
    correctCount: float | None = None
    score: int | None = None
    feedback: str = ""


class NextMemorizationRequest(BaseModel):
    memorization1: str = ""
    memorization2: str = ""
    achievement: str = ""


class NextLessonRecordCreateRequest(BaseModel):
    studentId: int

    category: str = ""

    year: int | None = None
    month: int | None = None
    weekOfMonth: int | None = None
    weekLabel: str = ""

    progress: str = ""
    lessonDate: str | None = None

    teacherName: str

    dailyEvaluations: list[NextEvaluationItemRequest] = Field(
        default_factory=list
    )
    dailyAchievement: int | None = None
    dailyGrade: str = ""

    homeworks: list[NextEvaluationItemRequest] = Field(
        default_factory=list
    )
    homeworkAchievement: int | None = None
    homeworkGrade: str = ""

    reviewTest: NextReviewTestRequest | None = None
    memorization: NextMemorizationRequest | None = None

    teacherComment: str = ""