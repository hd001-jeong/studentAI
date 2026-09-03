from database.connection import supabase


def read_next_attendance(
    teacher_name: str,
    attendance_date: str,
):
    response = (
        supabase
        .table("attendance")
        .select(
            """
            id,
            created_at,
            class_id,
            student_id,
            attendance_date,
            status,
            memo,
            students!attendance_student_id_fkey (
                student_name,
                school_name,
                grade,
                teacher_name
            ),
            classes!attendance_class_id_fkey (
                class_name,
                start_time,
                end_time
            )
            """
        )
        .eq("attendance_date", attendance_date)
        .eq("students.teacher_name", teacher_name)
        .order("class_id")
        .order("student_id")
        .execute()
    )

    return response.data


def create_next_attendance(data: dict):
    response = (
        supabase
        .table("attendance")
        .upsert(
            data,
            on_conflict="student_id,attendance_date",
        )
        .execute()
    )

    return response.data[0]