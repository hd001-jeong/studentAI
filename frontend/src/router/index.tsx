import { Navigate, createBrowserRouter } from "react-router-dom";

import MainLayout from "@/components/layout/MainLayout";

import StudentReportPage from "@/pages/Report/StudentReportPage";
import StudentDashboardPage from "@/pages/Student/StudentDashboardPage";

const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    children: [
      {
        index: true,
        element: <Navigate to="/students" replace />,
      },
      {
        path: "students",
        element: <StudentDashboardPage />,
      },
      {
        path: "reports",
        element: <StudentReportPage />,
      },
    ],
  },
]);

export default router;
