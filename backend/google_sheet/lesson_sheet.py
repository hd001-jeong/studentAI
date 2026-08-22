from typing import Any

import gspread

from google_sheet.connection import get_worksheet

from google_sheet.utils import (
    create_achievement_item,
    get_record_id_from_row,
    to_number_or_none,
    to_week_number,
)



def create_lesson_record_from_row(
    row: dict[str, Any],
) -> dict[str, Any] | None:
    number = to_number_or_none(
        row.get(
            "번호",
            "",
        ),
    )

    record_id = get_record_id_from_row(
        row,
    )

    if not record_id:
        return None

    student_id = str(
        row.get(
            "학생ID(자동)",
            "",
        ),
    ).strip()

    teacher_name = str(
        row.get(
            "담당 선생님",
            "",
        ),
    ).strip()

    return {
        "recordId": record_id,

        "number": number,

        "category": str(
            row.get(
                "구분",
                "",
            ),
        ).strip(),

        "weekNumber": to_week_number(
            row.get(
                "주차",
                "",
            ),
        ),

        "weekLabel": str(
            row.get(
                "주차",
                "",
            ),
        ).strip(),

        "progress": str(
            row.get(
                "진도",
                "",
            ),
        ).strip(),

        "lessonDate": str(
            row.get(
                "날짜",
                "",
            ),
        ).strip(),

        "studentId": student_id,

        "studentName": str(
            row.get(
                "학생이름(자동)",
                "",
            ),
        ).strip(),

        "schoolName": str(
            row.get(
                "소속학교명(자동)",
                "",
            ),
        ).strip(),

        "grade": str(
            row.get(
                "학년(자동)",
                "",
            ),
        ).strip(),

        "teacherName": teacher_name,

        "homeworks": [
            create_achievement_item(
                row.get("숙제1", ""),
                row.get("숙제1 성취도", ""),
            ),
            create_achievement_item(
                row.get("숙제2", ""),
                row.get("숙제2 성취도", ""),
            ),
            create_achievement_item(
                row.get("숙제3", ""),
                row.get("숙제3 성취도", ""),
            ),
        ],

        "dailyEvaluations": [
            create_achievement_item(
                row.get("당일1", ""),
                row.get("당일1 성취도", ""),
            ),
            create_achievement_item(
                row.get("당일2", ""),
                row.get("당일2 성취도", ""),
            ),
            create_achievement_item(
                row.get("당일3", ""),
                row.get("당일3 성취도", ""),
            ),
        ],

        "homeworkAchievement": to_number_or_none(
            row.get(
                "숙제 성취도(자동)",
                "",
            ),
        ),

        "homeworkGrade": str(
            row.get(
                "숙제 등급(자동)",
                "",
            ),
        ).strip(),

        "dailyAchievement": to_number_or_none(
            row.get(
                "당일 성취도(자동)",
                "",
            ),
        ),

        "dailyGrade": str(
            row.get(
                "당일 등급(자동)",
                "",
            ),
        ).strip(),

        "reviewTest": str(
            row.get(
                "복습 테스트",
                "",
            ),
        ).strip(),

        "reviewQuestionCount": to_number_or_none(
            row.get(
                "복습 문항 개수",
                "",
            ),
        ),

        "reviewCorrectCount": to_number_or_none(
            row.get(
                "복습 맞은 개수",
                "",
            ),
        ),

        "reviewTestScore": to_number_or_none(
            row.get(
                "복습 테스트 점수(자동)",
                "",
            ),
        ),

        "reviewFeedback": str(
            row.get(
                "복습 피드백",
                "",
            ),
        ).strip(),

        "memorizationClass1": str(
            row.get(
                "암기반1",
                "",
            ),
        ).strip(),

        "memorizationClass2": str(
            row.get(
                "암기반2",
                "",
            ),
        ).strip(),

        "memorizationAchievement": (
            str(
                row.get(
                    "암기반 성취도",
                    "",
                ),
            ).strip()
            or None
        ),

        "teacherComment": str(
            row.get(
                "쌤 한마디",
                "",
            ),
        ).strip(),

        "notice": str(
            row.get(
                "Notice",
                "",
            ),
        ).strip(),
    }


