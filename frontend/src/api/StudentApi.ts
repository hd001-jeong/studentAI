import { lessonRecords, students } from "../services/mockStudentData";

class StudentApi {
  getStudents() {
    return students;
  }

  getStudent(studentId: string) {
    return students.find((student) => student.studentId === studentId);
  }

  getLessonRecords() {
    return lessonRecords;
  }

  getLessonRecord(studentId: string) {
    return lessonRecords.filter(
      (lessonRecord) => lessonRecord.studentId === studentId,
    );
  }
}

export default new StudentApi();
