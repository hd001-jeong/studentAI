import { useQuery } from "@tanstack/react-query";

import StudentApi from "@/api/StudentApi";

export function useLessonRecordsBatchQuery(
  teacherName: string,
  studentIds: string[],
) {
  return useQuery({
    queryKey: ["lesson-records-batch", teacherName, studentIds],

    queryFn: () => StudentApi.getLessonRecordsBatch(teacherName, studentIds),

    enabled: Boolean(teacherName) && studentIds.length > 0,
  });
}
