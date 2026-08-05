import ApiClient from "./ApiClient";
import type { LessonRecord } from "@/types/lessonRecord";

class StudentApi {
  async getLessonRecords(): Promise<LessonRecord[]> {
    const response = await ApiClient.get<LessonRecord[]>("/students");

    return response.data;
  }

  async updateHomework1Achievement(
    recordId: string,
    achievement: number,
  ): Promise<void> {
    await ApiClient.put(`/students/${recordId}/homework1`, {
      achievement,
    });
  }
}

export default new StudentApi();
