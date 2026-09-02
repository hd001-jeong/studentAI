from database.connection import supabase


def test_students():
    response = supabase.table("students").select("*").execute()

    print("조회 결과:")
    print(response.data)


if __name__ == "__main__":
    test_students()