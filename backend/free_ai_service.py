from statistics import mean

from student_service import get_student_records, get_students


def find_student_in_question(question: str) -> dict | None:
    """질문에 포함된 학생 이름을 찾아 반환한다."""
    students = get_students()

    for student in students:
        if student["studentName"] in question:
            return student

    return None


def get_number(record: dict, key: str) -> float:
    """빈 값이나 문자열이 들어와도 안전하게 숫자로 변환한다."""
    value = record.get(key, 0)

    if value in ("", None):
        return 0

    try:
        return float(value)
    except (TypeError, ValueError):
        return 0


def format_score(value: float) -> str:
    """72.0은 72점, 72.5는 72.5점으로 표시한다."""
    if value.is_integer():
        return f"{int(value)}점"

    return f"{value:.1f}점"


def sort_records(records: list[dict]) -> list[dict]:
    """수업일이 최신인 기록부터 정렬한다."""
    return sorted(
        records,
        key=lambda record: record.get("lessonDate", ""),
        reverse=True,
    )


def analyze_latest_record(student: dict, records: list[dict]) -> str:
    latest = sort_records(records)[0]

    return (
        f"{student['studentName']} 학생의 최근 수업 정보입니다.\n\n"
        f"- 수업일: {latest.get('lessonDate') or '-'}\n"
        f"- 진도: {latest.get('progress') or '-'}\n"
        f"- 숙제 성취도: "
        f"{format_score(get_number(latest, 'homeworkAchievement'))}\n"
        f"- 숙제 등급: {latest.get('homeworkGrade') or '-'}\n"
        f"- 당일 성취도: "
        f"{format_score(get_number(latest, 'dailyAchievement'))}\n"
        f"- 당일 등급: {latest.get('dailyGrade') or '-'}\n"
        f"- 복습 테스트: "
        f"{format_score(get_number(latest, 'reviewTestScore'))}\n"
        f"- 암기반 결과: "
        f"{latest.get('memorizationAchievement') or '-'}\n"
        f"- 선생님 한마디: "
        f"{latest.get('teacherComment') or '-'}\n"
        f"- Notice: {latest.get('notice') or '-'}"
    )


def analyze_average(student: dict, records: list[dict]) -> str:
    homework_scores = [
        get_number(record, "homeworkAchievement")
        for record in records
    ]
    daily_scores = [
        get_number(record, "dailyAchievement")
        for record in records
    ]
    review_scores = [
        get_number(record, "reviewTestScore")
        for record in records
    ]

    homework_average = mean(homework_scores) if homework_scores else 0
    daily_average = mean(daily_scores) if daily_scores else 0
    review_average = mean(review_scores) if review_scores else 0

    return (
        f"{student['studentName']} 학생의 전체 수업 평균입니다.\n\n"
        f"- 수업 기록 수: {len(records)}건\n"
        f"- 숙제 성취도 평균: {format_score(homework_average)}\n"
        f"- 당일 성취도 평균: {format_score(daily_average)}\n"
        f"- 복습 테스트 평균: {format_score(review_average)}"
    )


def get_trend_text(scores: list[float]) -> str:
    if len(scores) < 2:
        return "비교할 수업 기록이 부족합니다."

    oldest_score = scores[-1]
    latest_score = scores[0]
    difference = latest_score - oldest_score

    if difference >= 10:
        return f"초기 기록보다 {difference:.0f}점 상승했습니다."

    if difference > 0:
        return f"초기 기록보다 {difference:.0f}점 소폭 상승했습니다."

    if difference <= -10:
        return f"초기 기록보다 {abs(difference):.0f}점 하락했습니다."

    if difference < 0:
        return f"초기 기록보다 {abs(difference):.0f}점 소폭 하락했습니다."

    return "초기 기록과 최근 기록의 점수가 같습니다."


