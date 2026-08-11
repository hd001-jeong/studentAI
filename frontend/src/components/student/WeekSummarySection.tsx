import { Card, Col, Row, Typography } from "antd";

import WeekSummaryCard from "@/components/student/WeekSummaryCard";

import type { LessonRecord } from "@/types/lessonRecord";

const { Text } = Typography;

interface WeekSummarySectionProps {
  records: LessonRecord[];
  selectedRecordId: string;
  onRecordChange: (recordId: string) => void;
}

function WeekSummarySection({
  records,
  selectedRecordId,
  onRecordChange,
}: WeekSummarySectionProps) {
  return (
    <Card
      title={
        <Text
          strong
          style={{
            fontSize: 19,
          }}
        >
          학습 현황
        </Text>
      }
      styles={{
        body: {
          padding: 12,
        },
      }}
    >
      <Row gutter={[10, 10]}>
        {records.map((record) => (
          <Col key={record.recordId} xs={24} sm={12} lg={6}>
            <WeekSummaryCard
              record={record}
              selected={record.recordId === selectedRecordId}
              onClick={() => onRecordChange(record.recordId)}
            />
          </Col>
        ))}
      </Row>
    </Card>
  );
}

export default WeekSummarySection;
