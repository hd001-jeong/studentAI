import ApiClient from "./ApiClient";

import type { LessonRecord } from "../types/lessonRecord";
import type { Student } from "../types/student";

class StudentApi {
  async getStudents(): Promise<Student[]> {
    const response = await ApiClient.get<Student[]>("/students");
    return response.data;
  }

  async getStudentRecords(studentId: string): Promise<LessonRecord[]> {
    const response = await ApiClient.get<LessonRecord[]>(
      `/students/${studentId}/records`,
    );

    return response.data;
  }

  async askAi(question: string): Promise<string> {
    const response = await ApiClient.post<{ answer: string }>("/ai/ask", {
      question,
    });

    return response.data.answer;
  }
}

export default new StudentApi();
