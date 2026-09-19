import {
  Card,
  Col,
  Empty,
  Progress,
  Row,
  Select,
  Spin,
  Tag,
  Typography,
} from "antd";
import { useEffect, useMemo, useState } from "react";

import { useLessonRecordsBatchQuery } from "@/hooks/useLessonRecordsBatchQuery";
import { useStudentsQuery } from "@/hooks/useStudentsQuery";

import type { LessonRecord, StudentSummary } from "@/types/lessonRecord";

const { Text, Title } = Typography;

const TEACHER_NAME = "박현민";

function getScoreTagColor(score: number | null) {
  if (score === null) {
    return "default";
  }

  if (score >= 90) {
    return "green";
  }

  if (score >= 70) {
    return "blue";
  }

  return "red";
}

function getMemorizationText(value: LessonRecord["memorizationAchievement"]) {
  if (value === null || value === undefined || value === "") {
    return "-";
  }

  return String(value);
}

export default function WeeklyStudentPage() {
  const [selectedSchool, setSelectedSchool] = useState("ALL");

  const [selectedGrade, setSelectedGrade] = useState("ALL");

  const [selectedWeeks, setSelectedWeeks] = useState<string[]>([]);

  /*
   * 전체 학생 목록 조회
   */
  const {
    data: students = [],
    isLoading: isStudentsLoading,
    isError: isStudentsError,
  } = useStudentsQuery(TEACHER_NAME);

  /*
   * 학교 목록
   */
  const schoolOptions = useMemo(() => {
    const schools = Array.from(
      new Set(students.map((student) => student.schoolName).filter(Boolean)),
    );

    return [
      {
        value: "ALL",
        label: "전체",
      },

      ...schools.map((school) => ({
        value: school,
        label: school,
      })),
    ];
  }, [students]);

  /*
   * 학년 목록
   */
  const gradeOptions = useMemo(() => {
    const grades = Array.from(
      new Set(
        students
          .filter((student) => {
            if (selectedSchool === "ALL") {
              return true;
            }

            return student.schoolName === selectedSchool;
          })
          .map((student) => student.grade)
          .filter(Boolean),
      ),
    );

    return [
      {
        value: "ALL",
        label: "전체",
      },

      ...grades.map((grade) => ({
        value: grade,
        label: grade,
      })),
    ];
  }, [students, selectedSchool]);

  /*
   * 학교 + 학년 조건으로 학생 필터
   */
  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      const schoolMatched =
        selectedSchool === "ALL" || student.schoolName === selectedSchool;

      const gradeMatched =
        selectedGrade === "ALL" || student.grade === selectedGrade;

      return schoolMatched && gradeMatched;
    });
  }, [students, selectedSchool, selectedGrade]);

  /*
   * Batch 조회에 사용할 학생 ID
   */
  const studentIds = useMemo(() => {
    return filteredStudents.map((student) => student.studentId);
  }, [filteredStudents]);

  /*
   * 여러 학생의 수업 기록 일괄 조회
   */
  const {
    data: lessonRecordsByStudent = {},
    isLoading: isRecordsLoading,
    isError: isRecordsError,
  } = useLessonRecordsBatchQuery(TEACHER_NAME, studentIds);

  /*
   * 실제 수업 기록에서 주차 목록 생성
   */
  const weekOptions = useMemo(() => {
    const weekMap = new Map<string, number>();

    Object.values(lessonRecordsByStudent).forEach((records) => {
      records.forEach((record) => {
        if (!record.weekLabel) {
          return;
        }

        const currentWeekNumber = weekMap.get(record.weekLabel);

        if (
          currentWeekNumber === undefined ||
          record.weekNumber < currentWeekNumber
        ) {
          weekMap.set(record.weekLabel, record.weekNumber);
        }
      });
    });

    return Array.from(weekMap.entries())
      .sort((a, b) => a[1] - b[1])
      .map(([weekLabel]) => ({
        value: weekLabel,
        label: weekLabel,
      }));
  }, [lessonRecordsByStudent]);

  /*
   * 선택된 주차가 유효하면 유지
   * 선택된 주차가 없으면 최신 주차 자동 선택
   */
  useEffect(() => {
    if (weekOptions.length === 0) {
      if (selectedWeeks.length > 0) {
        setSelectedWeeks([]);
      }

      return;
    }

    const validSelectedWeeks = selectedWeeks.filter((week) =>
      weekOptions.some((option) => option.value === week),
    );

    if (validSelectedWeeks.length > 0) {
      if (validSelectedWeeks.length !== selectedWeeks.length) {
        setSelectedWeeks(validSelectedWeeks);
      }

      return;
    }

    const latestWeek = weekOptions[weekOptions.length - 1];

    if (selectedWeeks.length !== 1 || selectedWeeks[0] !== latestWeek.value) {
      setSelectedWeeks([latestWeek.value]);
    }
  }, [weekOptions, selectedWeeks]);

  /*
   * 학교 변경
   */
  const handleSchoolChange = (school: string) => {
    setSelectedSchool(school);

    setSelectedGrade("ALL");

    setSelectedWeeks([]);
  };

  /*
   * 학년 변경
   */
  const handleGradeChange = (grade: string) => {
    setSelectedGrade(grade);

    setSelectedWeeks([]);
  };

  /*
   * 학생 + 주차에 해당하는 기록 찾기
   */
  const getRecord = (studentId: string, weekLabel: string) => {
    const records = lessonRecordsByStudent[studentId] ?? [];

    return records.find((record) => record.weekLabel === weekLabel) ?? null;
  };

  /*
   * 학생 목록 조회 중
   */
  if (isStudentsLoading) {
    return (
      <div
        style={{
          minHeight: 300,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Spin size="large" />
      </div>
    );
  }

  /*
   * 학생 목록 조회 실패
   */
  if (isStudentsError) {
    return (
      <Card>
        <Text type="danger">학생 목록을 불러오지 못했습니다.</Text>
      </Card>
    );
  }

  return (
    <div
      style={{
        width: "100%",
        maxWidth: 1400,
        margin: "0 auto",
      }}
    >
      <Title
        level={3}
        style={{
          marginTop: 0,
          marginBottom: 16,
        }}
      >
        주차별 수업
      </Title>

      {/* 조회 조건 */}
      <Card
        style={{
          marginBottom: 20,
        }}
      >
        <Row gutter={[16, 16]}>
          <Col xs={24} md={8}>
            <Text strong>학교 선택</Text>

            <Select
              value={selectedSchool}
              options={schoolOptions}
              style={{
                width: "100%",
                marginTop: 6,
              }}
              onChange={handleSchoolChange}
            />
          </Col>

          <Col xs={24} md={8}>
            <Text strong>학년 선택</Text>

            <Select
              value={selectedGrade}
              options={gradeOptions}
              style={{
                width: "100%",
                marginTop: 6,
              }}
              onChange={handleGradeChange}
            />
          </Col>

          <Col xs={24} md={8}>
            <Text strong>주차 선택</Text>

            <Select
              mode="multiple"
              value={selectedWeeks}
              options={weekOptions}
              loading={isRecordsLoading}
              disabled={isRecordsLoading || weekOptions.length === 0}
              maxTagCount="responsive"
              placeholder="주차를 선택하세요."
              style={{
                width: "100%",
                marginTop: 6,
              }}
              onChange={setSelectedWeeks}
            />
          </Col>
        </Row>
      </Card>

      {/* 수업 기록 조회 중 */}
      {isRecordsLoading && (
        <Card>
          <div
            style={{
              padding: 24,
              textAlign: "center",
            }}
          >
            <Spin />

            <div
              style={{
                marginTop: 10,
              }}
            >
              <Text type="secondary">학생 수업 기록을 불러오는 중입니다.</Text>
            </div>
          </div>
        </Card>
      )}

      {/* 수업 기록 조회 실패 */}
      {!isRecordsLoading && isRecordsError && (
        <Card>
          <Text type="danger">수업 기록을 불러오지 못했습니다.</Text>
        </Card>
      )}

      {/* 주차별 학생 목록 */}
      {!isRecordsLoading &&
        !isRecordsError &&
        selectedWeeks.map((week) => {
          const weeklyStudents = filteredStudents.filter(
            (student) => getRecord(student.studentId, week) !== null,
          );

          return (
            <Card
              key={week}
              style={{
                marginBottom: 24,
              }}
              styles={{
                body: {
                  padding: 16,
                },
              }}
            >
              {/* 주차 제목 */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  marginBottom: 16,
                  paddingBottom: 12,
                  borderBottom: "3px solid #91caff",
                }}
              >
                <Title
                  level={4}
                  style={{
                    margin: 0,
                    color: "#1677ff",
                  }}
                >
                  {week}
                </Title>

                <Text type="secondary">학생 {weeklyStudents.length}명</Text>
              </div>

              {/* 해당 주차 기록 없음 */}
              {weeklyStudents.length === 0 ? (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description="해당 주차의 수업 기록이 없습니다."
                />
              ) : (
                <Row gutter={[16, 16]}>
                  {weeklyStudents.map((student: StudentSummary, index) => {
                    const record = getRecord(student.studentId, week);

                    if (!record) {
                      return null;
                    }

                    const dailyAchievement = record.dailyAchievement ?? null;

                    const homeworkAchievement =
                      record.homeworkAchievement ?? null;

                    const reviewTestScore = record.reviewTestScore ?? null;

                    const memorizationAchievement = getMemorizationText(
                      record.memorizationAchievement,
                    );

                    /*
                     * 암기반 상태 표시
                     */
                    const isMemorizationPass =
                      memorizationAchievement === "통과";

                    const isMemorizationAbsent =
                      memorizationAchievement.includes("병결") ||
                      memorizationAchievement.includes("결석");

                    return (
                      <Col
                        key={`${week}-${student.studentId}`}
                        xs={24}
                        sm={12}
                        lg={8}
                        xl={6}
                      >
                        <Card
                          size="small"
                          style={{
                            height: "100%",
                            border: "1px solid #cbdcf2",
                            borderRadius: 12,
                            boxShadow: "0 3px 10px rgba(22, 119, 255, 0.08)",
                            overflow: "hidden",
                          }}
                          styles={{
                            header: {
                              minHeight: 62,
                              padding: "0 14px",
                              background:
                                "linear-gradient(135deg, #f0f7ff 0%, #e6f4ff 100%)",
                              borderBottom: "1px solid #d6e4ff",
                            },
                            body: {
                              padding: "14px",
                            },
                          }}
                          title={
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 10,
                                width: "100%",
                              }}
                            >
                              {/* 학생 아이콘 */}
                              <div
                                style={{
                                  width: 34,
                                  height: 34,
                                  flexShrink: 0,
                                  borderRadius: "50%",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  background: "#d6eaff",
                                  color: "#1677ff",
                                  fontSize: 16,
                                  fontWeight: 700,
                                }}
                              >
                                {student.studentName?.charAt(0)}
                              </div>

                              {/* 학생 정보 */}
                              <div
                                style={{
                                  flex: 1,
                                  minWidth: 0,
                                }}
                              >
                                <Text
                                  strong
                                  style={{
                                    display: "block",
                                    fontSize: 16,
                                    lineHeight: 1.3,
                                    color: "#1f1f1f",
                                  }}
                                >
                                  {student.studentName}
                                </Text>

                                <Text
                                  style={{
                                    display: "block",
                                    marginTop: 2,
                                    fontSize: 12,
                                    color: "#55708f",
                                  }}
                                >
                                  {student.schoolName}
                                  {" · "}
                                  {student.grade}
                                </Text>
                              </div>

                              {/* 순번 */}
                              <div
                                style={{
                                  flexShrink: 0,
                                  padding: "2px 7px",
                                  borderRadius: 10,
                                  background: "#d6eaff",
                                  color: "#1677ff",
                                  fontSize: 11,
                                  fontWeight: 700,
                                }}
                              >
                                #{index + 1}
                              </div>
                            </div>
                          }
                        >
                          <div
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              gap: 15,
                            }}
                          >
                            {/* 당일 평가 */}
                            <div>
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "space-between",
                                  marginBottom: 6,
                                }}
                              >
                                <Text
                                  strong
                                  style={{
                                    fontSize: 14,
                                  }}
                                >
                                  당일 평가
                                </Text>

                                <Tag
                                  color={getScoreTagColor(dailyAchievement)}
                                  style={{
                                    margin: 0,
                                    minWidth: 48,
                                    textAlign: "center",
                                    fontWeight: 600,
                                  }}
                                >
                                  {dailyAchievement === null
                                    ? "-"
                                    : `${dailyAchievement}%`}
                                </Tag>
                              </div>

                              <Progress
                                percent={dailyAchievement ?? 0}
                                showInfo={false}
                                size="small"
                              />
                            </div>

                            {/* 숙제 */}
                            <div>
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "space-between",
                                  marginBottom: 6,
                                }}
                              >
                                <Text
                                  strong
                                  style={{
                                    fontSize: 14,
                                  }}
                                >
                                  숙제
                                </Text>

                                <Tag
                                  color={getScoreTagColor(homeworkAchievement)}
                                  style={{
                                    margin: 0,
                                    minWidth: 48,
                                    textAlign: "center",
                                    fontWeight: 600,
                                  }}
                                >
                                  {homeworkAchievement === null
                                    ? "-"
                                    : `${homeworkAchievement}%`}
                                </Tag>
                              </div>

                              <Progress
                                percent={homeworkAchievement ?? 0}
                                showInfo={false}
                                size="small"
                              />
                            </div>

                            {/* 구분선 */}
                            <div
                              style={{
                                height: 1,
                                background: "#eef1f5",
                              }}
                            />

                            {/* 복습 테스트 */}
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                              }}
                            >
                              <Text>복습 테스트</Text>

                              <Text
                                strong
                                style={{
                                  fontSize: 15,
                                }}
                              >
                                {reviewTestScore === null
                                  ? "-"
                                  : `${reviewTestScore}점`}
                              </Text>
                            </div>

                            {/* 암기반 */}
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                              }}
                            >
                              <Text>암기반</Text>

                              {isMemorizationPass ? (
                                <Tag
                                  color="green"
                                  style={{
                                    margin: 0,
                                    minWidth: 58,
                                    textAlign: "center",
                                    fontWeight: 600,
                                  }}
                                >
                                  통과
                                </Tag>
                              ) : isMemorizationAbsent ? (
                                <Tag
                                  color="red"
                                  style={{
                                    margin: 0,
                                    minWidth: 58,
                                    textAlign: "center",
                                    fontWeight: 600,
                                  }}
                                >
                                  {memorizationAchievement}
                                </Tag>
                              ) : (
                                <Text strong>{memorizationAchievement}</Text>
                              )}
                            </div>
                          </div>
                        </Card>
                      </Col>
                    );
                  })}
                </Row>
              )}
            </Card>
          );
        })}

      {/* 선택 주차 없음 */}
      {!isRecordsLoading && !isRecordsError && selectedWeeks.length === 0 && (
        <Card>
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="조회할 주차를 선택해주세요."
          />
        </Card>
      )}
    </div>
  );
}
