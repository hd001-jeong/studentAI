import {
  FileTextOutlined,
  SettingOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Grid, Layout, Menu } from "antd";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

import AppHeader from "@/components/layout/AppHeader";

const { Sider, Content } = Layout;
const { useBreakpoint } = Grid;

const TEACHER_NAME = "박현민";

export default function MainLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const screens = useBreakpoint();

  const selectedKey = location.pathname;

  const [collapsed, setCollapsed] = useState(false);

  const isMobile = !screens.md;

  useEffect(() => {
    setCollapsed(isMobile);
  }, [isMobile]);

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
          collapsedWidth={64}
          collapsed={collapsed}
          collapsible
          onCollapse={(value) => {
            setCollapsed(value);
          }}
          theme="light"
          style={{
            borderRight: "1px solid #f0f0f0",
          }}
        >
          <Menu
            mode="inline"
            selectedKeys={[selectedKey]}
            defaultOpenKeys={["students", "admin"]}
            inlineCollapsed={collapsed}
            style={{
              height: "100%",
              borderInlineEnd: 0,
              paddingTop: 12,
            }}
            items={[
              {
                key: "students",
                icon: <UserOutlined />,
                label: "학생 관리",
                children: [
                  {
                    key: "/students/by-student",
                    label: "학생별 관리",
                  },
                  {
                    key: "/students/by-week",
                    label: "주차별 수업",
                  },
                ],
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
                    label: "수업 관리",
                  },
                  {
                    key: "/admin/multi-data",
                    label: "주차 생성",
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
            minWidth: 0,
          }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}
