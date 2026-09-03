import {
  CalendarOutlined,
  DollarOutlined,
  TeamOutlined,
  UserAddOutlined,
} from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
import { Card, Col, List, Row, Space, Statistic, Typography } from "antd";
import { useNavigate } from "react-router-dom";

import ApiClient from "@/api/ApiClient";

const { Title, Text } = Typography;

interface StudentCountResponse {
  count: number;
}

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

interface AttendanceRecord {
  id: number;
  class_id: number;
  student_id: number;
  attendance_date: string;
  status: "present" | "late" | "absent";
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

export default function NextDashboardPage() {
  const navigate = useNavigate();

  const teacherName = sessionStorage.getItem("teacherName") ?? "";
  const todayDayOfWeek = getTodayDayOfWeek();
  const todayDate = getTodayDate();

  const { data: studentCountData, isLoading: isStudentCountLoading } = useQuery(
    {
      queryKey: ["next-student-count", teacherName],
      queryFn: async () => {
        const response = await ApiClient.get<StudentCountResponse>(
          "/next/students/count",
          {
            params: {
              teacherName,
            },
          },
        );

        return response.data;
      },
      enabled: !!teacherName,
    },
  );

  const { data: todayClasses = [], isLoading: isTodayClassesLoading } =
    useQuery({
      queryKey: ["next-today-classes", teacherName, todayDayOfWeek],
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

  const { data: attendanceRecords = [], isLoading: isAttendanceLoading } =
    useQuery({
      queryKey: ["next-dashboard-attendance", teacherName, todayDate],
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
      enabled: !!teacherName,
    });

  const studentCount = studentCountData?.count ?? 0;
  const todayClassCount = todayClasses.length;

  const absentCount = attendanceRecords.filter(
    (item) => item.status === "absent",
  ).length;

  return (
    <div style={{ padding: 24 }}>
      <Space direction="vertical" size={4} style={{ marginBottom: 24 }}>
        <Title level={2} style={{ margin: 0 }}>
          켠로그 NEXT
        </Title>

        <Text type="secondary">
          학생 관리부터 출결, 일정, 수납까지 한 번에 관리합니다.
        </Text>
      </Space>

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="학생 수"
              value={studentCount}
              loading={isStudentCountLoading}
              prefix={<TeamOutlined />}
              suffix="명"
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="오늘 수업"
              value={todayClassCount}
              loading={isTodayClassesLoading}
              prefix={<CalendarOutlined />}
              suffix="건"
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="오늘 결석"
              value={absentCount}
              loading={isAttendanceLoading}
              prefix={<UserAddOutlined />}
              suffix="건"
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="미납"
              value={0}
              prefix={<DollarOutlined />}
              suffix="건"
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 8 }}>
        <Col xs={24} lg={14}>
          <Card title="오늘 일정" style={{ minHeight: 260 }}>
            {todayClasses.length === 0 ? (
              <Text type="secondary">등록된 일정이 없습니다.</Text>
            ) : (
              <List
                loading={isTodayClassesLoading}
                dataSource={todayClasses}
                renderItem={(item) => (
                  <List.Item>
                    <List.Item.Meta
                      title={
                        <Space>
                          <CalendarOutlined />

                          <Text strong>{item.class_name}</Text>
                        </Space>
                      }
                      description={
                        <Text type="secondary">
                          {formatTime(item.start_time)}
                          {item.end_time
                            ? ` ~ ${formatTime(item.end_time)}`
                            : ""}
                        </Text>
                      }
                    />
                  </List.Item>
                )}
              />
            )}
          </Card>
        </Col>

        <Col xs={24} lg={10}>
          <Card title="빠른 메뉴" style={{ minHeight: 260 }}>
            <Row gutter={[12, 12]}>
              <Col span={12}>
                <Card
                  hoverable
                  onClick={() => navigate("/next/students")}
                  style={{ textAlign: "center" }}
                >
                  <TeamOutlined style={{ fontSize: 24 }} />

                  <div style={{ marginTop: 8 }}>학생 관리</div>
                </Card>
              </Col>

              <Col span={12}>
                <Card
                  hoverable
                  onClick={() => navigate("/next/attendance")}
                  style={{ textAlign: "center" }}
                >
                  <UserAddOutlined style={{ fontSize: 24 }} />

                  <div style={{ marginTop: 8 }}>출결 관리</div>
                </Card>
              </Col>

              <Col span={12}>
                <Card
                  hoverable
                  onClick={() => navigate("/next/schedules")}
                  style={{ textAlign: "center" }}
                >
                  <CalendarOutlined style={{ fontSize: 24 }} />

                  <div style={{ marginTop: 8 }}>일정 관리</div>
                </Card>
              </Col>

              <Col span={12}>
                <Card
                  hoverable
                  onClick={() => navigate("/next/payments")}
                  style={{ textAlign: "center" }}
                >
                  <DollarOutlined style={{ fontSize: 24 }} />

                  <div style={{ marginTop: 8 }}>수납 관리</div>
                </Card>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
