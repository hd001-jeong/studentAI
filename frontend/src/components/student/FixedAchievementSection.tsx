import { Card, Col, Form, Input, Row, Typography } from "antd";
import type { FormInstance } from "antd";

import AchievementInput from "./AchievementInput";

import { EMPTY_ACHIEVEMENT_ITEM } from "@/constants/studentConstants";
import type { LessonRecord } from "@/types/lessonRecord";

const { Text } = Typography;

interface FixedAchievementSectionProps {
  form: FormInstance<LessonRecord>;

  fieldName: "homeworks" | "dailyEvaluations";

  title: string;
  itemTitle: string;
  inputLabel: string;
}

export default function FixedAchievementSection({
  form,
  fieldName,
  title,
  itemTitle,
  inputLabel,
}: FixedAchievementSectionProps) {
  const watchedItems = Form.useWatch(fieldName, form) ?? [];

  return (
    <Card
      size="small"
      title={title}
      styles={{
        body: {
          padding: 12,
        },
      }}
    >
      <Row gutter={[10, 10]}>
        {[0, 1, 2].map((index) => {
          const item = watchedItems[index] ?? EMPTY_ACHIEVEMENT_ITEM;

          return (
            <Col key={index} xs={24} md={8}>
              <Card
                size="small"
                title={`${itemTitle} ${index + 1}`}
                style={{
                  height: "100%",
                }}
                styles={{
                  header: {
                    minHeight: 38,
                    padding: "0 12px",
                  },
                  body: {
                    padding: 12,
                  },
                }}
              >
                <Form.Item
                  label={inputLabel}
                  name={[fieldName, index, "name"]}
                  style={{
                    marginBottom: 10,
                  }}
                >
                  <Input
                    readOnly
                    style={{
                      backgroundColor: "#f0f7ff",
                      color: "#595959",
                      cursor: "default",
                    }}
                  />
                </Form.Item>

                <Text
                  strong
                  style={{
                    display: "block",
                    marginBottom: 6,
                  }}
                >
                  성취도
                </Text>

                <AchievementInput
                  score={item.achievement ?? null}
                  namePath={[fieldName, index, "achievement"]}
                />
              </Card>
            </Col>
          );
        })}
      </Row>
    </Card>
  );
}
