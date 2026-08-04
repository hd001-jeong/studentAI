import json


def build_student_prompt(
    question: str,
    student: dict,
    records: list[dict],
) -> str:
    student_data = {
        "학생ID": student["studentId"],
        "학생이름": student["studentName"],
        "학교": student["schoolName"],
        "학년": student["grade"],
        "담당선생님": student["teacherName"],
    }

    recent_records = records[:10]

    return f"""
너는 영어학원에서 선생님을 돕는 학생관리 AI다.

아래 제공된 학생 데이터만 근거로 사용자의 질문에 답해라.

[학생 기본정보]
{json.dumps(student_data, ensure_ascii=False, indent=2)}

[최근 수업 기록]
{json.dumps(recent_records, ensure_ascii=False, indent=2)}

[사용자 질문]
{question}

[답변 규칙]
1. 학생 데이터에 없는 내용은 추측하지 않는다.
2. 점수나 날짜를 말할 때는 실제 데이터를 정확히 사용한다.
3. 장점과 보완할 점이 있다면 구분해서 설명한다.
4. 학부모와 선생님이 이해하기 쉬운 한국어로 답한다.
5. 답변은 너무 길지 않게 작성한다.
""".strip()