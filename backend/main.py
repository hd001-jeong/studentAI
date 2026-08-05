from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from pydantic import BaseModel

from student_service import (
    read_students,
    update_homework1,
)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/students")
def get_students():
    return read_students()


class Homework1UpdateRequest(BaseModel):
    achievement: int


@app.put(
    "/students/{record_id}/homework1",
)
def update_student_homework1(
    record_id: str,
    request: Homework1UpdateRequest,
):
    return update_homework1(
        record_id,
        request.achievement,
    )