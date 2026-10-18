import React, { useState } from 'react';
import {
  FileSpreadsheet,
  ArrowUpDown,
  Search,
  Eye,
  CheckCircle2,
  XCircle,
  Clock,
  User,
  Users,
  Award,
  ChevronLeft,
  X,
  FileDown
} from 'lucide-react';
import { Exam, StudentSubmission, SubmissionQuestionDetail } from '../types/exam';
import { exportSubmissionsToExcel, exportSubmissionsToCSV } from '../utils/exportExcel';
import { ChemistryRenderer } from '../utils/chemistry';

interface TeacherResultsProps {
  exam: Exam;
  submissions: StudentSubmission[];
  onBackToExams: () => void;
  onGoToTest: (code: string) => void;
}

export const TeacherResults: React.FC<TeacherResultsProps> = ({
  exam,
  submissions,
  onBackToExams,
  onGoToTest,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'score-desc' | 'score-asc' | 'name' | 'time'>('time');
  const [selectedSubmission, setSelectedSubmission] = useState<StudentSubmission | null>(null);

  // Statistics calculation
  const totalStudents = submissions.length;
  const averageScore = totalStudents > 0
    ? (submissions.reduce((acc, s) => acc + s.score, 0) / totalStudents).toFixed(2)
    : '0';
  const maxScore = totalStudents > 0
    ? Math.max(...submissions.map(s => s.score))
    : 0;
  const passCount = submissions.filter(s => s.score >= 5.0).length;
  const passRate = totalStudents > 0
    ? ((passCount / totalStudents) * 100).toFixed(1)
    : '0';

  // Filter and sort
  const filteredSubmissions = submissions
    .filter(s =>
      s.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.studentClass.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'score-desc') return b.score - a.score;
      if (sortBy === 'score-asc') return a.score - b.score;
      if (sortBy === 'name') return a.studentName.localeCompare(b.studentName, 'vi');
      return new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime();
    });

  const handleExportExcel = () => {
    exportSubmissionsToExcel(exam, submissions);
  };

  const handleExportCSV = () => {
    exportSubmissionsToCSV(exam, submissions);
  };

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6">
      {/* Top Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <button
          onClick={onBackToExams}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Quay lại danh sách đề thi</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onGoToTest(exam.code)}
            className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors"
          >
            Làm Bài Thử Nghiệm
          </button>

          <button
            onClick={handleExportExcel}
            className="px-4 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Xuất Excel (.xlsx)</span>
          </button>
        </div>
      </div>

      {/* Exam Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                {exam.code}
              </span>
              <span className="text-xs text-slate-400">·</span>
              <span className="text-xs text-slate-500">{exam.grade || 'Lớp 12'}</span>
              <span className="text-xs text-slate-400">·</span>
              <span className="text-xs text-slate-500">{exam.durationMinutes} phút</span>
            </div>
            <h1 className="text-xl font-bold text-slate-900 mt-1">
              Bảng Điểm & Quản Lý Kết Quả: {exam.title}
            </h1>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 text-center">
              <span className="text-[11px] text-slate-500 block">Số Học Sinh</span>
              <span className="text-base font-bold text-slate-900 tabular-nums">
                {totalStudents}
              </span>
            </div>
            <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 text-center">
              <span className="text-[11px] text-slate-500 block">Điểm Trung Bình</span>
              <span className="text-base font-bold text-teal-700 tabular-nums">
                {averageScore}
              </span>
            </div>
            <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 text-center">
              <span className="text-[11px] text-slate-500 block">Điểm Cao Nhất</span>
              <span className="text-base font-bold text-emerald-700 tabular-nums">
                {maxScore}
              </span>
            </div>
            <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 text-center">
              <span className="text-[11px] text-slate-500 block">Tỷ Lệ Đạt (≥5đ)</span>
              <span className="text-base font-bold text-slate-900 tabular-nums">
                {passRate}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Search & Sort Controls */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs mb-6 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm theo tên học sinh hoặc lớp..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:border-teal-600 focus:bg-white"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <span className="text-xs text-slate-500 whitespace-nowrap">Sắp xếp:</span>
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value as any)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 font-medium focus:outline-hidden"
          >
            <option value="time">Thời gian nộp mới nhất</option>
            <option value="score-desc">Điểm cao xuống thấp</option>
            <option value="score-asc">Điểm thấp lên cao</option>
            <option value="name">Tên học sinh (A-Z)</option>
          </select>
        </div>
      </div>

      {/* Submissions Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        {filteredSubmissions.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <h3 className="text-sm font-semibold text-slate-800">
              Chưa có kết quả nộp bài nào
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Hãy gửi mã đề hoặc đường dẫn làm bài cho học sinh. Khi học sinh bấm nộp bài, kết quả sẽ tự động hiển thị tại đây.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                  <th className="py-3 px-4 w-12 text-center">STT</th>
                  <th className="py-3 px-4">Họ Và Tên</th>
                  <th className="py-3 px-4">Lớp</th>
                  <th className="py-3 px-4 text-center">Điểm Số (/10)</th>
                  <th className="py-3 px-4 text-center">Đúng / Sai</th>
                  <th className="py-3 px-4 text-center">Thời Gian Làm</th>
                  <th className="py-3 px-4">Thời Gian Nộp</th>
                  <th className="py-3 px-4 text-center">Chi Tiết</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredSubmissions.map((sub, idx) => {
                  const isHigh = sub.score >= 8.0;
                  const isLow = sub.score < 5.0;

                  return (
                    <tr key={sub.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4 text-center text-slate-400 tabular-nums">
                        {idx + 1}
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-900">
                        {sub.studentName}
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        {sub.studentClass}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-block font-mono font-bold text-sm px-2 py-0.5 rounded ${
                            isHigh
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : isLow
                              ? 'bg-rose-50 text-rose-700 border border-rose-200'
                              : 'bg-teal-50 text-teal-800 border border-teal-200'
                          }`}
                        >
                          {sub.score.toFixed(2)}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center tabular-nums">
                        <span className="text-emerald-700 font-medium">{sub.correctCount}</span>
                        <span className="text-slate-400 mx-1">/</span>
                        <span className="text-rose-600 font-medium">{sub.incorrectCount}</span>
                      </td>
                      <td className="py-3 px-4 text-center text-slate-600 tabular-nums">
                        {Math.floor(sub.durationSeconds / 60)}p {sub.durationSeconds % 60}s
                      </td>
                      <td className="py-3 px-4 text-slate-600 tabular-nums">
                        {new Date(sub.submittedAt).toLocaleTimeString('vi-VN', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}{' '}
                        {new Date(sub.submittedAt).toLocaleDateString('vi-VN')}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => setSelectedSubmission(sub)}
                          className="px-2.5 py-1 text-xs font-semibold text-teal-700 hover:bg-teal-50 rounded-lg transition-colors inline-flex items-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Xem bài</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ==================== STUDENT SUBMISSION DETAIL MODAL ==================== */}
      {selectedSubmission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Bài Làm Chi Tiết: {selectedSubmission.studentName}
                </h3>
                <span className="text-xs text-slate-500">
                  Lớp: {selectedSubmission.studentClass} · Điểm số: {selectedSubmission.score}/10 ({selectedSubmission.correctCount}/{selectedSubmission.totalQuestions} câu đúng)
                </span>
              </div>
              <button
                onClick={() => setSelectedSubmission(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Scroll Content */}
            <div className="p-6 overflow-y-auto space-y-6">
              {selectedSubmission.details.map((detail, idx) => (
                <div
                  key={detail.questionId || idx}
                  className={`p-4 rounded-xl border ${
                    detail.isCorrect
                      ? 'bg-emerald-50/40 border-emerald-200'
                      : 'bg-rose-50/40 border-rose-200'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-800">
                        Câu {detail.questionNumber} (Phần {detail.section})
                      </span>
                      {detail.isCorrect ? (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Đúng (+{detail.pointsEarned.toFixed(2)}đ)</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-700">
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Sai (0/{detail.maxPoints.toFixed(2)}đ)</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Question Stem */}
                  <ChemistryRenderer
                    content={detail.questionContent}
                    images={detail.images}
                    className="text-sm font-medium text-slate-800 mb-3"
                  />

                  {/* Section 1 Answer Comparison */}
                  {detail.section === 1 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      <div className="p-2.5 rounded-lg bg-white border border-slate-200">
                        <span className="text-slate-500 block">Học sinh chọn:</span>
                        <span className={`font-bold mt-0.5 block ${detail.isCorrect ? 'text-emerald-700' : 'text-rose-700'}`}>
                          {detail.studentAnswer}
                        </span>
                      </div>
                      <div className="p-2.5 rounded-lg bg-white border border-slate-200">
                        <span className="text-slate-500 block">Đáp án chuẩn:</span>
                        <span className="font-bold text-emerald-700 mt-0.5 block">
                          {detail.correctAnswer}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Section 2 True/False Sub-items Breakdown */}
                  {detail.section === 2 && detail.subItems && (
                    <div className="space-y-1.5 text-xs">
                      {detail.subItems.map(sub => (
                        <div
                          key={sub.label}
                          className="p-2 rounded-lg bg-white border border-slate-200 flex items-center justify-between gap-2"
                        >
                          <div className="flex items-center gap-2">
                            <span className="font-bold uppercase text-slate-800">{sub.label})</span>
                            <ChemistryRenderer content={sub.text} />
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="text-slate-500">
                              Chọn: <strong>{sub.studentChoice === true ? 'Đúng' : sub.studentChoice === false ? 'Sai' : 'Chưa chọn'}</strong>
                            </span>
                            <span className="text-slate-300">·</span>
                            <span className="text-emerald-700 font-semibold">
                              Chuẩn: {sub.correctChoice ? 'Đúng' : 'Sai'}
                            </span>
                            {sub.isCorrect ? (
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 ml-1" />
                            ) : (
                              <XCircle className="w-3.5 h-3.5 text-rose-500 ml-1" />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Section 3 Short Answer Comparison */}
                  {detail.section === 3 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      <div className="p-2.5 rounded-lg bg-white border border-slate-200">
                        <span className="text-slate-500 block">Câu trả lời của học sinh:</span>
                        <span className={`font-mono font-bold mt-0.5 block ${detail.isCorrect ? 'text-emerald-700' : 'text-rose-700'}`}>
                          {detail.studentAnswer}
                        </span>
                      </div>
                      <div className="p-2.5 rounded-lg bg-white border border-slate-200">
                        <span className="text-slate-500 block">Đáp án chuẩn:</span>
                        <span className="font-mono font-bold text-emerald-700 mt-0.5 block">
                          {detail.correctAnswer}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Explanation */}
                  {detail.explanation && (
                    <div className="mt-3 p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700">
                      <span className="font-bold text-teal-800">Lời giải của Thầy Thiện: </span>
                      <span>{detail.explanation}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
