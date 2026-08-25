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
  reviewQuestionCount: number | null;
}

interface NumberInputWithUnitProps {
  value?: number | null;
  onChange?: (value: number | null) => void;
  readOnly?: boolean;
  unit: string;
  disabled?: boolean;
  min?: number;
  max?: number;
}

function NumberInputWithUnit({
  value,
  onChange,
  readOnly = false,
  unit,
  disabled = false,
  min,
  max,
}: NumberInputWithUnitProps) {
  return (
    <Flex align="center">
      <InputNumber
        value={value}
        onChange={onChange}
        readOnly={readOnly}
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

function calculateReviewScore(
  correctCount: number | null | undefined,
  questionCount: number | null | undefined,
): number | null {
  if (
    correctCount === null ||
    correctCount === undefined ||
    questionCount === null ||
    questionCount === undefined ||
    questionCount === 0
  ) {
    return null;
  }

  return Math.round((correctCount / questionCount) * 100);
}

export default function ReviewTestSection({
  reviewQuestionCount,
}: ReviewTestSectionProps) {
  const form = Form.useFormInstance();

  const reviewCorrectCount = Form.useWatch("reviewCorrectCount", form);

  const reviewScore = calculateReviewScore(
    reviewCorrectCount,
    reviewQuestionCount,
  );

  return (
    <Card
      title={
        <Text strong style={{ fontSize: 18 }}>
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
            <Input
              readOnly
              style={{
                backgroundColor: "#f5f5f5",
                color: "#595959",
                cursor: "default",
              }}
            />
          </Form.Item>
        </Col>

        <Col xs={24} sm={8} lg={4}>
          <Form.Item label="복습 문항 개수" name="reviewQuestionCount">
            <Input
              readOnly
              style={{
                backgroundColor: "#f5f5f5",
                color: "#595959",
                cursor: "default",
              }}
            />
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
          <Form.Item label="복습 테스트 점수">
            <Input
              readOnly
              value={reviewScore ?? ""}
              style={{
                backgroundColor: "#f5f5f5",
                color: "#595959",
                cursor: "default",
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
            ? "-"
            : `${reviewScore}점 · ${getAchievementLabel(reviewScore)}`}
        </Tag>
      </Row>
    </Card>
  );
}
