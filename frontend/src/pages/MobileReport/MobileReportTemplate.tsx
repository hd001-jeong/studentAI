import { forwardRef } from "react";
import type { CSSProperties } from "react";

import academyLogo from "@/assets/academy-logo.jpg";

import type { LessonRecord } from "@/types/lessonRecord";

import {
  calculateAverage,
  calculateOverallSummary,
  getAchievementLabel,
  getAchievementTagColor,
} from "@/utils/achievement";

import type { AchievementTagColor } from "@/utils/achievement";

// =========================================================
// 시안 C 디자인 토큰
// 540 × 960px (9:16) 기준, 코멘트가 길면 최대 1,080px까지
// =========================================================

export const REPORT_WIDTH = 540;
export const REPORT_MIN_HEIGHT = 960;
export const REPORT_MAX_HEIGHT = 1080;

// =========================================================
// 글꼴: IBM Plex Sans KR (Google Fonts) — 시안 문서 지정
//
// 리포트에서만 쓰는 글꼴이라 이 파일이 처음 불러와질 때
// <head>에 한 번만 추가한다. (index.html 수정 불필요)
// =========================================================

export const REPORT_FONT_NAME = "IBM Plex Sans KR";

const REPORT_FONT_URL =
  "https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+KR:wght@400;500;700&display=swap";

const REPORT_FONT_LINK_ID = "report-font-ibm-plex-sans-kr";

if (
  typeof document !== "undefined" &&
  !document.getElementById(REPORT_FONT_LINK_ID)
) {
  const fontLink = document.createElement("link");

  fontLink.id = REPORT_FONT_LINK_ID;
  fontLink.rel = "stylesheet";
  fontLink.href = REPORT_FONT_URL;

  document.head.appendChild(fontLink);
}

const FONT_FAMILY = `'${REPORT_FONT_NAME}', -apple-system, 'Apple SD Gothic Neo', 'Malgun Gothic', sans-serif`;

const COLORS = {
  page: "#F1F4F8",
  card: "#FFFFFF",
  header: "#1C2B4A",
  latestRow: "#E9EDF6",
  barTrack: "#E4E8EE",
  number: "#1B1F29",
  sub: "#5B6270",
  lastWeekRange: "rgba(27, 31, 41, 0.38)",
  // 쌤 한마디 글씨: 문서값(#4B2E7A)보다 한 단계 진하게
  comment: "#36195F",
  commentBorder: "#DCCCF3",
} as const;

// 상태별 칸 배경
// success = 우수 / warning = 주의 / error = 보완 필요 / default = 암기반·미입력
const CELL_BACKGROUNDS: Record<AchievementTagColor, string> = {
  success: "#C9F0D4",
  warning: "#FFE682",
  error: "#FFBDBD",
  default: "#EEF1F5",
};

// 상태별 막대 색
const BAR_COLORS: Record<AchievementTagColor, string> = {
  success: "#2FB463",
  warning: "#F2C11B",
  error: "#F25C5C",
  default: "#E4E8EE",
};

// 표 열: 주차·진도 80 / 당일 62 / 숙제 62 / 복습 62 / 암기반 54 / 코멘트 나머지
// 학습 현황 표: 항상 8줄, 한 줄 높이 고정
// 66px = 칸 여백 + 코멘트 3줄 (12px × 줄간격 1.4)
const REPORT_ROW_COUNT = 8;
const REPORT_ROW_HEIGHT = 66;
const COMMENT_MAX_LINES = 3;

// 숙제·복습테스트 칸 위쪽에 표시하는 고정 문구
const LAST_WEEK_RANGE_LABEL = "지난주 범위";

const TABLE_GRID: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "80px 62px 62px 62px 54px minmax(0, 1fr)",
  gap: 4,
};

// =========================================================
// 공통 스타일
// =========================================================

