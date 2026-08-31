import ApiClient from "./ApiClient";

import type { LessonRecord, StudentSummary } from "@/types/lessonRecord";

interface TeacherLoginRequest {
  teacherName: string;
  password: string;
}

interface TeacherLoginResponse {
  teacherCode: string;
  teacherName: string;
}

interface LessonRecordsBatchRequest {
  teacherName: string;
  studentIds: string[];
}

type LessonRecordsBatchResponse = Record<string, LessonRecord[]>;

/**
 * 주차 데이터 생성 대상 학생
 */
export interface WeeklyDataStudent {
  studentId: string;
  studentName: string;
  schoolName: string;
  grade: string;
}

/**
 * 주차 데이터 생성 Request
 */
export interface WeeklyDataCreateRequest {
  schoolName: string;
  grade: string;
  weekLabel: string;
  lessonDate: string;
  teacherName: string;

  progress: string;

  daily1: string;
  daily2: string;
  daily3: string;

  homework1: string;
  homework2: string;
  homework3: string;

  reviewTest: string;
  reviewQuestionCount: number | null;

  memorization1: string;
  memorization2: string;

  notice: string;

  students: WeeklyDataStudent[];
}

/**
 * 주차 데이터 생성 Response
 */
export interface WeeklyDataCreateResponse {
  createdCount: number;
}

class StudentApi {
  async login(request: TeacherLoginRequest): Promise<TeacherLoginResponse> {
    const response = await ApiClient.post<TeacherLoginResponse>(
      "/login",
      request,
    );

    return response.data;
  }

  /**
   * 학생 Select 목록 조회
   */
  async getStudents(teacherName: string): Promise<StudentSummary[]> {
    const response = await ApiClient.get<StudentSummary[]>("/students", {
      params: {
        teacherName,
      },
    });

    return response.data;
  }

  /**
   * 선택한 학생 1명의 수업 기록 조회
   */
  async getLessonRecords(
    teacherName: string,
    studentId: string,
  ): Promise<LessonRecord[]> {
    const response = await ApiClient.get<LessonRecord[]>(
      `/students/${studentId}/records`,
      {
        params: {
          teacherName,
        },
      },
    );

    return response.data;
  }

  /**
   * 여러 학생의 수업 기록 일괄 조회
   */
  async getLessonRecordsBatch(
    teacherName: string,
    studentIds: string[],
  ): Promise<LessonRecordsBatchResponse> {
    const request: LessonRecordsBatchRequest = {
      teacherName,
      studentIds,
    };

    const response = await ApiClient.post<LessonRecordsBatchResponse>(
      "/students/records/batch",
      request,
    );

    return response.data;
  }

  /**
   * 선택한 한 주차의 전체 수업 기록 수정
   */
  async updateLessonRecord(
    recordId: string,
    record: LessonRecord,
  ): Promise<LessonRecord> {
    const response = await ApiClient.put<LessonRecord>(
      `/students/${recordId}`,
      record,
    );

    return response.data;
  }

  /**
   * 새 주차 데이터 생성
   *
   * 선택된 학생 수만큼 내신관리데이터에 행 생성
   */
  async createWeeklyData(
    request: WeeklyDataCreateRequest,
  ): Promise<WeeklyDataCreateResponse> {
    const response = await ApiClient.post<WeeklyDataCreateResponse>(
      "/students/weekly-data",
      request,
    );

    return response.data;
  }
}

export default new StudentApi();
