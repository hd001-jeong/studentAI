import { Button, Card, Input, Space, Typography } from "antd";
import { useState } from "react";

const { Title } = Typography;

function AiPage() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");

  const handleAskAi = () => {
    const trimmedQuestion = question.trim();

    if (!trimmedQuestion) {
      return;
    }

    setAnswer(
      "AI 질문 기능은 준비 중입니다. 추후 학생 데이터를 기반으로 답변하도록 연결할 예정입니다.",
    );
  };

  return (
    <div
      style={{
        maxWidth: 700,
        margin: "0 auto",
        padding: 24,
      }}
    >
      <Title level={2}>Student AI 질문</Title>

      <Space direction="vertical" size="large" style={{ width: "100%" }}>
        <Space.Compact style={{ width: "100%" }}>
          <Input
            placeholder="예: 김규민 최근 수업 알려줘"
            value={question}
            onChange={(event) => {
              setQuestion(event.target.value);
            }}
            onPressEnter={handleAskAi}
          />

          <Button type="primary" onClick={handleAskAi}>
            질문하기
          </Button>
        </Space.Compact>

        <Card title="AI 답변">
          {answer ? (
            <Typography.Paragraph
              style={{
                marginBottom: 0,
                lineHeight: 1.7,
              }}
            >
              {answer}
            </Typography.Paragraph>
          ) : (
            <Typography.Text type="secondary">
              AI 기능은 현재 준비 중입니다.
            </Typography.Text>
          )}
        </Card>
      </Space>
    </div>
  );
}

export default AiPage;
