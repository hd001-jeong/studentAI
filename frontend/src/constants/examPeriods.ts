import type { LessonRecord } from "@/types/lessonRecord";
import { DEFAULT_WEEK_RECORDS } from "@/constants/studentConstants";

export type ExamPeriodKey = "MIDTERM" | "FINAL";

export interface ExamPeriod {
  key: ExamPeriodKey;
  label: string;
  /** 기간 시작일 (포함) */
  startDate: string;
  /** 기간 종료일 (포함) */
  endDate: string;
  /** 빈 카드 생성 기준이 되는 첫 수업일 (학교별 설정이 없을 때 사용) */
  firstLessonDate: string;
  /** 학교별 첫 수업일 (있으면 firstLessonDate보다 우선) */
  firstLessonDateBySchool?: Record<string, string>;
}

export const EXAM_PERIODS: ExamPeriod[] = [
  {
    key: "MIDTERM",
    label: "중간고사",
    startDate: "2026-08-01",
    // 9월 5주 이후 시험기간(10월 1~2주)에 기록이 있어도 중간고사 쪽에 남도록
    endDate: "2026-10-11",
    firstLessonDate: "2026-08-18",
  },
  {
    key: "FINAL",
    label: "기말고사",
    startDate: "2026-10-12", // 10월 3주 월요일
    endDate: "2026-12-31",
    firstLessonDate: "2026-10-13", // 기본값: 10월 3주
    firstLessonDateBySchool: {
      이화여고: "2026-10-17", // 10월 3주 토요일
      인창고: "2026-10-20", // 10월 4주 화요일
    },
  },
];

export const CURRENT_EXAM_PERIOD: ExamPeriodKey = "FINAL";

const toTime = (date: string) => new Date(`${date}T00:00:00`).getTime();

/**
 * lessonDate가 비어 있거나 형식이 다르면 false
 * → 시트의 lessonDate는 반드시 YYYY-MM-DD 형식으로 입력
 */
export const isInPeriod = (lessonDate: string, period: ExamPeriod) => {
  if (!lessonDate) {
    return false;
  }

  const t = toTime(lessonDate);

  if (Number.isNaN(t)) {
    return false;
  }

  return t >= toTime(period.startDate) && t <= toTime(period.endDate);
};

/**
 * 기존 데이터와 같은 방식(월요일 시작 달력 주차)으로 주차 라벨 생성
 * 2026-08-18 → "8월 4주", 2026-09-29 → "9월 5주", 2026-10-13 → "10월 3주"
 */
export const getWeekLabel = (dateStr: string) => {
  const date = new Date(`${dateStr}T00:00:00`);
  const first = new Date(date.getFullYear(), date.getMonth(), 1);
  const offset = (first.getDay() + 6) % 7; // 월요일 = 0
  const week = Math.ceil((date.getDate() + offset) / 7);

  return `${date.getMonth() + 1}월 ${week}주`;
};

const addDays = (dateStr: string, days: number) => {
  const d = new Date(`${dateStr}T00:00:00`);
  d.setDate(d.getDate() + days);

  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");

  return `${y}-${m}-${day}`;
};

/**
 * 기간 내 주차 칸 생성
 * - 실제 기록이 있는 주 → 실제 기록
 * - 없는 주 → 빈 카드 (recordId: DEFAULT_{기간}_{n})
 */
export const getFirstLessonDate = (period: ExamPeriod, schoolName?: string) =>
  (schoolName && period.firstLessonDateBySchool?.[schoolName]) ||
  period.firstLessonDate;

export const buildPeriodWeeks = (
  period: ExamPeriod,
  records: LessonRecord[],
  schoolName?: string,
  count = 8,
): LessonRecord[] => {
  const template = DEFAULT_WEEK_RECORDS[0];
  const firstLessonDate = getFirstLessonDate(period, schoolName);

  const slots: LessonRecord[] = Array.from({ length: count }, (_, i) => {
    const lessonDate = addDays(firstLessonDate, i * 7);
    const weekLabel = getWeekLabel(lessonDate);

    const real = records.find(
      (record) => getWeekLabel(record.lessonDate) === weekLabel,
    );

    if (real) {
      return real;
    }

    return {
      ...template,
      recordId: `DEFAULT_${period.key}_${i + 1}`,
      weekNumber: i + 1,
      weekLabel,
      lessonDate,
      progress: "",
    } as LessonRecord;
  });

  // 칸에 안 들어간 실제 기록(같은 주 2회 수업, 8주 이후 기록 등)은 뒤에 붙임
  const usedIds = new Set(slots.map((slot) => slot.recordId));
  const extras = records.filter((record) => !usedIds.has(record.recordId));

  return [...slots, ...extras].sort(
    (a, b) => toTime(a.lessonDate) - toTime(b.lessonDate),
  );
};
