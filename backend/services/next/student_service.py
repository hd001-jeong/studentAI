from database.connection import supabase


def read_next_students(teacher_name: str):
    response = (
        supabase
        .table("students")
        .select("*")
        .eq("teacher_name", teacher_name)
        .order("id")
        .execute()
    )

    return response.data


def read_next_student_count(teacher_name: str) -> int:
    response = (
        supabase
        .table("students")
        .select("id")
        .eq("teacher_name", teacher_name)
        .execute()
    )

    return len(response.data)


def create_next_student(data: dict):
    response = (
        supabase
        .table("students")
        .insert(data)
        .execute()
    )

    return response.data[0]