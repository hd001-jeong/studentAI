import { Navigate, createBrowserRouter } from "react-router-dom";

import MainLayout from "@/components/layout/MainLayout";

import MultiDataPage from "@/pages/Admin/MultiDataPage";
import NoticePage from "@/pages/Admin/NoticePage";
import SingleDataPage from "@/pages/Admin/SingleDataPage";
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
      {
        path: "notices",
        element: <NoticePage />,
      },
      {
        path: "admin/single-data",
        element: <SingleDataPage />,
      },
      {
        path: "admin/multi-data",
        element: <MultiDataPage />,
      },
    ],
  },
]);

export default router;