def analyze_trend(student: dict, records: list[dict]) -> str:
    sorted_items = sort_records(records)

    homework_scores = [
        get_number(record, "homeworkAchievement")
        for record in sorted_items
    ]
    daily_scores = [
        get_number(record, "dailyAchievement")
        for record in sorted_items
    ]
    review_scores = [
        get_number(record, "reviewTestScore")
        for record in sorted_items
    ]

    return (
        f"{student['studentName']} 학생의 성취도 변화입니다.\n\n"
        f"- 숙제: {get_trend_text(homework_scores)}\n"
        f"- 당일 평가: {get_trend_text(daily_scores)}\n"
        f"- 복습 테스트: {get_trend_text(review_scores)}"
    )


def analyze_student_summary(student: dict, records: list[dict]) -> str:
    sorted_items = sort_records(records)
    latest = sorted_items[0]

    homework_average = mean(
        get_number(record, "homeworkAchievement")
        for record in records
    )
    daily_average = mean(
        get_number(record, "dailyAchievement")
        for record in records
    )
    review_average = mean(
        get_number(record, "reviewTestScore")
        for record in records
    )

    strengths = []
    improvements = []

    if homework_average >= 70:
        strengths.append("숙제 수행 성취도가 양호합니다.")
    else:
        improvements.append("숙제 수행 성취도 보완이 필요합니다.")

    if daily_average >= 70:
        strengths.append("당일 학습 성취도가 양호합니다.")
    else:
        improvements.append("당일 학습 내용의 반복 확인이 필요합니다.")

    if review_average >= 70:
        strengths.append("복습 테스트 결과가 양호합니다.")
    else:
        improvements.append("복습 테스트 대비가 필요합니다.")

    if latest.get("memorizationAchievement") == "통과":
        strengths.append("최근 암기반 평가를 통과했습니다.")
    elif latest.get("memorizationAchievement"):
        improvements.append(
            f"최근 암기반 결과는 "
            f"{latest['memorizationAchievement']}입니다."
        )

    strength_text = (
        "\n".join(f"- {item}" for item in strengths)
        if strengths
        else "- 현재 데이터에서 뚜렷한 강점을 판단하기 어렵습니다."
    )

    improvement_text = (
        "\n".join(f"- {item}" for item in improvements)
        if improvements
        else "- 현재 특별한 보완 사항이 발견되지 않았습니다."
    )

    return (
        f"{student['studentName']} 학생의 무료 분석 결과입니다.\n\n"
        f"[기본정보]\n"
        f"- 학교/학년: {student['schoolName']} / {student['grade']}\n"
        f"- 담당 선생님: {student['teacherName']}\n"
        f"- 분석 수업 수: {len(records)}건\n\n"
        f"[평균]\n"
        f"- 숙제 성취도: {format_score(homework_average)}\n"
        f"- 당일 성취도: {format_score(daily_average)}\n"
        f"- 복습 테스트: {format_score(review_average)}\n\n"
        f"[강점]\n{strength_text}\n\n"
        f"[보완할 점]\n{improvement_text}\n\n"
        f"[최근 전달사항]\n"
        f"- 선생님 한마디: "
        f"{latest.get('teacherComment') or '-'}\n"
        f"- Notice: {latest.get('notice') or '-'}"
    )

def analyze_homework(student: dict, records: list[dict]) -> str:
    sorted_items = sort_records(records)
    latest = sorted_items[0]

    average_score = mean(
        get_number(record, "homeworkAchievement")
        for record in records
    )

    return (
        f"{student['studentName']} 학생의 숙제 분석입니다.\n\n"
        f"[최근 숙제]\n"
        f"- 수업일: {latest.get('lessonDate') or '-'}\n"
        f"- 숙제 1: {latest.get('homework1') or '-'} "
        f"({format_score(get_number(latest, 'homework1Achievement'))})\n"
        f"- 숙제 2: {latest.get('homework2') or '-'} "
        f"({format_score(get_number(latest, 'homework2Achievement'))})\n"
        f"- 숙제 3: {latest.get('homework3') or '-'} "
        f"({format_score(get_number(latest, 'homework3Achievement'))})\n"
        f"- 최근 숙제 종합: "
        f"{format_score(get_number(latest, 'homeworkAchievement'))}\n"
        f"- 최근 숙제 등급: {latest.get('homeworkGrade') or '-'}\n\n"
        f"[전체 숙제 기록]\n"
        f"- 수업 기록 수: {len(records)}건\n"
        f"- 숙제 성취도 평균: {format_score(average_score)}"
    )


