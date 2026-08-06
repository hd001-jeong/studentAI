import { Card, Row, Space, Tag, Typography } from "antd";

import type { LessonRecord } from "@/types/lessonRecord";

import {
  calculateAverage,
  getAchievementBackground,
  getAchievementColor,
  getAchievementLabel,
  getAchievementTagColor,
} from "@/utils/achievement";

const { Text } = Typography;

interface WeekSummaryCardProps {
  record: LessonRecord;
  selected: boolean;
  onClick: () => void;
}

export default function WeekSummaryCard({
  record,
  selected,
  onClick,
}: WeekSummaryCardProps) {
  const homeworkAverage = calculateAverage(
    record.homeworks.map((homework) => homework.achievement),
  );

  const dailyAverage = calculateAverage(
    record.dailyEvaluations.map((evaluation) => evaluation.achievement),
  );

  return (
    <Card
      hoverable
      size="small"
      onClick={onClick}
      style={{
        height: "100%",
        cursor: "pointer",
        background: "#ffffff",
        border: selected ? "2px solid #1677ff" : "1px solid #d9d9d9",
        boxShadow: selected ? "0 0 0 2px rgba(22,119,255,0.12)" : "none",
      }}
      styles={{
        body: {
          padding: 12,
        },
      }}
    >
      <Row justify="space-between" align="middle">
        <Text
          strong
          style={{
            fontSize: 17,
          }}
        >
          {record.weekNumber}주차
        </Text>

        {selected && (
          <Tag color="blue" style={{ margin: 0 }}>
            선택
          </Tag>
        )}
      </Row>

      <Text
        type="secondary"
        style={{
          display: "block",
          marginTop: 3,
          fontSize: 13,
        }}
      >
        {record.weekLabel}
      </Text>

      <Text
        ellipsis={{
          tooltip: record.progress || "진도 미입력",
        }}
        style={{
          display: "block",
          minHeight: 22,
          marginTop: 7,
          fontWeight: 600,
          fontSize: 14,
        }}
      >
        {record.progress || "진도 미입력"}
      </Text>

      <Space
        orientation="vertical"
        size={7}
        style={{
          width: "100%",
          marginTop: 10,
        }}
      >
        <div
          style={{
            padding: "9px 10px",
            borderRadius: 8,
            background: getAchievementBackground(homeworkAverage),
            border: `1px solid ${getAchievementColor(homeworkAverage)}`,
          }}
        >
          <Row justify="space-between" align="middle" wrap={false}>
            <Text strong>숙제</Text>

            <Space size={5}>
              <Text
                strong
                style={{
                  fontSize: 15,
                  color: getAchievementColor(homeworkAverage),
                }}
              >
                {homeworkAverage === null ? "-" : `${homeworkAverage}%`}
              </Text>

              <Tag
                color={getAchievementTagColor(homeworkAverage)}
                style={{ margin: 0 }}
              >
                {getAchievementLabel(homeworkAverage)}
              </Tag>
            </Space>
          </Row>
        </div>

        <div
          style={{
            padding: "9px 10px",
            borderRadius: 8,
            background: "#fafafa",
            border: "1px solid #f0f0f0",
          }}
        >
          <Row justify="space-between" align="middle" wrap={false}>
            <Text>당일평가</Text>

            <Text strong>
              {dailyAverage === null ? "-" : `${dailyAverage}%`}
            </Text>
          </Row>
        </div>

        <div
          style={{
            padding: "9px 10px",
            borderRadius: 8,
            background: getAchievementBackground(record.reviewTestScore),
            border: `1px solid ${getAchievementColor(record.reviewTestScore)}`,
          }}
        >
          <Row justify="space-between" align="middle" wrap={false}>
            <Text strong>복습 테스트</Text>

            <Space size={5}>
              <Text
                strong
                style={{
                  fontSize: 15,
                  color: getAchievementColor(record.reviewTestScore),
                }}
              >
                {record.reviewTestScore === null
                  ? "-"
                  : `${record.reviewTestScore}점`}
              </Text>

              <Tag
                color={getAchievementTagColor(record.reviewTestScore)}
                style={{ margin: 0 }}
              >
                {getAchievementLabel(record.reviewTestScore)}
              </Tag>
            </Space>
          </Row>
        </div>
      </Space>
    </Card>
  );
}
