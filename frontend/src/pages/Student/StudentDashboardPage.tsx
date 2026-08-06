import { useEffect, useMemo, useState } from "react";
import { Card, Form, Layout, Spin, Typography, message } from "antd";

import StudentApi from "@/api/StudentApi";

import AppHeader from "@/components/layout/AppHeader";

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

import { TEACHER_COMMENT_MAX_LENGTH } from "@/constants/studentConstants";
import { useLessonRecordsQuery } from "@/hooks/useLessonRecordsQuery";

import type {
  LessonRecord,
  MemorizationAchievement,
} from "@/types/lessonRecord";

import {
  calculateOverallSummary,
  calculateReviewScore,
} from "@/utils/achievement";

const { Content } = Layout;
const { Text } = Typography;

const EMPTY_LESSON_RECORDS: LessonRecord[] = [];

const centeredPageStyle = {
  minHeight: "100vh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "#f5f7fa",
};

export default function StudentDashboardPage() {
  const teacherCode = localStorage.getItem("teacherCode") ?? "";

  const [saving, setSaving] = useState(false);

  const teacherName = localStorage.getItem("teacherName");
  /*
   * 화면에서 수정 중인 데이터
   */
  const [lessonRecords, setLessonRecords] = useState<LessonRecord[]>([]);

  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [selectedRecordId, setSelectedRecordId] = useState("");

  const [form] = Form.useForm<LessonRecord>();
  const [messageApi, contextHolder] = message.useMessage();

  const [selectedGrade, setSelectedGrade] = useState("ALL");

  /*
   * 수업 기록 조회
   */
  const { data, isLoading, isError, error } =
    useLessonRecordsQuery(teacherCode);

  const fetchedLessonRecords = data ?? EMPTY_LESSON_RECORDS;

  /*
   * 조회 결과를 화면 상태에 반영
   */
  useEffect(() => {
    setLessonRecords(fetchedLessonRecords);

    if (fetchedLessonRecords.length === 0) {
      setSelectedStudentId("");
      setSelectedRecordId("");
      return;
    }

    const firstRecord = fetchedLessonRecords[0];

    setSelectedStudentId((currentStudentId) => {
      const studentExists = fetchedLessonRecords.some(
        (record) => record.studentId === currentStudentId,
      );

      return studentExists ? currentStudentId : firstRecord.studentId;
    });

    setSelectedRecordId((currentRecordId) => {
      const recordExists = fetchedLessonRecords.some(
        (record) => record.recordId === currentRecordId,
      );

      return recordExists ? currentRecordId : firstRecord.recordId;
    });
  }, [fetchedLessonRecords]);

  /*
   * Form 감시값
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
   * 학생 선택 목록
   */
  const studentOptions = useMemo(() => {
    const studentMap = new Map<
      string,
      {
        value: string;
        label: string;
        grade: string;
      }
    >();

    lessonRecords.forEach((record) => {
      if (studentMap.has(record.studentId)) {
        return;
      }

      studentMap.set(record.studentId, {
        value: record.studentId,
        label: `${record.studentName} (${record.schoolName}/${record.grade})`,
        grade: record.grade,
      });
    });

    return Array.from(studentMap.values());
  }, [lessonRecords]);

  const gradeOptions = useMemo(() => {
    const grades = Array.from(
      new Set(studentOptions.map((student) => student.grade)),
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
  }, [studentOptions]);

  const filteredStudentOptions = useMemo(() => {
    if (!selectedGrade || selectedGrade === "ALL") {
      return studentOptions;
    }

    return studentOptions.filter((student) => student.grade === selectedGrade);
  }, [selectedGrade, studentOptions]);

  const handleGradeChange = (grade: string) => {
    setSelectedGrade(grade);

    const firstStudent =
      grade === "ALL"
        ? studentOptions[0]
        : studentOptions.find((student) => student.grade === grade);

    if (!firstStudent) {
      setSelectedStudentId("");
      setSelectedRecordId("");
      return;
    }

    handleStudentChange(firstStudent.value);
  };

  /*
   * 선택 학생의 수업 기록
   */
  const selectedStudentRecords = useMemo(
    () =>
      lessonRecords
        .filter((record) => record.studentId === selectedStudentId)
        .sort((a, b) => a.weekNumber - b.weekNumber),
    [lessonRecords, selectedStudentId],
  );

  /*
   * 선택 주차 기록
   */
  const selectedRecord = useMemo(
    () =>
      selectedStudentRecords.find(
        (record) => record.recordId === selectedRecordId,
      ) ?? selectedStudentRecords[0],
    [selectedRecordId, selectedStudentRecords],
  );

  /*
   * 전체 평균
   */
  const overallSummary = useMemo(
    () => calculateOverallSummary(selectedStudentRecords),
    [selectedStudentRecords],
  );

  /*
   * 선택 주차를 Form에 표시
   */
  useEffect(() => {
    if (!selectedRecord) {
      form.resetFields();
      return;
    }

    form.setFieldsValue({
      ...selectedRecord,

      homeworks: selectedRecord.homeworks.map((homework) => ({
        ...homework,
      })) as LessonRecord["homeworks"],

      dailyEvaluations: selectedRecord.dailyEvaluations.map((evaluation) => ({
        ...evaluation,
      })) as LessonRecord["dailyEvaluations"],
    });
  }, [form, selectedRecord]);

  /*
   * 학생 변경
   */
  const handleStudentChange = (studentId: string) => {
    setSelectedStudentId(studentId);

    const firstRecord = lessonRecords
      .filter((record) => record.studentId === studentId)
      .sort((a, b) => a.weekNumber - b.weekNumber)[0];

    setSelectedRecordId(firstRecord?.recordId ?? "");
  };

  /*
   * 선택 주차 저장
   */
  const handleSave = async () => {
    if (!selectedRecord) {
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

      setLessonRecords((records) =>
        records.map((record) =>
          record.recordId === savedRecord.recordId ? savedRecord : record,
        ),
      );

      messageApi.success(`${savedRecord.weekNumber}주차 기록을 저장했습니다.`);
    } catch (saveError) {
      console.error("수업 기록 저장 실패", saveError);

      messageApi.error("수업 기록을 저장하지 못했습니다.");
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) {
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

          <Text type="secondary">수업 기록을 불러오는 중입니다.</Text>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div style={centeredPageStyle}>
        <Card>
          <Text type="danger">수업 기록을 불러오지 못했습니다.</Text>

          <div style={{ marginTop: 8 }}>
            <Text type="secondary">
              {error instanceof Error
                ? error.message
                : "알 수 없는 오류가 발생했습니다."}
            </Text>
          </div>
        </Card>
      </div>
    );
  }

  if (!selectedRecord) {
    return (
      <div style={centeredPageStyle}>
        <Card>
          <Text type="secondary">표시할 수업 기록이 없습니다.</Text>
        </Card>
      </div>
    );
  }

  return (
    <>
      {contextHolder}

      <Layout style={{ minHeight: "100vh" }}>
        <AppHeader teacherName={teacherName} />

        <Content
          style={{
            padding: 18,
            background: "#f5f7fa",
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: 1700,
              margin: "0 auto",
            }}
          >
            <Form form={form} layout="vertical" requiredMark={false}>
              <StudentHeaderCard
                selectedGrade={selectedGrade}
                gradeOptions={gradeOptions}
                selectedStudentId={selectedStudentId}
                studentOptions={filteredStudentOptions}
                selectedRecord={selectedRecord}
                onGradeChange={handleGradeChange}
                onStudentChange={handleStudentChange}
              />

              <WeekSummarySection
                records={selectedStudentRecords}
                selectedRecordId={selectedRecord.recordId}
                onRecordChange={setSelectedRecordId}
              />

              <StudentOverallStatus summary={overallSummary} />

              <LessonDetailSection
                weekNumber={selectedRecord.weekNumber}
                saving={saving}
                onSave={handleSave}
              >
                <LessonBasicInfo />

                <FixedAchievementSection
                  form={form}
                  fieldName="homeworks"
                  title="숙제"
                  itemTitle="숙제"
                  inputLabel="숙제 내용"
                />

                <div style={{ marginTop: 10 }}>
                  <FixedAchievementSection
                    form={form}
                    fieldName="dailyEvaluations"
                    title="당일 평가"
                    itemTitle="당일 평가"
                    inputLabel="평가 내용"
                  />
                </div>

                <ReviewTestSection
                  reviewScore={reviewScore}
                  reviewQuestionCount={reviewQuestionCount}
                />

                <MemorizationSection achievement={memorizationAchievement} />

                <TeacherCommentSection maxLength={TEACHER_COMMENT_MAX_LENGTH} />
              </LessonDetailSection>
            </Form>
          </div>
        </Content>
      </Layout>
    </>
  );
}
