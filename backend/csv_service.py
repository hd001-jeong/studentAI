import csv
from pathlib import Path
from typing import Any


# 현재 파일 위치를 기준으로 CSV 경로를 잡는다.
# 실행 위치가 달라져도 파일을 안정적으로 찾을 수 있다.
BASE_DIR = Path(__file__).resolve().parent
CSV_PATH = BASE_DIR / "data" / "lesson_records.csv"


def to_number_or_none(value: str) -> int | None:
    """
    CSV의 숫자 문자열을 int로 변환한다.

    빈 값은 0이 아니라 None으로 반환한다.
    그래야 프론트에서 '미입력'으로 처리할 수 있다.
    """
    cleaned_value = value.strip()

    if cleaned_value == "":
        return None

    try:
        return int(float(cleaned_value))
    except ValueError:
        return None


def to_week_number(value: str) -> int:
    """
    '1', '1주', '1주차' 형태를 모두 숫자 1로 변환한다.
    """
    cleaned_value = (
        value.strip()
        .replace("주차", "")
        .replace("주", "")
    )

    try:
        return int(cleaned_value)
    except ValueError:
        return 0


def create_achievement_item(
    name: str,
    achievement: str,
) -> dict[str, Any]:
    """
    숙제와 당일평가에서 공통으로 사용하는 형태를 만든다.
    """
    return {
        "name": name.strip(),
        "achievement": to_number_or_none(achievement),
    }


def read_students() -> list[dict[str, Any]]:
    """
    lesson_records.csv 전체 데이터를 읽어서
    React의 LessonRecord 타입과 같은 구조로 반환한다.
    """
    records: list[dict[str, Any]] = []

    with CSV_PATH.open(
        mode="r",
        encoding="utf-8-sig",
        newline="",
    ) as file:
        reader = csv.DictReader(file)

        for row in reader:
            number = to_number_or_none(row["번호"])

            record = {
                # React에서 각 수업 기록을 구분할 고유값
                "recordId": (
                    f"R{number:03d}"
                    if number is not None
                    else row["학생ID(자동)"]
                ),

                # CSV 원본 관리용 값
                "number": number,
                "category": row["구분"].strip(),

                # 주차 및 수업 기본정보
                "weekNumber": to_week_number(row["주차"]),
                "weekLabel": row["주차"].strip(),
                "progress": row["진도"].strip(),
                "lessonDate": row["날짜"].strip(),

                # 학생정보
                "studentId": row["학생ID(자동)"].strip(),
                "studentName": row["학생이름(자동)"].strip(),
                "schoolName": row["소속학교명(자동)"].strip(),
                "grade": row["학년(자동)"].strip(),
                "teacherName": row["담당 선생님"].strip(),

                # 숙제 3개 고정
                "homeworks": [
                    create_achievement_item(
                        row["숙제1"],
                        row["숙제1 성취도"],
                    ),
                    create_achievement_item(
                        row["숙제2"],
                        row["숙제2 성취도"],
                    ),
                    create_achievement_item(
                        row["숙제3"],
                        row["숙제3 성취도"],
                    ),
                ],

                # 당일평가 3개 고정
                "dailyEvaluations": [
                    create_achievement_item(
                        row["당일1"],
                        row["당일1 성취도"],
                    ),
                    create_achievement_item(
                        row["당일2"],
                        row["당일2 성취도"],
                    ),
                    create_achievement_item(
                        row["당일3"],
                        row["당일3 성취도"],
                    ),
                ],

                # CSV에 있는 자동 계산값도 일단 보존
                "homeworkAchievement": to_number_or_none(
                    row["숙제 성취도(자동)"]
                ),
                "homeworkGrade": row["숙제 등급 (자동)"].strip(),

                "dailyAchievement": to_number_or_none(
                    row["당일 성취도(자동)"]
                ),
                "dailyGrade": row["당일 등급(자동)"].strip(),

                # 복습 테스트
                "reviewTest": row["복습 테스트"].strip(),
                "reviewQuestionCount": to_number_or_none(
                    row["복습 문항 개수"]
                ),
                "reviewCorrectCount": to_number_or_none(
                    row["복습 맞은 개수"]
                ),
                "reviewTestScore": to_number_or_none(
                    row["복습 테스트 점수(자동)"]
                ),
                "reviewFeedback": row["복습 피드백"].strip(),

                # 암기반
                "memorizationClass1": row["암기반1"].strip(),
                "memorizationClass2": row["암기반2"].strip(),
                "memorizationAchievement": (
                    row["암기반 성취도"].strip() or None
                ),

                # 기타
                "teacherComment": row["쌤 한마디"].strip(),
                "notice": row["Notice"].strip(),
            }

            records.append(record)

    return records