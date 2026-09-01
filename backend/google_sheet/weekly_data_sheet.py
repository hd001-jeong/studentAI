from typing import Any
import unicodedata

from gspread.utils import rowcol_to_a1

from google_sheet.connection import get_worksheet


def clean_value(value: Any) -> str:
    if value is None:
        return ""

    return str(value).strip()


def clean_header(value: Any) -> str:
    if value is None:
        return ""

    return (
        unicodedata.normalize(
            "NFKC",
            str(value),
        )
        .replace("\ufeff", "")
        .replace("\u200b", "")
        .replace("\u200c", "")
        .replace("\u200d", "")
        .strip()
    )


def create_weekly_data_in_sheet(
    data: dict[str, Any],
) -> dict[str, Any]:

    worksheet = get_worksheet()

    raw_headers = worksheet.row_values(1)

    if not raw_headers:
        raise ValueError(
            "시트 헤더를 찾을 수 없습니다.",
        )

    # =====================================================
    # 헤더 정리
    # =====================================================

    headers = [
        clean_header(header)
        for header in raw_headers
    ]

    # =====================================================
    # DEBUG - 실제 연결된 시트 / 헤더 확인
    # =====================================================

    print("===== 주차 생성 DEBUG =====")
    print(
        "spreadsheet title:",
        worksheet.spreadsheet.title,
    )
    print(
        "spreadsheet id:",
        worksheet.spreadsheet.id,
    )
    print(
        "worksheet title:",
        worksheet.title,
    )
    print(
        "worksheet id:",
        worksheet.id,
    )
    print(
        "raw headers:",
        [
            repr(header)
            for header in raw_headers
        ],
    )
    print(
        "headers:",
        headers,
    )
    print("==========================")

    header_index = {
        header: index
        for index, header in enumerate(headers)
        if header
    }

    required_headers = [
        "번호",
        "구분",
        "주차",
        "진도",
        "날짜",
        "학생선택(이름/학교/학년)",
        "학생ID(자동)",
        "학생이름(자동)",
        "소속학교명(자동)",
        "학년(자동)",
        "담당 선생님",
        "당일1",
        "당일2",
        "당일3",
        "숙제1",
        "숙제2",
        "숙제3",
        "복습 테스트",
        "복습 문항 개수",
        "암기반1",
        "암기반2",
        "Notice",
    ]

    missing_headers = [
        header
        for header in required_headers
        if header not in header_index
    ]

    if missing_headers:
        raise ValueError(
            "필수 컬럼을 찾을 수 없습니다: "
            + ", ".join(missing_headers),
        )

    # =====================================================
    # 기본 데이터
    # =====================================================

    category = clean_value(
        data.get("category"),
    )

    if not category:
        category = "26년2학기"

    school_name = clean_value(
        data.get("schoolName"),
    )

    grade = clean_value(
        data.get("grade"),
    )

    week_label = clean_value(
        data.get("weekLabel"),
    )

    lesson_date = clean_value(
        data.get("lessonDate"),
    )

    teacher_name = clean_value(
        data.get("teacherName"),
    )

    students = data.get(
        "students",
        [],
    )

    review_question_count = data.get(
        "reviewQuestionCount",
    )

    # =====================================================
    # Validation
    # =====================================================

    if not school_name:
        raise ValueError(
            "학교를 선택해주세요.",
        )

    if not grade:
        raise ValueError(
            "학년을 선택해주세요.",
        )

    if not week_label:
        raise ValueError(
            "주차를 선택해주세요.",
        )

    if not lesson_date:
        raise ValueError(
            "날짜를 선택해주세요.",
        )

    if not teacher_name:
        raise ValueError(
            "담당 선생님을 입력해주세요.",
        )

    if not students:
        raise ValueError(
            "생성할 학생이 없습니다.",
        )

    if (
        review_question_count is not None
        and review_question_count < 0
    ):
        raise ValueError(
            "복습 문항 개수는 0 이상이어야 합니다.",
        )

    # =====================================================
    # 마지막 번호 찾기
    # =====================================================

    number_column_number = (
        header_index["번호"] + 1
    )

    number_values = worksheet.col_values(
        number_column_number,
    )

    last_number = 0

    for value in number_values[1:]:
        cleaned_value = clean_value(value)

        if cleaned_value.isdigit():
            last_number = max(
                last_number,
                int(cleaned_value),
            )

    # =====================================================
    # 마지막 실제 학생 데이터 행 찾기
    # 학생선택 컬럼 기준
    # =====================================================

    student_select_column_number = (
        header_index[
            "학생선택(이름/학교/학년)"
        ]
        + 1
    )

    student_select_values = worksheet.col_values(
        student_select_column_number,
    )

    last_data_row = 1

    for row_number, value in enumerate(
        student_select_values,
        start=1,
    ):
        if row_number == 1:
            continue

        if clean_value(value):
            last_data_row = row_number

    if last_data_row <= 1:
        raise ValueError(
            "기존 학생 데이터 행을 찾을 수 없습니다.",
        )

    start_row = last_data_row + 1
    end_row = start_row + len(students) - 1

    # =====================================================
    # 필요한 경우 시트 행 추가
    # =====================================================

    if end_row > worksheet.row_count:
        worksheet.add_rows(
            end_row - worksheet.row_count,
        )

    # =====================================================
    # 학생별 Validation 먼저 수행
    # =====================================================

    for student in students:
        student_id = clean_value(
            student.get("studentId"),
        )

        student_name = clean_value(
            student.get("studentName"),
        )

        student_school_name = clean_value(
            student.get("schoolName"),
        )

        student_grade = clean_value(
            student.get("grade"),
        )

        if not student_id:
            raise ValueError(
                "학생 ID가 없는 학생이 있습니다.",
            )

        if not student_name:
            raise ValueError(
                "학생 이름이 없는 학생이 있습니다.",
            )

        if not student_school_name:
            raise ValueError(
                f"{student_name} 학생의 "
                "학교 정보가 없습니다.",
            )

        if not student_grade:
            raise ValueError(
                f"{student_name} 학생의 "
                "학년 정보가 없습니다.",
            )

        if student_school_name != school_name:
            raise ValueError(
                f"{student_name} 학생의 "
                "학교 정보가 선택한 학교와 "
                "일치하지 않습니다.",
            )

        if student_grade != grade:
            raise ValueError(
                f"{student_name} 학생의 "
                "학년 정보가 선택한 학년과 "
                "일치하지 않습니다.",
            )

    # =====================================================
    # 자동 학생정보 수식만 복사
    #
    # 학생ID(자동)
    # 학생이름(자동)
    # 소속학교명(자동)
    # 학년(자동)
    #
    # 그 외 수식은 복사하지 않음
    # =====================================================

    auto_student_headers = [
        "학생ID(자동)",
        "학생이름(자동)",
        "소속학교명(자동)",
        "학년(자동)",
    ]

    copy_requests: list[dict[str, Any]] = []

    for target_row in range(
        start_row,
        end_row + 1,
    ):
        for header_name in auto_student_headers:
            column_index = header_index[
                header_name
            ]

            copy_requests.append(
                {
                    "copyPaste": {
                        "source": {
                            "sheetId": worksheet.id,
                            "startRowIndex": (
                                last_data_row - 1
                            ),
                            "endRowIndex": (
                                last_data_row
                            ),
                            "startColumnIndex": (
                                column_index
                            ),
                            "endColumnIndex": (
                                column_index + 1
                            ),
                        },
                        "destination": {
                            "sheetId": worksheet.id,
                            "startRowIndex": (
                                target_row - 1
                            ),
                            "endRowIndex": (
                                target_row
                            ),
                            "startColumnIndex": (
                                column_index
                            ),
                            "endColumnIndex": (
                                column_index + 1
                            ),
                        },
                        "pasteType": "PASTE_FORMULA",
                        "pasteOrientation": "NORMAL",
                    },
                }
            )

    if copy_requests:
        worksheet.spreadsheet.batch_update(
            {
                "requests": copy_requests,
            }
        )

    # =====================================================
    # 프론트에서 직접 입력하는 컬럼
    #
    # 여기에 없는 컬럼은 건드리지 않음
    # =====================================================

    writable_headers = [
        "번호",
        "구분",
        "주차",
        "진도",
        "날짜",
        "학생선택(이름/학교/학년)",
        "담당 선생님",
        "당일1",
        "당일2",
        "당일3",
        "숙제1",
        "숙제2",
        "숙제3",
        "복습 테스트",
        "복습 문항 개수",
        "암기반1",
        "암기반2",
        "Notice",
    ]

    updates: list[dict[str, Any]] = []

    # =====================================================
    # 학생별 입력 데이터 생성
    # =====================================================

    for index, student in enumerate(students):
        student_id = clean_value(
            student.get("studentId"),
        )

        student_name = clean_value(
            student.get("studentName"),
        )

        student_school_name = clean_value(
            student.get("schoolName"),
        )

        student_grade = clean_value(
            student.get("grade"),
        )

        target_row = start_row + index

        student_select_value = (
            f"{student_name}"
            f"({student_school_name}/{student_grade}) "
            f"[{student_id}]"
        )

        row_values: dict[str, Any] = {
            "번호": last_number + index + 1,
            "구분": category,
            "주차": week_label,
            "진도": clean_value(
                data.get("progress"),
            ),
            "날짜": lesson_date,
            "학생선택(이름/학교/학년)": (
                student_select_value
            ),
            "담당 선생님": teacher_name,

            "당일1": clean_value(
                data.get("daily1"),
            ),
            "당일2": clean_value(
                data.get("daily2"),
            ),
            "당일3": clean_value(
                data.get("daily3"),
            ),

            "숙제1": clean_value(
                data.get("homework1"),
            ),
            "숙제2": clean_value(
                data.get("homework2"),
            ),
            "숙제3": clean_value(
                data.get("homework3"),
            ),

            "복습 테스트": clean_value(
                data.get("reviewTest"),
            ),

            "복습 문항 개수": (
                review_question_count
                if review_question_count is not None
                else ""
            ),

            "암기반1": clean_value(
                data.get("memorization1"),
            ),

            "암기반2": clean_value(
                data.get("memorization2"),
            ),

            "Notice": clean_value(
                data.get("notice"),
            ),
        }

        for header_name in writable_headers:
            column_number = (
                header_index[header_name]
                + 1
            )

            # Google Sheets API를 호출하지 않고
            # Python 내부에서 셀 주소 계산
            cell_address = rowcol_to_a1(
                target_row,
                column_number,
            )

            updates.append(
                {
                    "range": cell_address,
                    "values": [
                        [
                            row_values[
                                header_name
                            ]
                        ]
                    ],
                }
            )

    # =====================================================
    # 프론트 입력값 저장
    # =====================================================

    worksheet.batch_update(
        updates,
        value_input_option="USER_ENTERED",
    )

    # =====================================================
    # 결과
    # =====================================================

    return {
        "createdCount": len(students),
        "startRow": start_row,
        "endRow": end_row,
    }