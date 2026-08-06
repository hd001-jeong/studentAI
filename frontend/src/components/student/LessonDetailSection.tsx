import type { ReactNode } from "react";
import { SaveOutlined } from "@ant-design/icons";
import { Button, Card, Typography } from "antd";

const { Text } = Typography;

interface LessonDetailSectionProps {
  weekNumber: number;
  saving: boolean;
  onSave: () => void;
  children: ReactNode;
}

function LessonDetailSection({
  weekNumber,
  saving,
  onSave,
  children,
}: LessonDetailSectionProps) {
  return (
    <Card
      title={
        <Text
          strong
          style={{
            fontSize: 19,
          }}
        >
          {weekNumber}주차 상세 입력
        </Text>
      }
      extra={
        <Button
          type="primary"
          icon={<SaveOutlined />}
          loading={saving}
          onClick={onSave}
        >
          저장
        </Button>
      }
      style={{
        marginTop: 12,
      }}
      styles={{
        body: {
          padding: 12,
        },
      }}
    >
      {children}
    </Card>
  );
}

export default LessonDetailSection;