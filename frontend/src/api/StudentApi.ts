import ApiClient from "./ApiClient";
import type { LessonRecord } from "@/types/lessonRecord";

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

  async getLessonRecords(teacherCode: string): Promise<LessonRecord[]> {
    const response = await ApiClient.get<LessonRecord[]>("/students", {
      params: {
        teacherCode,
      },
    });

    return response.data;
  }

  /**
   * 선택한 한 주차의 전체 수업 기록을 수정한다.
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
