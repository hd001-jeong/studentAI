from database.connection import supabase


def read_next_classes(teacher_name: str):
    response = (
        supabase
        .table("classes")
        .select("*")
        .eq("teacher_name", teacher_name)
        .eq("is_active", True)
        .order("day_of_week")
        .order("start_time")
        .execute()
    )

    return response.data

def read_today_classes(
    teacher_name: str,
    day_of_week: int,
):
    response = (
        supabase
        .table("classes")
        .select("*")
        .eq("teacher_name", teacher_name)
        .eq("day_of_week", day_of_week)
        .eq("is_active", True)
        .order("start_time")
        .execute()
    )

    return response.data

def read_class_students(
    class_id: int,
):
    response = (
        supabase
        .table("students")
        .select("*")
        .eq("class_id", class_id)
        .order("id")
        .execute()
    )

    return response.data