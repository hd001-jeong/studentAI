import type { LessonRecord } from "@/types/lessonRecord";
import { DEFAULT_WEEK_RECORDS } from "@/constants/studentConstants";

export type ExamPeriodKey = "MIDTERM" | "FINAL";

export interface ExamPeriod {
  key: ExamPeriodKey;
  label: string;
  startDate: string;
  endDate: string;
  firstLessonDate: string;
  firstLessonDateBySchool?: Record<string, string>;
}

export const EXAM_PERIODS: ExamPeriod[] = [
  {
    key: "MIDTERM",
    label: "중간고사",
    startDate: "2026-08-01",
    endDate: "2026-10-11",
    firstLessonDate: "2026-08-18",
  },
  {
    key: "FINAL",
    label: "기말고사",
    startDate: "2026-10-12",
    endDate: "2026-12-31",
    firstLessonDate: "2026-10-13",
    firstLessonDateBySchool: {
      이화여고: "2026-10-17",
      인창고: "2026-10-20",
    },
  },
];

export const CURRENT_EXAM_PERIOD: ExamPeriodKey = "FINAL";

const toTime = (date: string) => new Date(`${date}T00:00:00`).getTime();

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
 * 기존 월요일 시작 달력 주차 계산 유지
 */
export const getWeekLabel = (dateStr: string) => {
  const date = new Date(`${dateStr}T00:00:00`);
  const first = new Date(date.getFullYear(), date.getMonth(), 1);

  const offset = (first.getDay() + 6) % 7;
  const week = Math.ceil((date.getDate() + offset) / 7);

  return `${date.getMonth() + 1}월 ${week}주`;
};

const formatDate = (date: Date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");

  return `${y}-${m}-${d}`;
};

/**
 * 해당 월의 특정 주차에 속하는 첫 날짜
 */
const getWeekStartDate = (year: number, month: number, week: number) => {
  const first = new Date(year, month - 1, 1);
  const offset = (first.getDay() + 6) % 7;

  const day = Math.max(1, (week - 1) * 7 - offset + 1);

  return formatDate(new Date(year, month - 1, day));
};

/**
 * 월별 주차 독립 생성
 *
 * 10월 4주
 * 10월 5주
 * 11월 1주
 * 11월 2주
 *
 * 월이 변경되면 반드시 1주부터 시작
 */
const buildWeekSlots = (firstLessonDate: string, count: number) => {
  const first = new Date(`${firstLessonDate}T00:00:00`);

  let year = first.getFullYear();
  let month = first.getMonth() + 1;

  const firstLabel = getWeekLabel(firstLessonDate);
  let week = Number(firstLabel.match(/(\d+)주/)?.[1] ?? 1);

  const slots: {
    weekLabel: string;
    lessonDate: string;
  }[] = [];

  while (slots.length < count) {
    const weekLabel = `${month}월 ${week}주`;

    const lessonDate =
      slots.length === 0
        ? firstLessonDate
        : getWeekStartDate(year, month, week);

    // 해당 월에 실제로 존재하는 주차인지 확인
    const lastDay = new Date(year, month, 0);
    const lastWeek = Number(
      getWeekLabel(formatDate(lastDay)).match(/(\d+)주/)?.[1] ?? 1,
    );

    if (week > lastWeek) {
      month += 1;

      if (month > 12) {
        month = 1;
        year += 1;
      }

      week = 1;
      continue;
    }

    slots.push({
      weekLabel,
      lessonDate,
    });

    week += 1;
  }

  return slots;
};

export const getFirstLessonDate = (period: ExamPeriod, schoolName?: string) =>
  (schoolName && period.firstLessonDateBySchool?.[schoolName]) ||
  period.firstLessonDate;

/**
 * 시험 기간별 주차 카드 생성
 *
 * 실제 기록 우선
 * 기록이 없으면 DEFAULT 카드 생성
 * 월별 주차 독립 관리
 */
export const buildPeriodWeeks = (
  period: ExamPeriod,
  records: LessonRecord[],
  schoolName?: string,
  count = 8,
): LessonRecord[] => {
  const template = DEFAULT_WEEK_RECORDS[0];

  const firstLessonDate = getFirstLessonDate(period, schoolName);

  const weekSlots = buildWeekSlots(firstLessonDate, count);

  const slots: LessonRecord[] = weekSlots.map(
    ({ weekLabel, lessonDate }, index) => {
      const real = records.find((record) => record.weekLabel === weekLabel);

      if (real) {
        return real;
      }

      return {
        ...template,
        recordId: `DEFAULT_${period.key}_${index + 1}`,
        weekNumber: index + 1,
        weekLabel,
        lessonDate,
        progress: "",
      } as LessonRecord;
    },
  );

  const usedIds = new Set(slots.map((slot) => slot.recordId));

  const extras = records.filter((record) => !usedIds.has(record.recordId));

  // 주차 슬롯 순서를 유지하면서
  // 실제 추가 기록도 보존
  return [...slots, ...extras];
};
