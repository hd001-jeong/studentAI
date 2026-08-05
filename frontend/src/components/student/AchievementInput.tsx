import { Form, InputNumber, Space, Tag } from "antd";

import {
  getAchievementLabel,
  getAchievementTagColor,
} from "@/utils/achievement";

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
        <InputNumber
          min={0}
          max={100}
          precision={0}
          addonAfter="%"
          placeholder="0"
          style={{
            width: "100%",
          }}
        />
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
