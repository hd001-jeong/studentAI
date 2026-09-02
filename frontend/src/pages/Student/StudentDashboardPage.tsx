import { useEffect, useMemo, useState } from "react";
import { Card, Form, Spin, Typography, message } from "antd";

import StudentApi from "@/api/StudentApi";

import {
  FixedAchievementSection,
  LessonBasicInfo,
  LessonDetailSection,
  MemorizationSection,
  ReviewTestSection,
  StudentHeaderCard,
  StudentOverallStatus,
  TeacherCommentSection,
  WeekSummarySection,
} from "@/components/student";

import {
  DEFAULT_WEEK_RECORDS,
  TEACHER_COMMENT_MAX_LENGTH,
} from "@/constants/studentConstants";

import { useStudentsQuery } from "@/hooks/useStudentsQuery";
import { useLessonRecordsQuery } from "@/hooks/useLessonRecordsQuery";

import type {
  LessonRecord,
  MemorizationAchievement,
} from "@/types/lessonRecord";

import {
  calculateOverallSummary,
  calculateReviewScore,
} from "@/utils/achievement";

// import StudentProgressChart from "./StudentProgressChart";

const { Text } = Typography;

const TEACHER_NAME = "박현민";

const centeredPageStyle = {
  minHeight: "100vh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "#f5f7fa",
};

