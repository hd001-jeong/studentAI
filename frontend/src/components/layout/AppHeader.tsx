import { Button, Layout, Space, Typography } from "antd";
import { LogoutOutlined, SaveOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

const { Header } = Layout;
const { Text } = Typography;

interface AppHeaderProps {
  teacherName?: string | null;
}

export default function AppHeader({ teacherName }: AppHeaderProps) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("teacherCode");
    localStorage.removeItem("teacherName");

    navigate("/");
  };

  return (
    <Header
      style={{
        height: 56,
        padding: "0 24px",
        background: "#ffffff",
        borderBottom: "1px solid #e5e7eb",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        lineHeight: "normal",
      }}
    >
      <Space size={10} align="center">
        <Text
          strong
          style={{
            fontSize: 20,
            whiteSpace: "nowrap",
          }}
        >
          이주미영어학원
        </Text>

        <Text
          type="secondary"
          style={{
            fontSize: 13,
            whiteSpace: "nowrap",
          }}
        >
          학생 관리
        </Text>
      </Space>

      <Space size={10} align="center">
        <Text
          strong
          style={{
            fontSize: 14,
            whiteSpace: "nowrap",
          }}
        >
          {teacherName ? `${teacherName}님` : "선생님"}
        </Text>

        <Button size="small" icon={<LogoutOutlined />} onClick={handleLogout}>
          로그아웃
        </Button>
      </Space>
    </Header>
  );
}
