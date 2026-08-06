import { useState } from "react";
import { Button, Form, Input, Typography, message } from "antd";
import { useNavigate } from "react-router-dom";

import StudentApi from "@/api/StudentApi";

const { Title, Text } = Typography;

interface TeacherLoginForm {
  teacherName: string;
  password: string;
}

export default function TeacherLoginPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleFinish = async (values: TeacherLoginForm) => {
    try {
      setLoading(true);

      const teacher = await StudentApi.login(values);

      localStorage.setItem("teacherCode", teacher.teacherCode);
      localStorage.setItem("teacherName", teacher.teacherName);

      navigate("/dashboard");
    } catch (error) {
      console.error("로그인 실패:", error);

      message.error("선생님 이름 또는 비밀번호가 올바르지 않습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "#ffffff",
        padding: 24,
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 520,
          textAlign: "center",
        }}
      >
        <Title
          level={1}
          style={{
            marginBottom: 8,
          }}
        >
          StudentAI
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
            loading={loading}
          >
            시작하기
          </Button>
        </Form>
      </div>
    </div>
  );
}
