import {
  Button,
  Card,
  Col,
  Divider,
  Input,
  InputNumber,
  Row,
  Select,
  Spin,
  Typography,
  message,
} from "antd";
import { useEffect, useMemo, useState } from "react";

import NoticeApi, {
  type NoticeHistoryItem,
  type NoticeResponse,
  type NoticeUpdateRequest,
} from "@/api/NoticeApi";

const { Text, Title } = Typography;

const schoolOptions = [
  { value: "인창고", label: "인창고" },
  { value: "이화여고", label: "이화여고" },
];

const gradeOptions = [
  { value: "고1", label: "고1" },
  { value: "고2", label: "고2" },
];

export default function NoticePage() {
  const [selectedSchool, setSelectedSchool] = useState("인창고");
  const [selectedGrade, setSelectedGrade] = useState("고1");
  const [selectedWeek, setSelectedWeek] = useState("");

  const [weeks, setWeeks] = useState<string[]>([]);

  const [notice, setNotice] = useState("");

  const [lessonDate, setLessonDate] = useState("");
  const [progress, setProgress] = useState("");

  const [daily1, setDaily1] = useState("");
  const [daily2, setDaily2] = useState("");
  const [daily3, setDaily3] = useState("");

  const [homework1, setHomework1] = useState("");
  const [homework2, setHomework2] = useState("");
  const [homework3, setHomework3] = useState("");

  const [reviewTest, setReviewTest] = useState("");
  const [reviewQuestionCount, setReviewQuestionCount] = useState<number | null>(
    null,
  );

  const [memorization1, setMemorization1] = useState("");
  const [memorization2, setMemorization2] = useState("");

  const [recentNotices, setRecentNotices] = useState<NoticeHistoryItem[]>([]);

  const [weeksLoading, setWeeksLoading] = useState(false);
  const [noticeLoading, setNoticeLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [messageApi, contextHolder] = message.useMessage();

  const weekOptions = useMemo(() => {
    return weeks.map((week) => ({
      value: week,
      label: week,
    }));
  }, [weeks]);

  const resetWeeklyData = () => {
    setNotice("");

    setLessonDate("");
    setProgress("");

    setDaily1("");
    setDaily2("");
    setDaily3("");

    setHomework1("");
    setHomework2("");
    setHomework3("");

    setReviewTest("");
    setReviewQuestionCount(null);

    setMemorization1("");
    setMemorization2("");
  };

  const applyWeeklyData = (data: Partial<NoticeResponse>) => {
    setNotice(data.notice ?? "");

    setLessonDate(data.lessonDate ?? "");
    setProgress(data.progress ?? "");

    setDaily1(data.daily1 ?? "");
    setDaily2(data.daily2 ?? "");
    setDaily3(data.daily3 ?? "");

    setHomework1(data.homework1 ?? "");
    setHomework2(data.homework2 ?? "");
    setHomework3(data.homework3 ?? "");

    setReviewTest(data.reviewTest ?? "");
    setReviewQuestionCount(data.reviewQuestionCount ?? null);

    setMemorization1(data.memorization1 ?? "");
    setMemorization2(data.memorization2 ?? "");
  };

  // =======================================================
  // 학교 / 학년 변경 시 주차 목록 조회
  // =======================================================

  useEffect(() => {
    const fetchWeeks = async () => {
      try {
        setWeeksLoading(true);

        setWeeks([]);
        setSelectedWeek("");
        resetWeeklyData();

        const data = await NoticeApi.getWeeks(selectedSchool, selectedGrade);

        setWeeks(data);

        if (data.length > 0) {
          setSelectedWeek(data[0]);
        }
      } catch (error) {
        console.error("주차 목록 조회 실패", error);

        messageApi.error("주차 목록을 불러오지 못했습니다.");

        setWeeks([]);
        setSelectedWeek("");
        resetWeeklyData();
      } finally {
        setWeeksLoading(false);
      }
    };

    fetchWeeks();
  }, [selectedSchool, selectedGrade, messageApi]);

  // =======================================================
  // 최근 공지 조회
  // =======================================================

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

  // =======================================================
  // 선택 주차 수업 정보 조회
  // =======================================================

  useEffect(() => {
    if (!selectedWeek) {
      resetWeeklyData();
      return;
    }

    const fetchWeeklyData = async () => {
      try {
        setNoticeLoading(true);

        const data = await NoticeApi.getNotice(
          selectedSchool,
          selectedGrade,
          selectedWeek,
        );

        applyWeeklyData(data);
      } catch (error) {
        console.error("주차별 수업 정보 조회 실패", error);

        messageApi.error("수업 정보를 불러오지 못했습니다.");

        resetWeeklyData();
      } finally {
        setNoticeLoading(false);
      }
    };

    fetchWeeklyData();
  }, [selectedSchool, selectedGrade, selectedWeek, messageApi]);

  // =======================================================
  // 저장
  // =======================================================

  const handleSave = async () => {
    if (!selectedWeek) {
      return;
    }

    try {
      setSaving(true);

      const request: NoticeUpdateRequest = {
        schoolName: selectedSchool,
        grade: selectedGrade,
        weekLabel: selectedWeek,

        notice: notice.trim(),

        lessonDate: lessonDate.trim(),
        progress: progress.trim(),

        daily1: daily1.trim(),
        daily2: daily2.trim(),
        daily3: daily3.trim(),

        homework1: homework1.trim(),
        homework2: homework2.trim(),
        homework3: homework3.trim(),

        reviewTest: reviewTest.trim(),
        reviewQuestionCount,

        memorization1: memorization1.trim(),
        memorization2: memorization2.trim(),
      };

      const data = await NoticeApi.updateNotice(request);

      applyWeeklyData(data);

      const history = await NoticeApi.getHistory(selectedSchool, selectedGrade);

      setRecentNotices(history);

      messageApi.success("주차별 수업 정보를 저장했습니다.");
    } catch (error) {
      console.error("주차별 수업 정보 저장 실패", error);

      messageApi.error("수업 정보를 저장하지 못했습니다.");
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
          주차별 수업 관리
        </Title>

        <Card>
          <Row gutter={[16, 16]}>
            <Col xs={24} md={8}>
              <Text strong>학교 선택</Text>

              <Select
                value={selectedSchool}
                options={schoolOptions}
                style={{
                  width: "100%",
                  marginTop: 6,
                }}
                onChange={setSelectedSchool}
              />
            </Col>

            <Col xs={24} md={8}>
              <Text strong>학년 선택</Text>

              <Select
                value={selectedGrade}
                options={gradeOptions}
                style={{
                  width: "100%",
                  marginTop: 6,
                }}
                onChange={setSelectedGrade}
              />
            </Col>

            <Col xs={24} md={8}>
              <Text strong>주차 선택</Text>

              <Select
                value={selectedWeek || undefined}
                options={weekOptions}
                loading={weeksLoading}
                disabled={weeksLoading || weekOptions.length === 0}
                placeholder="주차 선택"
                style={{
                  width: "100%",
                  marginTop: 6,
                }}
                onChange={setSelectedWeek}
              />
            </Col>

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
                  onChange={(event) => setNotice(event.target.value)}
                  maxLength={50}
                  showCount
                  placeholder="공지사항을 입력하세요."
                />

                {noticeLoading && (
                  <Spin
                    size="small"
                    style={{
                      position: "absolute",
                      right: 12,
                      top: 8,
                    }}
                  />
                )}
              </div>
            </Col>

            <Col xs={24}>
              <Divider>수업 정보</Divider>
            </Col>

            <Col xs={24} md={8}>
              <Text strong>수업일</Text>

              <Input
                value={lessonDate}
                disabled={loading || !selectedWeek}
                placeholder="예: 2026-08-31"
                style={{
                  marginTop: 6,
                }}
                onChange={(event) => setLessonDate(event.target.value)}
              />
            </Col>

            <Col xs={24} md={16}>
              <Text strong>진도</Text>

              <Input
                value={progress}
                disabled={loading || !selectedWeek}
                placeholder="수업 진도를 입력하세요."
                style={{
                  marginTop: 6,
                }}
                onChange={(event) => setProgress(event.target.value)}
              />
            </Col>

            <Col xs={24}>
              <Divider>당일 평가</Divider>
            </Col>

            <Col xs={24} md={8}>
              <Text strong>당일 평가 1</Text>

              <Input
                value={daily1}
                disabled={loading || !selectedWeek}
                placeholder="평가 내용"
                style={{
                  marginTop: 6,
                }}
                onChange={(event) => setDaily1(event.target.value)}
              />
            </Col>

            <Col xs={24} md={8}>
              <Text strong>당일 평가 2</Text>

              <Input
                value={daily2}
                disabled={loading || !selectedWeek}
                placeholder="평가 내용"
                style={{
                  marginTop: 6,
                }}
                onChange={(event) => setDaily2(event.target.value)}
              />
            </Col>

            <Col xs={24} md={8}>
              <Text strong>당일 평가 3</Text>

              <Input
                value={daily3}
                disabled={loading || !selectedWeek}
                placeholder="평가 내용"
                style={{
                  marginTop: 6,
                }}
                onChange={(event) => setDaily3(event.target.value)}
              />
            </Col>

            <Col xs={24}>
              <Divider>숙제</Divider>
            </Col>

            <Col xs={24} md={8}>
              <Text strong>숙제 1</Text>

              <Input
                value={homework1}
                disabled={loading || !selectedWeek}
                placeholder="숙제 내용"
                style={{
                  marginTop: 6,
                }}
                onChange={(event) => setHomework1(event.target.value)}
              />
            </Col>

            <Col xs={24} md={8}>
              <Text strong>숙제 2</Text>

              <Input
                value={homework2}
                disabled={loading || !selectedWeek}
                placeholder="숙제 내용"
                style={{
                  marginTop: 6,
                }}
                onChange={(event) => setHomework2(event.target.value)}
              />
            </Col>

            <Col xs={24} md={8}>
              <Text strong>숙제 3</Text>

              <Input
                value={homework3}
                disabled={loading || !selectedWeek}
                placeholder="숙제 내용"
                style={{
                  marginTop: 6,
                }}
                onChange={(event) => setHomework3(event.target.value)}
              />
            </Col>

            <Col xs={24}>
              <Divider>복습 테스트</Divider>
            </Col>

            <Col xs={24} md={16}>
              <Text strong>복습 테스트명</Text>

              <Input
                value={reviewTest}
                disabled={loading || !selectedWeek}
                placeholder="예: 올포1,2강"
                style={{
                  marginTop: 6,
                }}
                onChange={(event) => setReviewTest(event.target.value)}
              />
            </Col>

            <Col xs={24} md={8}>
              <Text strong>복습 문항 개수</Text>

              <InputNumber
                value={reviewQuestionCount}
                disabled={loading || !selectedWeek}
                min={0}
                precision={0}
                placeholder="문항 수"
                style={{
                  width: "100%",
                  marginTop: 6,
                }}
                onChange={(value) => setReviewQuestionCount(value)}
              />
            </Col>

            <Col xs={24}>
              <Divider>암기반</Divider>
            </Col>

            <Col xs={24} md={12}>
              <Text strong>암기반 1</Text>

              <Input
                value={memorization1}
                disabled={loading || !selectedWeek}
                placeholder="암기반 1 내용"
                style={{
                  marginTop: 6,
                }}
                onChange={(event) => setMemorization1(event.target.value)}
              />
            </Col>

            <Col xs={24} md={12}>
              <Text strong>암기반 2</Text>

              <Input
                value={memorization2}
                disabled={loading || !selectedWeek}
                placeholder="암기반 2 내용"
                style={{
                  marginTop: 6,
                }}
                onChange={(event) => setMemorization2(event.target.value)}
              />
            </Col>

            <Col xs={24}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  marginTop: 8,
                }}
              >
                <Button
                  type="primary"
                  loading={saving}
                  disabled={loading || !selectedWeek}
                  onClick={handleSave}
                >
                  저장
                </Button>
              </div>
            </Col>
          </Row>
        </Card>

        {(historyLoading || recentNotices.length > 0) && (
          <Card
            title="최근 공지"
            style={{
              marginTop: 16,
            }}
          >
            {historyLoading ? (
              <div
                style={{
                  textAlign: "center",
                  padding: 16,
                }}
              >
                <Spin />
              </div>
            ) : (
              <Row gutter={[0, 12]}>
                {recentNotices.map((item) => (
                  <Col xs={24} key={item.weekLabel}>
                    <div>
                      <Text strong>{item.weekLabel}</Text>

                      <div
                        style={{
                          marginTop: 4,
                        }}
                      >
                        <Text>{item.notice}</Text>
                      </div>
                    </div>
                  </Col>
                ))}
              </Row>
            )}
          </Card>
        )}
      </div>
    </>
  );
}
