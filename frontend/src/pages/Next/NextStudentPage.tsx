import { ArrowLeftOutlined, PlusOutlined } from "@ant-design/icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Button,
  Card,
  Form,
  Input,
  InputNumber,
  Modal,
  Space,
  Table,
  Tag,
  Typography,
  message,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import ApiClient from "@/api/ApiClient";

const { Title, Text } = Typography;

interface NextStudent {
  id: number;
  student_code: string;
  student_name: string;
  school_name: string | null;
  grade: number | null;
  teacher_name: string;
  created_at: string;
}

interface NextStudentCreateRequest {
  studentCode: string;
  studentName: string;
  schoolName: string;
  grade: number | null;
  teacherName: string;
}

interface StudentFormValues {
  studentCode: string;
  studentName: string;
  schoolName: string;
  grade: number | null;
}

export default function NextStudentPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [form] = Form.useForm<StudentFormValues>();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const teacherName = sessionStorage.getItem("teacherName") ?? "";

  const {
    data: students = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["next-students", teacherName],
    queryFn: async () => {
      const response = await ApiClient.get<NextStudent[]>("/next/students", {
        params: {
          teacherName,
        },
      });

      return response.data;
    },
    enabled: !!teacherName,
  });

  const createStudentMutation = useMutation({
    mutationFn: async (values: StudentFormValues) => {
      const request: NextStudentCreateRequest = {
        studentCode: values.studentCode,
        studentName: values.studentName,
        schoolName: values.schoolName ?? "",
        grade: values.grade ?? null,
        teacherName,
      };

      const response = await ApiClient.post<NextStudent>(
        "/next/students",
        request,
      );

      return response.data;
    },

    onSuccess: async () => {
      message.success("학생이 등록되었습니다.");

      setIsCreateModalOpen(false);
      form.resetFields();

      await queryClient.invalidateQueries({
        queryKey: ["next-students", teacherName],
      });

      await queryClient.invalidateQueries({
        queryKey: ["next-student-count", teacherName],
      });
    },

    onError: () => {
      message.error("학생 등록 중 오류가 발생했습니다.");
    },
  });

  const handleOpenCreateModal = () => {
    form.resetFields();
    setIsCreateModalOpen(true);
  };

  const handleCloseCreateModal = () => {
    if (createStudentMutation.isPending) {
      return;
    }

    setIsCreateModalOpen(false);
    form.resetFields();
  };

  const handleCreateStudent = async () => {
    try {
      const values = await form.validateFields();

      createStudentMutation.mutate(values);
    } catch {
      // Form validation 실패 시 별도 처리 없음
    }
  };

  const columns: ColumnsType<NextStudent> = [
    {
      title: "학생 코드",
      dataIndex: "student_code",
      key: "student_code",
      width: 120,
    },
    {
      title: "학생 이름",
      dataIndex: "student_name",
      key: "student_name",
      width: 140,
      render: (studentName: string) => <Text strong>{studentName}</Text>,
    },
    {
      title: "학교",
      dataIndex: "school_name",
      key: "school_name",
      render: (schoolName: string | null) => schoolName || "-",
    },
    {
      title: "학년",
      dataIndex: "grade",
      key: "grade",
      width: 100,
      render: (grade: number | null) => (grade ? <Tag>{grade}학년</Tag> : "-"),
    },
    {
      title: "담당",
      dataIndex: "teacher_name",
      key: "teacher_name",
      width: 120,
    },
  ];

  if (isError) {
    message.error("학생 목록을 불러오지 못했습니다.");
  }

  return (
    <>
      <div style={{ padding: 24 }}>
        <Space
          direction="vertical"
          size={24}
          style={{
            width: "100%",
          }}
        >
          <div>
            <Button
              type="text"
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate("/next")}
              style={{
                paddingLeft: 0,
                marginBottom: 8,
              }}
            >
              대시보드
            </Button>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-end",
                gap: 16,
              }}
            >
              <div>
                <Title
                  level={2}
                  style={{
                    margin: 0,
                  }}
                >
                  학생 관리
                </Title>

                <Text type="secondary">등록된 학생 정보를 관리합니다.</Text>
              </div>

              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleOpenCreateModal}
              >
                학생 등록
              </Button>
            </div>
          </div>

          <Card>
            <div
              style={{
                marginBottom: 16,
              }}
            >
              <Text>
                전체 학생 <Text strong>{students.length}</Text>명
              </Text>
            </div>

            <Table<NextStudent>
              rowKey="id"
              columns={columns}
              dataSource={students}
              loading={isLoading}
              pagination={false}
              scroll={{
                x: 650,
              }}
            />
          </Card>
        </Space>
      </div>

      <Modal
        title="학생 등록"
        open={isCreateModalOpen}
        onCancel={handleCloseCreateModal}
        onOk={handleCreateStudent}
        okText="등록"
        cancelText="취소"
        confirmLoading={createStudentMutation.isPending}
        destroyOnHidden
      >
        <Form<StudentFormValues>
          form={form}
          layout="vertical"
          style={{
            marginTop: 24,
          }}
        >
          <Form.Item
            label="학생 코드"
            name="studentCode"
            rules={[
              {
                required: true,
                message: "학생 코드를 입력해주세요.",
              },
            ]}
          >
            <Input placeholder="예: S0002" maxLength={30} />
          </Form.Item>

          <Form.Item
            label="학생 이름"
            name="studentName"
            rules={[
              {
                required: true,
                message: "학생 이름을 입력해주세요.",
              },
            ]}
          >
            <Input placeholder="학생 이름" maxLength={50} />
          </Form.Item>

          <Form.Item label="학교" name="schoolName">
            <Input placeholder="학교명" maxLength={100} />
          </Form.Item>

          <Form.Item label="학년" name="grade">
            <InputNumber
              min={1}
              max={3}
              placeholder="학년"
              style={{
                width: "100%",
              }}
            />
          </Form.Item>

          <Form.Item label="담당 선생님">
            <Input value={teacherName} disabled />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
