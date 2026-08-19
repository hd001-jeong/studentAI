import { FileTextOutlined, UserOutlined } from "@ant-design/icons";
import { Layout, Menu } from "antd";
import { Outlet, useLocation, useNavigate } from "react-router-dom";

import AppHeader from "@/components/layout/AppHeader";

const { Sider, Content } = Layout;

const TEACHER_NAME = "박현민";

export default function MainLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  const selectedKey = location.pathname.startsWith("/reports")
    ? "/reports"
    : "/students";

  return (
    <Layout
      style={{
        minHeight: "100vh",
      }}
    >
      <AppHeader teacherName={TEACHER_NAME} />

      <Layout>
        <Sider
          width={180}
          theme="light"
          style={{
            borderRight: "1px solid #f0f0f0",
          }}
        >
          <Menu
            mode="inline"
            selectedKeys={[selectedKey]}
            style={{
              height: "100%",
              borderInlineEnd: 0,
              paddingTop: 12,
            }}
            items={[
              {
                key: "/students",
                icon: <UserOutlined />,
                label: "학생 관리",
              },
              {
                key: "/reports",
                icon: <FileTextOutlined />,
                label: "리포트",
              },
            ]}
            onClick={({ key }) => {
              navigate(key);
            }}
          />
        </Sider>

        <Content
          style={{
            background: "#f5f7fa",
            padding: 18,
          }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}
