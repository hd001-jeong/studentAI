import { Form, InputNumber, Space, Tag, Typography } from "antd";

import {
  getAchievementLabel,
  getAchievementTagColor,
} from "@/utils/achievement";

const { Text } = Typography;

interface AchievementInputProps {
  score: number | null;
  namePath: Array<string | number>;
}

export default function AchievementInput({
  score,
  namePath,
}: AchievementInputProps) {
  return (
    <Space
      size={8}
      align="center"
      style={{
        display: "flex",
        width: "100%",
      }}
    >
      <Form.Item
        name={namePath}
        style={{
          flex: 1,
          marginBottom: 0,
        }}
      >
        <Space.Compact
          style={{
            width: "100%",
          }}
        >
          <InputNumber
            min={0}
            max={100}
            precision={0}
            placeholder="0"
            style={{
              width: "100%",
            }}
          />

          <div
            style={{
              width: 42,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "1px solid #d9d9d9",
              borderLeft: 0,
              borderRadius: "0 6px 6px 0",
              background: "#fafafa",
            }}
          >
            <Text type="secondary">%</Text>
          </div>
        </Space.Compact>
      </Form.Item>

      <Tag
        color={getAchievementTagColor(score)}
        style={{
          minWidth: 78,
          margin: 0,
          textAlign: "center",
        }}
      >
        {getAchievementLabel(score)}
      </Tag>
    </Space>
  );
}