def analyze_daily_work(student: dict, records: list[dict]) -> str:
    sorted_items = sort_records(records)
    latest = sorted_items[0]

    average_score = mean(
        get_number(record, "dailyAchievement")
        for record in records
    )

    return (
        f"{student['studentName']} 학생의 당일 평가 분석입니다.\n\n"
        f"[최근 당일 평가]\n"
        f"- 수업일: {latest.get('lessonDate') or '-'}\n"
        f"- 당일 1: {latest.get('daily1') or '-'} "
        f"({format_score(get_number(latest, 'daily1Achievement'))})\n"
        f"- 당일 2: {latest.get('daily2') or '-'} "
        f"({format_score(get_number(latest, 'daily2Achievement'))})\n"
        f"- 당일 3: {latest.get('daily3') or '-'} "
        f"({format_score(get_number(latest, 'daily3Achievement'))})\n"
        f"- 최근 당일 종합: "
        f"{format_score(get_number(latest, 'dailyAchievement'))}\n"
        f"- 최근 당일 등급: {latest.get('dailyGrade') or '-'}\n\n"
        f"[전체 당일 평가 기록]\n"
        f"- 당일 성취도 평균: {format_score(average_score)}"
    )


def analyze_review_test(student: dict, records: list[dict]) -> str:
    sorted_items = sort_records(records)
    latest = sorted_items[0]

    average_score = mean(
        get_number(record, "reviewTestScore")
        for record in records
    )

    return (
        f"{student['studentName']} 학생의 복습 테스트 분석입니다.\n\n"
        f"[최근 복습 테스트]\n"
        f"- 수업일: {latest.get('lessonDate') or '-'}\n"
        f"- 테스트명: {latest.get('reviewTest') or '-'}\n"
        f"- 전체 문항: "
        f"{int(get_number(latest, 'reviewQuestionCount'))}문항\n"
        f"- 맞은 개수: "
        f"{int(get_number(latest, 'reviewCorrectCount'))}개\n"
        f"- 점수: "
        f"{format_score(get_number(latest, 'reviewTestScore'))}\n"
        f"- 피드백: {latest.get('reviewFeedback') or '-'}\n\n"
        f"[전체 복습 기록]\n"
        f"- 복습 테스트 평균: {format_score(average_score)}"
    )


