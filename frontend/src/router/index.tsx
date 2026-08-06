import { createBrowserRouter } from "react-router-dom";

import StudentDashboardPage from "@/pages/Student/StudentDashboardPage";
import StudentPage from "@/pages/Student/StudentPage";
import { TeacherLoginPage } from "@/pages/Teacher";

const router = createBrowserRouter([
  {
    path: "/",
    element: <TeacherLoginPage />,
  },
  {
    path: "/dashboard",
    element: <StudentDashboardPage />,
  },
  {
    path: "/student",
    element: <StudentPage />,
  },
]);

export default router;
