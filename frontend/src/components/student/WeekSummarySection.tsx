import { Card, Col, Row, Typography } from "antd";

import WeekSummaryCard from "@/components/student/WeekSummaryCard";

import type { LessonRecord } from "@/types/lessonRecord";

const { Text } = Typography;

interface WeekSummarySectionProps {
  records: LessonRecord[];
  selectedRecordId: string;
  onRecordChange: (recordId: string) => void;
  onDetailOpen: () => void;
  readOnly?: boolean;
  columns?: 2 | 4;
  reportMode?: boolean;
}

function WeekSummarySection({
  records,
  selectedRecordId,
  onRecordChange,
  onDetailOpen,
  readOnly = false,
  columns = 4,
  reportMode = false,
}: WeekSummarySectionProps) {
  const lgSpan = columns === 2 ? 12 : 6;

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
          <Col key={record.recordId} xs={24} sm={12} lg={lgSpan}>
            <WeekSummaryCard
              record={record}
              selected={!readOnly && record.recordId === selectedRecordId}
              reportMode={reportMode}
              onClick={() => {
                if (readOnly) {
                  return;
                }

                onRecordChange(record.recordId);
                onDetailOpen();
              }}
            />
          </Col>
        ))}
      </Row>
    </Card>
  );
}

export default WeekSummarySection;
