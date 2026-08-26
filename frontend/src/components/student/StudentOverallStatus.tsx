import { Card, Col, Row, Tag, Typography } from "antd";

import type { OverallSummary } from "@/types/lessonRecord";

import {
  getAchievementBackground,
  getAchievementColor,
  getAchievementLabel,
  getAchievementTagColor,
} from "@/utils/achievement";

const { Text } = Typography;

interface StatusBoxProps {
  title: string;
  score: number | null;
  suffix: string;
  useBackground?: boolean;
}

function StatusBox({
  title,
  score,
  suffix,
  useBackground = true,
}: StatusBoxProps) {
  return (
    <div
      style={{
        padding: 14,
        borderRadius: 10,
        textAlign: "center",
        background: useBackground ? getAchievementBackground(score) : "#fafafa",
        border: useBackground
          ? `1px solid ${getAchievementColor(score)}`
          : "1px solid #e8e8e8",
      }}
    >
      <Text
        strong
        style={{
          display: "block",
          fontSize: 16,
        }}
      >
        {title}
      </Text>

      <Text
        strong
        style={{
          display: "block",
          marginTop: 6,
          fontSize: 25,
          color: useBackground ? getAchievementColor(score) : undefined,
        }}
      >
        {score ?? "-"}
        {score === null ? "" : suffix}
      </Text>

      <Tag
        color={getAchievementTagColor(score)}
        style={{
          marginTop: 6,
          marginRight: 0,
          padding: "3px 10px",
          fontSize: 14,
        }}
      >
        {getAchievementLabel(score)}
      </Tag>
    </div>
  );
}

interface StudentOverallStatusProps {
  summary: OverallSummary;
}

export default function StudentOverallStatus({
  summary,
}: StudentOverallStatusProps) {
  return (
    <Card
      title={
        <Text
          strong
          style={{
            fontSize: 19,
          }}
        >
          전체 상태
        </Text>
      }
      size="small"
      style={{
        marginTop: 12,
      }}
      styles={{
        body: {
          padding: 14,
        },
      }}
    >
      <Row gutter={[12, 12]}>
        <Col xs={24} md={8}>
          <StatusBox
            title="숙제 평균"
            score={summary.homeworkAverage}
            suffix="%"
          />
        </Col>

        <Col xs={24} md={8}>
          <StatusBox
            title="당일평가 평균"
            score={summary.dailyAverage}
            suffix="%"
          />
        </Col>

        <Col xs={24} md={8}>
          <StatusBox
            title="복습 테스트 평균"
            score={summary.reviewAverage}
            suffix="점"
          />
        </Col>
      </Row>
    </Card>
  );
}
