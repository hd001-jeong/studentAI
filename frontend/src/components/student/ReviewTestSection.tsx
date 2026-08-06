import {
  Card,
  Col,
  Flex,
  Form,
  Input,
  InputNumber,
  Row,
  Tag,
  Typography,
} from "antd";

import {
  getAchievementBackground,
  getAchievementColor,
  getAchievementLabel,
  getAchievementTagColor,
} from "@/utils/achievement";

const { Text } = Typography;

interface ReviewTestSectionProps {
  reviewScore: number | null;
  reviewQuestionCount: number | null;
}

interface NumberInputWithUnitProps {
  unit: string;
  disabled?: boolean;
  min?: number;
  max?: number;
}

function NumberInputWithUnit({
  unit,
  disabled = false,
  min,
  max,
}: NumberInputWithUnitProps) {
  return (
    <Flex align="center">
      <InputNumber
        min={min}
        max={max}
        precision={0}
        disabled={disabled}
        style={{
          width: "100%",
          borderTopRightRadius: 0,
          borderBottomRightRadius: 0,
        }}
      />

      <div
        style={{
          height: 32,
          minWidth: 48,
          padding: "0 10px",
          border: "1px solid #d9d9d9",
          borderLeft: 0,
          borderTopRightRadius: 6,
          borderBottomRightRadius: 6,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: disabled ? "rgba(0, 0, 0, 0.04)" : "#fafafa",
          color: "rgba(0, 0, 0, 0.65)",
        }}
      >
        {unit}
      </div>
    </Flex>
  );
}

export default function ReviewTestSection({
  reviewScore,
  reviewQuestionCount,
}: ReviewTestSectionProps) {
  return (
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
          <Form.Item label="복습 문항 개수" name="reviewQuestionCount">
            <NumberInputWithUnit min={0} unit="문항" />
          </Form.Item>
        </Col>

        <Col xs={24} sm={8} lg={4}>
          <Form.Item label="복습 맞은 개수" name="reviewCorrectCount">
            <NumberInputWithUnit
              min={0}
              max={reviewQuestionCount ?? undefined}
              unit="개"
            />
          </Form.Item>
        </Col>

        <Col xs={24} sm={8} lg={4}>
          <Form.Item label="복습 테스트 점수" name="reviewTestScore">
            <NumberInputWithUnit disabled unit="점" />
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
            : `${reviewScore}점 · ${getAchievementLabel(reviewScore)}`}
        </Tag>
      </Row>
    </Card>
  );
}
