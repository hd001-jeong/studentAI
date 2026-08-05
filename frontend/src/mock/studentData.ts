import type {
  AchievementItem,
  AchievementTuple,
  LessonRecord,
} from "@/types/student";

function createEmptyItem(): AchievementItem {
  return {
    name: "",
    achievement: null,
  };
}

function createEmptyTuple(): AchievementTuple {
  return [createEmptyItem(), createEmptyItem(), createEmptyItem()];
}

export const INITIAL_LESSON_RECORDS: LessonRecord[] = [
  {
    recordId: "R001",
    studentId: "S00120",
    studentName: "김동범",
    schoolName: "인창고",
    grade: "고1",
    teacherName: "이주미",

    weekNumber: 1,
    lessonDate: "2026-05-12",
    weekLabel: "5월 3주",
    progress: "천일문 U40~43",

    homeworks: [
      {
        name: "천일문 U40~43 복습",
        achievement: 20,
      },
      {
        name: "어법 문제 풀이",
        achievement: 50,
      },
      createEmptyItem(),
    ],

    dailyEvaluations: [
      {
        name: "어휘 테스트",
        achievement: 50,
      },
      createEmptyItem(),
      createEmptyItem(),
    ],

    reviewTest: "복습 테스트",
    reviewQuestionCount: 50,
    reviewCorrectCount: 10,
    reviewTestScore: 20,
    reviewFeedback: "첨삭 완료",

    memorizationClass1: "일이삼사오육칠팔구십",
    memorizationClass2: "일이삼사오육칠팔구십",
    memorizationAchievement: "통과",

    teacherComment: "11시30분 조퇴, 수업만 듣고 워크시트 미완료",
  },
  {
    recordId: "R002",
    studentId: "S00120",
    studentName: "김동범",
    schoolName: "인창고",
    grade: "고1",
    teacherName: "이주미",

    weekNumber: 2,
    lessonDate: "2026-05-19",
    weekLabel: "5월 4주",
    progress: "교과서 2과 + 천일문 58",

    homeworks: [
      {
        name: "교과서 2과 복습",
        achievement: 80,
      },
      {
        name: "천일문 58번",
        achievement: 40,
      },
      createEmptyItem(),
    ],

    dailyEvaluations: [
      {
        name: "어휘 테스트",
        achievement: 70,
      },
      {
        name: "어법 테스트",
        achievement: 50,
      },
      createEmptyItem(),
    ],

    reviewTest: "복습 테스트",
    reviewQuestionCount: 50,
    reviewCorrectCount: 10,
    reviewTestScore: 20,
    reviewFeedback: "",

    memorizationClass1: "올포 7번 시그니처",
    memorizationClass2: "",
    memorizationAchievement: "보충 필요",

    teacherComment: "",
  },
  {
    recordId: "R003",
    studentId: "S00120",
    studentName: "김동범",
    schoolName: "인창고",
    grade: "고1",
    teacherName: "이주미",

    weekNumber: 3,
    lessonDate: "2026-05-26",
    weekLabel: "5월 5주",
    progress: "천일문 U60, 13~16, 토이스토리",

    homeworks: [
      {
        name: "1주차 천일문 밀린 숙제",
        achievement: 80,
      },
      {
        name: "천일문 U60 문제",
        achievement: 70,
      },
      {
        name: "토이스토리 워크시트",
        achievement: 20,
      },
    ],

    dailyEvaluations: [
      {
        name: "천일문 단어",
        achievement: 70,
      },
      {
        name: "어법",
        achievement: 40,
      },
      createEmptyItem(),
    ],

    reviewTest: "복습 테스트",
    reviewQuestionCount: 50,
    reviewCorrectCount: 10,
    reviewTestScore: 20,
    reviewFeedback: "",

    memorizationClass1: "올포 7번 시그니처",
    memorizationClass2: "",
    memorizationAchievement: "보충 필요",

    teacherComment: "",
  },
  {
    recordId: "R004",
    studentId: "S00120",
    studentName: "김동범",
    schoolName: "인창고",
    grade: "고1",
    teacherName: "이주미",

    weekNumber: 4,
    lessonDate: "2026-06-02",
    weekLabel: "6월 1주",
    progress: "천일문 U17~22, 토이스토리 #2,3",

    homeworks: [
      {
        name: "천일문 U17~22",
        achievement: 100,
      },
      {
        name: "토이스토리 #2",
        achievement: 60,
      },
      {
        name: "토이스토리 #3",
        achievement: 90,
      },
    ],

    dailyEvaluations: [
      {
        name: "어휘",
        achievement: 100,
      },
      {
        name: "어법",
        achievement: 90,
      },
      {
        name: "독해",
        achievement: 80,
      },
    ],

    reviewTest: "복습 테스트",
    reviewQuestionCount: 20,
    reviewCorrectCount: 15,
    reviewTestScore: 75,
    reviewFeedback: "향상됨",

    memorizationClass1: "올포 7번 시그니처",
    memorizationClass2: "",
    memorizationAchievement: "통과",

    teacherComment: "",
  },
  {
    recordId: "R005",
    studentId: "S00120",
    studentName: "김동범",
    schoolName: "인창고",
    grade: "고1",
    teacherName: "이주미",

    weekNumber: 5,
    lessonDate: "2026-06-09",
    weekLabel: "6월 2주",
    progress: "6문 #20~30번",

    homeworks: [
      {
        name: "6문 #20~25",
        achievement: 40,
      },
      {
        name: "6문 #26~30",
        achievement: 60,
      },
      createEmptyItem(),
    ],

    dailyEvaluations: [
      {
        name: "어휘",
        achievement: 60,
      },
      {
        name: "어법",
        achievement: 40,
      },
      createEmptyItem(),
    ],

    reviewTest: "복습 테스트",
    reviewQuestionCount: 50,
    reviewCorrectCount: 23,
    reviewTestScore: 46,
    reviewFeedback: "보충 필요",

    memorizationClass1: "",
    memorizationClass2: "",
    memorizationAchievement: "보충 필요",

    teacherComment: "",
  },
  {
    recordId: "R006",
    studentId: "S00120",
    studentName: "김동범",
    schoolName: "인창고",
    grade: "고1",
    teacherName: "이주미",

    weekNumber: 6,
    lessonDate: "2026-06-16",
    weekLabel: "6월 3주",
    progress: "6문 #31~38번",

    homeworks: [
      {
        name: "6문 #31~34",
        achievement: 20,
      },
      {
        name: "6문 #35~38",
        achievement: 80,
      },
      createEmptyItem(),
    ],

    dailyEvaluations: [
      {
        name: "어휘",
        achievement: 40,
      },
      {
        name: "어법",
        achievement: 20,
      },
      createEmptyItem(),
    ],

    reviewTest: "복습 테스트",
    reviewQuestionCount: 50,
    reviewCorrectCount: 19,
    reviewTestScore: 38,
    reviewFeedback: "결석",

    memorizationClass1: "",
    memorizationClass2: "",
    memorizationAchievement: "결석",

    teacherComment: "",
  },
  {
    recordId: "R007",
    studentId: "S00120",
    studentName: "김동범",
    schoolName: "인창고",
    grade: "고1",
    teacherName: "이주미",

    weekNumber: 7,
    lessonDate: "2026-06-23",
    weekLabel: "6월 4주",
    progress: "천일문 U23~25 + 6문 리뷰",

    homeworks: [
      {
        name: "천일문 U23~25",
        achievement: 20,
      },
      {
        name: "6문 리뷰",
        achievement: 50,
      },
      createEmptyItem(),
    ],

    dailyEvaluations: [
      {
        name: "어휘",
        achievement: 30,
      },
      {
        name: "어법",
        achievement: 40,
      },
      createEmptyItem(),
    ],

    reviewTest: "",
    reviewQuestionCount: null,
    reviewCorrectCount: null,
    reviewTestScore: null,
    reviewFeedback: "",

    memorizationClass1: "",
    memorizationClass2: "",
    memorizationAchievement: null,

    teacherComment: "",
  },
  {
    recordId: "R008",
    studentId: "S00120",
    studentName: "김동범",
    schoolName: "인창고",
    grade: "고1",
    teacherName: "이주미",

    weekNumber: 8,
    lessonDate: "2026-06-30",
    weekLabel: "6월 5주",
    progress: "",

    homeworks: createEmptyTuple(),
    dailyEvaluations: createEmptyTuple(),

    reviewTest: "",
    reviewQuestionCount: null,
    reviewCorrectCount: null,
    reviewTestScore: null,
    reviewFeedback: "",

    memorizationClass1: "",
    memorizationClass2: "",
    memorizationAchievement: null,

    teacherComment: "",
  },
];
