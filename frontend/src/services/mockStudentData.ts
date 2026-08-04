import type { Student } from "../types/student";
import type { LessonRecord } from "../types/lessonRecord";

export const students: Student[] = [
  {
    studentId: "S00012",
    studentName: "김규민",
    schoolName: "경복고",
    grade: "고1",
    teacherName: "이주미",
  },
  {
    studentId: "S00064",
    studentName: "송정환",
    schoolName: "경복고",
    grade: "고1",
    teacherName: "이주미",
  },
  {
    studentId: "S00072",
    studentName: "양정훈",
    schoolName: "경복고",
    grade: "고1",
    teacherName: "이주미",
  },
  {
    studentId: "S00120",
    studentName: "임이건",
    schoolName: "경복고",
    grade: "고1",
    teacherName: "이주미",
  },
];

export const lessonRecords: LessonRecord[] = [
  {
    number: 1,
    category: "26년2학기",
    week: "5월1주",
    progress: "올포 7강",
    lessonDate: "2026-07-14",

    studentId: "S00012",
    studentName: "김규민",
    schoolName: "경복고",
    grade: "고1",
    teacherName: "이주미",

    homework1: "올포 7강 어법 고치기",
    homework1Achievement: 30,

    homework2: "빈칸채우기",
    homework2Achievement: 50,

    homework3: "변형 나머지 다",
    homework3Achievement: 30,

    homeworkAchievement: 37,
    homeworkGrade: "옐로우",

    daily1: "올포7강 단어",
    daily1Achievement: 50,

    daily2: "어법",
    daily2Achievement: 35,

    daily3: "",
    daily3Achievement: 0,

    dailyAchievement: 43,
    dailyGrade: "옐로우",

    reviewTest: "복습 테스트",
    reviewQuestionCount: 50,
    reviewCorrectCount: 10,
    reviewTestScore: 20,
    reviewFeedback: "첨삭 완료",

    memorizationClass1: "일이삼사오육칠팔구십일이삼사오",
    memorizationClass2: "일이삼사오육칠팔구십일이삼사오",
    memorizationAchievement: "통과",

    teacherComment:
      "11시30분 조퇴, 수업만 듣고 여름문 워크시트(TS)는 미완료. 다음부턴 일찍 와서 해볼까요? From 원장쌤",

    notice:
      "모의고사 푸는 것에 다시 적응 중이라 어렵겠지만, 최대한 키워드 생각하며 시간맞춰 풀기!",
  },
  {
    number: 2,
    category: "26년2학기",
    week: "5월1주",
    progress: "올포 7강",
    lessonDate: "2026-07-14",

    studentId: "S00064",
    studentName: "송정환",
    schoolName: "경복고",
    grade: "고1",
    teacherName: "이주미",

    homework1: "올포 7강 어법 고치기",
    homework1Achievement: 40,

    homework2: "빈칸채우기",
    homework2Achievement: 60,

    homework3: "변형 나머지 다",
    homework3Achievement: 60,

    homeworkAchievement: 53,
    homeworkGrade: "옐로우",

    daily1: "올포7강 단어",
    daily1Achievement: 70,

    daily2: "어법",
    daily2Achievement: 57,

    daily3: "",
    daily3Achievement: 0,

    dailyAchievement: 64,
    dailyGrade: "옐로우",

    reviewTest: "복습 테스트",
    reviewQuestionCount: 50,
    reviewCorrectCount: 10,
    reviewTestScore: 20,
    reviewFeedback: "",

    memorizationClass1: "올포7 단어",
    memorizationClass2: "J시그니처",
    memorizationAchievement: "보충 필요",

    teacherComment: "",
    notice: "",
  },
  {
    number: 3,
    category: "26년2학기",
    week: "5월1주",
    progress: "올포 7강",
    lessonDate: "2026-07-14",

    studentId: "S00072",
    studentName: "양정훈",
    schoolName: "경복고",
    grade: "고1",
    teacherName: "이주미",

    homework1: "올포 7강 어법 고치기",
    homework1Achievement: 50,

    homework2: "빈칸채우기",
    homework2Achievement: 70,

    homework3: "변형 나머지 다",
    homework3Achievement: 20,

    homeworkAchievement: 47,
    homeworkGrade: "옐로우",

    daily1: "올포7강 단어",
    daily1Achievement: 63,

    daily2: "어법",
    daily2Achievement: 70,

    daily3: "",
    daily3Achievement: 0,

    dailyAchievement: 67,
    dailyGrade: "옐로우",

    reviewTest: "복습 테스트",
    reviewQuestionCount: 50,
    reviewCorrectCount: 10,
    reviewTestScore: 20,
    reviewFeedback: "",

    memorizationClass1: "올포7 단어",
    memorizationClass2: "J시그니처",
    memorizationAchievement: "보충 필요",

    teacherComment: "",
    notice: "",
  },
  {
    number: 4,
    category: "26년2학기",
    week: "5월1주",
    progress: "올포 7강",
    lessonDate: "2026-07-14",

    studentId: "S00120",
    studentName: "임이건",
    schoolName: "경복고",
    grade: "고1",
    teacherName: "이주미",

    homework1: "올포 7강 어법 고치기",
    homework1Achievement: 30,

    homework2: "빈칸채우기",
    homework2Achievement: 30,

    homework3: "변형 나머지 다",
    homework3Achievement: 40,

    homeworkAchievement: 33,
    homeworkGrade: "옐로우",

    daily1: "올포7강 단어",
    daily1Achievement: 56,

    daily2: "어법",
    daily2Achievement: 60,

    daily3: "",
    daily3Achievement: 0,

    dailyAchievement: 58,
    dailyGrade: "옐로우",

    reviewTest: "복습 테스트",
    reviewQuestionCount: 50,
    reviewCorrectCount: 10,
    reviewTestScore: 20,
    reviewFeedback: "",

    memorizationClass1: "올포7 단어",
    memorizationClass2: "J시그니처",
    memorizationAchievement: "결석",

    teacherComment: "",
    notice: "",
  },
];
