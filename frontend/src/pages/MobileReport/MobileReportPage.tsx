import { useLayoutEffect, useMemo, useRef, useState } from "react";

import html2canvas from "html2canvas";

import {
  Alert,
  Button,
  Card,
  Checkbox,
  Col,
  Input,
  Modal,
  Row,
  Segmented,
  Typography,
} from "antd";

import StudentApi from "@/api/StudentApi";
import { useStudentsQuery } from "@/hooks/useStudentsQuery";

import type { LessonRecord, StudentSummary } from "@/types/lessonRecord";

import MobileReportTemplate, {
  REPORT_FONT_NAME,
  REPORT_MAX_HEIGHT,
  REPORT_WIDTH,
} from "./MobileReportTemplate";

const { Title, Text } = Typography;

const TEACHER_NAME = "박현민";
const ALLOWED_SCHOOLS = ["인창고", "이화여고"];

interface ReportPreviewItem {
  student: StudentSummary;
  records: LessonRecord[];
}

export default function MobileReportPage() {
  const [keyword, setKeyword] = useState("");

  const [selectedGrade, setSelectedGrade] = useState("ALL");

  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);

  const [reportPreviews, setReportPreviews] = useState<ReportPreviewItem[]>([]);

  const [previewIndex, setPreviewIndex] = useState(0);

  const [imageSaving, setImageSaving] = useState(false);

  // 현재 미리보기 리포트 높이 (최대 1,080px 초과 여부 확인용)
  const [previewHeight, setPreviewHeight] = useState(0);

  // 현재 모달에서 보고 있는 학생 1명
  const reportPreviewRef = useRef<HTMLDivElement>(null);

  // 이미지 저장용 숨김 영역
  const reportPagesRef = useRef<HTMLDivElement>(null);

  const {
    data: students = [],
    isLoading,
    isError,
  } = useStudentsQuery(TEACHER_NAME);

  // =========================================================
  // 학년 옵션
  // =========================================================

  const gradeOptions = useMemo(() => {
    const grades = Array.from(
      new Set(
        students
          .filter((student) => ALLOWED_SCHOOLS.includes(student.schoolName))
          .map((student) => student.grade)
          .filter(Boolean),
      ),
    );

    return [
      {
        label: "전체",
        value: "ALL",
      },
      ...grades.map((grade) => ({
        label: grade,
        value: grade,
      })),
    ];
  }, [students]);

  // =========================================================
  // 학생 검색 / 학년 필터
  // =========================================================

  const filteredStudents = useMemo(() => {
    const cleanedKeyword = keyword.trim().toLowerCase();

    return students.filter((student) => {
      const matchesSchool = ALLOWED_SCHOOLS.includes(student.schoolName);

      const matchesGrade =
        selectedGrade === "ALL" || student.grade === selectedGrade;

      const searchableText =
        `${student.studentName} ${student.schoolName} ${student.grade}`.toLowerCase();

      const matchesKeyword =
        !cleanedKeyword || searchableText.includes(cleanedKeyword);

      return matchesSchool && matchesGrade && matchesKeyword;
    });
  }, [students, selectedGrade, keyword]);

  // =========================================================
  // 학생 선택
  // =========================================================

  const handleStudentChange = (studentId: string, checked: boolean) => {
    if (checked) {
      setSelectedStudentIds((prev) => {
        if (prev.includes(studentId)) {
          return prev;
        }

        return [...prev, studentId];
      });

      return;
    }

    setSelectedStudentIds((prev) => prev.filter((id) => id !== studentId));
  };

  // =========================================================
  // 전체 선택
  // =========================================================

  const handleSelectAll = (checked: boolean) => {
    const filteredStudentIds = filteredStudents.map(
      (student) => student.studentId,
    );

    if (checked) {
      setSelectedStudentIds((prev) => {
        const mergedIds = new Set([...prev, ...filteredStudentIds]);

        return Array.from(mergedIds);
      });

      return;
    }

    const filteredStudentIdSet = new Set(filteredStudentIds);

    setSelectedStudentIds((prev) =>
      prev.filter((id) => !filteredStudentIdSet.has(id)),
    );
  };

  const allSelected =
    filteredStudents.length > 0 &&
    filteredStudents.every((student) =>
      selectedStudentIds.includes(student.studentId),
    );

  // =========================================================
  // 리포트 미리보기 데이터 조회
  // =========================================================

  const handleCreatePreview = async () => {
    if (selectedStudentIds.length === 0) {
      return;
    }

    try {
      const recordsByStudent = await StudentApi.getLessonRecordsBatch(
        TEACHER_NAME,
        selectedStudentIds,
      );

      const studentReports = selectedStudentIds
        .map((studentId) => {
          const student = students.find((item) => item.studentId === studentId);

          if (!student) {
            return null;
          }

          return {
            student,
            records: [...(recordsByStudent[studentId] ?? [])].sort(
              (a, b) =>
                new Date(a.lessonDate).getTime() -
                new Date(b.lessonDate).getTime(),
            ),
          };
        })
        .filter((report): report is ReportPreviewItem => report !== null);

      setReportPreviews(studentReports);

      setPreviewIndex(0);
    } catch (error) {
      console.error("리포트 batch 데이터 조회 실패", error);
    }
  };

  // =========================================================
  // 미리보기 닫기
  // =========================================================

  const handleClosePreview = () => {
    setReportPreviews([]);
    setPreviewIndex(0);
  };

  // =========================================================
  // 미리보기 리포트 높이 측정
  // 코멘트가 길어 1,080px을 넘으면 경고를 띄운다.
  // =========================================================

  useLayoutEffect(() => {
    if (!reportPreviewRef.current) {
      setPreviewHeight(0);
      return;
    }

    setPreviewHeight(reportPreviewRef.current.offsetHeight);
  }, [reportPreviews, previewIndex]);

  // =========================================================
  // 리포트 영역 → PNG Blob
  //
  // 540 × 960px(9:16) 영역을 scale 2로 캡처 → 1080 × 1920px
  // 휴대폰 화면 비율(9:16)이라 카톡에서 한 화면에 꽉 차게 보인다.
  // =========================================================

  const captureReportToPng = async (element: HTMLElement) => {
    // 리포트 글꼴(보통·굵게)을 확실히 불러온 뒤에 캡처
    // (안 그러면 기본 글꼴로 찍힘)
    await Promise.all(
      [400, 500, 700].map((weight) =>
        document.fonts.load(`${weight} 16px "${REPORT_FONT_NAME}"`),
      ),
    ).catch(() => {
      // 글꼴을 못 불러와도 기본 글꼴로 저장은 진행
    });

    await document.fonts.ready;

    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#F1F4F8",
    });

    return new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob);
          return;
        }

        reject(new Error("이미지 변환 실패"));
      }, "image/png");
    });
  };

  // =========================================================
  // PNG 파일 다운로드
  // =========================================================

  const downloadBlob = (blob: Blob, fileName: string) => {
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;
    link.download = fileName;
    link.click();

    // 다운로드가 시작된 뒤 메모리 해제
    setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 1000);
  };

  // =========================================================
  // 숨김 영역에서 학생 리포트 요소 찾기
  //
  // 모달 안의 미리보기는 스크롤 영역 안에 있어서
  // 캡처하면 잘릴 수 있으므로 숨김 영역을 캡처한다.
  // =========================================================

  const findReportElement = (studentId: string) => {
    return reportPagesRef.current?.querySelector<HTMLElement>(
      `[data-student-id="${studentId}"]`,
    );
  };

  // =========================================================
  // 현재 학생 1명 PNG 저장
  // =========================================================

  const handleDownloadImage = async () => {
    const currentStudent = reportPreviews[previewIndex]?.student;

    if (!currentStudent) {
      return;
    }

    const reportElement = findReportElement(currentStudent.studentId);

    if (!reportElement) {
      return;
    }

    try {
      setImageSaving(true);

      const blob = await captureReportToPng(reportElement);

      downloadBlob(blob, `${currentStudent.studentName}_학습리포트.png`);
    } catch (error) {
      console.error("이미지 저장 실패", error);
    } finally {
      setImageSaving(false);
    }
  };

  // =========================================================
  // 선택 학생 전체 PNG 저장
  // 학생 1명 = PNG 1장
  //
  // 브라우저가 처음 한 번 "여러 파일 다운로드 허용"을 물어볼 수 있다.
  // =========================================================

  const handleDownloadAllImages = async () => {
    try {
      setImageSaving(true);

      for (const report of reportPreviews) {
        const reportElement = findReportElement(report.student.studentId);

        if (!reportElement) {
          continue;
        }

        const blob = await captureReportToPng(reportElement);

        downloadBlob(blob, `${report.student.studentName}_학습리포트.png`);

        // 연속 다운로드가 막히지 않도록 잠깐 쉬었다가 다음 학생
        await new Promise((resolve) => {
          setTimeout(resolve, 400);
        });
      }
    } catch (error) {
      console.error("전체 이미지 저장 실패", error);
    } finally {
      setImageSaving(false);
    }
  };

  return (
    <Card>
      {/* =====================================================
          제목
      ===================================================== */}

      <Title
        level={3}
        style={{
          marginTop: 0,
          marginBottom: 4,
        }}
      >
        모바일 리포트
      </Title>

      <Text type="secondary">리포트 이미지로 저장할 학생을 선택해주세요.</Text>

      {/* =====================================================
          필터
      ===================================================== */}

      <div
        style={{
          marginTop: 18,
          display: "flex",
          gap: 12,
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <Segmented
          options={gradeOptions}
          value={selectedGrade}
          onChange={(value) => {
            setSelectedGrade(String(value));
            setSelectedStudentIds([]);
          }}
        />

        <Input.Search
          placeholder="학생 이름 / 학교 / 학년 검색"
          allowClear
          value={keyword}
          onChange={(event) => {
            setKeyword(event.target.value);
          }}
          style={{
            flex: 1,
            minWidth: 260,
          }}
        />
      </div>

      {/* =====================================================
          전체 선택
      ===================================================== */}

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginTop: 14,
          marginBottom: 12,
        }}
      >
        <Checkbox
          checked={allSelected}
          onChange={(event) => {
            handleSelectAll(event.target.checked);
          }}
        >
          전체 선택
        </Checkbox>

        <Text type="secondary">조회 {filteredStudents.length}명</Text>
      </div>

      {/* =====================================================
          학생 목록
      ===================================================== */}

      {isLoading ? (
        <Card
          size="small"
          style={{
            textAlign: "center",
          }}
        >
          <Text type="secondary">학생 목록을 불러오는 중입니다.</Text>
        </Card>
      ) : isError ? (
        <Card
          size="small"
          style={{
            textAlign: "center",
          }}
        >
          <Text type="danger">학생 목록을 불러오지 못했습니다.</Text>
        </Card>
      ) : (
        <Row gutter={[10, 10]}>
          {filteredStudents.map((student) => {
            const selected = selectedStudentIds.includes(student.studentId);

            return (
              <Col key={student.studentId} xs={24} sm={12} lg={8} xl={6}>
                <Card
                  hoverable
                  size="small"
                  onClick={() => {
                    handleStudentChange(student.studentId, !selected);
                  }}
                  style={{
                    height: "100%",
                    cursor: "pointer",

                    border: selected
                      ? "1px solid #1677ff"
                      : "1px solid #f0f0f0",

                    background: selected ? "#e6f4ff" : "#ffffff",
                  }}
                  styles={{
                    body: {
                      padding: "10px 12px",
                    },
                  }}
                >
                  <Checkbox
                    checked={selected}
                    onClick={(event) => {
                      event.stopPropagation();
                    }}
                    onChange={(event) => {
                      handleStudentChange(
                        student.studentId,
                        event.target.checked,
                      );
                    }}
                  >
                    <Text
                      strong
                      style={{
                        fontSize: 14,
                      }}
                    >
                      {student.studentName}
                    </Text>

                    <Text
                      type="secondary"
                      style={{
                        marginLeft: 7,
                        fontSize: 12,
                      }}
                    >
                      {student.schoolName} / {student.grade}
                    </Text>
                  </Checkbox>
                </Card>
              </Col>
            );
          })}
        </Row>
      )}

      {/* =====================================================
          하단 선택 상태
      ===================================================== */}

      <div
        style={{
          position: "sticky",
          bottom: 0,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginTop: 20,
          padding: "12px 0 4px",
          background: "#ffffff",
          borderTop: "1px solid #f0f0f0",
          zIndex: 10,
        }}
      >
        <Text>
          선택 학생 <Text strong>{selectedStudentIds.length}명</Text>
        </Text>

        <Button
          type="primary"
          size="large"
          disabled={selectedStudentIds.length === 0}
          onClick={handleCreatePreview}
        >
          리포트 미리보기
        </Button>
      </div>

      {/* =====================================================
          리포트 미리보기 Modal
      ===================================================== */}

      <Modal
        title="리포트 미리보기"
        open={reportPreviews.length > 0}
        onCancel={handleClosePreview}
        width={REPORT_WIDTH + 60}
        centered
        destroyOnHidden
        footer={[
          <Button key="close" onClick={handleClosePreview}>
            닫기
          </Button>,

          <Button
            key="currentPdf"
            loading={imageSaving}
            onClick={handleDownloadImage}
          >
            현재 학생 저장
          </Button>,

          <Button
            key="allPdf"
            type="primary"
            loading={imageSaving}
            onClick={handleDownloadAllImages}
          >
            전체 저장
          </Button>,
        ]}
        styles={{
          body: {
            maxHeight: "68vh",
            overflowY: "auto",
          },
        }}
      >
        {reportPreviews.length > 0 && (
          <>
            {/* 페이지 이동 */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 12,
              }}
            >
              <Button
                disabled={previewIndex === 0}
                onClick={() => {
                  setPreviewIndex((prev) => prev - 1);
                }}
              >
                이전
              </Button>

              <Text strong>
                {previewIndex + 1} / {reportPreviews.length}
              </Text>

              <Button
                disabled={previewIndex === reportPreviews.length - 1}
                onClick={() => {
                  setPreviewIndex((prev) => prev + 1);
                }}
              >
                다음
              </Button>
            </div>

            {/* 높이 초과 경고 */}
            {previewHeight > REPORT_MAX_HEIGHT && (
              <Alert
                type="warning"
                showIcon
                style={{
                  marginBottom: 12,
                }}
                message={`코멘트가 길어 리포트 높이가 ${previewHeight}px입니다. (권장 최대 ${REPORT_MAX_HEIGHT}px) 코멘트를 줄이면 카톡에서 더 크게 보입니다.`}
              />
            )}

            {/* 현재 학생 리포트 */}
            <MobileReportTemplate
              ref={reportPreviewRef}
              studentName={reportPreviews[previewIndex].student.studentName}
              schoolName={reportPreviews[previewIndex].student.schoolName}
              grade={reportPreviews[previewIndex].student.grade}
              teacherName={reportPreviews[previewIndex].student.teacherName}
              records={reportPreviews[previewIndex].records}
            />
          </>
        )}
      </Modal>

      {/* =====================================================
          이미지 저장용 숨김 렌더링 영역

          화면에는 보이지 않지만
          선택한 학생 전체가 여기 렌더링됨.

          학생 15명 선택
          → MobileReportTemplate 15개 생성
          → html2canvas로 하나씩 캡처
          → PNG 15장 저장
      ===================================================== */}

      <div
        ref={reportPagesRef}
        style={{
          position: "fixed",
          left: "-100000px",
          top: 0,
          width: REPORT_WIDTH,
          pointerEvents: "none",
        }}
      >
        {reportPreviews.map((report) => (
          <div
            key={report.student.studentId}
            data-student-id={report.student.studentId}
            style={{
              width: REPORT_WIDTH,
            }}
          >
            <MobileReportTemplate
              studentName={report.student.studentName}
              schoolName={report.student.schoolName}
              grade={report.student.grade}
              teacherName={report.student.teacherName}
              records={report.records}
            />
          </div>
        ))}
      </div>
    </Card>
  );
}
