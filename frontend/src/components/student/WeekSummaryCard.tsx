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

  const achievementItemStyle = {
    padding: "6px 8px",
    borderRadius: 7,
  };

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
        boxShadow: selected
          ? "0 0 0 2px rgba(22,119,255,0.1)"
          : "0 1px 2px rgba(0,0,0,0.03)",
      }}
      styles={{
        body: {
          padding: 12,
        },
      }}
    >
      {/* 주차 제목 */}
      <Row justify="space-between" align="middle">
        <Text
          strong
          style={{
            fontSize: 16,
            color: "#1f1f1f",
          }}
        >
          {record.weekNumber}주차
        </Text>

        {selected && (
          <Tag
            color="blue"
            style={{
              margin: 0,
              fontSize: 11,
            }}
          >
            선택
          </Tag>
        )}
      </Row>

      {/* 주차 표시 */}
      <Text
        type="secondary"
        style={{
          display: "block",
          marginTop: 2,
          fontSize: 12,
        }}
      >
        {record.weekLabel}
      </Text>

      {/* 진도 */}
      <Text
        ellipsis={{
          tooltip: record.progress || "진도 미입력",
        }}
        style={{
          display: "block",
          minHeight: 20,
          marginTop: 5,
          fontWeight: 600,
          fontSize: 13,
        }}
      >
        {record.progress || "진도 미입력"}
      </Text>

      <Space
        orientation="vertical"
        size={5}
        style={{
          width: "100%",
          marginTop: 8,
        }}
      >
        {/* 숙제 */}
        <div
          style={{
            ...achievementItemStyle,
            background: getAchievementBackground(homeworkAverage),
            border: `1px solid ${getAchievementColor(homeworkAverage)}`,
          }}
        >
          <Row justify="space-between" align="middle" wrap={false}>
            <Text strong style={{ fontSize: 12 }}>
              숙제
            </Text>

            <Space size={4}>
              <Text
                strong
                style={{
                  fontSize: 13,
                  color: getAchievementColor(homeworkAverage),
                }}
              >
                {homeworkAverage === null ? "-" : `${homeworkAverage}%`}
              </Text>

              <Tag
                color={getAchievementTagColor(homeworkAverage)}
                style={{
                  margin: 0,
                  fontSize: 10,
                  lineHeight: "18px",
                }}
              >
                {getAchievementLabel(homeworkAverage)}
              </Tag>
            </Space>
          </Row>
        </div>

        {/* 당일 평가 */}
        <div
          style={{
            ...achievementItemStyle,
            background: getAchievementBackground(dailyAverage),
            border: `1px solid ${getAchievementColor(dailyAverage)}`,
          }}
        >
          <Row justify="space-between" align="middle" wrap={false}>
            <Text strong style={{ fontSize: 12 }}>
              당일 평가
            </Text>

            <Space size={4}>
              <Text
                strong
                style={{
                  fontSize: 13,
                  color: getAchievementColor(dailyAverage),
                }}
              >
                {dailyAverage === null ? "-" : `${dailyAverage}%`}
              </Text>

              <Tag
                color={getAchievementTagColor(dailyAverage)}
                style={{
                  margin: 0,
                  fontSize: 10,
                  lineHeight: "18px",
                }}
              >
                {getAchievementLabel(dailyAverage)}
              </Tag>
            </Space>
          </Row>
        </div>

        {/* 복습 테스트 */}
        <div
          style={{
            ...achievementItemStyle,
            background: getAchievementBackground(record.reviewTestScore),
            border: `1px solid ${getAchievementColor(record.reviewTestScore)}`,
          }}
        >
          <Row justify="space-between" align="middle" wrap={false}>
            <Text strong style={{ fontSize: 12 }}>
              복습 테스트
            </Text>

            <Space size={4}>
              <Text
                strong
                style={{
                  fontSize: 13,
                  color: getAchievementColor(record.reviewTestScore),
                }}
              >
                {record.reviewTestScore === null
                  ? "-"
                  : `${record.reviewTestScore}점`}
              </Text>

              <Tag
                color={getAchievementTagColor(record.reviewTestScore)}
                style={{
                  margin: 0,
                  fontSize: 10,
                  lineHeight: "18px",
                }}
              >
                {getAchievementLabel(record.reviewTestScore)}
              </Tag>
            </Space>
          </Row>
        </div>

        {/* 암기반 */}
        <div
          style={{
            ...achievementItemStyle,
            background: "#fafafa",
            border: "1px solid #f0f0f0",
          }}
        >
          <Row justify="space-between" align="middle" wrap={false}>
            <Text strong style={{ fontSize: 12 }}>
              암기반
            </Text>

            <Text
              style={{
                fontSize: 12,
                fontWeight: 500,
              }}
            >
              {record.memorizationAchievement || "미입력"}
            </Text>
          </Row>
        </div>

        {/* 쌤 한마디 */}
        <div
          style={{
            padding: "7px 8px",
            borderRadius: 7,
            background: "#f6f8fa",
          }}
        >
          <Text
            type="secondary"
            ellipsis={{
              tooltip: record.teacherComment || "쌤 한마디 미입력",
            }}
            style={{
              display: "block",
              fontSize: 11,
            }}
          >
            💬 {record.teacherComment || "쌤 한마디 미입력"}
          </Text>
        </div>
      </Space>
    </Card>
  );
}
