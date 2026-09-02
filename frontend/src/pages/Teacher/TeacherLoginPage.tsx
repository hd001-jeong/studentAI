import { Button, Form, Input, Typography, message } from "antd";
import { useNavigate } from "react-router-dom";

const { Title, Text } = Typography;

interface TeacherLoginForm {
  teacherName: string;
  password: string;
}

const LOGIN_TEACHER_NAME = "박현민";
const LOGIN_PASSWORD = "1234";

export default function TeacherLoginPage() {
  const navigate = useNavigate();

  const handleFinish = (values: TeacherLoginForm) => {
    const isValid =
      values.teacherName === LOGIN_TEACHER_NAME &&
      values.password === LOGIN_PASSWORD;

    if (!isValid) {
      message.error("선생님 이름 또는 비밀번호가 올바르지 않습니다.");
      return;
    }

    localStorage.setItem("isLoggedIn", "true");
    localStorage.setItem("teacherName", values.teacherName);

    navigate("/students/by-student", { replace: true });
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: 24,
        backgroundImage: `
          linear-gradient(
            rgba(255, 255, 255, 0.82),
            rgba(255, 255, 255, 0.82)
          ),
          url("/images/login-bg.jpg")
        `,
        backgroundSize: "cover",
        backgroundPosition: "center 65%",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 520,
          textAlign: "center",
          padding: "36px 32px",
          borderRadius: 20,
          background: "rgba(255, 255, 255, 0.72)",
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
          boxShadow: "0 12px 40px rgba(0, 0, 0, 0.08)",
          border: "1px solid rgba(255, 255, 255, 0.8)",
        }}
      >
        <Title
          level={1}
          style={{
            marginBottom: 8,
          }}
        >
          켠로그
        </Title>

        <Text type="secondary">
          선생님 정보를 입력하고 학생 관리 화면으로 이동하세요.
        </Text>

        <Form<TeacherLoginForm>
          layout="vertical"
          onFinish={handleFinish}
          style={{
            marginTop: 40,
            textAlign: "left",
          }}
        >
          <Form.Item
            label="선생님 이름"
            name="teacherName"
            rules={[
              {
                required: true,
                message: "선생님 이름을 입력해주세요.",
              },
            ]}
          >
            <Input
              size="large"
              placeholder="선생님 이름"
              autoComplete="username"
            />
          </Form.Item>

          <Form.Item
            label="비밀번호"
            name="password"
            rules={[
              {
                required: true,
                message: "비밀번호를 입력해주세요.",
              },
            ]}
          >
            <Input.Password
              size="large"
              placeholder="비밀번호"
              autoComplete="current-password"
            />
          </Form.Item>

          <Button
            type="primary"
            htmlType="submit"
            size="large"
            block
            style={{
              height: 44,
              marginTop: 8,
            }}
          >
            시작하기
          </Button>
        </Form>
      </div>
    </div>
  );
}
