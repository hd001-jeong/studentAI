import { useQuery } from "@tanstack/react-query";

import StudentApi from "@/api/StudentApi";

export function useLessonRecordsQuery(teacherName: string, studentId: string) {
  return useQuery({
    queryKey: ["lessonRecords", teacherName, studentId],

    queryFn: () => StudentApi.getLessonRecords(teacherName, studentId),

    // 학생을 선택하기 전에는 조회하지 않음
    enabled: Boolean(teacherName && studentId),
  });
}