export default function StudentDashboardPage() {
  const [saving, setSaving] = useState(false);

  // 학교
  const [selectedSchool, setSelectedSchool] = useState("ALL");

  // 학년
  const [selectedGrade, setSelectedGrade] = useState("ALL");

  // 학생
  const [selectedStudentId, setSelectedStudentId] = useState("");

  const [selectedRecordId, setSelectedRecordId] = useState("DEFAULT_WEEK_1");

  const [form] = Form.useForm<LessonRecord>();

  const [messageApi, contextHolder] = message.useMessage();

  const [detailOpen, setDetailOpen] = useState(false);

  const setRecordToForm = (record: LessonRecord) => {
    form.setFieldsValue({
      ...record,

      homeworks: record.homeworks.map((homework) => ({
        ...homework,
      })) as LessonRecord["homeworks"],

      dailyEvaluations: record.dailyEvaluations.map((evaluation) => ({
        ...evaluation,
      })) as LessonRecord["dailyEvaluations"],
    });
  };

  /*
   * 학생 Select 목록 조회
   */
  const {
    data: students = [],
    isLoading: isStudentsLoading,
    isError: isStudentsError,
    error: studentsError,
  } = useStudentsQuery(TEACHER_NAME);

  /*
   * 선택한 학생의 수업 기록 조회
   */
  const {
    data: fetchedLessonRecords = [],
    isLoading: isRecordsLoading,
    isError: isRecordsError,
    refetch: refetchLessonRecords,
  } = useLessonRecordsQuery(TEACHER_NAME, selectedStudentId);

  /*
   * 최초 진입:
   * DEFAULT 1~4주차
   *
   * 학생 선택 후:
   * 실제 Google Sheet 데이터
   *
   * lessonDate 기준 오래된 → 최신 순 정렬
   * 최근 8주만 표시
   */
  const displayedRecords = useMemo(() => {
    if (selectedStudentId && fetchedLessonRecords.length > 0) {
      return [...fetchedLessonRecords]
        .sort(
          (a, b) =>
            new Date(a.lessonDate).getTime() - new Date(b.lessonDate).getTime(),
        )
        .slice(-8);
    }

    return DEFAULT_WEEK_RECORDS;
  }, [selectedStudentId, fetchedLessonRecords]);

  /*
   * 학교 목록
   *
   * 학생 데이터의 schoolName을 기준으로 자동 생성
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
   *
   * 선택한 학교에 존재하는 학년만 표시
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
   * 학생 목록
   *
   * 학교 + 학년 조건으로 필터링
   */
  const studentOptions = useMemo(() => {
    return students
      .filter((student) => {
        const schoolMatched =
          selectedSchool === "ALL" || student.schoolName === selectedSchool;

        const gradeMatched =
          selectedGrade === "ALL" || student.grade === selectedGrade;

        return schoolMatched && gradeMatched;
      })
      .map((student) => ({
        value: student.studentId,

        label:
          `${student.studentName} ` +
          `(${student.schoolName}/${student.grade})`,
      }));
  }, [students, selectedSchool, selectedGrade]);

  /*
   * 학교 변경
   *
   * 학교가 변경되면
   * 학년 / 학생 선택 초기화
   */
  const handleSchoolChange = (school: string) => {
    setSelectedSchool(school);

    setSelectedGrade("ALL");

    setSelectedStudentId("");

    setSelectedRecordId("DEFAULT_WEEK_1");
  };

  /*
   * 학년 변경
   */
  const handleGradeChange = (grade: string) => {
    setSelectedGrade(grade);

    setSelectedStudentId("");

    setSelectedRecordId("DEFAULT_WEEK_1");
  };

  /*
   * 학생 변경
   */
  const handleStudentChange = (studentId: string) => {
    setSelectedStudentId(studentId);

    setSelectedRecordId("DEFAULT_WEEK_1");
  };

  const handleDetailClose = () => {
    if (selectedRecord) {
      form.setFieldsValue({
        ...selectedRecord,

        homeworks: selectedRecord.homeworks.map((homework) => ({
          ...homework,
        })),

        dailyEvaluations: selectedRecord.dailyEvaluations.map((evaluation) => ({
          ...evaluation,
        })),
      });
    }

    setDetailOpen(false);
  };

  /*
   * 학생 기록 조회 완료 후
   *
   * 현재 선택된 기록이 있으면 유지하고,
   * 선택된 기록이 없을 때만
   * 현재 화면의 첫 번째 기록 선택
   */
  useEffect(() => {
    if (!selectedStudentId) {
      return;
    }

    if (displayedRecords.length === 0) {
      return;
    }

    const hasSelectedRecord = displayedRecords.some(
      (record) => record.recordId === selectedRecordId,
    );

    if (!hasSelectedRecord) {
      setSelectedRecordId(displayedRecords[0].recordId);
    }
  }, [selectedStudentId, displayedRecords, selectedRecordId]);

  /*
   * 현재 선택된 주차
   */
  const selectedRecord = useMemo(() => {
    return (
      displayedRecords.find((record) => record.recordId === selectedRecordId) ??
      displayedRecords[0]
    );
  }, [displayedRecords, selectedRecordId]);

  /*
   * Form 감시
   */
  const reviewQuestionCount =
    Form.useWatch("reviewQuestionCount", form) ?? null;

  const reviewCorrectCount = Form.useWatch("reviewCorrectCount", form) ?? null;

  const reviewScore = Form.useWatch("reviewTestScore", form) ?? null;

  const memorizationAchievement = (Form.useWatch(
    "memorizationAchievement",
    form,
  ) ?? null) as MemorizationAchievement;

  /*
   * 복습 점수 자동 계산
   */
  useEffect(() => {
    const score = calculateReviewScore(reviewQuestionCount, reviewCorrectCount);

    form.setFieldValue("reviewTestScore", score);
  }, [form, reviewQuestionCount, reviewCorrectCount]);

  /*
   * 선택 주차를 Form에 표시
   */
  useEffect(() => {
    if (!selectedRecord) {
      form.resetFields();
      return;
    }

    setRecordToForm(selectedRecord);
  }, [selectedRecord]);

  /*
   * 전체 평균
   *
   * 화면에 표시되는 최근 8주 기준
   * 학생 선택 전에는 빈 값
   */
  const overallSummary = useMemo(() => {
    if (!selectedStudentId) {
      return calculateOverallSummary([]);
    }

    return calculateOverallSummary(displayedRecords);
  }, [selectedStudentId, displayedRecords]);

  /*
   * 저장
   */
  const handleSave = async () => {
    /*
     * 학생 선택 전 기본 템플릿은
     * 저장하지 않는다.
     */
    if (!selectedStudentId) {
      return;
    }

    if (!selectedRecord) {
      return;
    }

    if (selectedRecord.recordId.startsWith("DEFAULT_")) {
      return;
    }

    try {
      const values = await form.validateFields();

      setSaving(true);

      const updatedRecord: LessonRecord = {
        ...selectedRecord,
        ...values,

        recordId: selectedRecord.recordId,

        studentId: selectedRecord.studentId,

        studentName: selectedRecord.studentName,

        schoolName: selectedRecord.schoolName,

        grade: selectedRecord.grade,

        teacherName: selectedRecord.teacherName,

        weekNumber: selectedRecord.weekNumber,

        reviewTestScore: calculateReviewScore(
          values.reviewQuestionCount,
          values.reviewCorrectCount,
        ),

        homeworks: values.homeworks as LessonRecord["homeworks"],

        dailyEvaluations:
          values.dailyEvaluations as LessonRecord["dailyEvaluations"],
      };

      const savedRecord = await StudentApi.updateLessonRecord(
        selectedRecord.recordId,
        updatedRecord,
      );

      form.setFieldsValue(savedRecord);

      await refetchLessonRecords();

      messageApi.success(`${savedRecord.weekLabel} 기록을 저장했습니다.`);
    } catch (saveError) {
      console.error("수업 기록 저장 실패", saveError);

      messageApi.error("수업 기록을 저장하지 못했습니다.");
    } finally {
      setSaving(false);
    }
  };

  /*
   * 학생 목록 최초 조회 중
   */
  if (isStudentsLoading) {
    return (
      <div style={centeredPageStyle}>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 12,
          }}
        >
          <Spin size="large" />

          <Text type="secondary">학생 목록을 불러오는 중입니다.</Text>
        </div>
      </div>
    );
  }

  /*
   * 학생 목록 조회 실패
   */
  if (isStudentsError) {
    return (
      <div style={centeredPageStyle}>
        <Card>
          <Text type="danger">학생 목록을 불러오지 못했습니다.</Text>

          <div
            style={{
              marginTop: 8,
            }}
          >
            <Text type="secondary">
              {studentsError instanceof Error
                ? studentsError.message
                : "알 수 없는 오류가 발생했습니다."}
            </Text>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <>
      {contextHolder}

      <div
        style={{
          width: "100%",
          maxWidth: 1700,
          margin: "0 auto",
        }}
      >
        <Form form={form} layout="vertical" requiredMark={false}>
          <StudentHeaderCard
            selectedSchool={selectedSchool}
            schoolOptions={schoolOptions}
            selectedGrade={selectedGrade}
            gradeOptions={gradeOptions}
            selectedStudentId={selectedStudentId}
            studentOptions={studentOptions}
            selectedRecord={selectedRecord}
            onSchoolChange={handleSchoolChange}
            onGradeChange={handleGradeChange}
            onStudentChange={handleStudentChange}
          />

          {isRecordsLoading ? (
            <Card
              style={{
                marginTop: 12,
              }}
            >
              <Spin />

              <Text
                type="secondary"
                style={{
                  marginLeft: 10,
                }}
              >
                학생 수업 기록을 불러오는 중입니다.
              </Text>
            </Card>
          ) : (
            <>
              <WeekSummarySection
                records={displayedRecords}
                selectedRecordId={selectedRecord.recordId}
                onRecordChange={setSelectedRecordId}
                onDetailOpen={() => setDetailOpen(true)}
              />

              {/* <StudentProgressChart records={displayedRecords} /> */}

              <StudentOverallStatus summary={overallSummary} />

              <LessonDetailSection
                weekLabel={selectedRecord.weekLabel}
                open={detailOpen}
                saving={saving}
                onClose={handleDetailClose}
                onSave={handleSave}
              >
                <LessonBasicInfo />

                <FixedAchievementSection
                  form={form}
                  fieldName="dailyEvaluations"
                  title="당일 평가"
                  itemTitle="당일 평가"
                  inputLabel="평가 내용"
                />

                <div
                  style={{
                    marginTop: 10,
                  }}
                >
                  <FixedAchievementSection
                    form={form}
                    fieldName="homeworks"
                    title="숙제"
                    itemTitle="숙제"
                    inputLabel="숙제 내용"
                  />
                </div>

                <ReviewTestSection
                  reviewScore={reviewScore}
                  reviewQuestionCount={reviewQuestionCount}
                />

                <MemorizationSection achievement={memorizationAchievement} />

                <TeacherCommentSection maxLength={TEACHER_COMMENT_MAX_LENGTH} />
              </LessonDetailSection>
            </>
          )}

          {isRecordsError && (
            <Card
              style={{
                marginTop: 12,
              }}
            >
              <Text type="danger">
                선택한 학생의 수업 기록을 불러오지 못했습니다.
              </Text>
            </Card>
          )}
        </Form>
      </div>
    </>
  );
}
