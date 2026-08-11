// import {
//   Card,
//   Descriptions,
//   Select,
//   Space,
//   Spin,
//   Table,
//   Typography,
// } from "antd";
// import type { TableColumnsType } from "antd";
// import { useEffect, useMemo, useState } from "react";

// import StudentApi from "../../api/StudentApi";
// import type { LessonRecord } from "../../types/lessonRecord";

// const { Title } = Typography;

// interface StudentSummary {
//   studentId: string;
//   studentName: string;
//   schoolName: string;
//   grade: string;
//   teacherName: string;
// }

// function formatScore(value: number | null | undefined): string {
//   return value == null ? "-" : `${value}점`;
// }

// function formatText(value: string | null | undefined): string {
//   return value?.trim() || "-";
// }

// function StudentPage() {
//   const [allLessonRecords, setAllLessonRecords] = useState<LessonRecord[]>([]);
//   const [selectedStudentId, setSelectedStudentId] = useState<string>();
//   const [loading, setLoading] = useState(false);

//   const teacherCode = localStorage.getItem("teacherCode") ?? "";

//   useEffect(() => {
//     const loadLessonRecords = async () => {
//       if (!teacherCode) {
//         setAllLessonRecords([]);
//         setSelectedStudentId(undefined);
//         return;
//       }

//       setLoading(true);

//       try {
//         const records = await StudentApi.getLessonRecords(teacherCode);

//         setAllLessonRecords(records);

//         if (records.length > 0) {
//           setSelectedStudentId((currentStudentId) => {
//             const currentStudentExists = records.some(
//               (record) => record.studentId === currentStudentId,
//             );

//             return currentStudentExists
//               ? currentStudentId
//               : records[0].studentId;
//           });
//         } else {
//           setSelectedStudentId(undefined);
//         }
//       } catch (error) {
//         console.error("수업 기록 조회 실패:", error);
//         setAllLessonRecords([]);
//         setSelectedStudentId(undefined);
//       } finally {
//         setLoading(false);
//       }
//     };

//     void loadLessonRecords();
//   }, [teacherCode]);

//   const students = useMemo<StudentSummary[]>(() => {
//     const studentMap = new Map<string, StudentSummary>();

//     allLessonRecords.forEach((record) => {
//       if (studentMap.has(record.studentId)) {
//         return;
//       }

//       studentMap.set(record.studentId, {
//         studentId: record.studentId,
//         studentName: record.studentName,
//         schoolName: record.schoolName,
//         grade: record.grade,
//         teacherName: record.teacherName,
//       });
//     });

//     return Array.from(studentMap.values());
//   }, [allLessonRecords]);

//   const selectedStudent = useMemo(
//     () => students.find((student) => student.studentId === selectedStudentId),
//     [selectedStudentId, students],
//   );

//   const lessonRecords = useMemo(
//     () =>
//       allLessonRecords
//         .filter((record) => record.studentId === selectedStudentId)
//         .sort(
//           (a, b) =>
//             new Date(b.lessonDate).getTime() - new Date(a.lessonDate).getTime(),
//         ),
//     [allLessonRecords, selectedStudentId],
//   );

//   const lessonColumns: TableColumnsType<LessonRecord> = [
//     {
//       title: "번호",
//       dataIndex: "number",
//       key: "number",
//       width: 70,
//       render: (value: number | null | undefined) => value ?? "-",
//     },
//     {
//       title: "구분",
//       dataIndex: "category",
//       key: "category",
//       width: 110,
//       render: formatText,
//     },
//     {
//       title: "주차",
//       dataIndex: "weekLabel",
//       key: "weekLabel",
//       width: 100,
//       render: formatText,
//     },
//     {
//       title: "수업일",
//       dataIndex: "lessonDate",
//       key: "lessonDate",
//       width: 120,
//       render: formatText,
//     },
//     {
//       title: "진도",
//       dataIndex: "progress",
//       key: "progress",
//       width: 160,
//       render: formatText,
//     },
//     ...[0, 1, 2].map((index) => ({
//       title: `숙제 ${index + 1}`,
//       children: [
//         {
//           title: "내용",
//           key: `homework-${index}-name`,
//           width: 220,
//           render: (_: unknown, record: LessonRecord) =>
//             formatText(record.homeworks[index]?.name),
//         },
//         {
//           title: "성취도",
//           key: `homework-${index}-achievement`,
//           width: 90,
//           render: (_: unknown, record: LessonRecord) =>
//             formatScore(record.homeworks[index]?.achievement),
//         },
//       ],
//     })),
//     {
//       title: "숙제 종합",
//       children: [
//         {
//           title: "성취도",
//           dataIndex: "homeworkAchievement",
//           key: "homeworkAchievement",
//           width: 90,
//           render: formatScore,
//         },
//         {
//           title: "등급",
//           dataIndex: "homeworkGrade",
//           key: "homeworkGrade",
//           width: 90,
//           render: formatText,
//         },
//       ],
//     },
//   ];

