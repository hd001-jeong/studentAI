import {
  Button,
  Card,
  Checkbox,
  Col,
  DatePicker,
  Divider,
  Input,
  InputNumber,
  Row,
  Select,
  Space,
  Tag,
  Typography,
  message,
} from "antd";
import dayjs from "dayjs";
import { useMemo, useState } from "react";

import StudentApi from "@/api/StudentApi";
import { useStudentsQuery } from "@/hooks/useStudentsQuery";

const { Text, Title } = Typography;

const TEACHER_NAME = "박현민";

export default function MultiDataPage() {
  const [messageApi, contextHolder] = message.useMessage();

  const [selectedSchool, setSelectedSchool] = useState("");
  const [selectedGrade, setSelectedGrade] = useState("");
  const [selectedWeek, setSelectedWeek] = useState("");
  const [lessonDate, setLessonDate] = useState<string | null>(null);

  const [progress, setProgress] = useState("");

  const [daily1, setDaily1] = useState("");
  const [daily2, setDaily2] = useState("");
  const [daily3, setDaily3] = useState("");

  const [homework1, setHomework1] = useState("");
  const [homework2, setHomework2] = useState("");
  const [homework3, setHomework3] = useState("");

  const [reviewTest, setReviewTest] = useState("");
  const [reviewQuestionCount, setReviewQuestionCount] = useState<number | null>(
    null,
  );

  const [memorization1, setMemorization1] = useState("");
  const [memorization2, setMemorization2] = useState("");

  const [notice, setNotice] = useState("");

  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [isCreating, setIsCreating] = useState(false);

  const { data: students = [], isLoading: isStudentsLoading } =
    useStudentsQuery(TEACHER_NAME);

  const schoolOptions = useMemo(() => {
    const schools = Array.from(
      new Set(students.map((student) => student.schoolName).filter(Boolean)),
    );

    return schools.map((school) => ({
      value: school,
      label: school,
    }));
  }, [students]);

  const gradeOptions = useMemo(() => {
    if (!selectedSchool) {
      return [];
    }

    const grades = Array.from(
      new Set(
        students
          .filter((student) => student.schoolName === selectedSchool)
          .map((student) => student.grade)
          .filter(Boolean),
      ),
    );

    return grades.map((grade) => ({
      value: grade,
      label: grade,
    }));
  }, [students, selectedSchool]);

  const filteredStudents = useMemo(() => {
    if (!selectedSchool || !selectedGrade) {
      return [];
    }

    return students.filter(
      (student) =>
        student.schoolName === selectedSchool &&
        student.grade === selectedGrade,
    );
  }, [students, selectedSchool, selectedGrade]);

  const allChecked =
    filteredStudents.length > 0 &&
    filteredStudents.every((student) =>
      selectedStudentIds.includes(student.studentId),
    );

  const indeterminate =
    !allChecked &&
    filteredStudents.some((student) =>
      selectedStudentIds.includes(student.studentId),
    );

  const handleSchoolChange = (school: string) => {
    setSelectedSchool(school);
    setSelectedGrade("");
    setSelectedStudentIds([]);
  };

  const handleGradeChange = (grade: string) => {
    setSelectedGrade(grade);

    const studentIds = students
      .filter(
        (student) =>
          student.schoolName === selectedSchool && student.grade === grade,
      )
      .map((student) => student.studentId);

    setSelectedStudentIds(studentIds);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedStudentIds(
        filteredStudents.map((student) => student.studentId),
      );
      return;
    }

    setSelectedStudentIds([]);
  };

  const handleStudentChange = (studentId: string, checked: boolean) => {
    if (checked) {
      setSelectedStudentIds((prev) => {
        if (prev.includes(studentId)) {
          return prev;
        }

        return [...prev, studentId];
      });

      return;
    }

    setSelectedStudentIds((prev) => prev.filter((id) => id !== studentId));
  };

  const handleCreate = async () => {
    if (!selectedSchool) {
      messageApi.warning("학교를 선택해주세요.");
      return;
    }

    if (!selectedGrade) {
      messageApi.warning("학년을 선택해주세요.");
      return;
    }

    if (!selectedWeek) {
      messageApi.warning("주차를 선택해주세요.");
      return;
    }

    if (!lessonDate) {
      messageApi.warning("날짜를 선택해주세요.");
      return;
    }

    if (selectedStudentIds.length === 0) {
      messageApi.warning("생성할 학생을 선택해주세요.");
      return;
    }

    const selectedStudents = filteredStudents
      .filter((student) => selectedStudentIds.includes(student.studentId))
      .map((student) => ({
        studentId: student.studentId,
        studentName: student.studentName,
        schoolName: student.schoolName,
        grade: student.grade,
      }));

    if (selectedStudents.length === 0) {
      messageApi.warning("생성할 학생 정보를 찾을 수 없습니다.");
      return;
    }

    const request = {
      schoolName: selectedSchool,
      grade: selectedGrade,
      weekLabel: selectedWeek,
      lessonDate,
      teacherName: TEACHER_NAME,

      progress,

      daily1,
      daily2,
      daily3,

      homework1,
      homework2,
      homework3,

      reviewTest,
      reviewQuestionCount,

      memorization1,
      memorization2,

      notice,

      students: selectedStudents,
    };

    try {
      setIsCreating(true);

      const response = await StudentApi.createWeeklyData(request);

      messageApi.success(
        `${response.createdCount}명 주차 데이터가 생성되었습니다.`,
      );
    } catch (error) {
      console.error("주차 데이터 생성 실패", error);

      messageApi.error(
        "주차 데이터 생성에 실패했습니다. 입력값과 서버 상태를 확인해주세요.",
      );
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <>
      {contextHolder}

      <div
        style={{
          width: "100%",
          maxWidth: 1280,
          margin: "0 auto",
        }}
      >
        <div
          style={{
            marginBottom: 20,
          }}
        >
          <Title
            level={3}
            style={{
              margin: 0,
            }}
          >
            주차 데이터 생성
          </Title>

          <Text type="secondary">
            새 주차의 수업 정보와 학생 데이터를 한 번에 생성합니다.
          </Text>
        </div>

        {/* 1. 기본 정보 */}
        <Card
          style={{
            marginBottom: 18,
          }}
          title={
            <Space>
              <Tag color="blue">1</Tag>
              <Text strong>기본 정보</Text>
            </Space>
          }
        >
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} lg={6}>
              <Text strong>학교</Text>

              <Select
                value={selectedSchool || undefined}
                placeholder="학교 선택"
                loading={isStudentsLoading}
                options={schoolOptions}
                style={{
                  width: "100%",
                  marginTop: 6,
                }}
                onChange={handleSchoolChange}
              />
            </Col>

            <Col xs={24} sm={12} lg={6}>
              <Text strong>학년</Text>

              <Select
                value={selectedGrade || undefined}
                placeholder="학년 선택"
                disabled={!selectedSchool}
                options={gradeOptions}
                style={{
                  width: "100%",
                  marginTop: 6,
                }}
                onChange={handleGradeChange}
              />
            </Col>

            <Col xs={24} sm={12} lg={6}>
              <Text strong>주차</Text>

              <Select
                value={selectedWeek || undefined}
                placeholder="주차 선택"
                style={{
                  width: "100%",
                  marginTop: 6,
                }}
                options={[
                  {
                    value: "9월 1주",
                    label: "9월 1주",
                  },
                  {
                    value: "9월 2주",
                    label: "9월 2주",
                  },
                  {
                    value: "9월 3주",
                    label: "9월 3주",
                  },
                  {
                    value: "9월 4주",
                    label: "9월 4주",
                  },
                  {
                    value: "9월 5주",
                    label: "9월 5주",
                  },
                ]}
                onChange={setSelectedWeek}
              />
            </Col>

            <Col xs={24} sm={12} lg={6}>
              <Text strong>날짜</Text>

              <DatePicker
                value={lessonDate ? dayjs(lessonDate) : null}
                format="YYYY-MM-DD"
                style={{
                  width: "100%",
                  marginTop: 6,
                }}
                onChange={(date) => {
                  setLessonDate(date ? date.format("YYYY-MM-DD") : null);
                }}
              />
            </Col>
          </Row>

          <div
            style={{
              marginTop: 16,
              padding: "12px 16px",
              borderRadius: 8,
              background: "#fafafa",
            }}
          >
            <Text type="secondary">담당 선생님</Text>

            <div>
              <Text strong>{TEACHER_NAME}</Text>
            </div>
          </div>
        </Card>

        {/* 2. 수업 내용 */}
        <Card
          style={{
            marginBottom: 18,
          }}
          title={
            <Space>
              <Tag color="blue">2</Tag>
              <Text strong>수업 내용</Text>
            </Space>
          }
        >
          <div>
            <Text strong>진도</Text>

            <Input
              value={progress}
              placeholder="수업 진도를 입력하세요."
              style={{
                marginTop: 6,
              }}
              onChange={(event) => setProgress(event.target.value)}
            />
          </div>

          <Divider>당일 평가</Divider>

          <Row gutter={[12, 12]}>
            <Col xs={24} md={8}>
              <Input
                value={daily1}
                placeholder="당일1"
                onChange={(event) => setDaily1(event.target.value)}
              />
            </Col>

            <Col xs={24} md={8}>
              <Input
                value={daily2}
                placeholder="당일2"
                onChange={(event) => setDaily2(event.target.value)}
              />
            </Col>

            <Col xs={24} md={8}>
              <Input
                value={daily3}
                placeholder="당일3"
                onChange={(event) => setDaily3(event.target.value)}
              />
            </Col>
          </Row>

          <Divider>숙제</Divider>

          <Row gutter={[12, 12]}>
            <Col xs={24} md={8}>
              <Input
                value={homework1}
                placeholder="숙제1"
                onChange={(event) => setHomework1(event.target.value)}
              />
            </Col>

            <Col xs={24} md={8}>
              <Input
                value={homework2}
                placeholder="숙제2"
                onChange={(event) => setHomework2(event.target.value)}
              />
            </Col>

            <Col xs={24} md={8}>
              <Input
                value={homework3}
                placeholder="숙제3"
                onChange={(event) => setHomework3(event.target.value)}
              />
            </Col>
          </Row>

          <Divider>복습 테스트</Divider>

          <Row gutter={[12, 12]}>
            <Col xs={24} md={18}>
              <Input
                value={reviewTest}
                placeholder="복습 테스트"
                onChange={(event) => setReviewTest(event.target.value)}
              />
            </Col>

            <Col xs={24} md={6}>
              <InputNumber
                value={reviewQuestionCount}
                placeholder="문항 수"
                min={0}
                style={{
                  width: "100%",
                }}
                onChange={(value) => setReviewQuestionCount(value)}
              />
            </Col>
          </Row>

          <Divider>암기반</Divider>

          <Row gutter={[12, 12]}>
            <Col xs={24} md={12}>
              <Input
                value={memorization1}
                placeholder="암기반1"
                onChange={(event) => setMemorization1(event.target.value)}
              />
            </Col>

            <Col xs={24} md={12}>
              <Input
                value={memorization2}
                placeholder="암기반2"
                onChange={(event) => setMemorization2(event.target.value)}
              />
            </Col>
          </Row>

          <Divider>Notice</Divider>

          <Input.TextArea
            value={notice}
            placeholder="공지사항 또는 수업 안내를 입력하세요."
            autoSize={{
              minRows: 2,
              maxRows: 5,
            }}
            onChange={(event) => setNotice(event.target.value)}
          />
        </Card>

        {/* 3. 학생 선택 */}
        <Card
          style={{
            marginBottom: 18,
          }}
          title={
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Space>
                <Tag color="blue">3</Tag>
                <Text strong>학생 선택</Text>
              </Space>

              <Tag color="processing">{selectedStudentIds.length}명 선택</Tag>
            </div>
          }
        >
          <div
            style={{
              marginBottom: 16,
            }}
          >
            <Checkbox
              checked={allChecked}
              indeterminate={indeterminate}
              disabled={filteredStudents.length === 0}
              onChange={(event) => handleSelectAll(event.target.checked)}
            >
              전체 선택
            </Checkbox>
          </div>

          {filteredStudents.length === 0 ? (
            <div
              style={{
                padding: 36,
                textAlign: "center",
                background: "#fafafa",
                borderRadius: 8,
              }}
            >
              <Text type="secondary">학교와 학년을 선택해주세요.</Text>
            </div>
          ) : (
            <Row gutter={[12, 12]}>
              {filteredStudents.map((student) => {
                const checked = selectedStudentIds.includes(student.studentId);

                return (
                  <Col key={student.studentId} xs={24} sm={12} md={8} xl={6}>
                    <div
                      role="button"
                      tabIndex={0}
                      style={{
                        minHeight: 74,
                        padding: "14px 16px",
                        borderRadius: 10,
                        cursor: "pointer",
                        transition: "all 0.2s",

                        border: checked
                          ? "1px solid #1677ff"
                          : "1px solid #e8e8e8",

                        background: checked ? "#e6f4ff" : "#ffffff",
                      }}
                      onClick={() =>
                        handleStudentChange(student.studentId, !checked)
                      }
                      onKeyDown={() => {}}
                    >
                      <Space align="start">
                        <Checkbox
                          checked={checked}
                          onClick={(event) => event.stopPropagation()}
                          onChange={(event) =>
                            handleStudentChange(
                              student.studentId,
                              event.target.checked,
                            )
                          }
                        />

                        <div>
                          <Text strong>{student.studentName}</Text>

                          <div
                            style={{
                              marginTop: 2,
                            }}
                          >
                            <Text
                              type="secondary"
                              style={{
                                fontSize: 12,
                              }}
                            >
                              {student.schoolName} {student.grade}
                            </Text>
                          </div>
                        </div>
                      </Space>
                    </div>
                  </Col>
                );
              })}
            </Row>
          )}
        </Card>

        {/* 생성 영역 */}
        <Card>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 16,
              flexWrap: "wrap",
            }}
          >
            <div>
              <Text
                type="secondary"
                style={{
                  display: "block",
                }}
              >
                생성 예정
              </Text>

              <Title
                level={4}
                style={{
                  margin: 0,
                }}
              >
                {selectedStudentIds.length}건
              </Title>
            </div>

            <Button
              type="primary"
              size="large"
              loading={isCreating}
              disabled={selectedStudentIds.length === 0}
              onClick={handleCreate}
              style={{
                minWidth: 220,
              }}
            >
              {selectedStudentIds.length}명 주차 데이터 생성
            </Button>
          </div>
        </Card>
      </div>
    </>
  );
}