def build_parent_consultation(student: dict, records: list[dict]) -> str:
    sorted_items = sort_records(records)
    latest = sorted_items[0]

    homework_average = mean(
        get_number(record, "homeworkAchievement")
        for record in records
    )
    daily_average = mean(
        get_number(record, "dailyAchievement")
        for record in records
    )
    review_average = mean(
        get_number(record, "reviewTestScore")
        for record in records
    )

    strengths = []
    concerns = []
    suggestions = []

    if homework_average >= 70:
        strengths.append("숙제 수행이 비교적 안정적입니다.")
    else:
        concerns.append("숙제 성취도가 다소 낮은 편입니다.")
        suggestions.append("숙제 완료 여부와 오답을 함께 확인할 필요가 있습니다.")

    if daily_average >= 70:
        strengths.append("당일 학습 내용의 이해도가 양호합니다.")
    else:
        concerns.append("당일 학습 내용의 이해도 보완이 필요합니다.")
        suggestions.append("수업 직후 핵심 내용을 짧게 복습하는 것이 좋습니다.")

    if review_average >= 70:
        strengths.append("복습 테스트 결과가 양호합니다.")
    else:
        concerns.append("복습 테스트 점수가 낮은 편입니다.")
        suggestions.append("이전 학습 내용의 반복 복습이 필요합니다.")

    if latest.get("memorizationAchievement") == "통과":
        strengths.append("최근 암기반 평가를 통과했습니다.")
    elif latest.get("memorizationAchievement"):
        concerns.append(
            f"최근 암기반 결과는 "
            f"{latest['memorizationAchievement']}입니다."
        )

    def make_lines(items: list[str], empty_message: str) -> str:
        if not items:
            return f"- {empty_message}"

        return "\n".join(f"- {item}" for item in items)

    return (
        f"{student['studentName']} 학생 학부모 상담 기초자료입니다.\n\n"
        f"[학생 정보]\n"
        f"- 학교/학년: {student['schoolName']} / {student['grade']}\n"
        f"- 담당 선생님: {student['teacherName']}\n"
        f"- 분석 수업 수: {len(records)}건\n\n"
        f"[학습 현황]\n"
        f"- 숙제 성취도 평균: {format_score(homework_average)}\n"
        f"- 당일 성취도 평균: {format_score(daily_average)}\n"
        f"- 복습 테스트 평균: {format_score(review_average)}\n\n"
        f"[잘하고 있는 점]\n"
        f"{make_lines(strengths, '현재 데이터에서 확인되는 항목이 없습니다.')}\n\n"
        f"[보완이 필요한 점]\n"
        f"{make_lines(concerns, '현재 특별한 보완 사항이 없습니다.')}\n\n"
        f"[다음 학습 제안]\n"
        f"{make_lines(suggestions, '현재 학습 흐름을 유지하면 좋습니다.')}\n\n"
        f"[최근 선생님 기록]\n"
        f"- 쌤 한마디: {latest.get('teacherComment') or '-'}\n"
        f"- Notice: {latest.get('notice') or '-'}\n\n"
        f"※ 이 내용은 입력된 수업 데이터를 기준으로 자동 작성된 "
        f"상담 기초자료입니다."
    )


def ask_free_student_ai(question: str) -> str:
    normalized_question = question.strip()

    student = find_student_in_question(normalized_question)

    if student is None:
        return (
            "질문에서 학생 이름을 찾지 못했습니다.\n\n"
            "아래처럼 학생 이름을 포함해서 질문해주세요.\n"
            "- 김규민 최근 수업 알려줘\n"
            "- 김규민 숙제 평균 알려줘\n"
            "- 김규민 학부모 상담 내용 만들어줘"
        )

    records = get_student_records(student["studentId"])

    if not records:
        return f"{student['studentName']} 학생의 수업 기록이 없습니다."

    if any(
        keyword in normalized_question
        for keyword in ["학부모", "상담", "부모님"]
    ):
        return build_parent_consultation(student, records)

    if any(
        keyword in normalized_question
        for keyword in ["숙제", "과제"]
    ):
        return analyze_homework(student, records)

    if any(
        keyword in normalized_question
        for keyword in ["당일", "수업 평가"]
    ):
        return analyze_daily_work(student, records)

    if any(
        keyword in normalized_question
        for keyword in ["복습", "테스트", "시험"]
    ):
        return analyze_review_test(student, records)

    if "평균" in normalized_question:
        return analyze_average(student, records)

    if any(
        keyword in normalized_question
        for keyword in ["추세", "변화", "상승", "하락", "올랐", "떨어졌"]
    ):
        return analyze_trend(student, records)

    if any(
        keyword in normalized_question
        for keyword in ["분석", "어떤 학생", "학습 상태", "상태"]
    ):
        return analyze_student_summary(student, records)

    if any(
        keyword in normalized_question
        for keyword in ["최근", "마지막", "수업", "진도"]
    ):
        return analyze_latest_record(student, records)

    return (
        f"질문의 종류를 정확히 이해하지 못했습니다.\n\n"
        f"다음과 같이 질문해보세요.\n"
        f"- {student['studentName']} 최근 수업 알려줘\n"
        f"- {student['studentName']} 숙제 분석해줘\n"
        f"- {student['studentName']} 복습 테스트 알려줘\n"
        f"- {student['studentName']} 성취도 변화 알려줘\n"
        f"- {student['studentName']} 학습 상태 분석해줘\n"
        f"- {student['studentName']} 학부모 상담 내용 만들어줘"
    )