# =========================================================
# 선택 학생의 수업 기록 조회
# =========================================================
def read_student_records_from_sheet(
    teacher_name: str,
    student_id: str,
) -> list[dict[str, Any]]:
    """
    학생 Select에서 선택한 studentId에 해당하는
    수업 기록만 반환한다.
    """

    worksheet = get_worksheet()

    rows = worksheet.get_all_records(
        default_blank="",
    )

    records: list[
        dict[str, Any]
    ] = []

    cleaned_teacher_name = str(
        teacher_name,
    ).strip()

    cleaned_student_id = str(
        student_id,
    ).strip()

    for row in rows:
        row_teacher_name = str(
            row.get(
                "담당 선생님",
                "",
            ),
        ).strip()

        if row_teacher_name != cleaned_teacher_name:
            continue

        row_student_id = str(
            row.get(
                "학생ID(자동)",
                "",
            ),
        ).strip()

        if row_student_id != cleaned_student_id:
            continue

        record = create_lesson_record_from_row(
            row,
        )

        if record is None:
            continue

        records.append(
            record,
        )

    # 최신 주차 순으로 정렬
    records = sorted(
        records,
        key=lambda record: record["weekNumber"] or 0,
        reverse=True,
    )

    # 최신 8개만 가져오기
    records = records[:8]

    # 화면에서는 오래된 주차 → 최신 주차 순으로 표시
    records = sorted(
        records,
        key=lambda record: record["weekNumber"] or 0,
    )

    return records


# =========================================================
# 여러 학생 수업 기록 일괄 조회
# =========================================================

def read_student_records_batch_from_sheet(
    teacher_name: str,
    student_ids: list[str],
) -> dict[str, list[dict[str, Any]]]:
    """
    여러 학생의 수업 기록을
    Google Sheet 한 번 조회로 반환한다.
    """

    worksheet = get_worksheet()

    rows = worksheet.get_all_records(
        default_blank="",
    )

    cleaned_teacher_name = str(
        teacher_name,
    ).strip()

    cleaned_student_ids = {
        str(student_id).strip()
        for student_id in student_ids
        if str(student_id).strip()
    }

    records_by_student: dict[
        str,
        list[dict[str, Any]],
    ] = {
        student_id: []
        for student_id in cleaned_student_ids
    }

    for row in rows:
        row_teacher_name = str(
            row.get(
                "담당 선생님",
                "",
            ),
        ).strip()

        if row_teacher_name != cleaned_teacher_name:
            continue

        row_student_id = str(
            row.get(
                "학생ID(자동)",
                "",
            ),
        ).strip()

        if row_student_id not in cleaned_student_ids:
            continue

        record = create_lesson_record_from_row(
            row,
        )

        if record is None:
            continue

        records_by_student[
            row_student_id
        ].append(
            record,
        )

    # 학생별 최근 8개만 유지
    for student_id in records_by_student:
        student_records = sorted(
            records_by_student[
                student_id
            ],
            key=lambda record: record["weekNumber"] or 0,
            reverse=True,
        )

        student_records = student_records[:8]

        records_by_student[
            student_id
        ] = sorted(
            student_records,
            key=lambda record: record["weekNumber"] or 0,
        )

    return records_by_student


# =========================================================
# 수업 기록 수정
# =========================================================

