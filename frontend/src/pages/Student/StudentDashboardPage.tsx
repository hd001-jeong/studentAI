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

  const [selectedSchool, setSelectedSchool] = useState("ALL");
  const [selectedGrade, setSelectedGrade] = useState("ALL");
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
   * 전체 학생 목록
   */
  const {
    data: students = [],
    isLoading: isStudentsLoading,
    isError: isStudentsError,
    error: studentsError,
  } = useStudentsQuery(TEACHER_NAME);

  /*
   * 전체 학생 이름 검색용
   */
  const allStudentOptions = useMemo(() => {
    return students.map((student) => ({
      value: student.studentId,
      label: `${student.studentName} (${student.schoolName}/${student.grade})`,
    }));
  }, [students]);

  /*
   * 선택 학생 수업 기록
   */
  const {
    data: fetchedLessonRecords = [],
    isLoading: isRecordsLoading,
    isError: isRecordsError,
    refetch: refetchLessonRecords,
  } = useLessonRecordsQuery(TEACHER_NAME, selectedStudentId);

  /*
   * 화면 표시 기록
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
   */
  const schoolOptions = useMemo(() => {
    const allowedSchools = ["인창고", "이화여고"];

    return Array.from(
      new Set(
        students
          .map((student) => student.schoolName)
          .filter((schoolName) => allowedSchools.includes(schoolName)),
      ),
    ).map((schoolName) => ({
      label: schoolName,
      value: schoolName,
    }));
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
   * 학교 + 학년 기준 학생 목록
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
   * 학생 선택
   *
   * 이름 검색으로 다른 학교 학생을 선택해도
   * 해당 학생 학교 / 학년으로 자동 변경
   */
  const handleStudentChange = (studentId: string) => {
    const student = students.find((item) => item.studentId === studentId);

    if (student) {
      setSelectedSchool(student.schoolName);
      setSelectedGrade(student.grade);
    }

    setSelectedStudentId(studentId);
    setSelectedRecordId("DEFAULT_WEEK_1");
  };

  /*
   * 학교 변경
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
   * 존재하는 첫 주차 선택
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
   * 현재 선택 주차
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
   * 선택 주차 Form 표시
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
   * 학생 목록 로딩
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
            allStudentOptions={allStudentOptions}
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
