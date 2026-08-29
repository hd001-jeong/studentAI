import { forwardRef } from "react";

import { Card, Typography } from "antd";

import academyLogo from "@/assets/academy-logo.jpg";

import StudentOverallStatus from "@/components/student/StudentOverallStatus";
import WeekSummarySection from "@/components/student/WeekSummarySection";

import type { LessonRecord } from "@/types/lessonRecord";

import { calculateOverallSummary } from "@/utils/achievement";

const { Text, Title } = Typography;

interface StudentReportPreviewProps {
  studentName: string;
  schoolName: string;
  grade: string;
  teacherName: string;
  records: LessonRecord[];
}

const StudentReportPreview = forwardRef<
  HTMLDivElement,
  StudentReportPreviewProps
>(({ studentName, schoolName, grade, teacherName, records }, ref) => {
  const summary = calculateOverallSummary(records);

  // =========================================================
  // 실제 사용용
  // =========================================================

  const sortedRecords = [...records]
    .sort((a, b) => a.weekNumber - b.weekNumber)
    .slice(0, 8);

  // =========================================================
  // 최근 공지사항 1개
  // sortedRecords는 주차 오름차순이므로
  // 뒤에서부터 notice가 있는 record를 찾는다.
  // =========================================================

  const latestNoticeRecord = [...sortedRecords]
    .reverse()
    .find((record) => record.notice?.trim());

  // =========================================================
  // 8주 PDF 레이아웃 테스트용
  // 테스트 끝나면 이 부분 삭제하고 위 실제 사용용 코드 활성화
  // =========================================================

  // const baseRecord = records[0];

  // const sortedRecords = baseRecord
  //   ? Array.from(
  //       {
  //         length: 8,
  //       },
  //       (_, index) => ({
  //         ...baseRecord,

  //         recordId: `test-${index + 1}`,

  //         weekNumber: index + 1,

  //         weekLabel: `${index + 1}주차`,

  //         progress: `테스트 진도 ${index + 1}`,
  //       }),
  //     )
  //   : [];

  return (
    <div
      ref={ref}
      style={{
        width: "100%",
        boxSizing: "border-box",
        padding: 14,
        background: "#f4f7fb",
        color: "#1f1f1f",
      }}
    >
      {/* =====================================================
          학원 헤더
      ===================================================== */}

      <Card
        style={{
          marginBottom: 10,
          border: "1px solid #cfe1ff",
          background: "linear-gradient(135deg, #f0f7ff 0%, #ffffff 100%)",
        }}
        styles={{
          body: {
            padding: "14px 18px",
          },
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 20,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
            }}
          >
            <img
              src={academyLogo}
              alt="이주미영어학원"
              style={{
                height: 58,
                width: "auto",
                objectFit: "contain",
              }}
            />

            <div>
              <Title
                level={3}
                style={{
                  margin: 0,
                  fontSize: 23,
                  color: "#1456a0",
                  lineHeight: 1.25,
                }}
              >
                이주미영어학원
              </Title>

              <Text
                style={{
                  display: "block",
                  marginTop: 2,
                  fontSize: 13,
                  fontWeight: 600,
                  color: "#8410b3",
                }}
              >
                학생관리카드
              </Text>
            </div>
          </div>

          <div
            style={{
              textAlign: "right",
            }}
          >
            <Text
              style={{
                display: "block",
                color: "#55708f",
                fontSize: 12,
                fontWeight: 600,
                letterSpacing: 1.8,
              }}
            >
              STUDENT REPORT
            </Text>

            <Text
              type="secondary"
              style={{
                display: "block",
                marginTop: 4,
                fontSize: 12,
              }}
            >
              최근 8주 학습 리포트
            </Text>
          </div>
        </div>
      </Card>

      {/* =====================================================
          학생 정보
      ===================================================== */}

      <Card
        style={{
          marginBottom: 10,
          border: "1px solid #d9e4f2",
          borderLeft: "5px solid #1677ff",
          background: "#ffffff",
        }}
        styles={{
          body: {
            padding: "12px 18px",
          },
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 16,
          }}
        >
          <div>
            <Text
              strong
              style={{
                display: "block",
                fontSize: 40,
                lineHeight: 1.3,
                color: "#1f1f1f",
              }}
            >
              {studentName}
            </Text>

            <Text
              style={{
                display: "block",
                marginTop: 4,
                fontSize: 14,
                color: "#667085",
              }}
            >
              {schoolName}
              {" · "}
              {grade}
              {" · "}
              담당 {teacherName}
            </Text>
          </div>

          <div
            style={{
              padding: "6px 12px",
              borderRadius: 20,
              background: "#e6f4ff",
              color: "#1677ff",
              fontSize: 13,
              fontWeight: 600,
              whiteSpace: "nowrap",
            }}
          >
            최근 8주 학습 현황
          </div>
        </div>
      </Card>

      {/* =====================================================
          Notice
          최근 공지사항 1개만 표시
      ===================================================== */}

      <Card
        style={{
          marginTop: 10,
          border: "1px solid #d9e4f2",
          background: "#ffffff",
        }}
        title={
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <div
              style={{
                width: 4,
                height: 18,
                borderRadius: 4,
                background: "#1677ff",
              }}
            />

            <Text
              strong
              style={{
                fontSize: 17,
              }}
            >
              Notice
            </Text>

            <Text
              type="secondary"
              style={{
                fontSize: 12,
              }}
            >
              전달사항
            </Text>
          </div>
        }
        styles={{
          header: {
            minHeight: 70,
          },

          body: {
            minHeight: 100,
            padding: "14px 18px",
            background: "#fafcff",
          },
        }}
      >
        {latestNoticeRecord?.notice ? (
          <Text
            style={{
              display: "block",
              fontSize: 15,
              lineHeight: 1.7,
              whiteSpace: "pre-wrap",
            }}
          >
            {latestNoticeRecord.notice}
          </Text>
        ) : (
          <Text
            type="secondary"
            style={{
              fontSize: 14,
            }}
          >
            전달사항이 없습니다.
          </Text>
        )}
      </Card>

      {/* =====================================================
          학습 현황
          PDF 전용 2열 × 4행
      ===================================================== */}

      <WeekSummarySection
        records={sortedRecords.slice(0, 8)}
        selectedRecordId=""
        onRecordChange={() => {}}
        onDetailOpen={() => {}}
        readOnly
        columns={2}
        reportMode
      />

      {/* =====================================================
          전체 상태
      ===================================================== */}

      <div
        style={{
          marginTop: 10,
        }}
      >
        <StudentOverallStatus summary={summary} />
      </div>

      {/* =====================================================
          하단 안내
      ===================================================== */}

      <div
        style={{
          marginTop: 8,
          textAlign: "right",
        }}
      >
        <Text
          type="secondary"
          style={{
            fontSize: 10,
          }}
        >
          이주미영어학원 학생 학습 리포트
        </Text>
      </div>
    </div>
  );
});

StudentReportPreview.displayName = "StudentReportPreview";

export default StudentReportPreview;
