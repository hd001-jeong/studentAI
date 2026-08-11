export interface AchievementItem {
  name: string;
  achievement: number | null;
}

export type AchievementTuple = [
  AchievementItem,
  AchievementItem,
  AchievementItem,
];

export type MemorizationAchievement =
  | "통과"
  | "보충 필요"
  | "결석"
  | "조퇴"
  | null;

export interface LessonRecord {
  recordId: string;

  studentId: string;
  studentName: string;
  schoolName: string;
  grade: string;
  teacherName: string;

  weekNumber: number;
  lessonDate: string;
  weekLabel: string;
  progress: string;

  homeworks: AchievementTuple;
  dailyEvaluations: AchievementTuple;

  reviewTest: string;
  reviewQuestionCount: number | null;
  reviewCorrectCount: number | null;
  reviewTestScore: number | null;
  reviewFeedback: string;

  memorizationClass1: string;
  memorizationClass2: string;
  memorizationAchievement: MemorizationAchievement;

  teacherComment: string;
}

export interface StudentSelectOption {
  value: string;
  label: string;
}

export interface OverallSummary {
  homeworkAverage: number | null;
  dailyAverage: number | null;
  reviewAverage: number | null;
}
