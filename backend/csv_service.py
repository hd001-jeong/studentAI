import csv


def to_number(value: str):
    if value == "":
        return 0

    try:
        return int(value)
    except ValueError:
        return value


def read_students():
    records = []

    with open(
        "data/lesson_records.csv",
        mode="r",
        encoding="utf-8-sig",
    ) as file:
        reader = csv.DictReader(file)

        for row in reader:
            record = {
                "number": to_number(row["번호"]),
                "category": row["구분"],
                "week": row["주차"],
                "progress": row["진도"],
                "lessonDate": row["날짜"],

                "studentId": row["학생ID(자동)"],
                "studentName": row["학생이름(자동)"],
                "schoolName": row["소속학교명(자동)"],
                "grade": row["학년(자동)"],
                "teacherName": row["담당 선생님"],

                "homework1": row["숙제1"],
                "homework1Achievement": to_number(row["숙제1 성취도"]),
                "homework2": row["숙제2"],
                "homework2Achievement": to_number(row["숙제2 성취도"]),
                "homework3": row["숙제3"],
                "homework3Achievement": to_number(row["숙제3 성취도"]),

                "homeworkAchievement": to_number(row["숙제 성취도(자동)"]),
                "homeworkGrade": row["숙제 등급 (자동)"],

                "daily1": row["당일1"],
                "daily1Achievement": to_number(row["당일1 성취도"]),
                "daily2": row["당일2"],
                "daily2Achievement": to_number(row["당일2 성취도"]),
                "daily3": row["당일3"],
                "daily3Achievement": to_number(row["당일3 성취도"]),

                "dailyAchievement": to_number(row["당일 성취도(자동)"]),
                "dailyGrade": row["당일 등급(자동)"],

                "reviewTest": row["복습 테스트"],
                "reviewQuestionCount": to_number(row["복습 문항 개수"]),
                "reviewCorrectCount": to_number(row["복습 맞은 개수"]),
                "reviewTestScore": to_number(row["복습 테스트 점수(자동)"]),
                "reviewFeedback": row["복습 피드백"],

                "memorizationClass1": row["암기반1"],
                "memorizationClass2": row["암기반2"],
                "memorizationAchievement": row["암기반 성취도"],

                "teacherComment": row["쌤 한마디"],
                "notice": row["Notice"],
            }

            records.append(record)

    return records