const cardStyle: CSSProperties = {
  padding: 12,
  borderRadius: 12,
  background: COLORS.card,
  boxSizing: "border-box",
};

const sectionTitleStyle: CSSProperties = {
  fontSize: 13,
  fontWeight: 700,
  color: COLORS.number,
};

const singleLineStyle: CSSProperties = {
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
};

// =========================================================
// 유틸
// =========================================================

/**
 * "9월2주" → "9월 2주"
 */
function formatWeekLabel(weekLabel: string): string {
  return weekLabel.replace(/월\s*(\d)/, "월 $1");
}

/**
 * 비어 있거나 "-"면 내용 없음으로 본다.
 */
function hasText(value: string | null | undefined): boolean {
  const cleaned = (value ?? "").trim();

  return cleaned !== "" && cleaned !== "-";
}

/**
 * "A · B · C"를 글자 사이 간격이 일정하게 보이도록 나눠서 그린다.
 * (html2canvas가 " · "를 한 단어처럼 붙여 그려 간격이 틀어지는 문제 방지)
 */
function DotJoin({ items }: { items: string[] }) {
  return (
    <>
      {items.map((item, index) => (
        <span key={`${item}-${index}`}>
          {index > 0 && (
            <span
              style={{
                display: "inline-block",
                margin: "0 4px",
              }}
            >
              ·
            </span>
          )}
          {item}
        </span>
      ))}
    </>
  );
}

interface NoticeItem {
  label: string;
  content: string;
}

/**
 * Notice 문장을 "|" 기준으로 나눈다.
 *
 * 예:
 * "⚽ 교과서1과 | 🏫 학원: ①교1단어"
 * → [{ label: "⚽ 진도", content: "교과서1과" },
 *    { label: "🏫 학원", content: "①교1단어" }]
 *
 * ":"가 없는 항목은 진도로 본다.
 */
function parseNotice(notice: string): NoticeItem[] {
  return notice
    .split("|")
    .map((item) => item.trim())
    .filter(Boolean)
    .map((item) => {
      const emojiMatch = item.match(/^(\p{Extended_Pictographic}\uFE0F?)\s*/u);

      const emoji = emojiMatch ? emojiMatch[1] : "";

      const rest = emojiMatch ? item.slice(emojiMatch[0].length) : item;

      const colonIndex = rest.indexOf(":");

      const label = colonIndex >= 0 ? rest.slice(0, colonIndex).trim() : "진도";

      const content =
        colonIndex >= 0 ? rest.slice(colonIndex + 1).trim() : rest.trim();

      return {
        label: emoji ? `${emoji} ${label}` : label,
        content,
      };
    });
}

// =========================================================
// 전체 상태 한 줄
// =========================================================

interface OverallRowProps {
  title: string;
  score: number | null;
  suffix: string;
}

