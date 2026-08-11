import { Avatar, Card, Col, Row, Select, Space, Tag, Typography } from "antd";

import type { LessonRecord } from "@/types/lessonRecord";

const { Text } = Typography;

interface SelectOption {
  value: string;
  label: string;
}

interface StudentHeaderCardProps {
  selectedGrade: string;
  gradeOptions: SelectOption[];

  selectedStudentId: string;
  studentOptions: SelectOption[];

  selectedRecord: LessonRecord;

  onGradeChange: (grade: string) => void;
  onStudentChange: (studentId: string) => void;
}

function StudentHeaderCard({
  selectedGrade,
  gradeOptions,
  selectedStudentId,
  studentOptions,
  selectedRecord,
  onGradeChange,
  onStudentChange,
}: StudentHeaderCardProps) {
  return (
    <Card
      size="small"
      style={{
        marginBottom: 12,
      }}
    >
      <Row gutter={[16, 12]} align="middle">
        {/* 학년 선택 */}
        <Col xs={24} sm={8} lg={4}>
          <Text strong>학년 선택</Text>

          <Select
            value={selectedGrade || undefined}
            options={gradeOptions}
            onChange={onGradeChange}
            placeholder="학년 선택"
            style={{
              width: "100%",
              marginTop: 6,
            }}
          />
        </Col>

        {/* 학생 선택 */}
        <Col xs={24} sm={16} lg={6}>
          <Text strong>학생 선택</Text>

          <Select
            showSearch
            optionFilterProp="label"
            value={selectedStudentId || undefined}
            options={studentOptions}
            onChange={onStudentChange}
            placeholder="학생을 선택해주세요."
            style={{
              width: "100%",
              marginTop: 6,
            }}
          />
        </Col>

        {/* 학생 기본 정보 */}
        <Col xs={24} lg={7}>
          <Space>
            <Avatar size={42}>{selectedRecord.studentName?.charAt(0)}</Avatar>

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

        {/* 현재 선택 수업 정보 */}
        <Col xs={24} lg={7}>
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: 6,
            }}
          >
            <Tag
              style={{
                padding: "5px 12px",
                fontSize: 14,
                margin: 0,
              }}
            >
              {selectedRecord.category}
            </Tag>

            <Tag
              color="blue"
              style={{
                padding: "5px 12px",
                fontSize: 15,
                margin: 0,
              }}
            >
              {selectedRecord.weekLabel}
            </Tag>
          </div>
        </Col>
      </Row>
    </Card>
  );
}

export default StudentHeaderCard;
