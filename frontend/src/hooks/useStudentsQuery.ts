import { useQuery } from "@tanstack/react-query";

import StudentApi from "@/api/StudentApi";

export function useStudentsQuery(teacherName: string) {
  return useQuery({
    queryKey: ["students", teacherName],

    queryFn: () => StudentApi.getStudents(teacherName),

    enabled: Boolean(teacherName),
  });
}
