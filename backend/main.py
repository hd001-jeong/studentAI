from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from ai_service import ask_student_ai
from free_ai_service import ask_free_student_ai
from student_service import get_student_records, get_students

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=False,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)


@app.get("/")
def home():
    return {
        "message": "Student AI API",
        "status": "success",
    }


@app.get("/students")
def read_student_list():
    return get_students()


@app.get("/students/{student_id}/records")
def read_student_records(student_id: str):
    records = get_student_records(student_id)

    if not records:
        raise HTTPException(
            status_code=404,
            detail="학생 수업 기록을 찾을 수 없습니다.",
        )

    return records

# @app.post("/ai/ask")
# def ask_ai(body: dict):
#     question = body.get("question", "").strip()

#     if not question:
#         raise HTTPException(
#             status_code=400,
#             detail="질문을 입력해주세요.",
#         )

#     answer = ask_student_ai(question)

#     return {
#         "answer": answer,
#     }
@app.post("/ai/ask")
def ask_ai(body: dict):
    question = body.get("question", "").strip()

    if not question:
        raise HTTPException(
            status_code=400,
            detail="질문을 입력해주세요.",
        )

    return {
        "answer": ask_free_student_ai(question),
    }