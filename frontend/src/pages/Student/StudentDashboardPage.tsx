import { RobotOutlined, SaveOutlined } from "@ant-design/icons";

import {
  Alert,
  Avatar,
  Button,
  Card,
  Col,
  Form,
  Input,
  InputNumber,
  Layout,
  Row,
  Select,
  Space,
  Spin,
  Tag,
  Typography,
  message,
} from "antd";

import {
  FixedAchievementSection,
  StudentOverallStatus,
  WeekSummaryCard,
} from "@/components/student";

import {
  MEMORIZATION_OPTIONS,
  TEACHER_COMMENT_MAX_LENGTH,
} from "@/constants/studentConstants";

import StudentApi from "@/api/StudentApi";

import type {
  LessonRecord,
  MemorizationAchievement,
} from "@/types/lessonRecord";

import {
  calculateOverallSummary,
  calculateReviewScore,
  getAchievementBackground,
  getAchievementColor,
  getAchievementLabel,
  getAchievementTagColor,
  getMemorizationTagColor,
} from "@/utils/achievement";

import { useEffect, useMemo, useState } from "react";

const { Header, Content } = Layout;
const { Title, Text } = Typography;
const { TextArea } = Input;

export default function StudentDashboardPage() {
  /*
   * CSV API 조회 중인지 표시하는 상태
   */
  const [loading, setLoading] = useState(true);

  /*
   * 저장 버튼 로딩 상태
   */
  const [saving, setSaving] = useState(false);

  /*
   * FastAPI에서 조회한 전체 수업 기록
   *
   * 이전에는 INITIAL_LESSON_RECORDS를 사용했지만
   * 이제는 빈 배열로 시작한 뒤 API 데이터를 넣는다.
   */
  const [lessonRecords, setLessonRecords] = useState<LessonRecord[]>([]);

  /*
   * 현재 선택된 학생 ID
   *
   * API 조회가 끝난 뒤 첫 번째 학생 ID로 설정한다.
   */
  const [selectedStudentId, setSelectedStudentId] = useState("");

  /*
   * 현재 선택된 수업 기록 ID
   *
   * 1주차, 2주차 카드 선택에 사용한다.
   */
  const [selectedRecordId, setSelectedRecordId] = useState("");

  /*
   * Ant Design Form 객체
   */
  const [form] = Form.useForm<LessonRecord>();

  /*
   * 성공 및 오류 메시지
   */
  const [messageApi, contextHolder] = message.useMessage();

  /*
   * 복습 테스트 전체 문항 수
   */
  const reviewQuestionCount =
    Form.useWatch("reviewQuestionCount", form) ?? null;

  /*
   * 복습 테스트 맞은 문항 수
   */
  const reviewCorrectCount = Form.useWatch("reviewCorrectCount", form) ?? null;

  /*
   * 자동 계산된 복습 테스트 점수
   */
  const reviewScore = Form.useWatch("reviewTestScore", form) ?? null;

  /*
   * 암기반 성취도 선택값
   */
  const memorizationAchievement = (Form.useWatch(
    "memorizationAchievement",
    form,
  ) ?? null) as MemorizationAchievement;

  /*
   * 화면 최초 진입 시 CSV 수업 기록을 조회한다.
   *
   * React
   * → StudentApi
   * → FastAPI /students
   * → csv_service.py
   * → lesson_records.csv
   */
  useEffect(() => {
    const loadLessonRecords = async () => {
      try {
        setLoading(true);

        const records = await StudentApi.getLessonRecords();

        setLessonRecords(records);

        /*
         * 조회 결과가 있으면 첫 번째 학생과
         * 첫 번째 수업 기록을 자동 선택한다.
         */
        if (records.length > 0) {
          setSelectedStudentId(records[0].studentId);

          setSelectedRecordId(records[0].recordId);
        }
      } catch (error) {
        console.error("CSV 수업 기록 조회 실패", error);

        messageApi.error("수업 기록을 불러오지 못했습니다.");
      } finally {
        setLoading(false);
      }
    };

    loadLessonRecords();
  }, [messageApi]);

  /*
   * 전체 문항 수 또는 맞은 개수가 변경되면
   * 복습 테스트 점수를 자동 계산한다.
   */
  useEffect(() => {
    const score = calculateReviewScore(reviewQuestionCount, reviewCorrectCount);

    form.setFieldValue("reviewTestScore", score);
  }, [form, reviewQuestionCount, reviewCorrectCount]);

  /*
   * 전체 수업 기록에서 학생 목록을 만든다.
   *
   * 동일 학생이 주차별로 여러 번 존재하므로
   * Map을 사용해 중복을 제거한다.
   */
  const studentOptions = useMemo(() => {
    const studentMap = new Map<
      string,
      {
        value: string;
        label: string;
      }
    >();

    lessonRecords.forEach((record) => {
      if (!studentMap.has(record.studentId)) {
        studentMap.set(record.studentId, {
          value: record.studentId,
          label: `${record.studentName} (${record.schoolName}/${record.grade})`,
        });
      }
    });

    return Array.from(studentMap.values());
  }, [lessonRecords]);

  /*
   * 현재 선택한 학생의 기록만 추출하고
   * weekNumber 기준으로 정렬한다.
   */
  const selectedStudentRecords = useMemo(
    () =>
      lessonRecords
        .filter((record) => record.studentId === selectedStudentId)
        .sort((a, b) => a.weekNumber - b.weekNumber),
    [lessonRecords, selectedStudentId],
  );

  /*
   * 현재 선택한 주차 기록을 찾는다.
   *
   * selectedRecordId가 없거나 일치하지 않으면
   * 선택 학생의 첫 번째 기록을 사용한다.
   */
  const selectedRecord = useMemo(
    () =>
      selectedStudentRecords.find(
        (record) => record.recordId === selectedRecordId,
      ) ?? selectedStudentRecords[0],
    [selectedRecordId, selectedStudentRecords],
  );

  /*
   * 선택한 학생의 전체 숙제,
   * 당일평가, 복습 테스트 평균을 계산한다.
   */
  const overallSummary = useMemo(
    () => calculateOverallSummary(selectedStudentRecords),
    [selectedStudentRecords],
  );

  /*
   * 주차가 변경되면 해당 데이터를
   * Form 입력값으로 넣는다.
   */
  useEffect(() => {
    if (!selectedRecord) {
      return;
    }

    form.setFieldsValue({
      ...selectedRecord,

      /*
       * Form에서 값을 수정해도 API 응답 객체가
       * 직접 변경되지 않도록 새 객체로 복사한다.
       */
      homeworks: selectedRecord.homeworks.map((homework) => ({
        ...homework,
      })) as LessonRecord["homeworks"],

      dailyEvaluations: selectedRecord.dailyEvaluations.map((evaluation) => ({
        ...evaluation,
      })) as LessonRecord["dailyEvaluations"],
    });
  }, [form, selectedRecord]);

  /*
   * 학생 선택 변경
   *
   * 학생을 바꾸면 해당 학생의
   * 가장 빠른 주차를 자동 선택한다.
   */
  const handleStudentChange = (studentId: string) => {
    setSelectedStudentId(studentId);

    const firstRecord = lessonRecords
      .filter((record) => record.studentId === studentId)
      .sort((a, b) => a.weekNumber - b.weekNumber)[0];

    if (firstRecord) {
      setSelectedRecordId(firstRecord.recordId);
    }
  };

  /*
   * 현재 Form 데이터를 저장한다.
   *
   * 지금은 프론트 lessonRecords만 변경한다.
   * 다음 단계에서 FastAPI 저장 API를 호출하면
   * CSV 또는 Google Sheets까지 수정할 수 있다.
   */
  const handleSave = async () => {
    if (!selectedRecord) {
      return;
    }

    try {
      const values = await form.validateFields();

      setSaving(true);

      /*
       * 저장 직전 복습 점수를 다시 계산한다.
       */
      const calculatedReviewScore = calculateReviewScore(
        values.reviewQuestionCount,
        values.reviewCorrectCount,
      );

      const updatedRecord: LessonRecord = {
        ...selectedRecord,
        ...values,

        /*
         * 화면에서 수정하지 않는 식별정보는
         * 기존 selectedRecord 값을 유지한다.
         */
        recordId: selectedRecord.recordId,

        studentId: selectedRecord.studentId,

        studentName: selectedRecord.studentName,

        schoolName: selectedRecord.schoolName,

        grade: selectedRecord.grade,

        teacherName: selectedRecord.teacherName,

        weekNumber: selectedRecord.weekNumber,

        reviewTestScore: calculatedReviewScore,

        /*
         * 숙제와 당일평가는 각각 3개 고정 Tuple이다.
         */
        homeworks: values.homeworks as LessonRecord["homeworks"],

        dailyEvaluations:
          values.dailyEvaluations as LessonRecord["dailyEvaluations"],
      };

      /*
       * 다음 단계에서 저장 API 호출
       *
       * await StudentApi.updateLessonRecord(
       *   updatedRecord.recordId,
       *   updatedRecord,
       * );
       */
      await StudentApi.updateHomework1Achievement(
        selectedRecord.recordId,
        updatedRecord.homeworks[0].achievement ?? 0,
      );

      /*
       * 현재는 브라우저 상태에만 저장한다.
       */
      setLessonRecords((records) =>
        records.map((record) =>
          record.recordId === updatedRecord.recordId ? updatedRecord : record,
        ),
      );

      messageApi.success(
        `${updatedRecord.weekNumber}주차 기록을 저장했습니다.`,
      );
    } catch (error) {
      console.error("수업 기록 저장 실패", error);

      messageApi.error("입력값을 확인해주세요.");
    } finally {
      setSaving(false);
    }
  };

  /*
   * API 조회 중 표시
   */
  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#f5f7fa",
        }}
      >
        <Spin size="large" tip="수업 기록을 불러오는 중입니다." />
      </div>
    );
  }

  /*
   * API 조회는 성공했지만 데이터가 없는 경우
   */
  if (!selectedRecord) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#f5f7fa",
        }}
      >
        <Card>
          <Text type="secondary">표시할 수업 기록이 없습니다.</Text>
        </Card>
      </div>
    );
  }

  return (
    <>
      {contextHolder}

      <Layout
        style={{
          minHeight: "100vh",
        }}
      >
        {/* 상단 헤더 */}
        <Header
          style={{
            height: 68,
            padding: "0 28px",
            background: "#ffffff",
            borderBottom: "1px solid #f0f0f0",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            lineHeight: "normal",
            position: "sticky",
            top: 0,
            zIndex: 100,
          }}
        >
          <Space size={12}>
            <Avatar shape="square" icon={<RobotOutlined />} />

            <div>
              <Title
                level={4}
                style={{
                  margin: 0,
                  lineHeight: 1.2,
                }}
              >
                Student AI
              </Title>

              <Text
                type="secondary"
                style={{
                  fontSize: 12,
                }}
              >
                8주 학습현황 관리
              </Text>
            </div>
          </Space>

          <Button
            type="primary"
            icon={<SaveOutlined />}
            loading={saving}
            onClick={handleSave}
          >
            저장
          </Button>
        </Header>

        {/*
          추후 탭 컴포넌트 위치

          <StudentNavigationTabs />
        */}

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
              {/* 학생 선택 및 학생 기본정보 */}
              <Card
                size="small"
                style={{
                  marginBottom: 12,
                }}
              >
                <Row gutter={[16, 12]} align="middle">
                  <Col xs={24} lg={8}>
                    <Text strong>학생 선택</Text>

                    <Select
                      showSearch
                      optionFilterProp="label"
                      value={selectedStudentId}
                      options={studentOptions}
                      onChange={handleStudentChange}
                      style={{
                        width: "100%",
                        marginTop: 6,
                      }}
                    />
                  </Col>

                  <Col xs={24} lg={8}>
                    <Space>
                      <Avatar size={42}>
                        {selectedRecord.studentName.charAt(0)}
                      </Avatar>

                      <div>
                        <Text
                          strong
                          style={{
                            fontSize: 17,
                          }}
                        >
                          {selectedRecord.studentName}
                        </Text>

                        <div>
                          <Text
                            type="secondary"
                            style={{
                              fontSize: 14,
                            }}
                          >
                            {selectedRecord.schoolName}
                            {" · "}
                            {selectedRecord.grade}
                            {" · 담당 "}
                            {selectedRecord.teacherName}
                          </Text>
                        </div>
                      </div>
                    </Space>
                  </Col>

                  <Col xs={24} lg={8}>
                    <Tag
                      color="blue"
                      style={{
                        padding: "5px 12px",
                        fontSize: 15,
                      }}
                    >
                      {selectedRecord.weekNumber}
                      주차 · {selectedRecord.weekLabel}
                    </Tag>
                  </Col>
                </Row>
              </Card>

              {/* 1~8주 학습현황 */}
              <Card
                title={
                  <Text
                    strong
                    style={{
                      fontSize: 19,
                    }}
                  >
                    1~8주 학습 현황
                  </Text>
                }
                styles={{
                  body: {
                    padding: 12,
                  },
                }}
              >
                <Row gutter={[10, 10]}>
                  {selectedStudentRecords.map((record) => (
                    <Col key={record.recordId} xs={24} sm={12} lg={6}>
                      <WeekSummaryCard
                        record={record}
                        selected={record.recordId === selectedRecord.recordId}
                        onClick={() => setSelectedRecordId(record.recordId)}
                      />
                    </Col>
                  ))}
                </Row>
              </Card>

              {/* 학생 전체 평균 */}
              <StudentOverallStatus summary={overallSummary} />

              {/* 선택 주차 상세 입력 */}
              <Card
                title={
                  <Text
                    strong
                    style={{
                      fontSize: 19,
                    }}
                  >
                    {selectedRecord.weekNumber}
                    주차 상세 입력
                  </Text>
                }
                extra={
                  <Button
                    type="primary"
                    icon={<SaveOutlined />}
                    loading={saving}
                    onClick={handleSave}
                  >
                    저장
                  </Button>
                }
                style={{
                  marginTop: 12,
                }}
                styles={{
                  body: {
                    padding: 12,
                  },
                }}
              >
                {/* 수업 기본정보 */}
                <Row gutter={[10, 0]}>
                  <Col xs={24} md={5}>
                    <Form.Item label="수업일" name="lessonDate">
                      <Input />
                    </Form.Item>
                  </Col>

                  <Col xs={24} md={5}>
                    <Form.Item label="주차 표시" name="weekLabel">
                      <Input />
                    </Form.Item>
                  </Col>

                  <Col xs={24} md={14}>
                    <Form.Item label="진도" name="progress">
                      <Input />
                    </Form.Item>
                  </Col>
                </Row>

                {/* 숙제 1~3 */}
                <FixedAchievementSection
                  form={form}
                  fieldName="homeworks"
                  title="숙제"
                  itemTitle="숙제"
                  inputLabel="숙제 내용"
                />

                {/* 당일평가 1~3 */}
                <div
                  style={{
                    marginTop: 10,
                  }}
                >
                  <FixedAchievementSection
                    form={form}
                    fieldName="dailyEvaluations"
                    title="당일 평가"
                    itemTitle="당일 평가"
                    inputLabel="평가 내용"
                  />
                </div>

                {/* 복습 테스트 */}
                <Card
                  title={
                    <Text
                      strong
                      style={{
                        fontSize: 18,
                      }}
                    >
                      복습 테스트
                    </Text>
                  }
                  size="small"
                  style={{
                    marginTop: 10,
                    background: getAchievementBackground(reviewScore),
                    border: `1px solid ${getAchievementColor(reviewScore)}`,
                  }}
                >
                  <Row gutter={[12, 0]}>
                    <Col xs={24} lg={6}>
                      <Form.Item label="복습 테스트명" name="reviewTest">
                        <Input />
                      </Form.Item>
                    </Col>

                    <Col xs={24} sm={8} lg={4}>
                      <Form.Item
                        label="복습 문항 개수"
                        name="reviewQuestionCount"
                      >
                        <InputNumber
                          min={0}
                          precision={0}
                          addonAfter="문항"
                          style={{
                            width: "100%",
                          }}
                        />
                      </Form.Item>
                    </Col>

                    <Col xs={24} sm={8} lg={4}>
                      <Form.Item
                        label="복습 맞은 개수"
                        name="reviewCorrectCount"
                      >
                        <InputNumber
                          min={0}
                          max={reviewQuestionCount ?? undefined}
                          precision={0}
                          addonAfter="개"
                          style={{
                            width: "100%",
                          }}
                        />
                      </Form.Item>
                    </Col>

                    <Col xs={24} sm={8} lg={4}>
                      <Form.Item
                        label="복습 테스트 점수"
                        name="reviewTestScore"
                      >
                        <InputNumber
                          disabled
                          addonAfter="점"
                          style={{
                            width: "100%",
                          }}
                        />
                      </Form.Item>
                    </Col>

                    <Col xs={24} lg={6}>
                      <Form.Item label="복습 피드백" name="reviewFeedback">
                        <Input />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Row justify="end">
                    <Tag
                      color={getAchievementTagColor(reviewScore)}
                      style={{
                        minWidth: 130,
                        margin: 0,
                        padding: "7px 14px",
                        textAlign: "center",
                        fontSize: 16,
                      }}
                    >
                      {reviewScore === null
                        ? "미입력"
                        : `${reviewScore}점 · ${getAchievementLabel(
                            reviewScore,
                          )}`}
                    </Tag>
                  </Row>
                </Card>

                {/* 암기반 */}
                <Card
                  title={
                    <Text
                      strong
                      style={{
                        fontSize: 18,
                      }}
                    >
                      암기반
                    </Text>
                  }
                  size="small"
                  style={{
                    marginTop: 10,
                  }}
                >
                  <Row gutter={[12, 0]}>
                    <Col xs={24} lg={8}>
                      <Form.Item label="암기반 1" name="memorizationClass1">
                        <Input />
                      </Form.Item>
                    </Col>

                    <Col xs={24} lg={8}>
                      <Form.Item label="암기반 2" name="memorizationClass2">
                        <Input />
                      </Form.Item>
                    </Col>

                    <Col xs={24} lg={8}>
                      <Form.Item
                        label="암기반 성취도"
                        name="memorizationAchievement"
                      >
                        <Select
                          allowClear
                          placeholder="결과 선택"
                          options={MEMORIZATION_OPTIONS}
                        />
                      </Form.Item>

                      <Tag
                        color={getMemorizationTagColor(memorizationAchievement)}
                        style={{
                          width: "100%",
                          margin: 0,
                          padding: "6px 10px",
                          textAlign: "center",
                          fontSize: 15,
                        }}
                      >
                        {memorizationAchievement ?? "미입력"}
                      </Tag>
                    </Col>
                  </Row>
                </Card>

                {/* 쌤 한마디 */}
                <Alert
                  type="info"
                  showIcon
                  message={
                    <Text
                      strong
                      style={{
                        fontSize: 17,
                      }}
                    >
                      쌤 한마디
                    </Text>
                  }
                  description={
                    <Form.Item
                      name="teacherComment"
                      style={{
                        marginTop: 10,
                        marginBottom: 0,
                      }}
                      rules={[
                        {
                          max: TEACHER_COMMENT_MAX_LENGTH,
                          message: `쌤 한마디는 최대 ${TEACHER_COMMENT_MAX_LENGTH}자까지 입력할 수 있습니다.`,
                        },
                      ]}
                    >
                      <TextArea
                        rows={2}
                        maxLength={TEACHER_COMMENT_MAX_LENGTH}
                        placeholder={`학생에게 전달할 내용을 ${TEACHER_COMMENT_MAX_LENGTH}자 이내로 입력해주세요.`}
                        showCount
                      />
                    </Form.Item>
                  }
                  style={{
                    marginTop: 10,
                  }}
                />
              </Card>
            </Form>
          </div>
        </Content>
      </Layout>
    </>
  );
}
