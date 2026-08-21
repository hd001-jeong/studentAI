import {
  FileTextOutlined,
  SettingOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Layout, Menu } from "antd";
import { Outlet, useLocation, useNavigate } from "react-router-dom";

import AppHeader from "@/components/layout/AppHeader";

const { Sider, Content } = Layout;

const TEACHER_NAME = "박현민";

export default function MainLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  const selectedKey = location.pathname;

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
            defaultOpenKeys={["admin"]}
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
              {
                key: "admin",
                icon: <SettingOutlined />,
                label: "관리자",
                children: [
                  {
                    key: "/notices",
                    label: "공지사항",
                  },
                  {
                    key: "/admin/single-data",
                    label: "단일 데이터",
                  },
                  {
                    key: "/admin/multi-data",
                    label: "다중 데이터",
                  },
                ],
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
