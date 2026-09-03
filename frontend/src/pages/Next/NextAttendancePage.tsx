import { ArrowLeftOutlined } from "@ant-design/icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Button,
  Card,
  Empty,
  Input,
  List,
  message,
  Radio,
  Select,
  Space,
  Spin,
  Typography,
} from "antd";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import ApiClient from "@/api/ApiClient";

const { Title, Text } = Typography;

type AttendanceStatus = "present" | "late" | "absent";

interface NextClass {
  id: number;
  created_at: string;
  teacher_name: string;
  class_name: string;
  day_of_week: number;
  start_time: string;
  end_time: string | null;
  is_active: boolean;
}

interface NextStudent {
  id: number;
  created_at: string;
  student_code: string;
  student_name: string;
  school_name: string;
  grade: number;
  teacher_name: string;
  class_id: number | null;
}

interface AttendanceRecord {
  id: number;
  created_at: string;
  class_id: number;
  student_id: number;
  attendance_date: string;
  status: AttendanceStatus;
  memo: string | null;
}

interface AttendanceFormValue {
  status?: AttendanceStatus;
  memo: string;
}

interface AttendanceRequest {
  classId: number;
  studentId: number;
  attendanceDate: string;
  status: AttendanceStatus;
  memo: string | null;
}

function getTodayDayOfWeek() {
  const day = new Date().getDay();

  return day === 0 ? 7 : day;
}

