import {
  Card,
  Descriptions,
  Select,
  Space,
  Spin,
  Table,
  Typography,
} from "antd";
import type { TableColumnsType } from "antd";
import { useEffect, useState } from "react";

import StudentApi from "../../api/StudentApi";
import type { LessonRecord } from "../../types/lessonRecord";
import type { Student } from "../../types/student";

const { Title, Paragraph } = Typography;

function StudentPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<string>();
  const [selectedStudent, setSelectedStudent] = useState<Student>();
  const [lessonRecords, setLessonRecords] = useState<LessonRecord[]>([]);
  const [loading, setLoading] = useState(false);

  const lessonColumns: TableColumnsType<LessonRecord> = [
    {
      title: "번호",
      dataIndex: "number",
      key: "number",
      width: 70,
    },
    {
      title: "구분",
      dataIndex: "category",
      key: "category",
      width: 110,
    },
    {
      title: "주차",
      dataIndex: "week",
      key: "week",
      width: 100,
    },
    {
      title: "수업일",
      dataIndex: "lessonDate",
      key: "lessonDate",
      width: 120,
    },
    {
      title: "진도",
      dataIndex: "progress",
      key: "progress",
      width: 130,
    },
    {
      title: "숙제 1",
      children: [
        {
          title: "내용",
          dataIndex: "homework1",
          key: "homework1",
          width: 220,
          render: (value: string) => value || "-",
        },
        {
          title: "성취도",
          dataIndex: "homework1Achievement",
          key: "homework1Achievement",
          width: 90,
          render: (value: number) => `${value}점`,
        },
      ],
    },
    {
      title: "숙제 2",
      children: [
        {
          title: "내용",
          dataIndex: "homework2",
          key: "homework2",
          width: 180,
          render: (value: string) => value || "-",
        },
        {
          title: "성취도",
          dataIndex: "homework2Achievement",
          key: "homework2Achievement",
          width: 90,
          render: (value: number) => `${value}점`,
        },
      ],
    },
    {
      title: "숙제 3",
      children: [
        {
          title: "내용",
          dataIndex: "homework3",
          key: "homework3",
          width: 180,
          render: (value: string) => value || "-",
        },
        {
          title: "성취도",
          dataIndex: "homework3Achievement",
          key: "homework3Achievement",
          width: 90,
          render: (value: number) => `${value}점`,
        },
      ],
    },
    {
      title: "숙제 종합",
      children: [
        {
          title: "성취도",
          dataIndex: "homeworkAchievement",
          key: "homeworkAchievement",
          width: 90,
          render: (value: number) => `${value}점`,
        },
        {
          title: "등급",
          dataIndex: "homeworkGrade",
          key: "homeworkGrade",
          width: 90,
          render: (value: string) => value || "-",
        },
      ],
    },
  ];

  const evaluationColumns: TableColumnsType<LessonRecord> = [
    {
      title: "수업일",
      dataIndex: "lessonDate",
      key: "lessonDate",
      width: 120,
      fixed: "left",
    },
    {
      title: "당일 1",
      children: [
        {
          title: "내용",
          dataIndex: "daily1",
          key: "daily1",
          width: 170,
          render: (value: string) => value || "-",
        },
        {
          title: "성취도",
          dataIndex: "daily1Achievement",
          key: "daily1Achievement",
          width: 90,
          render: (value: number) => `${value}점`,
        },
      ],
    },
    {
      title: "당일 2",
      children: [
        {
          title: "내용",
          dataIndex: "daily2",
          key: "daily2",
          width: 150,
          render: (value: string) => value || "-",
        },
        {
          title: "성취도",
          dataIndex: "daily2Achievement",
          key: "daily2Achievement",
          width: 90,
          render: (value: number) => `${value}점`,
        },
      ],
    },
    {
      title: "당일 3",
      children: [
        {
          title: "내용",
          dataIndex: "daily3",
          key: "daily3",
          width: 150,
          render: (value: string) => value || "-",
        },
        {
          title: "성취도",
          dataIndex: "daily3Achievement",
          key: "daily3Achievement",
          width: 90,
          render: (value: number) => `${value}점`,
        },
      ],
    },
    {
      title: "당일 종합",
      children: [
        {
          title: "성취도",
          dataIndex: "dailyAchievement",
          key: "dailyAchievement",
          width: 90,
          render: (value: number) => `${value}점`,
        },
        {
          title: "등급",
          dataIndex: "dailyGrade",
          key: "dailyGrade",
          width: 90,
          render: (value: string) => value || "-",
        },
      ],
    },
    {
      title: "복습 테스트",
      children: [
        {
          title: "테스트",
          dataIndex: "reviewTest",
          key: "reviewTest",
          width: 140,
          render: (value: string) => value || "-",
        },
        {
          title: "문항 수",
          dataIndex: "reviewQuestionCount",
          key: "reviewQuestionCount",
          width: 90,
        },
        {
          title: "정답 수",
          dataIndex: "reviewCorrectCount",
          key: "reviewCorrectCount",
          width: 90,
        },
        {
          title: "점수",
          dataIndex: "reviewTestScore",
          key: "reviewTestScore",
          width: 80,
          render: (value: number) => `${value}점`,
        },
        {
          title: "피드백",
          dataIndex: "reviewFeedback",
          key: "reviewFeedback",
          width: 170,
          render: (value: string) => value || "-",
        },
      ],
    },
    {
      title: "암기반",
      children: [
        {
          title: "암기반 1",
          dataIndex: "memorizationClass1",
          key: "memorizationClass1",
          width: 180,
          render: (value: string) => value || "-",
        },
        {
          title: "암기반 2",
          dataIndex: "memorizationClass2",
          key: "memorizationClass2",
          width: 180,
          render: (value: string) => value || "-",
        },
        {
          title: "결과",
          dataIndex: "memorizationAchievement",
          key: "memorizationAchievement",
          width: 110,
          render: (value: string) => value || "-",
        },
      ],
    },
    {
      title: "쌤 한마디",
      dataIndex: "teacherComment",
      key: "teacherComment",
      width: 350,
      render: (value: string) => value || "-",
    },
    {
      title: "Notice",
      dataIndex: "notice",
      key: "notice",
      width: 350,
      render: (value: string) => value || "-",
    },
  ];

  useEffect(() => {
    const loadStudents = async () => {
      setLoading(true);

      try {
        const result = await StudentApi.getStudents();
        setStudents(result);
      } catch (error) {
        console.error("학생 목록 조회 실패:", error);
        setStudents([]);
      } finally {
        setLoading(false);
      }
    };

    loadStudents();
  }, []);

  const handleStudentChange = async (studentId: string) => {
    setSelectedStudentId(studentId);
    setLoading(true);

    try {
      const student = students.find((item) => item.studentId === studentId);

      const records = await StudentApi.getStudentRecords(studentId);

      setSelectedStudent(student);

      const sortedRecords = [...records].sort(
        (a, b) =>
          new Date(b.lessonDate).getTime() - new Date(a.lessonDate).getTime(),
      );

      setLessonRecords(sortedRecords);
    } catch (error) {
      console.error("수업 기록 조회 실패:", error);
      setSelectedStudent(undefined);
      setLessonRecords([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <Title level={2}>Student AI</Title>

      <Spin spinning={loading}>
        <Space direction="vertical" size="large" style={{ width: "100%" }}>
          <Select
            showSearch
            placeholder="학생 선택"
            value={selectedStudentId}
            optionFilterProp="label"
            onChange={handleStudentChange}
            style={{ width: 400, maxWidth: "100%" }}
            options={students.map((student) => ({
              value: student.studentId,
              label: `${student.studentName} (${student.schoolName}/${student.grade})`,
            }))}
          />

          {selectedStudent && (
            <Card title="학생 정보">
              <Descriptions column={3} bordered size="small">
                <Descriptions.Item label="학생 ID">
                  {selectedStudent.studentId}
                </Descriptions.Item>

                <Descriptions.Item label="이름">
                  {selectedStudent.studentName}
                </Descriptions.Item>

                <Descriptions.Item label="학교">
                  {selectedStudent.schoolName}
                </Descriptions.Item>

                <Descriptions.Item label="학년">
                  {selectedStudent.grade}
                </Descriptions.Item>

                <Descriptions.Item label="담당">
                  {selectedStudent.teacherName}
                </Descriptions.Item>
              </Descriptions>
            </Card>
          )}

          {selectedStudent && (
            <>
              <Title level={4}>수업 및 숙제 기록</Title>

              <Table<LessonRecord>
                rowKey={(record) =>
                  `lesson-${record.studentId}-${record.number}-${record.lessonDate}`
                }
                columns={lessonColumns}
                dataSource={lessonRecords}
                loading={loading}
                pagination={false}
                scroll={{ x: 1700 }}
                bordered
                size="small"
                locale={{
                  emptyText: "수업 기록이 없습니다.",
                }}
              />

              <Title level={4} style={{ marginTop: 32 }}>
                평가 및 전달사항
              </Title>

              <Table<LessonRecord>
                rowKey={(record) =>
                  `evaluation-${record.studentId}-${record.number}-${record.lessonDate}`
                }
                columns={evaluationColumns}
                dataSource={lessonRecords}
                loading={loading}
                pagination={false}
                scroll={{ x: 2300 }}
                bordered
                size="small"
                locale={{
                  emptyText: "평가 기록이 없습니다.",
                }}
              />
            </>
          )}
        </Space>
      </Spin>
    </div>
  );
}

export default StudentPage;
