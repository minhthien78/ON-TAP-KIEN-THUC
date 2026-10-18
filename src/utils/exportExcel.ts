import * as XLSX from 'xlsx';
import { StudentSubmission, Exam } from '../types/exam';

/**
 * Exports student submissions of an exam to a professionally formatted Excel (.xlsx) workbook.
 */
export function exportSubmissionsToExcel(exam: Exam, submissions: StudentSubmission[]): void {
  const wb = XLSX.utils.book_new();

  // Sheet 1: Summary Table (Bảng Điểm Tổng Hợp)
  const summaryRows = submissions.map((sub, idx) => ({
    'STT': idx + 1,
    'Họ và tên': sub.studentName,
    'Lớp': sub.studentClass,
    'Điểm số (Thang 10)': sub.score,
    'Số câu đúng': sub.correctCount,
    'Số câu sai': sub.incorrectCount,
    'Tổng số câu': sub.totalQuestions,
    'Thời gian làm bài (giây)': sub.durationSeconds,
    'Thời gian nộp': new Date(sub.submittedAt).toLocaleString('vi-VN'),
  }));

  const summaryWs = XLSX.utils.json_to_sheet(summaryRows.length > 0 ? summaryRows : [
    { 'Thông báo': 'Chưa có học sinh nào nộp bài' }
  ]);

  // Adjust column widths for Sheet 1
  summaryWs['!cols'] = [
    { wch: 6 },
    { wch: 25 },
    { wch: 12 },
    { wch: 18 },
    { wch: 14 },
    { wch: 14 },
    { wch: 14 },
    { wch: 22 },
    { wch: 22 },
  ];

  XLSX.utils.book_append_sheet(wb, summaryWs, 'Bang_Diem_Tong_Hop');

  // Sheet 2: Question-by-Question Breakdown (Chi Tiết Từng Câu)
  if (submissions.length > 0) {
    const detailedRows: any[] = [];
    submissions.forEach(sub => {
      sub.details.forEach(d => {
        detailedRows.push({
          'Họ và tên': sub.studentName,
          'Lớp': sub.studentClass,
          'Phần': `Phần ${d.section}`,
          'Câu số': d.questionNumber,
          'Kết quả': d.isCorrect ? 'Đúng' : 'Sai',
          'Điểm đạt': Number(d.pointsEarned.toFixed(2)),
          'Điểm tối đa': Number(d.maxPoints.toFixed(2)),
          'Đáp án học sinh': typeof d.studentAnswer === 'object' ? JSON.stringify(d.studentAnswer) : String(d.studentAnswer),
          'Đáp án chuẩn': typeof d.correctAnswer === 'object' ? JSON.stringify(d.correctAnswer) : String(d.correctAnswer),
        });
      });
    });

    const detailedWs = XLSX.utils.json_to_sheet(detailedRows);
    detailedWs['!cols'] = [
      { wch: 22 },
      { wch: 10 },
      { wch: 10 },
      { wch: 8 },
      { wch: 10 },
      { wch: 10 },
      { wch: 12 },
      { wch: 25 },
      { wch: 25 },
    ];
    XLSX.utils.book_append_sheet(wb, detailedWs, 'Chi_Tiet_Tung_Cau');
  }

  // Trigger download
  const safeTitle = (exam.title || 'Ket_Qua_Thi').replace(/[^a-zA-Z0-9_\u00C0-\u1EF9]/g, '_');
  const filename = `${exam.code}_${safeTitle}_${new Date().toISOString().slice(0, 10)}.xlsx`;
  XLSX.writeFile(wb, filename);
}

/**
 * Quick CSV export fallback
 */
export function exportSubmissionsToCSV(exam: Exam, submissions: StudentSubmission[]): void {
  const headers = ['STT', 'Họ và tên', 'Lớp', 'Điểm (Thang 10)', 'Số câu đúng', 'Số câu sai', 'Tổng câu', 'Thời gian nộp'];
  const rows = submissions.map((sub, idx) => [
    idx + 1,
    `"${sub.studentName.replace(/"/g, '""')}"`,
    `"${sub.studentClass.replace(/"/g, '""')}"`,
    sub.score,
    sub.correctCount,
    sub.incorrectCount,
    sub.totalQuestions,
    `"${new Date(sub.submittedAt).toLocaleString('vi-VN')}"`
  ]);

  const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${exam.code}_KetQua.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
