from pydantic import BaseModel


class NextStudentCreateRequest(BaseModel):
    studentCode: str
    studentName: str
    schoolName: str = ""
    grade: int | None = None
    teacherName: str