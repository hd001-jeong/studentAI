import { Card, Select, Space, Typography } from "antd";
import { useState } from "react";

import StudentApi from "../../api/StudentApi";
import type { LessonRecord } from "../../types/lessonRecord";
import type { Student } from "../../types/student";

const { Title, Text, Paragraph } = Typography;

function StudentPage() {
  const students = StudentApi.getStudents();

  const [selectedStudentId, setSelectedStudentId] = useState<string>();
  const [selectedStudent, setSelectedStudent] = useState<Student>();
  const [lessonRecord, setLessonRecord] = useState<LessonRecord>();

  const handleStudentChange = (studentId: string) => {
    const student = StudentApi.getStudent(studentId);
    const records = StudentApi.getLessonRecord(studentId);

    setSelectedStudentId(studentId);
    setSelectedStudent(student);
    setLessonRecord(records[0]);
  };

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: 24 }}>
      <Title level={2}>학생 관리 AI</Title>

      <Space direction="vertical" size="large" style={{ width: "100%" }}>
        <Select
          showSearch
          value={selectedStudentId}
          placeholder="학생을 선택하세요"
          style={{ width: "100%" }}
          optionFilterProp="label"
          onChange={handleStudentChange}
          options={students.map(
            (student: {
              studentId: any;
              studentName: any;
              schoolName: any;
              grade: any;
            }) => ({
              value: student.studentId,
              label: `${student.studentName} (${student.schoolName}/${student.grade})`,
            }),
          )}
        />

        {selectedStudent && (
          <Card title="학생 기본정보">
            <Paragraph>학생 ID: {selectedStudent.studentId}</Paragraph>
            <Paragraph>이름: {selectedStudent.studentName}</Paragraph>
            <Paragraph>학교: {selectedStudent.schoolName}</Paragraph>
            <Paragraph>학년: {selectedStudent.grade}</Paragraph>
            <Paragraph>담당 선생님: {selectedStudent.teacherName}</Paragraph>
          </Card>
        )}

        {lessonRecord && (
          <>
            <Card title="수업 정보">
              <Paragraph>구분: {lessonRecord.category}</Paragraph>
              <Paragraph>주차: {lessonRecord.week}</Paragraph>
              <Paragraph>진도: {lessonRecord.progress}</Paragraph>
              <Paragraph>수업일: {lessonRecord.lessonDate}</Paragraph>
            </Card>

            <Card title="숙제">
              <Paragraph>
                {lessonRecord.homework1} / {lessonRecord.homework1Achievement}점
              </Paragraph>
              <Paragraph>
                {lessonRecord.homework2} / {lessonRecord.homework2Achievement}점
              </Paragraph>
              <Paragraph>
                {lessonRecord.homework3} / {lessonRecord.homework3Achievement}점
              </Paragraph>

              <Text strong>
                전체 성취도: {lessonRecord.homeworkAchievement}점 /{" "}
                {lessonRecord.homeworkGrade}
              </Text>
            </Card>

            <Card title="당일 평가">
              <Paragraph>
                {lessonRecord.daily1} / {lessonRecord.daily1Achievement}점
              </Paragraph>
              <Paragraph>
                {lessonRecord.daily2} / {lessonRecord.daily2Achievement}점
              </Paragraph>

              {lessonRecord.daily3 && (
                <Paragraph>
                  {lessonRecord.daily3} / {lessonRecord.daily3Achievement}점
                </Paragraph>
              )}

              <Text strong>
                전체 성취도: {lessonRecord.dailyAchievement}점 /{" "}
                {lessonRecord.dailyGrade}
              </Text>
            </Card>

            <Card title="복습 테스트">
              <Paragraph>테스트: {lessonRecord.reviewTest}</Paragraph>
              <Paragraph>
                결과: {lessonRecord.reviewQuestionCount}문항 중{" "}
                {lessonRecord.reviewCorrectCount}개 정답
              </Paragraph>
              <Paragraph>점수: {lessonRecord.reviewTestScore}점</Paragraph>

              {lessonRecord.reviewFeedback && (
                <Paragraph>피드백: {lessonRecord.reviewFeedback}</Paragraph>
              )}
            </Card>

            <Card title="암기반">
              <Paragraph>암기반1: {lessonRecord.memorizationClass1}</Paragraph>
              <Paragraph>암기반2: {lessonRecord.memorizationClass2}</Paragraph>
              <Paragraph>
                결과: {lessonRecord.memorizationAchievement}
              </Paragraph>
            </Card>

            {(lessonRecord.teacherComment || lessonRecord.notice) && (
              <Card title="선생님 전달사항">
                {lessonRecord.teacherComment && (
                  <Paragraph>
                    쌤 한마디: {lessonRecord.teacherComment}
                  </Paragraph>
                )}

                {lessonRecord.notice && (
                  <Paragraph>Notice: {lessonRecord.notice}</Paragraph>
                )}
              </Card>
            )}
          </>
        )}
      </Space>
    </div>
  );
}

export default StudentPage;
