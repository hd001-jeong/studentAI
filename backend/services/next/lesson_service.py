from database.connection import supabase


def read_next_lesson_records(
    student_id: int,
    teacher_name: str,
):
    response = (
        supabase
        .table("lesson_records")
        .select(
            """
            *,
            daily_evaluations(*),
            homework_evaluations(*),
            review_tests(*),
            memorization_records(*)
            """
        )
        .eq("student_id", student_id)
        .eq("teacher_name", teacher_name)
        .order("lesson_date", desc=True)
        .order("id", desc=True)
        .execute()
    )

    return response.data


def create_next_lesson_record(data: dict):
    lesson_data = {
        "student_id": data["studentId"],
        "category": data.get("category"),
        "year": data.get("year"),
        "month": data.get("month"),
        "week_of_month": data.get("weekOfMonth"),
        "week_label": data.get("weekLabel"),
        "progress": data.get("progress"),
        "lesson_date": data.get("lessonDate"),
        "teacher_name": data["teacherName"],
        "daily_achievement": data.get("dailyAchievement"),
        "daily_grade": data.get("dailyGrade"),
        "homework_achievement": data.get("homeworkAchievement"),
        "homework_grade": data.get("homeworkGrade"),
        "teacher_comment": data.get("teacherComment"),
    }

    lesson_response = (
        supabase
        .table("lesson_records")
        .insert(lesson_data)
        .execute()
    )

    lesson_record = lesson_response.data[0]
    lesson_record_id = lesson_record["id"]

    _save_daily_evaluations(
        lesson_record_id,
        data.get("dailyEvaluations", []),
    )

    _save_homework_evaluations(
        lesson_record_id,
        data.get("homeworks", []),
    )

    _save_review_test(
        lesson_record_id,
        data.get("reviewTest"),
    )

    _save_memorization(
        lesson_record_id,
        data.get("memorization"),
    )

    return lesson_record


def update_next_lesson_record(
    lesson_record_id: int,
    data: dict,
):
    lesson_data = {
        "student_id": data["studentId"],
        "category": data.get("category"),
        "year": data.get("year"),
        "month": data.get("month"),
        "week_of_month": data.get("weekOfMonth"),
        "week_label": data.get("weekLabel"),
        "progress": data.get("progress"),
        "lesson_date": data.get("lessonDate"),
        "teacher_name": data["teacherName"],
        "daily_achievement": data.get("dailyAchievement"),
        "daily_grade": data.get("dailyGrade"),
        "homework_achievement": data.get("homeworkAchievement"),
        "homework_grade": data.get("homeworkGrade"),
        "teacher_comment": data.get("teacherComment"),
    }

    lesson_response = (
        supabase
        .table("lesson_records")
        .update(lesson_data)
        .eq("id", lesson_record_id)
        .execute()
    )

    if not lesson_response.data:
        raise ValueError("수업 기록을 찾을 수 없습니다.")

    (
        supabase
        .table("daily_evaluations")
        .delete()
        .eq("lesson_record_id", lesson_record_id)
        .execute()
    )

    (
        supabase
        .table("homework_evaluations")
        .delete()
        .eq("lesson_record_id", lesson_record_id)
        .execute()
    )

    (
        supabase
        .table("review_tests")
        .delete()
        .eq("lesson_record_id", lesson_record_id)
        .execute()
    )

    (
        supabase
        .table("memorization_records")
        .delete()
        .eq("lesson_record_id", lesson_record_id)
        .execute()
    )

    _save_daily_evaluations(
        lesson_record_id,
        data.get("dailyEvaluations", []),
    )

    _save_homework_evaluations(
        lesson_record_id,
        data.get("homeworks", []),
    )

    _save_review_test(
        lesson_record_id,
        data.get("reviewTest"),
    )

    _save_memorization(
        lesson_record_id,
        data.get("memorization"),
    )

    return lesson_response.data[0]


def delete_next_lesson_record(
    lesson_record_id: int,
):
    response = (
        supabase
        .table("lesson_records")
        .delete()
        .eq("id", lesson_record_id)
        .execute()
    )

    if not response.data:
        raise ValueError("수업 기록을 찾을 수 없습니다.")

    return {
        "success": True,
        "id": lesson_record_id,
    }


def _save_daily_evaluations(
    lesson_record_id: int,
    items: list[dict],
):
    if not items:
        return

    rows = []

    for index, item in enumerate(items, start=1):
        rows.append(
            {
                "lesson_record_id": lesson_record_id,
                "evaluation_no": index,
                "evaluation_name": item.get("name"),
                "achievement": item.get("achievement"),
            }
        )

    (
        supabase
        .table("daily_evaluations")
        .insert(rows)
        .execute()
    )


def _save_homework_evaluations(
    lesson_record_id: int,
    items: list[dict],
):
    if not items:
        return

    rows = []

    for index, item in enumerate(items, start=1):
        rows.append(
            {
                "lesson_record_id": lesson_record_id,
                "homework_no": index,
                "homework_name": item.get("name"),
                "achievement": item.get("achievement"),
            }
        )

    (
        supabase
        .table("homework_evaluations")
        .insert(rows)
        .execute()
    )


def _save_review_test(
    lesson_record_id: int,
    review_test: dict | None,
):
    if not review_test:
        return

    (
        supabase
        .table("review_tests")
        .insert(
            {
                "lesson_record_id": lesson_record_id,
                "test_name": review_test.get("name"),
                "question_count": review_test.get("questionCount"),
                "correct_count": review_test.get("correctCount"),
                "score": review_test.get("score"),
                "feedback": review_test.get("feedback"),
            }
        )
        .execute()
    )


def _save_memorization(
    lesson_record_id: int,
    memorization: dict | None,
):
    if not memorization:
        return

    (
        supabase
        .table("memorization_records")
        .insert(
            {
                "lesson_record_id": lesson_record_id,
                "memorization1": memorization.get("memorization1"),
                "memorization2": memorization.get("memorization2"),
                "achievement": memorization.get("achievement"),
            }
        )
        .execute()
    )