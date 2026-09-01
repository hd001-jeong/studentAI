import { useMemo, useRef, useState } from "react";

import html2canvas from "html2canvas";
import jsPDF from "jspdf";

import {
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

import StudentReportPreview from "./StudentReportPreview";

const { Title, Text } = Typography;

const TEACHER_NAME = "박현민";

interface ReportPreviewItem {
  student: StudentSummary;
  records: LessonRecord[];
}

export default function StudentReportPage() {
  const [keyword, setKeyword] = useState("");

  const [selectedGrade, setSelectedGrade] = useState("ALL");

  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);

  const [reportPreviews, setReportPreviews] = useState<ReportPreviewItem[]>([]);

  const [previewIndex, setPreviewIndex] = useState(0);

  const [pdfGenerating, setPdfGenerating] = useState(false);

  // 현재 모달에서 보고 있는 학생 1명
  const reportPreviewRef = useRef<HTMLDivElement>(null);

  // 전체 학생 PDF 생성용 숨김 영역
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
      new Set(students.map((student) => student.grade).filter(Boolean)),
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
      const matchesGrade =
        selectedGrade === "ALL" || student.grade === selectedGrade;

      const searchableText =
        `${student.studentName} ${student.schoolName} ${student.grade}`.toLowerCase();

      const matchesKeyword =
        !cleanedKeyword || searchableText.includes(cleanedKeyword);

      return matchesGrade && matchesKeyword;
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
  // PDF 미리보기 데이터 조회
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
  // 현재 학생 1명 PDF 생성
  // =========================================================

  const handleDownloadPdf = async () => {
    if (!reportPreviewRef.current) {
      return;
    }

    try {
      setPdfGenerating(true);

      const canvas = await html2canvas(reportPreviewRef.current, {
        scale: 1.7,
        useCORS: true,
        backgroundColor: "#ffffff",
      });

      const imageData = canvas.toDataURL("image/jpeg", 0.95);

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const pageWidth = pdf.internal.pageSize.getWidth();

      const pageHeight = pdf.internal.pageSize.getHeight();

      const margin = 10;

      const availableWidth = pageWidth - margin * 2;

      const availableHeight = pageHeight - margin * 2;

      const imageRatio = canvas.width / canvas.height;

      const pageRatio = availableWidth / availableHeight;

      let finalWidth = availableWidth;

      let finalHeight = availableWidth / imageRatio;

      if (imageRatio < pageRatio) {
        finalHeight = availableHeight;

        finalWidth = availableHeight * imageRatio;
      }

      pdf.addImage(
        imageData,
        "JPEG",
        (pageWidth - finalWidth) / 2,
        (pageHeight - finalHeight) / 2,
        finalWidth,
        finalHeight,
      );

      const currentStudent = reportPreviews[previewIndex]?.student;

      const fileName = currentStudent
        ? `${currentStudent.studentName}_학습리포트.pdf`
        : "학습리포트.pdf";

      pdf.save(fileName);
    } catch (error) {
      console.error("PDF 생성 실패", error);
    } finally {
      setPdfGenerating(false);
    }
  };

  // =========================================================
  // 선택 학생 전체 PDF 생성
  // 학생 1명 = PDF 1페이지
  // =========================================================

  const handleDownloadAllPdf = async () => {
    if (!reportPagesRef.current) {
      return;
    }

    try {
      setPdfGenerating(true);

      const pageElements = reportPagesRef.current.querySelectorAll<HTMLElement>(
        '[data-pdf-page="true"]',
      );

      if (pageElements.length === 0) {
        return;
      }

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const pageWidth = pdf.internal.pageSize.getWidth();

      const pageHeight = pdf.internal.pageSize.getHeight();

      const margin = 10;

      const availableWidth = pageWidth - margin * 2;

      const availableHeight = pageHeight - margin * 2;

      for (let index = 0; index < pageElements.length; index += 1) {
        const pageElement = pageElements[index];

        const canvas = await html2canvas(pageElement, {
          scale: 1.7,
          useCORS: true,
          backgroundColor: "#ffffff",
        });

        const imageData = canvas.toDataURL("image/jpeg", 0.9);

        const imageRatio = canvas.width / canvas.height;

        const pageRatio = availableWidth / availableHeight;

        let finalWidth = availableWidth;

        let finalHeight = availableWidth / imageRatio;

        if (imageRatio < pageRatio) {
          finalHeight = availableHeight;

          finalWidth = availableHeight * imageRatio;
        }

        if (index > 0) {
          pdf.addPage();
        }

        pdf.addImage(
          imageData,
          "JPEG",
          (pageWidth - finalWidth) / 2,
          (pageHeight - finalHeight) / 2,
          finalWidth,
          finalHeight,
        );
      }

      pdf.save(`학생학습리포트_${reportPreviews.length}명.pdf`);
    } catch (error) {
      console.error("전체 PDF 생성 실패", error);
    } finally {
      setPdfGenerating(false);
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
        리포트
      </Title>

      <Text type="secondary">PDF로 출력할 학생을 선택해주세요.</Text>

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
          PDF 미리보기
        </Button>
      </div>

      {/* =====================================================
          PDF 미리보기 Modal
      ===================================================== */}

      <Modal
        title="PDF 미리보기"
        open={reportPreviews.length > 0}
        onCancel={handleClosePreview}
        width={1200}
        centered
        destroyOnHidden
        footer={[
          <Button key="close" onClick={handleClosePreview}>
            닫기
          </Button>,

          <Button
            key="currentPdf"
            loading={pdfGenerating}
            onClick={handleDownloadPdf}
          >
            현재 학생 PDF
          </Button>,

          <Button
            key="allPdf"
            type="primary"
            loading={pdfGenerating}
            onClick={handleDownloadAllPdf}
          >
            전체 PDF 생성
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

            {/* 현재 학생 리포트 */}
            <StudentReportPreview
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
          전체 PDF 생성용 숨김 렌더링 영역

          화면에는 보이지 않지만
          선택한 학생 전체가 여기 렌더링됨.

          학생 15명 선택
          → StudentReportPreview 15개 생성
          → html2canvas로 하나씩 캡처
          → PDF 15페이지 생성
      ===================================================== */}

      <div
        ref={reportPagesRef}
        style={{
          position: "fixed",
          left: "-100000px",
          top: 0,
          width: 1200,
          pointerEvents: "none",
        }}
      >
        {reportPreviews.map((report) => (
          <div
            key={report.student.studentId}
            data-pdf-page="true"
            style={{
              width: 1200,
            }}
          >
            <StudentReportPreview
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
