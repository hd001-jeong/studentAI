import {
  Button,
  Card,
  Col,
  Input,
  Row,
  Select,
  Spin,
  Typography,
  message,
} from "antd";
import { useEffect, useMemo, useState } from "react";

import NoticeApi, { type NoticeHistoryItem } from "@/api/NoticeApi";

const { Text, Title } = Typography;

const schoolOptions = [
  {
    value: "인창고",
    label: "인창고",
  },
  {
    value: "이화여고",
    label: "이화여고",
  },
];

const gradeOptions = [
  {
    value: "고1",
    label: "고1",
  },
  {
    value: "고2",
    label: "고2",
  },
];

export default function NoticePage() {
  const [selectedSchool, setSelectedSchool] = useState("인창고");

  const [selectedGrade, setSelectedGrade] = useState("고1");

  const [selectedWeek, setSelectedWeek] = useState("");

  const [weeks, setWeeks] = useState<string[]>([]);

  const [notice, setNotice] = useState("");

  const [recentNotices, setRecentNotices] = useState<NoticeHistoryItem[]>([]);

  const [weeksLoading, setWeeksLoading] = useState(false);

  const [noticeLoading, setNoticeLoading] = useState(false);

  const [historyLoading, setHistoryLoading] = useState(false);

  const [saving, setSaving] = useState(false);

  const [messageApi, contextHolder] = message.useMessage();

  /*
   * 주차 Select 옵션
   */
  const weekOptions = useMemo(() => {
    return weeks.map((week) => ({
      value: week,
      label: week,
    }));
  }, [weeks]);

  /*
   * 학교 / 학년 변경 시
   * 해당 조건의 주차 목록 조회
   */
  useEffect(() => {
    const fetchWeeks = async () => {
      try {
        setWeeksLoading(true);

        setWeeks([]);
        setSelectedWeek("");
        setNotice("");

        const data = await NoticeApi.getWeeks(selectedSchool, selectedGrade);

        setWeeks(data);

        if (data.length > 0) {
          setSelectedWeek(data[0]);
        }
      } catch (error) {
        console.error("공지사항 주차 목록 조회 실패", error);

        messageApi.error("주차 목록을 불러오지 못했습니다.");

        setWeeks([]);
        setSelectedWeek("");
        setNotice("");
      } finally {
        setWeeksLoading(false);
      }
    };

    fetchWeeks();
  }, [selectedSchool, selectedGrade, messageApi]);

  /*
   * 학교 / 학년별 최근 공지사항 조회
   */
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setHistoryLoading(true);

        const data = await NoticeApi.getHistory(selectedSchool, selectedGrade);

        setRecentNotices(data);
      } catch (error) {
        console.error("최근 공지사항 조회 실패", error);

        setRecentNotices([]);
      } finally {
        setHistoryLoading(false);
      }
    };

    fetchHistory();
  }, [selectedSchool, selectedGrade]);

  /*
   * 학교 / 학년 / 주차별
   * 현재 공지사항 조회
   */
  useEffect(() => {
    if (!selectedWeek) {
      setNotice("");
      return;
    }

    const fetchNotice = async () => {
      try {
        setNoticeLoading(true);

        const data = await NoticeApi.getNotice(
          selectedSchool,
          selectedGrade,
          selectedWeek,
        );

        setNotice(data.notice ?? "");
      } catch (error) {
        console.error("공지사항 조회 실패", error);

        messageApi.error("공지사항을 불러오지 못했습니다.");

        setNotice("");
      } finally {
        setNoticeLoading(false);
      }
    };

    fetchNotice();
  }, [selectedSchool, selectedGrade, selectedWeek, messageApi]);

  /*
   * 공지사항 저장
   */
  const handleSave = async () => {
    if (!selectedWeek) {
      return;
    }

    if (!notice.trim()) {
      return;
    }

    try {
      setSaving(true);

      const data = await NoticeApi.updateNotice({
        schoolName: selectedSchool,
        grade: selectedGrade,
        weekLabel: selectedWeek,
        notice: notice.trim(),
      });

      setNotice(data.notice ?? "");

      /*
       * 저장 후 최근 공지 다시 조회
       */
      const history = await NoticeApi.getHistory(selectedSchool, selectedGrade);

      setRecentNotices(history);

      messageApi.success("공지사항을 저장했습니다.");
    } catch (error) {
      console.error("공지사항 저장 실패", error);

      messageApi.error("공지사항을 저장하지 못했습니다.");
    } finally {
      setSaving(false);
    }
  };

  const loading = weeksLoading || noticeLoading;

  return (
    <>
      {contextHolder}

      <div
        style={{
          width: "100%",
          maxWidth: 1000,
          margin: "0 auto",
        }}
      >
        <Title
          level={3}
          style={{
            marginTop: 0,
            marginBottom: 16,
          }}
        >
          공지사항 관리
        </Title>

        <Card>
          <Row gutter={[16, 16]}>
            {/* 학교 선택 */}
            <Col xs={24} md={8}>
              <Text strong>학교 선택</Text>

              <Select
                value={selectedSchool}
                options={schoolOptions}
                onChange={setSelectedSchool}
                disabled={weeksLoading}
                style={{
                  width: "100%",
                  marginTop: 6,
                }}
              />
            </Col>

            {/* 학년 선택 */}
            <Col xs={24} md={8}>
              <Text strong>학년 선택</Text>

              <Select
                value={selectedGrade}
                options={gradeOptions}
                onChange={setSelectedGrade}
                disabled={weeksLoading}
                style={{
                  width: "100%",
                  marginTop: 6,
                }}
              />
            </Col>

            {/* 주차 선택 */}
            <Col xs={24} md={8}>
              <Text strong>주차 선택</Text>

              <Select
                value={selectedWeek || undefined}
                options={weekOptions}
                onChange={setSelectedWeek}
                loading={weeksLoading}
                disabled={weeksLoading || weeks.length === 0}
                placeholder={
                  weeksLoading ? "주차 조회 중" : "주차를 선택해주세요."
                }
                style={{
                  width: "100%",
                  marginTop: 6,
                }}
              />
            </Col>

            {/* 공지사항 */}
            <Col xs={24}>
              <Text strong>공지사항</Text>

              <div
                style={{
                  position: "relative",
                  marginTop: 6,
                }}
              >
                <Input
                  value={notice}
                  disabled={loading || !selectedWeek}
                  onChange={(event) => {
                    setNotice(event.target.value);
                  }}
                  maxLength={50}
                  showCount
                  placeholder={
                    !selectedWeek
                      ? "주차를 선택해주세요."
                      : noticeLoading
                        ? "공지사항을 불러오는 중입니다."
                        : "공지사항을 입력해주세요."
                  }
                  onPressEnter={handleSave}
                />

                {noticeLoading && (
                  <Spin
                    size="small"
                    style={{
                      position: "absolute",
                      right: 45,
                      top: 7,
                    }}
                  />
                )}
              </div>
            </Col>

            {/* 저장 */}
            <Col xs={24}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                }}
              >
                <Button
                  type="primary"
                  loading={saving}
                  disabled={loading || !selectedWeek || !notice.trim()}
                  onClick={handleSave}
                >
                  저장
                </Button>
              </div>
            </Col>
          </Row>
        </Card>

        {/* 최근 공지 */}
        {(historyLoading || recentNotices.length > 0) && (
          <Card
            title="최근 공지"
            style={{
              marginTop: 16,
            }}
          >
            {historyLoading ? (
              <Spin />
            ) : (
              recentNotices.map((item, index) => (
                <div
                  key={`${item.weekLabel}-${index}`}
                  style={{
                    padding: "12px 0",
                    borderBottom:
                      index === recentNotices.length - 1
                        ? "none"
                        : "1px solid #f0f0f0",
                  }}
                >
                  <Text
                    strong
                    style={{
                      fontSize: 13,
                    }}
                  >
                    {item.weekLabel}
                  </Text>

                  <div
                    style={{
                      marginTop: 4,
                    }}
                  >
                    <Text>{item.notice}</Text>
                  </div>
                </div>
              ))
            )}
          </Card>
        )}
      </div>
    </>
  );
}
