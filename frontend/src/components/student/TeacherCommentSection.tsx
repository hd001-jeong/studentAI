import { Alert, Form, Input, Typography } from "antd";

const { Text } = Typography;
const { TextArea } = Input;

interface TeacherCommentSectionProps {
  maxLength: number;
}

export default function TeacherCommentSection({
  maxLength,
}: TeacherCommentSectionProps) {
  return (
    <Alert
      type="info"
      showIcon
      title={
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
              max: maxLength,
              message: `쌤 한마디는 최대 ${maxLength}자까지 입력할 수 있습니다.`,
            },
          ]}
        >
          <TextArea
            rows={2}
            maxLength={maxLength}
            placeholder={`학생에게 전달할 내용을 ${maxLength}자 이내로 입력해주세요.`}
            showCount
          />
        </Form.Item>
      }
      style={{
        marginTop: 10,
      }}
    />
  );
}
