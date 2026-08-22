import re
from typing import Any


def to_number_or_none(
    value: Any,
) -> int | None:
    """
    빈 값 -> None
    숫자 -> int
    """
    cleaned_value = str(value).strip()

    if cleaned_value == "":
        return None

    try:
        return int(float(cleaned_value))
    except ValueError:
        return None


def to_week_number(
    value: Any,
) -> int:
    """
    예:
    1       -> 1
    1주     -> 1
    1주차   -> 1
    8월4주  -> 4
    """
    cleaned_value = str(value).strip()

    match = re.search(
        r"(\d+)\s*주(?:차)?",
        cleaned_value,
    )

    if match:
        return int(
            match.group(1),
        )

    try:
        return int(
            cleaned_value,
        )
    except ValueError:
        return 0


def create_achievement_item(
    name: Any,
    achievement: Any,
) -> dict[str, Any]:
    return {
        "name": str(name).strip(),
        "achievement": to_number_or_none(
            achievement,
        ),
    }


def get_record_id_from_row(
    row: dict[str, Any],
) -> str:
    """
    구글시트의 통합행번호를 recordId로 사용한다.

    통합행번호가 없는 경우에만 fallback ID를 만든다.
    """
    integrated_row_number = str(
        row.get(
            "통합행번호(자동, 건드리지 마세요)",
            "",
        ),
    ).strip()

    if integrated_row_number:
        return integrated_row_number

    student_id = str(
        row.get(
            "학생ID(자동)",
            "",
        ),
    ).strip()

    number = to_number_or_none(
        row.get(
            "번호",
            "",
        ),
    )

    if student_id and number is not None:
        return f"{student_id}-{number}"

    if student_id:
        return student_id

    return ""