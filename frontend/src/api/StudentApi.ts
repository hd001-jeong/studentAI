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
   * 선택한 학생의 수업 기록 조회
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
}

export default new StudentApi();
