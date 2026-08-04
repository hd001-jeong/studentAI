import { Button, Card, Input, Space, Spin, Typography } from "antd";
import { useState } from "react";

import StudentApi from "../../api/StudentApi";

const { Title, Paragraph } = Typography;

function AiPage() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAskAi = async () => {
    const trimmedQuestion = question.trim();

    if (!trimmedQuestion) {
      return;
    }

    setLoading(true);

    try {
      const result = await StudentApi.askAi(trimmedQuestion);
      setAnswer(result);
    } catch (error) {
      console.error("AI 질문 실패:", error);
      setAnswer("질문 처리 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 700, margin: "0 auto", padding: 24 }}>
      <Title level={2}>Student AI 질문</Title>

      <Space direction="vertical" size="large" style={{ width: "100%" }}>
        <Space.Compact style={{ width: "100%" }}>
          <Input
            placeholder="예: 김규민 최근 수업 알려줘"
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            onPressEnter={handleAskAi}
          />

          <Button type="primary" onClick={handleAskAi}>
            질문하기
          </Button>
        </Space.Compact>

        <Spin spinning={loading}>
          <Card title="AI 답변">
            {answer ? (
              <Space direction="vertical" size={8} style={{ width: "100%" }}>
                {answer.split("\n").map((line, index) => {
                  const trimmedLine = line.trim();

                  if (!trimmedLine) {
                    return <div key={index} style={{ height: 4 }} />;
                  }

                  if (trimmedLine.startsWith("[")) {
                    return (
                      <Typography.Title
                        key={index}
                        level={5}
                        style={{ margin: "8px 0 4px" }}
                      >
                        {trimmedLine}
                      </Typography.Title>
                    );
                  }

                  if (trimmedLine.startsWith("-")) {
                    return (
                      <div
                        key={index}
                        style={{
                          display: "flex",
                          gap: 8,
                          alignItems: "flex-start",
                        }}
                      >
                        <span>•</span>
                        <Typography.Text>
                          {trimmedLine.replace(/^-+\s*/, "")}
                        </Typography.Text>
                      </div>
                    );
                  }

                  return (
                    <Typography.Paragraph
                      key={index}
                      style={{ marginBottom: 0, lineHeight: 1.7 }}
                    >
                      {trimmedLine}
                    </Typography.Paragraph>
                  );
                })}
              </Space>
            ) : (
              <Typography.Text type="secondary">
                학생 이름을 포함해서 질문해보세요.
              </Typography.Text>
            )}
          </Card>
        </Spin>
      </Space>
    </div>
  );
}

export default AiPage;
