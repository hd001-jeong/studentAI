from pydantic import BaseModel


class NextAttendanceCreateRequest(BaseModel):
    classId: int
    studentId: int
    attendanceDate: str
    status: str
    memo: str | None = None