import { useRef } from "react";

import {
  Button,
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
  value?: number | null;
  onChange?: (value: number | null) => void;
  readOnly?: boolean;
  unit: string;
  disabled?: boolean;
  min?: number;
  max?: number;
}

interface ReviewTestBackup {
  reviewQuestionCount: number | null;
  reviewCorrectCount: number | null;
  reviewTestScore: number | null;
  reviewFeedback: string;
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
        step={0.1}
        disabled={disabled}
        controls={false}
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
  const form = Form.useFormInstance();

  /*
   * 결석 처리 직전 값 보관
   *
   * 결석 버튼을 잘못 눌렀을 경우
   * 되돌리기로 기존 값을 복구하기 위함
   */
  const beforeAbsentRef = useRef<ReviewTestBackup | null>(null);

  /*
   * 현재 결석 상태 여부
   */
  const reviewFeedback = Form.useWatch("reviewFeedback", form);

  const isAbsent = reviewFeedback === "결석🌸";

  /*
   * 결석 처리
   */
  const handleAbsent = () => {
    beforeAbsentRef.current = {
      reviewQuestionCount: form.getFieldValue("reviewQuestionCount") ?? null,

      reviewCorrectCount: form.getFieldValue("reviewCorrectCount") ?? null,

      reviewTestScore: form.getFieldValue("reviewTestScore") ?? null,

      reviewFeedback: form.getFieldValue("reviewFeedback") ?? "",
    };

    form.setFieldsValue({
      reviewQuestionCount: null,
      reviewCorrectCount: null,
      reviewTestScore: null,
      reviewFeedback: "결석🌸",
    });
  };

  /*
   * 결석 되돌리기
   */
  const handleAbsentCancel = () => {
    const previous = beforeAbsentRef.current;

    /*
     * 현재 화면에서 결석 버튼을 눌렀다가
     * 바로 되돌리는 경우
     */
    if (previous) {
      form.setFieldsValue({
        reviewQuestionCount: previous.reviewQuestionCount,

        reviewCorrectCount: previous.reviewCorrectCount,

        reviewTestScore: previous.reviewTestScore,

        reviewFeedback: previous.reviewFeedback,
      });
    } else {
      /*
       * DB에 이미 결석 상태로 저장된 데이터를
       * 다시 열어서 되돌리는 경우
       *
       * 이전 값을 알 수 없으므로
       * 결석 표시만 제거
       */
      form.setFieldsValue({
        reviewQuestionCount: null,
        reviewCorrectCount: null,
        reviewTestScore: null,
        reviewFeedback: "",
      });
    }

    beforeAbsentRef.current = null;
  };

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
        {/* 복습 테스트명 */}
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

        {/* 복습 문항 개수 */}
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

        {/* 복습 맞은 개수 */}
        <Col xs={24} sm={8} lg={4}>
          <Form.Item label="복습 맞은 개수" name="reviewCorrectCount">
            <NumberInputWithUnit
              min={0}
              max={reviewQuestionCount ?? undefined}
              unit="개"
              disabled={isAbsent}
            />
          </Form.Item>
        </Col>

        {/* 복습 테스트 점수 */}
        <Col xs={24} sm={8} lg={4}>
          <Form.Item label="복습 테스트 점수" name="reviewTestScore">
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

        {/* 복습 피드백 */}
        <Col xs={24} lg={6}>
          <Form.Item
            label={
              <Flex align="center" gap={6}>
                <Text>복습 피드백</Text>

                <Button
                  size="small"
                  danger={!isAbsent}
                  onClick={isAbsent ? handleAbsentCancel : handleAbsent}
                >
                  {isAbsent ? "되돌리기" : "결석"}
                </Button>
              </Flex>
            }
            name="reviewFeedback"
          >
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
