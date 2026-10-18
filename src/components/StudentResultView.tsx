import React from 'react';
import {
  Award,
  CheckCircle2,
  XCircle,
  Clock,
  User,
  GraduationCap,
  RotateCcw,
  Printer,
  ChevronRight,
  BookOpen,
  Lock
} from 'lucide-react';
import { Exam, StudentSubmission } from '../types/exam';
import { ChemistryRenderer } from '../utils/chemistry';

interface StudentResultViewProps {
  exam: Exam;
  submission: StudentSubmission;
  onRetakeTest: () => void;
  onBackToHome: () => void;
}

export const StudentResultView: React.FC<StudentResultViewProps> = ({
  exam,
  submission,
  onRetakeTest,
  onBackToHome,
}) => {
  const isHigh = submission.score >= 8.0;
  const isPass = submission.score >= 5.0;

  const maxAttempts = exam.maxAttempts || submission.maxAttempts || 0;
  const currentAttempt = submission.attemptNumber || 1;
  const hasReachedLimit = maxAttempts > 0 && currentAttempt >= maxAttempts;
  const attemptsRemaining = maxAttempts > 0 ? Math.max(0, maxAttempts - currentAttempt) : null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-4xl mx-auto py-10 px-4 sm:px-6 space-y-8">
      {/* Result Hero Card */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-10 shadow-xs text-center relative overflow-hidden">
        {/* Glow backdrop */}
        <div className={`absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full blur-3xl opacity-20 pointer-events-none ${
          isHigh ? 'bg-emerald-400' : isPass ? 'bg-teal-400' : 'bg-rose-400'
        }`} />

        <div className="relative z-10">
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm ${
            isHigh
              ? 'bg-emerald-100 text-emerald-700'
              : isPass
              ? 'bg-teal-100 text-teal-700'
              : 'bg-rose-100 text-rose-700'
          }`}>
            <Award className="w-8 h-8" />
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            KẾT QUẢ BÀI LÀM
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {exam.title}
          </p>

          {/* Student Meta */}
          <div className="mt-4 flex flex-wrap items-center justify-center gap-3 text-xs text-slate-600">
            <span className="font-semibold text-slate-900 flex items-center gap-1">
              <User className="w-3.5 h-3.5 text-slate-400" />
              <span>{submission.studentName}</span>
            </span>
            <span>·</span>
            <span className="flex items-center gap-1">
              <GraduationCap className="w-3.5 h-3.5 text-slate-400" />
              <span>{submission.studentClass}</span>
            </span>
            <span>·</span>
            <span className="flex items-center gap-1 font-mono">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>{Math.floor(submission.durationSeconds / 60)}p {submission.durationSeconds % 60}s</span>
            </span>
          </div>

          {/* Big Score Box */}
          <div className="my-8 max-w-xs mx-auto p-6 rounded-2xl bg-slate-50 border border-slate-200 shadow-inner">
            <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider block">
              ĐIỂM SỐ ĐẠT ĐƯỢC
            </span>
            <div className="flex items-baseline justify-center gap-1 mt-2">
              <span className={`text-5xl font-mono font-extrabold tracking-tight tabular-nums ${
                isHigh ? 'text-emerald-700' : isPass ? 'text-teal-700' : 'text-rose-600'
              }`}>
                {submission.score.toFixed(2)}
              </span>
              <span className="text-lg text-slate-400 font-medium">/ 10</span>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
              <span className="flex items-center gap-1 text-emerald-700 font-bold">
                <CheckCircle2 className="w-4 h-4" />
                <span>{submission.correctCount} câu đúng</span>
              </span>
              <span className="flex items-center gap-1 text-rose-600 font-bold">
                <XCircle className="w-4 h-4" />
                <span>{submission.incorrectCount} câu sai</span>
              </span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={handlePrint}
              className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>In Kết Quả</span>
            </button>

            {hasReachedLimit ? (
              <div className="px-4 py-2 text-xs font-bold text-rose-700 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-1.5 shadow-2xs">
                <Lock className="w-3.5 h-3.5 text-rose-600" />
                <span>Đã hết lượt làm bài ({currentAttempt}/{maxAttempts} lần)</span>
              </div>
            ) : (
              <button
                onClick={onRetakeTest}
                className="px-4 py-2 text-xs font-semibold text-teal-800 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>
                  Làm Lại Đề Này {attemptsRemaining !== null ? `(Còn ${attemptsRemaining} lượt)` : ''}
                </span>
              </button>
            )}

            <button
              onClick={onBackToHome}
              className="px-5 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
            >
              Chọn Đề Thi Khác
            </button>
          </div>
        </div>
      </div>

      {/* Detailed Question Review */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-teal-600" />
            <span>Nội Dung Câu Hỏi & Các Lựa Chọn Đã Nộp</span>
          </h2>
          <span className="text-xs text-slate-500">
            Tổng cộng: {submission.totalQuestions} câu
          </span>
        </div>

        <div className="p-3.5 rounded-xl bg-teal-50 border border-teal-200 text-xs text-teal-900 flex items-center gap-2">
          <span className="font-semibold">🔒 Chế độ bảo mật đề thi:</span>
          <span>Thí sinh xem lại câu hỏi và các lựa chọn đã nộp. Không hiển thị đáp án đúng chuẩn để đảm bảo tính công bằng và bảo mật của kỳ thi.</span>
        </div>

        <div className="space-y-6">
          {submission.details.map((detail, idx) => (
            <div
              key={detail.questionId || idx}
              className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs"
            >
              {/* Question Header */}
              <div className="flex items-center justify-between gap-3 mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-900 bg-slate-100 px-2 py-1 rounded">
                    Câu {detail.questionNumber} (Phần {detail.section})
                  </span>
                  <span className="text-xs text-slate-500 font-medium">
                    (Điểm tối đa: {detail.maxPoints.toFixed(2)}đ)
                  </span>
                </div>
              </div>

              {/* Question Stem */}
              <div className="mb-4">
                <ChemistryRenderer
                  content={detail.questionContent}
                  images={detail.images}
                  className="text-sm font-medium text-slate-800"
                />
              </div>

              {/* Section 1 Answer Comparison */}
              {detail.section === 1 && (
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs my-3">
                  <span className="text-slate-500 block mb-0.5">Phương án bạn đã chọn:</span>
                  <span className="font-bold text-sm text-slate-900 block">
                    {detail.studentAnswer}
                  </span>
                </div>
              )}

              {/* Section 2 True/False Sub-items Breakdown */}
              {detail.section === 2 && detail.subItems && (
                <div className="space-y-2 text-xs my-3">
                  {detail.subItems.map(sub => (
                    <div
                      key={sub.label}
                      className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                    >
                      <div className="flex items-start gap-2">
                        <span className="font-bold uppercase text-slate-900">{sub.label})</span>
                        <ChemistryRenderer content={sub.text} />
                      </div>

                      <div className="text-xs shrink-0 self-end sm:self-auto">
                        <span className="text-slate-600">
                          Bạn đã chọn:{' '}
                          <strong className="text-slate-900 font-bold">
                            {sub.studentChoice === true ? 'Đúng' : sub.studentChoice === false ? 'Sai' : 'Chưa chọn'}
                          </strong>
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Section 3 Short Answer Comparison */}
              {detail.section === 3 && (
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs my-3">
                  <span className="text-slate-500 block mb-0.5">Câu trả lời bạn đã nhập:</span>
                  <span className="font-mono font-bold text-sm text-slate-900 block">
                    {detail.studentAnswer}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
