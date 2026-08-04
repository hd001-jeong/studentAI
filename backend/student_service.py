from csv_service import read_students


def get_students():
    records = read_students()
    students_by_id = {}

    for record in records:
        student_id = record["studentId"]

        # 아직 학생 정보가 입력되지 않은 빈 행은 제외
        if not student_id:
            continue

        students_by_id[student_id] = {
            "studentId": student_id,
            "studentName": record["studentName"],
            "schoolName": record["schoolName"],
            "grade": record["grade"],
            "teacherName": record["teacherName"],
        }

    return list(students_by_id.values())


def get_student_records(student_id: str):
    records = read_students()

    return [
        record
        for record in records
        if record["studentId"] == student_id
    ]