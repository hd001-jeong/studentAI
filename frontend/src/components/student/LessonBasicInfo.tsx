import { Col, Form, Input, Row } from "antd";

function LessonBasicInfo() {
  return (
    <Row gutter={[10, 0]}>
      <Col xs={24} md={5}>
        <Form.Item label="수업일" name="lessonDate">
          <Input readOnly />
        </Form.Item>
      </Col>

      <Col xs={24} md={5}>
        <Form.Item label="주차 표시" name="weekLabel">
          <Input readOnly />
        </Form.Item>
      </Col>

      <Col xs={24} md={14}>
        <Form.Item label="진도" name="progress">
          <Input readOnly />
        </Form.Item>
      </Col>
    </Row>
  );
}

export default LessonBasicInfo;
