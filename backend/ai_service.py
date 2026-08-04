from openai_client import ask_openai
from prompt_builder import build_student_prompt
from student_service import get_student_records, get_students


def find_student_in_question(question: str) -> dict | None:
    students = get_students()

    for student in students:
        if student["studentName"] in question:
            return student

    return None


def ask_student_ai(question: str) -> str:
    student = find_student_in_question(question)

    if student is None:
        return "질문에 학생 이름을 포함해주세요."

    records = get_student_records(student["studentId"])

    if not records:
        return f"{student['studentName']} 학생의 수업 기록이 없습니다."

    sorted_records = sorted(
        records,
        key=lambda record: record["lessonDate"],
        reverse=True,
    )

    prompt = build_student_prompt(
        question=question,
        student=student,
        records=sorted_records,
    )

    return ask_openai(prompt)