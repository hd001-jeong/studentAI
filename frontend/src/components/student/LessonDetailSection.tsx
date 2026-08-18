import type { ReactNode } from "react";

import { SaveOutlined } from "@ant-design/icons";
import { Button, Drawer } from "antd";

interface LessonDetailSectionProps {
  weekLabel: string;
  open: boolean;
  saving: boolean;
  onClose: () => void;
  onSave: () => void;
  children: ReactNode;
}

function LessonDetailSection({
  weekLabel,
  open,
  saving,
  onClose,
  onSave,
  children,
}: LessonDetailSectionProps) {
  return (
    <Drawer
      title={`${weekLabel} 상세 입력`}
      open={open}
      onClose={onClose}
      width={1000}
      destroyOnHidden={false}
      footer={
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
          }}
        >
          <Button
            type="primary"
            icon={<SaveOutlined />}
            loading={saving}
            onClick={onSave}
            size="large"
          >
            저장
          </Button>
        </div>
      }
    >
      {children}
    </Drawer>
  );
}

export default LessonDetailSection;
