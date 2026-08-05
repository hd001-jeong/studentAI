export interface AchievementItem {
  name: string;
  achievement: number | null;
}

export type AchievementTuple = [
  AchievementItem,
  AchievementItem,
  AchievementItem,
];

export type MemorizationAchievement = "통과" | "보충 필요" | "결석" | null;

export interface LessonRecord {
  recordId: string;

  number: number | null;
  category: string;

  weekNumber: number;
  weekLabel: string;
  progress: string;
  lessonDate: string;

  studentId: string;
  studentName: string;
  schoolName: string;
  grade: string;
  teacherName: string;

  homeworks: AchievementTuple;
  dailyEvaluations: AchievementTuple;

  homeworkAchievement: number | null;
  homeworkGrade: string;

  dailyAchievement: number | null;
  dailyGrade: string;

  reviewTest: string;
  reviewQuestionCount: number | null;
  reviewCorrectCount: number | null;
  reviewTestScore: number | null;
  reviewFeedback: string;

  memorizationClass1: string;
  memorizationClass2: string;
  memorizationAchievement: MemorizationAchievement;

  teacherComment: string;
  notice: string;
}
export interface OverallSummary {
  homeworkAverage: number | null;
  dailyAverage: number | null;
  reviewAverage: number | null;
}
