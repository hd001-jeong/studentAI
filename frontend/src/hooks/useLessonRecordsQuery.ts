import { useQuery } from "@tanstack/react-query";

import StudentApi from "@/api/StudentApi";

export function useLessonRecordsQuery(teacherCode: string) {
  return useQuery({
    queryKey: ["lessonRecords", teacherCode],
    queryFn: () => StudentApi.getLessonRecords(teacherCode),
    enabled: Boolean(teacherCode),
  });
}
