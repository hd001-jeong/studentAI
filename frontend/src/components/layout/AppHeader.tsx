import {
  CalendarOutlined,
  LeftOutlined,
  LogoutOutlined,
  PlusOutlined,
  RightOutlined,
} from "@ant-design/icons";
import {
  Button,
  DatePicker,
  Form,
  Input,
  Layout,
  Modal,
  Select,
  Space,
  TimePicker,
  Typography,
} from "antd";
import axios from "axios";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import "./AppHeader.css";

const { Header } = Layout;
const { Text } = Typography;

interface AppHeaderProps {
  teacherName?: string | null;
}

type ScheduleType = "lesson" | "makeup" | "exam" | "cancel" | "etc";

interface ScheduleApiItem {
  scheduleId: string;
  scheduleDate: string;
  startTime: string;
  scheduleType: ScheduleType;
  studentId: string;
  studentName: string;
  title: string;
  memo: string;
  teacherName: string;
  createdAt: string;
}

interface ScheduleItem {
  id: string;
  date: string;
  title: string;
  type: ScheduleType;
}

interface CalendarDay {
  date: Date;
  dateKey: string;
  day: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  dayOfWeek: number;
}

const WEEK_DAYS = ["일", "월", "화", "수", "목", "금", "토"];

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000";

function formatDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function isSameDate(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function createCalendarDays(year: number, month: number): CalendarDay[] {
  const firstDay = new Date(year, month, 1);

  const startDate = new Date(year, month, 1 - firstDay.getDay());

  const lastDay = new Date(year, month + 1, 0);

  const totalDays = Math.ceil((firstDay.getDay() + lastDay.getDate()) / 7) * 7;

  const today = new Date();

  return Array.from(
    {
      length: totalDays,
    },
    (_, index) => {
      const date = new Date(startDate);

      date.setDate(startDate.getDate() + index);

      return {
        date,
        dateKey: formatDateKey(date),
        day: date.getDate(),
        isCurrentMonth:
          date.getMonth() === month && date.getFullYear() === year,
        isToday: isSameDate(date, today),
        dayOfWeek: date.getDay(),
      };
    },
  );
}

function createScheduleTitle(schedule: ScheduleApiItem) {
  if (schedule.scheduleType === "lesson") {
    return [schedule.startTime, schedule.studentName].filter(Boolean).join(" ");
  }

  if (schedule.scheduleType === "makeup" && schedule.studentName) {
    return [schedule.startTime, schedule.studentName, "보강"]
      .filter(Boolean)
      .join(" ");
  }

  if (schedule.startTime && schedule.title) {
    return `${schedule.startTime} ${schedule.title}`;
  }

  return schedule.title;
}

export default function AppHeader({ teacherName }: AppHeaderProps) {
  const navigate = useNavigate();

  const today = new Date();

  const [calendarOpen, setCalendarOpen] = useState(false);

  const [currentYear, setCurrentYear] = useState(today.getFullYear());

  const [currentMonth, setCurrentMonth] = useState(today.getMonth());

  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const [schedules, setSchedules] = useState<ScheduleItem[]>([]);

  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);

  const [scheduleForm] = Form.useForm();

  const calendarDays = useMemo(
    () => createCalendarDays(currentYear, currentMonth),
    [currentYear, currentMonth],
  );

  useEffect(() => {
    if (!calendarOpen) {
      return;
    }

    const fetchSchedules = async () => {
      try {
        const response = await axios.get<ScheduleApiItem[]>(
          `${API_BASE_URL}/schedules`,
        );

        const mappedSchedules = response.data.map((schedule) => ({
          id: schedule.scheduleId,
          date: schedule.scheduleDate,
          type: schedule.scheduleType,
          title: createScheduleTitle(schedule),
        }));

        setSchedules(mappedSchedules);
      } catch (error) {
        console.error("일정 조회 실패:", error);

        setSchedules([]);
      }
    };

    fetchSchedules();
  }, [calendarOpen]);

  const handleLogout = () => {
    localStorage.removeItem("teacherCode");
    localStorage.removeItem("teacherName");

    navigate("/");
  };

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentYear((prev) => prev - 1);
      setCurrentMonth(11);

      return;
    }

    setCurrentMonth((prev) => prev - 1);
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentYear((prev) => prev + 1);
      setCurrentMonth(0);

      return;
    }

    setCurrentMonth((prev) => prev + 1);
  };

  const handleToday = () => {
    const now = new Date();

    setCurrentYear(now.getFullYear());
    setCurrentMonth(now.getMonth());
    setSelectedDate(formatDateKey(now));
  };

  const handleDateClick = (day: CalendarDay) => {
    setSelectedDate(day.dateKey);

    console.log("선택 날짜:", day.dateKey);
  };

  const getSchedulesByDate = (dateKey: string) => {
    return schedules.filter((schedule) => schedule.date === dateKey);
  };

  return (
    <>
      <Header
        style={{
          height: 56,
          padding: "0 24px",
          background: "#ffffff",
          borderBottom: "1px solid #e5e7eb",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          lineHeight: "normal",
        }}
      >
        <Space size={10} align="center">
          <Text
            strong
            style={{
              fontSize: 20,
              whiteSpace: "nowrap",
            }}
          >
            켠코어
          </Text>

          <Text
            type="secondary"
            style={{
              fontSize: 13,
              whiteSpace: "nowrap",
            }}
          >
            학생 관리
          </Text>
        </Space>

        <Space size={10} align="center">
          <Button
            type="text"
            icon={<CalendarOutlined />}
            onClick={() => setCalendarOpen(true)}
            className="kyeon-calendar-button"
          />

          <Text
            strong
            style={{
              fontSize: 14,
              whiteSpace: "nowrap",
            }}
          >
            {teacherName ? `${teacherName}님` : "선생님"}
          </Text>

          <Button size="small" icon={<LogoutOutlined />} onClick={handleLogout}>
            로그아웃
          </Button>
        </Space>
      </Header>

      <Modal
        open={calendarOpen}
        onCancel={() => setCalendarOpen(false)}
        footer={null}
        width={1120}
        centered
        destroyOnHidden
        className="kyeon-calendar-modal"
      >
        <div className="kyeon-calendar-container">
          <div className="kyeon-calendar-top">
            <div>
              <div className="kyeon-calendar-small-title">KYEON CORE</div>

              <div className="kyeon-calendar-title">
                {currentYear}년 {currentMonth + 1}월
              </div>
            </div>

            <Button
              type="primary"
              icon={<PlusOutlined />}
              className="kyeon-schedule-button"
              onClick={() => {
                scheduleForm.resetFields();
                setScheduleModalOpen(true);
              }}
            >
              일정 추가
            </Button>
          </div>

          <div className="kyeon-calendar-navigation">
            <Button
              type="text"
              icon={<LeftOutlined />}
              onClick={handlePrevMonth}
              className="calendar-nav-button"
            />

            <Button
              type="text"
              onClick={handleToday}
              className="calendar-today-button"
            >
              오늘
            </Button>

            <Button
              type="text"
              icon={<RightOutlined />}
              onClick={handleNextMonth}
              className="calendar-nav-button"
            />
          </div>

          <div className="kyeon-week-header">
            {WEEK_DAYS.map((day, index) => (
              <div
                key={day}
                className={[
                  "kyeon-week-day",
                  index === 0 ? "sunday" : "",
                  index === 6 ? "saturday" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                {day}
              </div>
            ))}
          </div>

          <div className="kyeon-calendar-grid">
            {calendarDays.map((day) => {
              const daySchedules = getSchedulesByDate(day.dateKey);

              const isSelected = selectedDate === day.dateKey;

              return (
                <button
                  key={day.dateKey}
                  type="button"
                  onClick={() => handleDateClick(day)}
                  className={[
                    "kyeon-day-card",
                    !day.isCurrentMonth ? "other-month" : "",
                    day.dayOfWeek === 0 ? "sunday" : "",
                    day.dayOfWeek === 6 ? "saturday" : "",
                    day.isToday ? "today" : "",
                    isSelected ? "selected" : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                >
                  <div className="kyeon-day-top">
                    <span className="kyeon-day-number">{day.day}</span>

                    {day.isToday && (
                      <span className="kyeon-today-badge">오늘</span>
                    )}
                  </div>

                  <div className="kyeon-day-schedules">
                    {daySchedules.slice(0, 3).map((schedule) => (
                      <div
                        key={schedule.id}
                        className={["kyeon-schedule-pill", schedule.type].join(
                          " ",
                        )}
                      >
                        {schedule.title}
                      </div>
                    ))}

                    {daySchedules.length > 3 && (
                      <div className="kyeon-more-schedule">
                        +{daySchedules.length - 3}개
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </Modal>
      <Modal
        open={scheduleModalOpen}
        title="일정 추가"
        okText="저장"
        cancelText="취소"
        centered
        width={480}
        onCancel={() => {
          setScheduleModalOpen(false);
          scheduleForm.resetFields();
        }}
        onOk={() => {
          scheduleForm.submit();
        }}
      >
        <Form
          form={scheduleForm}
          layout="vertical"
          onFinish={(values) => {
            console.log("일정 입력값:", values);

            // 아직 API 저장 안 함
            setScheduleModalOpen(false);
            scheduleForm.resetFields();
          }}
        >
          <Form.Item
            label="날짜"
            name="scheduleDate"
            rules={[
              {
                required: true,
                message: "날짜를 선택해주세요.",
              },
            ]}
          >
            <DatePicker
              style={{
                width: "100%",
              }}
              format="YYYY-MM-DD"
            />
          </Form.Item>

          <Form.Item label="시작 시간" name="startTime">
            <TimePicker
              style={{
                width: "100%",
              }}
              format="HH:mm"
              minuteStep={10}
            />
          </Form.Item>

          <Form.Item
            label="구분"
            name="scheduleType"
            initialValue="lesson"
            rules={[
              {
                required: true,
                message: "구분을 선택해주세요.",
              },
            ]}
          >
            <Select
              options={[
                {
                  label: "정규 수업",
                  value: "lesson",
                },
                {
                  label: "보강",
                  value: "makeup",
                },
                {
                  label: "시험",
                  value: "exam",
                },
                {
                  label: "휴강",
                  value: "cancel",
                },
                {
                  label: "기타",
                  value: "etc",
                },
              ]}
            />
          </Form.Item>

          <Form.Item label="학생" name="studentId">
            <Select
              placeholder="학생 선택"
              options={[
                {
                  label: "강병문",
                  value: "S00003",
                },
                {
                  label: "최민우",
                  value: "S00140",
                },
              ]}
            />
          </Form.Item>

          <Form.Item
            label="일정명"
            name="title"
            rules={[
              {
                required: true,
                message: "일정명을 입력해주세요.",
              },
            ]}
          >
            <Input
              placeholder="예: 정규 수업, 중간고사, 학원 휴강"
              maxLength={30}
            />
          </Form.Item>

          <Form.Item label="메모" name="memo">
            <Input.TextArea
              placeholder="필요한 내용을 입력해주세요."
              rows={3}
              maxLength={100}
              showCount
            />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
