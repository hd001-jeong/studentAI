export interface LessonRecord {
  number: number;
  category: string;
  week: string;
  progress: string;
  lessonDate: string;

  studentId: string;
  studentName: string;
  schoolName: string;
  grade: string;
  teacherName: string;

  homework1: string;
  homework1Achievement: number;

  homework2: string;
  homework2Achievement: number;

  homework3: string;
  homework3Achievement: number;

  homeworkAchievement: number;
  homeworkGrade: string;

  daily1: string;
  daily1Achievement: number;

  daily2: string;
  daily2Achievement: number;

  daily3: string;
  daily3Achievement: number;

  dailyAchievement: number;
  dailyGrade: string;

  reviewTest: string;
  reviewQuestionCount: number;
  reviewCorrectCount: number;
  reviewTestScore: number;
  reviewFeedback: string;

  memorizationClass1: string;
  memorizationClass2: string;
  memorizationAchievement: string;

  teacherComment: string;
  notice: string;
}
