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
  reportMode?: boolean;
}

export default function WeekSummaryCard({
  record,
  selected,
  onClick,
  reportMode = false,
}: WeekSummaryCardProps) {
  const homeworkAverage = calculateAverage(
    record.homeworks.map((homework) => homework.achievement),
  );

  const dailyAverage = calculateAverage(
    record.dailyEvaluations.map((evaluation) => evaluation.achievement),
  );

  // =========================================================
  // PDF / 리포트 전용 디자인
  // =========================================================

  if (reportMode) {
    const reportItemStyle = {
      display: "grid",
      gridTemplateColumns: "45% 55%",
      alignItems: "center",
      minHeight: 38,
      marginTop: 5,
      padding: "6px 10px",
      borderRadius: 8,
      border: "1px solid #e5e7eb",
      background: "#fafafa",
    };

    const labelStyle = {
      fontFamily: '"Pretendard", "Noto Sans KR", "Malgun Gothic", sans-serif',

      fontSize: 20,
      fontWeight: 900,
      color: "#222222",
    };

    const valueWrapStyle = {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: 6,
      minWidth: 0,
    };

    const valueStyle = {
      fontFamily: '"Pretendard", "Noto Sans KR", "Malgun Gothic", sans-serif',

      fontSize: 20,
      fontWeight: 900,
      color: "#111111",
    };

    return (
      <Card
        size="small"
        style={{
          height: "100%",
          border: "1px solid #d9d9d9",
          borderRadius: 10,
          boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
          background: "#ffffff",
          overflow: "hidden",
        }}
        styles={{
          body: {
            padding: 10,
          },
        }}
      >
        {/* =====================================================
    주차 + 진도
===================================================== */}

        <div
          style={{
            padding: "8px 10px",
            textAlign: "center",
            background: "#e6f4ff",
            borderRadius: 7,
            marginBottom: 6,
          }}
        >
          <Text
            style={{
              fontFamily:
                '"Pretendard", "Noto Sans KR", "Malgun Gothic", sans-serif',
              fontSize: 17,
              fontWeight: 800,
              color: "#1456a0",
            }}
          >
            {record.weekLabel || `${record.weekNumber}주차`} (
            {record.weekNumber}주차) / {record.progress || "진도"}
          </Text>
        </div>
        {/* =====================================================
            당일 평가
        ===================================================== */}

        <div
          style={{
            ...reportItemStyle,

            background:
              dailyAverage === null
                ? "#fafafa"
                : getAchievementBackground(dailyAverage),

            border:
              dailyAverage === null
                ? "1px solid #e5e7eb"
                : `1px solid ${getAchievementColor(dailyAverage)}`,
          }}
        >
          <Text style={labelStyle}>당일 평가</Text>

          <div style={valueWrapStyle}>
            <Text
              style={{
                ...valueStyle,

                color:
                  dailyAverage === null
                    ? "#667085"
                    : getAchievementColor(dailyAverage),
              }}
            >
              {dailyAverage === null ? "-" : `${dailyAverage}%`}
            </Text>

            {dailyAverage !== null && (
              <Tag
                color={getAchievementTagColor(dailyAverage)}
                style={{
                  margin: 0,
                  fontSize: 11,
                  fontWeight: 700,
                  lineHeight: "20px",
                }}
              >
                {getAchievementLabel(dailyAverage)}
              </Tag>
            )}
          </div>
        </div>

        {/* =====================================================
            숙제
        ===================================================== */}

        <div
          style={{
            ...reportItemStyle,

            background:
              homeworkAverage === null
                ? "#fafafa"
                : getAchievementBackground(homeworkAverage),

            border:
              homeworkAverage === null
                ? "1px solid #e5e7eb"
                : `1px solid ${getAchievementColor(homeworkAverage)}`,
          }}
        >
          <Text style={labelStyle}>숙제 성취율</Text>

          <div style={valueWrapStyle}>
            <Text
              style={{
                ...valueStyle,

                color:
                  homeworkAverage === null
                    ? "#667085"
                    : getAchievementColor(homeworkAverage),
              }}
            >
              {homeworkAverage === null ? "-" : `${homeworkAverage}%`}
            </Text>

            {homeworkAverage !== null && (
              <Tag
                color={getAchievementTagColor(homeworkAverage)}
                style={{
                  margin: 0,
                  fontSize: 20,
                  fontWeight: 700,
                  lineHeight: "20px",
                }}
              >
                {getAchievementLabel(homeworkAverage)}
              </Tag>
            )}
          </div>
        </div>

        {/* =====================================================
            복습 테스트
        ===================================================== */}

        <div
          style={{
            ...reportItemStyle,

            background:
              record.reviewTestScore === null
                ? "#fafafa"
                : getAchievementBackground(record.reviewTestScore),

            border:
              record.reviewTestScore === null
                ? "1px solid #e5e7eb"
                : `1px solid ${getAchievementColor(record.reviewTestScore)}`,
          }}
        >
          <Text style={labelStyle}>복습테스트 점수</Text>

          <div style={valueWrapStyle}>
            <Text
              style={{
                ...valueStyle,

                color:
                  record.reviewTestScore === null
                    ? "#667085"
                    : getAchievementColor(record.reviewTestScore),
              }}
            >
              {record.reviewTestScore === null
                ? "-"
                : `${record.reviewTestScore}점`}
            </Text>

            {record.reviewTestScore !== null && (
              <Tag
                color={getAchievementTagColor(record.reviewTestScore)}
                style={{
                  margin: 0,
                  fontSize: 11,
                  fontWeight: 700,
                  lineHeight: "20px",
                }}
              >
                {getAchievementLabel(record.reviewTestScore)}
              </Tag>
            )}
          </div>
        </div>

        {/* =====================================================
            암기반
        ===================================================== */}

        <div
          style={{
            ...reportItemStyle,
            background: "#fafafa",
          }}
        >
          <Text style={labelStyle}>암기반</Text>

          <div style={valueWrapStyle}>
            <Text
              style={{
                ...valueStyle,
                fontSize: 20,
                color: "#475467",
              }}
            >
              {record.memorizationAchievement || "-"}
            </Text>
          </div>
        </div>

        {/* =====================================================
            비고
        ===================================================== */}

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "18% 82%",
            alignItems: "center",
            minHeight: 38,
            marginTop: 5,
            padding: "6px 10px",
            borderRadius: 8,
            border: "1px solid #f1e4b8",
            background: record.teacherComment ? "#fffaf0" : "#f8f9fb",
          }}
        >
          <Text
            style={{
              fontFamily:
                '"Pretendard", "Noto Sans KR", "Malgun Gothic", sans-serif',

              fontSize: 18,
              fontWeight: 800,
              color: "#344054",
            }}
          ></Text>

          <Text
            ellipsis={{
              tooltip: record.teacherComment || "쌤 한마디",
            }}
            style={{
              display: "block",

              fontFamily:
                '"Pretendard", "Noto Sans KR", "Malgun Gothic", sans-serif',

              fontSize: 18,
              fontWeight: 600,
              color: "#475467",
            }}
          >
            {record.teacherComment || "쌤 한마디"}
          </Text>
        </div>
      </Card>
    );
  }

  // =========================================================
  // 메인 대시보드
  // 기존 디자인 유지
  // =========================================================

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
            fontSize: 17,
          }}
        >
          {record.weekLabel}
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

      {/* 진도 */}
      <Text
        style={{
          display: "block",
          fontSize: 14,
          fontWeight: 600,
        }}
      >
        {record.progress || "진도"}
      </Text>

      <Space
        orientation="vertical"
        size={5}
        style={{
          width: "100%",
          marginTop: 8,
        }}
      >
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
                  fontSize: 12,
                  lineHeight: "18px",
                }}
              >
                {getAchievementLabel(dailyAverage)}
              </Tag>
            </Space>
          </Row>
        </div>
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
              {record.memorizationAchievement || "-"}
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
              tooltip: record.teacherComment || "쌤 한마디",
            }}
            style={{
              display: "block",
              fontSize: 11,
            }}
          >
            💬 {record.teacherComment || "쌤 한마디"}
          </Text>
        </div>
      </Space>
    </Card>
  );
}