//   const evaluationColumns: TableColumnsType<LessonRecord> = [
//     {
//       title: "수업일",
//       dataIndex: "lessonDate",
//       key: "lessonDate",
//       width: 120,
//       fixed: "left",
//       render: formatText,
//     },
//     ...[0, 1, 2].map((index) => ({
//       title: `당일 ${index + 1}`,
//       children: [
//         {
//           title: "내용",
//           key: `daily-${index}-name`,
//           width: 180,
//           render: (_: unknown, record: LessonRecord) =>
//             formatText(record.dailyEvaluations[index]?.name),
//         },
//         {
//           title: "성취도",
//           key: `daily-${index}-achievement`,
//           width: 90,
//           render: (_: unknown, record: LessonRecord) =>
//             formatScore(record.dailyEvaluations[index]?.achievement),
//         },
//       ],
//     })),
//     {
//       title: "당일 종합",
//       children: [
//         {
//           title: "성취도",
//           dataIndex: "dailyAchievement",
//           key: "dailyAchievement",
//           width: 90,
//           render: formatScore,
//         },
//         {
//           title: "등급",
//           dataIndex: "dailyGrade",
//           key: "dailyGrade",
//           width: 90,
//           render: formatText,
//         },
//       ],
//     },
//     {
//       title: "복습 테스트",
//       children: [
//         {
//           title: "테스트",
//           dataIndex: "reviewTest",
//           key: "reviewTest",
//           width: 140,
//           render: formatText,
//         },
//         {
//           title: "문항 수",
//           dataIndex: "reviewQuestionCount",
//           key: "reviewQuestionCount",
//           width: 90,
//           render: (value: number | null | undefined) => value ?? "-",
//         },
//         {
//           title: "정답 수",
//           dataIndex: "reviewCorrectCount",
//           key: "reviewCorrectCount",
//           width: 90,
//           render: (value: number | null | undefined) => value ?? "-",
//         },
//         {
//           title: "점수",
//           dataIndex: "reviewTestScore",
//           key: "reviewTestScore",
//           width: 80,
//           render: formatScore,
//         },
//         {
//           title: "피드백",
//           dataIndex: "reviewFeedback",
//           key: "reviewFeedback",
//           width: 180,
//           render: formatText,
//         },
//       ],
//     },
//     {
//       title: "암기반",
//       children: [
//         {
//           title: "암기반 1",
//           dataIndex: "memorizationClass1",
//           key: "memorizationClass1",
//           width: 180,
//           render: formatText,
//         },
//         {
//           title: "암기반 2",
//           dataIndex: "memorizationClass2",
//           key: "memorizationClass2",
//           width: 180,
//           render: formatText,
//         },
//         {
//           title: "결과",
//           dataIndex: "memorizationAchievement",
//           key: "memorizationAchievement",
//           width: 110,
//           render: formatText,
//         },
//       ],
//     },
//     {
//       title: "쌤 한마디",
//       dataIndex: "teacherComment",
//       key: "teacherComment",
//       width: 350,
//       render: formatText,
//     },
//     {
//       title: "Notice",
//       dataIndex: "notice",
//       key: "notice",
//       width: 350,
//       render: formatText,
//     },
//   ];

//   const handleStudentChange = (studentId: string) => {
//     setSelectedStudentId(studentId);
//   };

//   return (
//     <div style={{ padding: 24 }}>
//       <Title level={2}>Student AI</Title>

//       <Spin spinning={loading}>
//         <Space direction="vertical" size="large" style={{ width: "100%" }}>
//           <Select
//             showSearch
//             placeholder="학생 선택"
//             value={selectedStudentId}
//             optionFilterProp="label"
//             onChange={handleStudentChange}
//             style={{ width: 400, maxWidth: "100%" }}
//             options={students.map((student) => ({
//               value: student.studentId,
//               label: `${student.studentName} (${student.schoolName}/${student.grade})`,
//             }))}
//           />

//           {selectedStudent && (
//             <Card title="학생 정보">
//               <Descriptions
//                 column={{ xs: 1, sm: 2, lg: 3 }}
//                 bordered
//                 size="small"
//               >
//                 <Descriptions.Item label="학생 ID">
//                   {selectedStudent.studentId}
//                 </Descriptions.Item>

//                 <Descriptions.Item label="이름">
//                   {selectedStudent.studentName}
//                 </Descriptions.Item>

//                 <Descriptions.Item label="학교">
//                   {selectedStudent.schoolName}
//                 </Descriptions.Item>

//                 <Descriptions.Item label="학년">
//                   {selectedStudent.grade}
//                 </Descriptions.Item>

//                 <Descriptions.Item label="담당">
//                   {selectedStudent.teacherName}
//                 </Descriptions.Item>
//               </Descriptions>
//             </Card>
//           )}

//           {selectedStudent && (
//             <>
//               <Title level={4}>수업 및 숙제 기록</Title>

//               <Table<LessonRecord>
//                 rowKey="recordId"
//                 columns={lessonColumns}
//                 dataSource={lessonRecords}
//                 loading={loading}
//                 pagination={false}
//                 scroll={{ x: 1700 }}
//                 bordered
//                 size="small"
//                 locale={{
//                   emptyText: "수업 기록이 없습니다.",
//                 }}
//               />

//               <Title level={4} style={{ marginTop: 32 }}>
//                 평가 및 전달사항
//               </Title>

//               <Table<LessonRecord>
//                 rowKey="recordId"
//                 columns={evaluationColumns}
//                 dataSource={lessonRecords}
//                 loading={loading}
//                 pagination={false}
//                 scroll={{ x: 2300 }}
//                 bordered
//                 size="small"
//                 locale={{
//                   emptyText: "평가 기록이 없습니다.",
//                 }}
//               />
//             </>
//           )}
//         </Space>
//       </Spin>
//     </div>
//   );
// }

// export default StudentPage;
