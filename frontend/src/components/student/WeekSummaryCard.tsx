import { Card, Row, Space, Tag, Typography } from "antd";

import type { LessonRecord } from "@/types/lessonRecord";

import {
  calculateAverage,
  getAchievementBackground,
  getAchievementColor,
  getAchievementLabel,
  getAchievementTagColor,
} from "@/utils/achievement";

import styles from "./WeekSummaryCard.module.css";

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
    return (
      <Card
        size="small"
        className={styles.reportCard}
        styles={{
          body: {
            padding: 12,
          },
        }}
      >
        {/* =====================================================
            주차 + 진도
        ===================================================== */}

        <div className={styles.reportHeader}>
          <Text className={styles.reportHeaderText}>
            {record.weekLabel || `${record.weekNumber}주차`} (
            {record.weekNumber}주차) / {record.progress || "진도"}
          </Text>
        </div>

        {/* =====================================================
            당일 평가
        ===================================================== */}

        <div
          className={styles.reportItem}
          style={{
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
          <Text className={styles.reportLabel}>당일 평가</Text>

          <div className={styles.reportValueWrap}>
            <Text
              className={styles.reportValue}
              style={{
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
                className={styles.reportTag}
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
          className={styles.reportItem}
          style={{
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
          <Text className={styles.reportLabel}>숙제 성취율</Text>

          <div className={styles.reportValueWrap}>
            <Text
              className={styles.reportValue}
              style={{
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
                className={styles.reportTag}
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
          className={styles.reportItem}
          style={{
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
          <Text className={styles.reportLabel}>복습테스트 점수</Text>

          <div className={styles.reportValueWrap}>
            <Text
              className={styles.reportValue}
              style={{
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
                className={styles.reportTag}
              >
                {getAchievementLabel(record.reviewTestScore)}
              </Tag>
            )}
          </div>
        </div>

        {/* =====================================================
            암기반
        ===================================================== */}

        <div className={`${styles.reportItem} ${styles.memorizationItem}`}>
          <Text className={styles.reportLabel}>암기반</Text>

          <div className={styles.reportValueWrap}>
            <Text
              className={`${styles.reportValue} ${styles.memorizationValue}`}
            >
              {record.memorizationAchievement || "-"}
            </Text>
          </div>
        </div>

        {/* =====================================================
            쌤 한마디
            연보라색 고정
        ===================================================== */}

        <div className={styles.teacherComment}>
          <Text className={styles.teacherCommentLabel}>쌤 한마디</Text>

          <Text
            ellipsis={{
              tooltip: record.teacherComment || "-",
            }}
            className={styles.teacherCommentText}
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

  return (
    <Card
      hoverable
      size="small"
      onClick={onClick}
      className={styles.dashboardCard}
      style={{
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
      {/* =====================================================
          주차 제목
      ===================================================== */}

      <Row justify="space-between" align="middle">
        <Text strong style={{ fontSize: 17 }}>
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

      {/* =====================================================
          진도
      ===================================================== */}

      <Text className={styles.dashboardProgress}>
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
        {/* =====================================================
            당일 평가
        ===================================================== */}

        <div
          className={styles.achievementItem}
          style={{
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

        {/* =====================================================
            숙제
        ===================================================== */}

        <div
          className={styles.achievementItem}
          style={{
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

        {/* =====================================================
            복습 테스트
        ===================================================== */}

        <div
          className={styles.achievementItem}
          style={{
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

        {/* =====================================================
            암기반
        ===================================================== */}

        <div className={styles.dashboardMemorization}>
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

        {/* =====================================================
            쌤 한마디
            연보라색 고정
        ===================================================== */}

        <div className={styles.dashboardComment}>
          <Text
            ellipsis={{
              tooltip: record.teacherComment || "쌤 한마디",
            }}
            className={styles.dashboardCommentText}
          >
            💬 {record.teacherComment || "쌤 한마디"}
          </Text>
        </div>
      </Space>
    </Card>
  );
}
