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
      minHeight: 44,
      marginTop: 6,
      padding: "8px 12px",
      borderRadius: 8,
      border: "1px solid #e5e7eb",
      background: "#fafafa",
    };

    const labelStyle = {
      fontFamily: '"Pretendard", "Noto Sans KR", "Malgun Gothic", sans-serif',
      fontSize: 22,
      fontWeight: 900,
      lineHeight: "28px",
      color: "#222222",
    };

    const valueWrapStyle = {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      minWidth: 0,
    };

    const valueStyle = {
      fontFamily: '"Pretendard", "Noto Sans KR", "Malgun Gothic", sans-serif',
      fontSize: 22,
      fontWeight: 900,
      lineHeight: "28px",
      color: "#111111",
    };

    const reportTagStyle = {
      margin: 0,
      fontSize: 16,
      fontWeight: 700,
      lineHeight: "24px",
      paddingInline: 7,
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
            padding: 12,
          },
        }}
      >
        {/* =====================================================
            주차 + 진도
        ===================================================== */}
        <div
          style={{
            padding: "10px 12px",
            textAlign: "center",
            background: "#e6f4ff",
            borderRadius: 7,
            marginBottom: 7,
          }}
        >
          <Text
            style={{
              fontFamily:
                '"Pretendard", "Noto Sans KR", "Malgun Gothic", sans-serif',
              fontSize: 20,
              fontWeight: 800,
              lineHeight: "26px",
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
                style={reportTagStyle}
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
                style={reportTagStyle}
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
                style={reportTagStyle}
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
                color: "#475467",
              }}
            >
              {record.memorizationAchievement || "-"}
            </Text>
          </div>
        </div>

        {/* =====================================================
            쌤 한마디
        ===================================================== */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "28% 72%",
            alignItems: "center",
            minHeight: 44,
            marginTop: 6,
            padding: "8px 12px",
            borderRadius: 8,
            border: "1px solid #f1e4b8",
            background: record.teacherComment ? "#fffaf0" : "#f8f9fb",
          }}
        >
          <Text
            style={{
              fontFamily:
                '"Pretendard", "Noto Sans KR", "Malgun Gothic", sans-serif',
              fontSize: 20,
              fontWeight: 800,
              lineHeight: "26px",
              color: "#344054",
            }}
          >
            쌤 한마디
          </Text>

          <Text
            ellipsis={{
              tooltip: record.teacherComment || "-",
            }}
            style={{
              display: "block",
              fontFamily:
                '"Pretendard", "Noto Sans KR", "Malgun Gothic", sans-serif',
              fontSize: 20,
              fontWeight: 700,
              lineHeight: "26px",
              color: "#344054",
            }}
          >
            {record.teacherComment || "-"}
          </Text>
        </div>
      </Card>
    );
  }

  // =========================================================
  // 메인 대시보드
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
            padding: "8px 10px",
            borderRadius: 7,
            background: "#f5f7fa",
            border: "1px solid #e5e7eb",
          }}
        >
          <Text
            ellipsis={{
              tooltip: record.teacherComment || "쌤 한마디",
            }}
            style={{
              display: "block",
              fontSize: 13,
              fontWeight: 600,
              lineHeight: "20px",
              color: "#344054",
            }}
          >
            💬 {record.teacherComment || "쌤 한마디"}
          </Text>
        </div>
      </Space>
    </Card>
  );
}
