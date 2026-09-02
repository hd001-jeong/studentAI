import { Navigate, createBrowserRouter } from "react-router-dom";

import AuthGuard from "@/components/common/AuthGuard";
import MainLayout from "@/components/layout/MainLayout";

import MultiDataPage from "@/pages/Admin/MultiDataPage";
import NoticePage from "@/pages/Admin/NoticePage";
import TeacherLoginPage from "@/pages/Teacher/TeacherLoginPage";
import StudentReportPage from "@/pages/Report/StudentReportPage";
import StudentDashboardPage from "@/pages/Student/StudentDashboardPage";
import WeeklyStudentPage from "@/pages/Student/WeeklyStudentPage";

const router = createBrowserRouter([
  {
    path: "/login",
    element: <TeacherLoginPage />,
  },
  {
    path: "/",
    element: (
      <AuthGuard>
        <MainLayout />
      </AuthGuard>
    ),
    children: [
      {
        index: true,
        element: <Navigate to="/students/by-student" replace />,
      },
      {
        path: "students",
        element: <Navigate to="/students/by-student" replace />,
      },
      {
        path: "students/by-student",
        element: <StudentDashboardPage />,
      },
      {
        path: "students/by-week",
        element: <WeeklyStudentPage />,
      },
      {
        path: "reports",
        element: <StudentReportPage />,
      },
      {
        path: "notices",
        element: <NoticePage />,
      },
      {
        path: "admin/multi-data",
        element: <MultiDataPage />,
      },
    ],
  },
]);

export default router;
