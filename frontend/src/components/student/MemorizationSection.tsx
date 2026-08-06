import { Card, Col, Form, Input, Row, Select, Tag, Typography } from "antd";

import { MEMORIZATION_OPTIONS } from "@/constants/studentConstants";

import type { MemorizationAchievement } from "@/types/lessonRecord";

import { getMemorizationTagColor } from "@/utils/achievement";

const { Text } = Typography;

interface MemorizationSectionProps {
  achievement: MemorizationAchievement;
}

export default function MemorizationSection({
  achievement,
}: MemorizationSectionProps) {
  return (
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
          <Form.Item label="암기반 성취도" name="memorizationAchievement">
            <Select
              allowClear
              placeholder="결과 선택"
              options={MEMORIZATION_OPTIONS}
            />
          </Form.Item>

          <Tag
            color={getMemorizationTagColor(achievement)}
            style={{
              width: "100%",
              margin: 0,
              padding: "6px 10px",
              textAlign: "center",
              fontSize: 15,
            }}
          >
            {achievement ?? "미입력"}
          </Tag>
        </Col>
      </Row>
    </Card>
  );
}