function OverallRow({ title, score, suffix }: OverallRowProps) {
  const status = getAchievementTagColor(score);

  const barWidth = score === null ? 0 : Math.max(0, Math.min(score, 100));

  return (
    <div
      style={{
        marginTop: 10,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
        }}
      >
        <span
          style={{
            flex: 1,
            minWidth: 0,
            fontSize: 12,
            color: COLORS.number,
            ...singleLineStyle,
          }}
        >
          {title}
        </span>

        <span
          style={{
            fontSize: 17,
            fontWeight: 700,
            color: COLORS.number,
          }}
        >
          {score === null ? "-" : `${score}${suffix}`}
        </span>

        {score !== null && (
          <span
            style={{
              padding: "1px 7px",
              borderRadius: 999,
              background: CELL_BACKGROUNDS[status],
              fontSize: 10.5,
              fontWeight: 700,
              color: COLORS.number,
              whiteSpace: "nowrap",
            }}
          >
            {getAchievementLabel(score)}
          </span>
        )}
      </div>

      <div
        style={{
          marginTop: 4,
          height: 4,
          borderRadius: 999,
          background: COLORS.barTrack,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${barWidth}%`,
            height: "100%",
            borderRadius: 999,
            background: BAR_COLORS[status],
          }}
        />
      </div>
    </div>
  );
}

// =========================================================
// 표 칸
//
// 최소 높이 52px, 여백 위 10px · 아래 12px
// 숫자는 세로 가운데 → 같은 줄의 숫자 높이가 같다.
// '지난주 범위'는 위쪽 모서리, 메모는 아래쪽 모서리에 겹쳐 표시
// =========================================================

interface TableCellProps {
  background: string;
  value: string;
  valueSize?: number;
  lastWeekRange?: string;
  memo?: string;
  multiline?: boolean;
}

function TableCell({
  background,
  value,
  valueSize = 15,
  lastWeekRange,
  memo,
  multiline,
}: TableCellProps) {
  // "보충 필요" → 보충 / 필요 두 줄
  const lines = multiline ? value.split(" ") : [value];

  return (
    <div
      style={{
        position: "relative",
        minHeight: 52,
        padding: "10px 2px 12px",
        borderRadius: 8,
        background,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        boxSizing: "border-box",
      }}
    >
      {lastWeekRange && (
        <span
          style={{
            position: "absolute",
            top: 3,
            left: 3,
            right: 3,
            fontSize: 7.5,
            lineHeight: 1.2,
            color: COLORS.lastWeekRange,
            ...singleLineStyle,
          }}
        >
          {lastWeekRange}
        </span>
      )}

      {lines.map((line, index) => (
        <span
          key={`${line}-${index}`}
          style={{
            display: "block",
            fontSize: valueSize,
            fontWeight: 700,
            lineHeight: 1.2,
            color: COLORS.number,
          }}
        >
          {line}
        </span>
      ))}

      {memo && (
        <span
          style={{
            position: "absolute",
            bottom: 3,
            left: 3,
            right: 3,
            fontSize: 9,
            lineHeight: 1.2,
            color: COLORS.number,
            ...singleLineStyle,
          }}
        >
          {memo}
        </span>
      )}
    </div>
  );
}

// =========================================================
// 템플릿 본체
// =========================================================

interface MobileReportTemplateProps {
  studentName: string;
  schoolName: string;
  grade: string;
  teacherName: string;
  records: LessonRecord[];
  periodLabel?: string; // 추가: "중간고사" | "기말고사"
}

const MobileReportTemplate = forwardRef<
  HTMLDivElement,
  MobileReportTemplateProps
>(
  (
    { studentName, schoolName, grade, teacherName, records, periodLabel },
    ref,
  ) => {
    // =========================================================
    // 최근 8주
    // 기존 리포트와 같은 기준: 날짜순 정렬 후 최신 8개
    // =========================================================

    const sortedRecords = [...records]
      .sort(
        (a, b) =>
          new Date(a.lessonDate).getTime() - new Date(b.lessonDate).getTime(),
      )
      .slice(-8);

    // 주차 번호는 오래된 주부터 1주차
    const numberedRecords = sortedRecords.map((record, index) => ({
      record,
      reportWeekNumber: index + 1,
    }));

    // 화면에는 최신 주차가 맨 위
    const displayRecords = [...numberedRecords].reverse();

    // =========================================================
    // 전체 상태 (기존 계산 함수 그대로 사용)
    // =========================================================

    const summary = calculateOverallSummary(sortedRecords);

    // =========================================================
    // 최근 공지사항 1개
    // =========================================================

    const latestNoticeRecord = [...sortedRecords]
      .reverse()
      .find((record) => record.notice?.trim());

    const noticeItems = latestNoticeRecord
      ? parseNotice(latestNoticeRecord.notice)
      : [];

    return (
      <div
        ref={ref}
        style={{
          width: REPORT_WIDTH,
          minHeight: REPORT_MIN_HEIGHT,
          boxSizing: "border-box",
          display: "flex",
          flexDirection: "column",
          background: COLORS.page,
          fontFamily: FONT_FAMILY,
          // 굵기는 문서에 700으로 지정된 곳만 굵게, 나머지는 보통(400)
          fontWeight: 400,
          // 전역 CSS의 자간(0.18px)을 받지 않도록 초기화
          letterSpacing: 0,
          color: COLORS.number,
          wordBreak: "keep-all",
          overflowWrap: "anywhere",
        }}
      >
        {/* =====================================================
          ① 헤더 (두 줄)
      ===================================================== */}

        <div
          style={{
            padding: "14px 16px 16px",
            background: COLORS.header,
            color: "#FFFFFF",
          }}
        >
          {/* 1줄: 로고 · 학원명 · 학생관리카드 / STUDENT REPORT */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                minWidth: 0,
              }}
            >
              <div
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: 8,
                  background: "#FFFFFF",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  overflow: "hidden",
                  flexShrink: 0,
                }}
              >
                <img
                  src={academyLogo}
                  alt="이주미영어학원"
                  style={{
                    width: 26,
                    height: 26,
                    objectFit: "contain",
                  }}
                />
              </div>

              <span
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  whiteSpace: "nowrap",
                }}
              >
                이주미영어학원
              </span>

              <span
                style={{
                  fontSize: 10.5,
                  opacity: 0.75,
                  whiteSpace: "nowrap",
                }}
              >
                학생관리카드
              </span>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                fontSize: 10.5,
                whiteSpace: "nowrap",
              }}
            >
              <span
                style={{
                  letterSpacing: 1,
                  opacity: 0.75,
                }}
              >
                STUDENT REPORT
              </span>

              <span>
                {periodLabel
                  ? `${periodLabel} 학습 리포트`
                  : "최근 8주 학습 리포트"}
              </span>
            </div>
          </div>

          {/* 2줄: 학생 이름 · 학교 · 학년 · 담당 */}
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              gap: 10,
              marginTop: 10,
            }}
          >
            <span
              style={{
                fontSize: 28,
                fontWeight: 700,
                lineHeight: 1.2,
              }}
            >
              {studentName}
            </span>

            <span
              style={{
                fontSize: 12,
                opacity: 0.85,
              }}
            >
              <DotJoin items={[schoolName, grade, `담당 ${teacherName}`]} />
            </span>
          </div>
        </div>

        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            gap: 8,
            padding: 12,
          }}
        >
          {/* =====================================================
            ② 전체 상태 | Notice
        ===================================================== */}

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 8,
            }}
          >
            {/* 전체 상태 */}
            <div style={cardStyle}>
              <div style={sectionTitleStyle}>전체 상태</div>

              <OverallRow
                title="숙제 평균"
                score={summary.homeworkAverage}
                suffix="%"
              />

              <OverallRow
                title="당일평가 평균"
                score={summary.dailyAverage}
                suffix="%"
              />

              <OverallRow
                title="복습테스트 평균"
                score={summary.reviewAverage}
                suffix="점"
              />
            </div>

            {/* Notice */}
            <div style={cardStyle}>
              <div
                style={{
                  display: "flex",
                  alignItems: "baseline",
                  gap: 5,
                }}
              >
                <span style={sectionTitleStyle}>Notice</span>

                <span
                  style={{
                    fontSize: 10.5,
                    color: COLORS.sub,
                  }}
                >
                  전달사항
                </span>
              </div>

              {noticeItems.length > 0 ? (
                <div
                  style={{
                    marginTop: 6,
                  }}
                >
                  {noticeItems.map((item, index) => (
                    <div
                      key={`${item.label}-${index}`}
                      style={{
                        display: "flex",
                        gap: 6,
                        padding: "3px 0",
                        fontSize: 12,
                        lineHeight: 1.45,
                      }}
                    >
                      <span
                        style={{
                          width: 54,
                          flexShrink: 0,
                          color: COLORS.sub,
                          whiteSpace: "nowrap",
                        }}
                      >
                        {item.label}
                      </span>

                      <span
                        style={{
                          flex: 1,
                          minWidth: 0,
                        }}
                      >
                        {item.content}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div
                  style={{
                    marginTop: 6,
                    fontSize: 12,
                    color: COLORS.sub,
                  }}
                >
                  전달사항이 없습니다.
                </div>
              )}
            </div>
          </div>

          {/* =====================================================
            ③ 학습 현황 표 (쌤 코멘트는 맨 오른쪽 칸)
            ④ 범례 + 꼬리말
        ===================================================== */}

          <div
            style={{
              ...cardStyle,
              flex: 1,
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "baseline",
                justifyContent: "space-between",
              }}
            >
              <span style={sectionTitleStyle}>학습 현황</span>

              <span
                style={{
                  fontSize: 10.5,
                  color: COLORS.sub,
                }}
              >
                최신 주차부터
              </span>
            </div>

            {/* 표 머리글 (코멘트 열은 머리글 없음) */}
            <div
              style={{
                ...TABLE_GRID,
                marginTop: 8,
                padding: "0 6px 4px",
                fontSize: 10.5,
                color: COLORS.sub,
                whiteSpace: "nowrap",
              }}
            >
              <span>주차 / 진도</span>
              <span style={{ textAlign: "center" }}>당일 평가</span>
              <span style={{ textAlign: "center" }}>숙제</span>
              <span style={{ textAlign: "center" }}>복습테스트</span>
              <span style={{ textAlign: "center" }}>암기반</span>
              <span />
            </div>

            {/* =====================================================
              학습 현황: 항상 8줄, 한 줄 높이 고정
              - 기록이 8주보다 적으면 남은 줄은 빈 줄로 채움
              - 코멘트는 3줄까지 표시
          ===================================================== */}
            <div
              style={{
                display: "grid",
                gridTemplateRows: `repeat(${REPORT_ROW_COUNT}, ${REPORT_ROW_HEIGHT}px)`,
                gap: 4,
              }}
            >
              {displayRecords.map(({ record, reportWeekNumber }, index) => {
                const isLatest = index === 0;

                // 기존 리포트와 같은 계산 (숙제 1~3, 당일 1~3 평균)
                const dailyAverage = calculateAverage(
                  record.dailyEvaluations.map((item) => item.achievement),
                );

                const homeworkAverage = calculateAverage(
                  record.homeworks.map((item) => item.achievement),
                );

                const reviewScore = record.reviewTestScore;

                const memorization =
                  record.memorizationAchievement?.trim() || "-";

                return (
                  <div
                    key={record.recordId}
                    style={{
                      ...TABLE_GRID,
                      padding: "3px 6px",
                      borderRadius: 8,
                      background: isLatest ? COLORS.latestRow : "transparent",
                    }}
                  >
                    {/* 주차 / 몇 주차 / 진도 (세 줄) */}
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        minWidth: 0,
                      }}
                    >
                      <span
                        style={{
                          fontSize: 12.5,
                          fontWeight: 700,
                          lineHeight: 1.3,
                        }}
                      >
                        {formatWeekLabel(record.weekLabel) ||
                          `${reportWeekNumber}주차`}
                      </span>

                      <span
                        style={{
                          fontSize: 10.5,
                          lineHeight: 1.35,
                          color: COLORS.sub,
                          whiteSpace: "nowrap",
                        }}
                      >
                        {isLatest ? (
                          <DotJoin
                            items={["이번 주", `${reportWeekNumber}주차`]}
                          />
                        ) : (
                          `${reportWeekNumber}주차`
                        )}
                      </span>

                      {record.progress && (
                        <span
                          style={{
                            fontSize: 10.5,
                            lineHeight: 1.35,
                            color: COLORS.sub,
                          }}
                        >
                          {record.progress}
                        </span>
                      )}
                    </div>

                    <TableCell
                      background={
                        CELL_BACKGROUNDS[getAchievementTagColor(dailyAverage)]
                      }
                      value={dailyAverage === null ? "-" : `${dailyAverage}%`}
                    />

                    <TableCell
                      background={
                        CELL_BACKGROUNDS[
                          getAchievementTagColor(homeworkAverage)
                        ]
                      }
                      value={
                        homeworkAverage === null ? "-" : `${homeworkAverage}%`
                      }
                      lastWeekRange={LAST_WEEK_RANGE_LABEL}
                    />

                    <TableCell
                      background={
                        CELL_BACKGROUNDS[getAchievementTagColor(reviewScore)]
                      }
                      value={reviewScore === null ? "-" : `${reviewScore}점`}
                      lastWeekRange={LAST_WEEK_RANGE_LABEL}
                      memo={
                        hasText(record.reviewFeedback)
                          ? record.reviewFeedback.trim()
                          : undefined
                      }
                    />

                    {/* 암기반은 상태와 관계없이 회색 */}
                    <TableCell
                      background={CELL_BACKGROUNDS.default}
                      value={memorization}
                      valueSize={memorization === "-" ? 15 : 12.5}
                      multiline
                    />

                    {/* 쌤 코멘트: 없어도 빈 칸 유지, 칸 크기 고정 (3줄까지) */}
                    <div
                      style={{
                        padding: "4px 7px",
                        borderRadius: 7,
                        border: `1px solid ${COLORS.commentBorder}`,
                        background: "#FFFFFF",
                        boxSizing: "border-box",
                        display: "flex",
                        alignItems: "center",
                        overflow: "hidden",
                      }}
                    >
                      <span
                        style={{
                          display: "block",
                          maxHeight: 12 * 1.4 * COMMENT_MAX_LINES,
                          overflow: "hidden",
                          fontSize: 12,
                          lineHeight: 1.4,
                          color: COLORS.comment,
                          // 가는 글씨라 흐려 보이지 않도록 코멘트만 한 단계 굵게
                          fontWeight: 500,
                          whiteSpace: "pre-wrap",
                          // 좁은 칸이라 한글은 글자 단위로 줄바꿈해 줄 수를 줄임
                          wordBreak: "normal",
                        }}
                      >
                        {hasText(record.teacherComment)
                          ? record.teacherComment.trim()
                          : ""}
                      </span>
                    </div>
                  </div>
                );
              })}

              {/* 기록이 8주보다 적을 때 남은 줄은 칸 없이 흰 여백 (자리만 차지) */}
              {Array.from(
                {
                  length: Math.max(REPORT_ROW_COUNT - displayRecords.length, 0),
                },
                (_, index) => (
                  <div key={`empty-row-${index}`} />
                ),
              )}
            </div>

            {/* 범례 + 꼬리말 (카드 맨 아래로 밀착) */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                marginTop: "auto",
                paddingTop: 10,
                fontSize: 10.5,
                color: COLORS.sub,
                whiteSpace: "nowrap",
              }}
            >
              {(
                [
                  ["success", "우수"],
                  ["warning", "주의"],
                  ["error", "보완 필요"],
                  ["default", "암기반 · 미입력"],
                ] as Array<[AchievementTagColor, string]>
              ).map(([status, label]) => (
                <span
                  key={status}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 4,
                  }}
                >
                  <span
                    style={{
                      width: 9,
                      height: 9,
                      borderRadius: 3,
                      background: CELL_BACKGROUNDS[status],
                    }}
                  />
                  {label}
                </span>
              ))}

              <span
                style={{
                  marginLeft: "auto",
                }}
              >
                이주미영어학원 학생 학습 리포트
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  },
);

MobileReportTemplate.displayName = "MobileReportTemplate";

export default MobileReportTemplate;
