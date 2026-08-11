import type {
  AchievementItem,
  LessonRecord,
  MemorizationAchievement,
} from "@/types/lessonRecord";

export const EMPTY_ACHIEVEMENT_ITEM: AchievementItem = {
  name: "",
  achievement: null,
};

/**
 * 빈 주차 데이터 생성
 */
function createDefaultWeekRecord(weekNumber: number): LessonRecord {
  return {
    recordId: `DEFAULT_WEEK_${weekNumber}`,

    number: null,
    category: "",

    weekNumber,
    weekLabel: `${weekNumber}주차`,
    progress: "",
    lessonDate: "",

    studentId: "",
    studentName: "",
    schoolName: "",
    grade: "",
    teacherName: "",

    homeworks: [
      {
        name: "",
        achievement: null,
      },
      {
        name: "",
        achievement: null,
      },
      {
        name: "",
        achievement: null,
      },
    ],

    dailyEvaluations: [
      {
        name: "",
        achievement: null,
      },
      {
        name: "",
        achievement: null,
      },
      {
        name: "",
        achievement: null,
      },
    ],

    homeworkAchievement: null,
    homeworkGrade: "",

    dailyAchievement: null,
    dailyGrade: "",

    reviewTest: "",
    reviewQuestionCount: null,
    reviewCorrectCount: null,
    reviewTestScore: null,
    reviewFeedback: "",

    memorizationClass1: "",
    memorizationClass2: "",
    memorizationAchievement: null,

    teacherComment: "",
    notice: "",
  };
}

/**
 * 대시보드 최초 진입 시 보여줄 기본 1~4주차
 */
export const DEFAULT_WEEK_RECORDS: LessonRecord[] = [
  createDefaultWeekRecord(1),
  createDefaultWeekRecord(2),
  createDefaultWeekRecord(3),
  createDefaultWeekRecord(4),
];

export const ACHIEVEMENT_GOOD_MIN_SCORE = 80;
export const ACHIEVEMENT_DANGER_MAX_SCORE = 30;

export const TEACHER_COMMENT_MAX_LENGTH = 40;

export const MEMORIZATION_OPTIONS: Array<{
  label: Exclude<MemorizationAchievement, null>;
  value: Exclude<MemorizationAchievement, null>;
}> = [
  {
    label: "통과",
    value: "통과",
  },
  {
    label: "보충 필요",
    value: "보충 필요",
  },
  {
    label: "결석",
    value: "결석",
  },
  {
    label: "조퇴",
    value: "조퇴",
  },
];

export const ACHIEVEMENT_COLORS = {
  empty: "#bfbfbf",
  success: "#52c41a",
  warning: "#faad14",
  error: "#ff4d4f",
} as const;

export const ACHIEVEMENT_BACKGROUNDS = {
  empty: "#f5f5f5",
  success: "#f6ffed",
  warning: "#fffbe6",
  error: "#fff2f0",
} as const;