def update_lesson_record_in_sheet(
    record_id: str,
    record: dict,
) -> dict:
    """
    recordId에 해당하는 수업기록 한 행을 수정한다.
    """
    worksheet = get_worksheet()

    rows = worksheet.get_all_records(
        default_blank="",
    )

    headers = worksheet.row_values(
        1,
    )

    for row_index, row in enumerate(
        rows,
        start=2,
    ):
        current_record_id = (
            get_record_id_from_row(
                row,
            )
        )

        if current_record_id != str(
            record_id,
        ).strip():
            continue

        homeworks = record.get(
            "homeworks",
            [],
        )

        daily_evaluations = record.get(
            "dailyEvaluations",
            [],
        )

        values_by_header = {
            # 기본 정보
            "주차": record.get(
                "weekLabel",
                "",
            ),

            "진도": record.get(
                "progress",
                "",
            ),

            "날짜": record.get(
                "lessonDate",
                "",
            ),

            # 숙제1
            "숙제1": (
                homeworks[0].get(
                    "name",
                    "",
                )
                if len(homeworks) > 0
                else ""
            ),

            "숙제1 성취도": (
                homeworks[0].get(
                    "achievement",
                    "",
                )
                if len(homeworks) > 0
                else ""
            ),

            # 숙제2
            "숙제2": (
                homeworks[1].get(
                    "name",
                    "",
                )
                if len(homeworks) > 1
                else ""
            ),

            "숙제2 성취도": (
                homeworks[1].get(
                    "achievement",
                    "",
                )
                if len(homeworks) > 1
                else ""
            ),

            # 숙제3
            "숙제3": (
                homeworks[2].get(
                    "name",
                    "",
                )
                if len(homeworks) > 2
                else ""
            ),

            "숙제3 성취도": (
                homeworks[2].get(
                    "achievement",
                    "",
                )
                if len(homeworks) > 2
                else ""
            ),

            # 당일1
            "당일1": (
                daily_evaluations[0].get(
                    "name",
                    "",
                )
                if len(
                    daily_evaluations
                ) > 0
                else ""
            ),

            "당일1 성취도": (
                daily_evaluations[0].get(
                    "achievement",
                    "",
                )
                if len(
                    daily_evaluations
                ) > 0
                else ""
            ),

            # 당일2
            "당일2": (
                daily_evaluations[1].get(
                    "name",
                    "",
                )
                if len(
                    daily_evaluations
                ) > 1
                else ""
            ),

            "당일2 성취도": (
                daily_evaluations[1].get(
                    "achievement",
                    "",
                )
                if len(
                    daily_evaluations
                ) > 1
                else ""
            ),

            # 당일3
            "당일3": (
                daily_evaluations[2].get(
                    "name",
                    "",
                )
                if len(
                    daily_evaluations
                ) > 2
                else ""
            ),

            "당일3 성취도": (
                daily_evaluations[2].get(
                    "achievement",
                    "",
                )
                if len(
                    daily_evaluations
                ) > 2
                else ""
            ),

            # 복습
            "복습 테스트": record.get(
                "reviewTest",
                "",
            ),

            "복습 문항 개수": record.get(
                "reviewQuestionCount",
                "",
            ),

            "복습 맞은 개수": record.get(
                "reviewCorrectCount",
                "",
            ),

            "복습 피드백": record.get(
                "reviewFeedback",
                "",
            ),

            # 암기반
            "암기반1": record.get(
                "memorizationClass1",
                "",
            ),

            "암기반2": record.get(
                "memorizationClass2",
                "",
            ),

            "암기반 성취도": record.get(
                "memorizationAchievement",
                "",
            ),

            # 코멘트
            "쌤 한마디": record.get(
                "teacherComment",
                "",
            ),

            "Notice": record.get(
                "notice",
                "",
            ),
        }

        cells_to_update = []

        for (
            header,
            value,
        ) in values_by_header.items():

            if header not in headers:
                continue

            column_index = (
                headers.index(
                    header,
                )
                + 1
            )

            if value is None:
                value = ""

            cells_to_update.append(
                {
                    "range": (
                        gspread.utils.rowcol_to_a1(
                            row_index,
                            column_index,
                        )
                    ),
                    "values": [
                        [
                            value,
                        ]
                    ],
                }
            )

        if cells_to_update:
            worksheet.batch_update(
                cells_to_update,
            )

        return record

    raise ValueError(
        "수업 기록을 찾을 수 없습니다: "
        f"{record_id}"
    )