function getTodayDate() {
  const now = new Date();

  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function formatTime(time: string | null) {
  if (!time) {
    return "";
  }

  return time.slice(0, 5);
}

export default function NextAttendancePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const teacherName = sessionStorage.getItem("teacherName") ?? "";
  const todayDayOfWeek = getTodayDayOfWeek();
  const todayDate = getTodayDate();

  const [selectedClassId, setSelectedClassId] = useState<number>();

  const [attendanceValues, setAttendanceValues] = useState<
    Record<number, AttendanceFormValue>
  >({});

  const { data: todayClasses = [], isLoading: isTodayClassesLoading } =
    useQuery({
      queryKey: ["next-attendance-today-classes", teacherName, todayDayOfWeek],
      queryFn: async () => {
        const response = await ApiClient.get<NextClass[]>(
          "/next/classes/today",
          {
            params: {
              teacherName,
              dayOfWeek: todayDayOfWeek,
            },
          },
        );

        return response.data;
      },
      enabled: !!teacherName,
    });

  const { data: students = [], isLoading: isStudentsLoading } = useQuery({
    queryKey: ["next-attendance-class-students", selectedClassId],
    queryFn: async () => {
      const response = await ApiClient.get<NextStudent[]>(
        `/next/classes/${selectedClassId}/students`,
      );

      return response.data;
    },
    enabled: !!selectedClassId,
  });

  const { data: attendanceRecords = [], isLoading: isAttendanceLoading } =
    useQuery({
      queryKey: ["next-attendance-records", teacherName, todayDate],
      queryFn: async () => {
        const response = await ApiClient.get<AttendanceRecord[]>(
          "/next/attendance",
          {
            params: {
              teacherName,
              attendanceDate: todayDate,
            },
          },
        );

        return response.data;
      },
      enabled: !!teacherName && !!selectedClassId,
    });

  useEffect(() => {
    if (!selectedClassId) {
      setAttendanceValues({});
      return;
    }

    const classAttendance = attendanceRecords.filter(
      (item) => item.class_id === selectedClassId,
    );

    const nextValues: Record<number, AttendanceFormValue> = {};

    students.forEach((student) => {
      const attendance = classAttendance.find(
        (item) => item.student_id === student.id,
      );

      nextValues[student.id] = {
        status: attendance?.status,
        memo: attendance?.memo ?? "",
      };
    });

    setAttendanceValues(nextValues);
  }, [selectedClassId, students, attendanceRecords]);

  const saveAttendanceMutation = useMutation({
    mutationFn: async (requests: AttendanceRequest[]) => {
      await Promise.all(
        requests.map((request) => ApiClient.post("/next/attendance", request)),
      );
    },

    onSuccess: async () => {
      message.success("출결이 저장되었습니다.");

      await queryClient.invalidateQueries({
        queryKey: ["next-attendance-records", teacherName, todayDate],
      });

      await queryClient.invalidateQueries({
        queryKey: ["next-dashboard-attendance", teacherName, todayDate],
      });
    },

    onError: () => {
      message.error("출결 저장에 실패했습니다.");
    },
  });

  const selectedClass = todayClasses.find(
    (item) => item.id === selectedClassId,
  );

  const handleClassChange = (classId: number) => {
    setSelectedClassId(classId);
    setAttendanceValues({});
  };

  const handleStatusChange = (studentId: number, status: AttendanceStatus) => {
    setAttendanceValues((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        status,
        memo: prev[studentId]?.memo ?? "",
      },
    }));
  };

  const handleMemoChange = (studentId: number, memo: string) => {
    setAttendanceValues((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        memo,
      },
    }));
  };

  const handleSave = () => {
    if (!selectedClassId) {
      message.warning("수업을 선택해주세요.");
      return;
    }

    const unselectedStudent = students.find(
      (student) => !attendanceValues[student.id]?.status,
    );

    if (unselectedStudent) {
      message.warning(
        `${unselectedStudent.student_name} 학생의 출결을 선택해주세요.`,
      );
      return;
    }

    const requests: AttendanceRequest[] = students.map((student) => ({
      classId: selectedClassId,
      studentId: student.id,
      attendanceDate: todayDate,
      status: attendanceValues[student.id].status as AttendanceStatus,
      memo: attendanceValues[student.id].memo.trim() || null,
    }));

    saveAttendanceMutation.mutate(requests);
  };

  const isLoading = isStudentsLoading || isAttendanceLoading;

  return (
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

          <Title
            level={2}
            style={{
              margin: 0,
            }}
          >
            출결 관리
          </Title>

          <Text type="secondary">오늘 수업별 학생 출결을 관리합니다.</Text>
        </div>

        <Card>
          <Space direction="vertical" size={12}>
            <Text strong>오늘 수업</Text>

            <Select
              style={{
                width: 300,
              }}
              placeholder="수업을 선택하세요"
              loading={isTodayClassesLoading}
              value={selectedClassId}
              onChange={handleClassChange}
              options={todayClasses.map((item) => ({
                value: item.id,
                label: `${item.class_name} ${formatTime(item.start_time)}`,
              }))}
            />
          </Space>
        </Card>

        <Card
          title={
            selectedClass ? `${selectedClass.class_name} 학생` : "학생 목록"
          }
          extra={
            selectedClass ? <Text type="secondary">{todayDate}</Text> : null
          }
        >
          {!selectedClassId && <Empty description="수업을 선택해주세요." />}

          {selectedClassId && isLoading && (
            <div
              style={{
                padding: 40,
                textAlign: "center",
              }}
            >
              <Spin />
            </div>
          )}

          {selectedClassId && !isLoading && students.length === 0 && (
            <Empty description="등록된 학생이 없습니다." />
          )}

          {selectedClassId && !isLoading && students.length > 0 && (
            <>
              <List
                dataSource={students}
                renderItem={(student) => {
                  const value = attendanceValues[student.id];

                  return (
                    <List.Item
                      style={{
                        alignItems: "flex-start",
                        gap: 24,
                      }}
                    >
                      <div
                        style={{
                          flex: 1,
                          minWidth: 180,
                        }}
                      >
                        <Space direction="vertical" size={2}>
                          <Text strong>{student.student_name}</Text>

                          <Text type="secondary">
                            {student.school_name} / {student.grade}학년
                          </Text>
                        </Space>
                      </div>

                      <div
                        style={{
                          width: 430,
                        }}
                      >
                        <Space
                          direction="vertical"
                          size={10}
                          style={{
                            width: "100%",
                          }}
                        >
                          <Radio.Group
                            value={value?.status}
                            onChange={(event) =>
                              handleStatusChange(student.id, event.target.value)
                            }
                            optionType="button"
                            buttonStyle="solid"
                          >
                            <Radio.Button value="present">출석</Radio.Button>

                            <Radio.Button value="late">지각</Radio.Button>

                            <Radio.Button value="absent">결석</Radio.Button>
                          </Radio.Group>

                          <Input
                            placeholder="메모"
                            value={value?.memo ?? ""}
                            onChange={(event) =>
                              handleMemoChange(student.id, event.target.value)
                            }
                          />
                        </Space>
                      </div>
                    </List.Item>
                  );
                }}
              />

              <div
                style={{
                  marginTop: 20,
                  textAlign: "right",
                }}
              >
                <Button
                  type="primary"
                  size="large"
                  loading={saveAttendanceMutation.isPending}
                  onClick={handleSave}
                >
                  출결 저장
                </Button>
              </div>
            </>
          )}
        </Card>
      </Space>
    </div>
  );
}
