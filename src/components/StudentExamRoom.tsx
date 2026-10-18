import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  Clock,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Send,
  User,
  GraduationCap,
  ArrowRight,
  BookOpen,
  RotateCcw,
  Sparkles
} from 'lucide-react';
import { Exam, Question, StudentSubmission } from '../types/exam';
import { ChemistryRenderer } from '../utils/chemistry';
import { api } from '../services/api';
import { StudentResultView } from './StudentResultView';

interface StudentExamRoomProps {
  initialCode?: string;
  onBackToHome?: () => void;
  isStudentMode?: boolean;
}

export const StudentExamRoom: React.FC<StudentExamRoomProps> = ({
  initialCode,
  onBackToHome,
  isStudentMode = false,
}) => {
  // Authentication & entry
  const [examCode, setExamCode] = useState<string>(initialCode || '');
  const [studentName, setStudentName] = useState<string>('');
  const [studentClass, setStudentClass] = useState<string>('');
  
  // Test State
  const [exam, setExam] = useState<Exam | null>(null);
  const [isTestStarted, setIsTestStarted] = useState<boolean>(false);
  const [startedAt, setStartedAt] = useState<string>('');
  const [timeRemainingSeconds, setTimeRemainingSeconds] = useState<number>(3000); // 50 mins default
  const [showPalette, setShowPalette] = useState<boolean>(false);
  
  // Student Answers state: { [qId]: optionId (Sec1) | { [subId]: boolean } (Sec2) | string (Sec3) }
  const [answers, setAnswers] = useState<Record<string, any>>({});
  
  // Submission & Result state
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submissionResult, setSubmissionResult] = useState<StudentSubmission | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoadingExam, setIsLoadingExam] = useState<boolean>(false);
  const [availableExams, setAvailableExams] = useState<Exam[]>([]);
  const [studentAttemptsCount, setStudentAttemptsCount] = useState<number>(0);
  const [isCheckingAttempts, setIsCheckingAttempts] = useState<boolean>(false);

  const handleResetToEntry = () => {
    setSubmissionResult(null);
    setIsTestStarted(false);
    setAnswers({});
    setExam(null);
    setExamCode('');
    setErrorMessage(null);
    setStudentAttemptsCount(0);
  };

  // Check student attempts whenever studentName or exam changes
  useEffect(() => {
    if (!exam || !studentName.trim() || !exam.maxAttempts || exam.maxAttempts === 0) {
      setStudentAttemptsCount(0);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setIsCheckingAttempts(true);
        const res = await api.checkStudentAttempts(exam.code, studentName.trim());
        setStudentAttemptsCount(res.attempts);
      } catch (err) {
        console.warn('Check attempts error', err);
      } finally {
        setIsCheckingAttempts(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [exam?.code, studentName, exam?.maxAttempts]);

  // Fetch available exams list on mount
  useEffect(() => {
    api.getExams().then(exams => {
      setAvailableExams(exams);
      if (initialCode) {
        loadExam(initialCode);
      } else if (exams.length === 1) {
        setExamCode(exams[0].code);
        loadExam(exams[0].code);
      }
    }).catch(err => console.warn('Could not load exams list', err));
  }, [initialCode]);

  // Timer countdown
  useEffect(() => {
    if (!isTestStarted || submissionResult) return;

    const timer = setInterval(() => {
      setTimeRemainingSeconds(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmitFinal(true); // auto-submit on timeout
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isTestStarted, submissionResult]);

  const loadExam = async (codeToLoad: string) => {
    const clean = codeToLoad.trim();
    if (!clean) return;
    setIsLoadingExam(true);
    setErrorMessage(null);

    try {
      const data = await api.getStudentExam(clean);
      setExam(data);
      setExamCode(data.code);
      setTimeRemainingSeconds((data.durationMinutes || 50) * 60);
    } catch (err: any) {
      setErrorMessage(err.message || `Không tìm thấy bài kiểm tra với mã: ${clean}`);
    } finally {
      setIsLoadingExam(false);
    }
  };

  const handleStartExam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentName.trim()) {
      setErrorMessage('Vui lòng nhập họ và tên của bạn.');
      return;
    }
    if (!exam) {
      setErrorMessage('Chưa tải được đề thi. Vui lòng kiểm tra mã đề.');
      return;
    }

    // Check if student has already exhausted allowed attempts
    if (exam.maxAttempts && exam.maxAttempts > 0 && studentAttemptsCount >= exam.maxAttempts) {
      setErrorMessage(
        `Em (${studentName.trim()}) đã hoàn thành tối đa ${exam.maxAttempts}/${exam.maxAttempts} lần làm bài cho phép đối với đề thi này.`
      );
      return;
    }

    setStartedAt(new Date().toISOString());
    setIsTestStarted(true);
    setErrorMessage(null);
  };

  // Section 1 answer handler
  const handleSelectOption = (questionId: string, optionId: string) => {
    if (submissionResult) return;
    setAnswers(prev => ({
      ...prev,
      [questionId]: optionId,
    }));
  };

  // Section 2 True/False handler
  const handleSelectTrueFalse = (questionId: string, itemId: string, value: boolean) => {
    if (submissionResult) return;
    setAnswers(prev => {
      const existing = prev[questionId] || {};
      return {
        ...prev,
        [questionId]: {
          ...existing,
          [itemId]: value,
        },
      };
    });
  };

  // Section 3 Short Answer handler
  const handleShortAnswerChange = (questionId: string, text: string) => {
    if (submissionResult) return;
    setAnswers(prev => ({
      ...prev,
      [questionId]: text,
    }));
  };

  // Check if a specific question is fully answered
  const isQuestionAnswered = (q: Question) => {
    const ans = answers[q.id];
    if (q.section === 1) return ans !== undefined && ans !== null;
    if (q.section === 2) {
      if (!ans) return false;
      const subItems = q.trueFalseItems || [];
      return subItems.length > 0 && Object.keys(ans).length === subItems.length;
    }
    if (q.section === 3) return ans !== undefined && String(ans).trim().length > 0;
    return false;
  };

  // Section breakdown
  const sec1Questions = exam?.questions.filter(q => q.section === 1) || [];
  const sec2Questions = exam?.questions.filter(q => q.section === 2) || [];
  const sec3Questions = exam?.questions.filter(q => q.section === 3) || [];

  const sec1Answered = sec1Questions.filter(isQuestionAnswered).length;
  const sec2Answered = sec2Questions.filter(isQuestionAnswered).length;
  const sec3Answered = sec3Questions.filter(isQuestionAnswered).length;

  const totalQuestions = exam?.questions.length || 0;
  const answeredCount = exam?.questions.filter(isQuestionAnswered).length || 0;
  const progressPercent = totalQuestions > 0 ? Math.round((answeredCount / totalQuestions) * 100) : 0;

  const scrollToQuestion = (qNum: number) => {
    const el = document.getElementById(`q-${qNum}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  // Final submission
  const handleSubmitFinal = async (isAutoSubmit: boolean = false) => {
    if (!exam || isSubmitting) return;

    setIsSubmitting(true);
    setShowConfirmModal(false);

    try {
      const result = await api.submitExam(exam.code, {
        studentName: studentName.trim(),
        studentClass: studentClass.trim() || 'Tự do',
        answers,
        startedAt: startedAt || new Date().toISOString(),
      });

      setSubmissionResult(result);

      // Trigger confetti on good score!
      if (result.score >= 7.0) {
        try {
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
          });
        } catch {}
      }
    } catch (err: any) {
      setErrorMessage(`Lỗi khi nộp bài: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // If already submitted, show result card
  if (submissionResult && exam) {
    return (
      <StudentResultView
        exam={exam}
        submission={submissionResult}
        onRetakeTest={() => {
          setSubmissionResult(null);
          setIsTestStarted(false);
          setAnswers({});
        }}
        onBackToHome={handleResetToEntry}
      />
    );
  }

  // ==================== SCREEN 1: LOGIN & START ====================
  if (!isTestStarted) {
    return (
      <div className="max-w-xl mx-auto py-12 px-4 sm:px-6">
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs">
          <div className="text-center mb-6">
            <div className="w-12 h-12 rounded-2xl bg-teal-600 text-white flex items-center justify-center mx-auto mb-3 shadow-xs">
              <GraduationCap className="w-6 h-6" />
            </div>
            <h1 className="text-xl font-bold text-slate-900">
              Phòng Thi Hóa Học Trực Tuyến
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Thầy Thiện - Hệ thống kiểm tra chuẩn cấu trúc Bộ GD&ĐT 2025/2026
            </p>
          </div>

          {errorMessage && (
            <div className="mb-5 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleStartExam} className="space-y-4">
            {/* Exam Code Input */}
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Mã Bài Kiểm Tra: <span className="text-rose-500">*</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: HHTT-2026-634"
                  value={examCode}
                  onChange={e => setExamCode(e.target.value.toUpperCase())}
                  className="flex-1 rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs font-mono font-bold text-slate-900 focus:outline-hidden focus:border-teal-600 focus:ring-1 focus:ring-teal-600 uppercase"
                />
                <button
                  type="button"
                  onClick={() => loadExam(examCode)}
                  disabled={isLoadingExam || !examCode}
                  className="px-4 py-2.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-50 rounded-xl transition-colors shrink-0"
                >
                  {isLoadingExam ? 'Đang tải...' : 'Tìm đề'}
                </button>
              </div>
            </div>

            {/* Quick Available Exams Picker */}
            {!exam && availableExams.length > 0 && (
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <span className="text-[11px] font-bold text-slate-600 block uppercase tracking-wider">
                  📋 Hoặc bấm chọn trực tiếp đề thi của Thầy:
                </span>
                <div className="space-y-1.5 max-h-48 overflow-y-auto">
                  {availableExams.map(ex => (
                    <button
                      key={ex.code}
                      type="button"
                      onClick={() => {
                        setExamCode(ex.code);
                        loadExam(ex.code);
                      }}
                      className="w-full text-left p-2.5 rounded-lg bg-white border border-slate-200 hover:border-teal-500 hover:bg-teal-50/50 transition-all flex items-center justify-between gap-2 group cursor-pointer"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-bold text-teal-700 bg-teal-50 px-1.5 py-0.5 rounded border border-teal-200">
                            {ex.code}
                          </span>
                          <span className="text-xs font-semibold text-slate-800 truncate">
                            {ex.title}
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-500 mt-0.5 block">
                          {ex.questions?.length || 0} câu hỏi · {ex.durationMinutes || 50} phút
                        </span>
                      </div>
                      <span className="text-xs font-bold text-teal-700 shrink-0 group-hover:translate-x-0.5 transition-transform">
                        Chọn đề →
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Exam Details Preview Card */}
            {exam && (
              <div className="p-3.5 rounded-xl bg-teal-50/70 border border-teal-200/80 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-teal-950 block text-sm">
                    {exam.title}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setExam(null);
                      setExamCode('');
                    }}
                    className="text-[11px] text-teal-700 hover:underline font-semibold"
                  >
                    Đổi đề khác
                  </button>
                </div>
                <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-teal-800">
                  <span>Khối: {exam.grade || 'Lớp 12'}</span>
                  <span>·</span>
                  <span>{exam.questions.length} câu hỏi</span>
                  <span>·</span>
                  <span>Thời gian: {exam.durationMinutes} phút</span>
                  <span>·</span>
                  <span className="font-semibold text-teal-950 bg-teal-100/70 px-2 py-0.5 rounded">
                    {exam.maxAttempts && exam.maxAttempts > 0
                      ? `Tối đa ${exam.maxAttempts} lần làm bài`
                      : 'Làm lại không giới hạn'}
                  </span>
                </div>
              </div>
            )}

            {/* Student Name */}
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Họ Và Tên Học Sinh: <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder="Nguyễn Văn A"
                  value={studentName}
                  onChange={e => setStudentName(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 pl-10 pr-3.5 py-2.5 text-xs text-slate-900 focus:outline-hidden focus:border-teal-600 focus:ring-1 focus:ring-teal-600"
                />
              </div>

              {/* Real-time attempts status indicator */}
              {exam && exam.maxAttempts && exam.maxAttempts > 0 && studentName.trim() && (
                <div className={`mt-2 p-2.5 rounded-xl text-xs font-medium flex items-center justify-between gap-2 border ${
                  studentAttemptsCount >= exam.maxAttempts
                    ? 'bg-rose-50 border-rose-200 text-rose-800'
                    : 'bg-teal-50 border-teal-200 text-teal-900'
                }`}>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full shrink-0 bg-current" />
                    <span>
                      Đã làm: <strong>{studentAttemptsCount}/{exam.maxAttempts} lần</strong>
                    </span>
                  </div>

                  {studentAttemptsCount >= exam.maxAttempts ? (
                    <span className="text-rose-700 font-bold text-[11px] bg-rose-100 px-2 py-0.5 rounded-md">
                      ⚠️ Đã hết lượt làm bài
                    </span>
                  ) : (
                    <span className="text-teal-700 font-bold text-[11px] bg-teal-100 px-2 py-0.5 rounded-md">
                      Lượt này: Lần {studentAttemptsCount + 1}
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Student Class */}
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Lớp / Trường:
              </label>
              <input
                type="text"
                placeholder="Ví dụ: 12A1 - THPT Chuyên"
                value={studentClass}
                onChange={e => setStudentClass(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs text-slate-900 focus:outline-hidden focus:border-teal-600 focus:ring-1 focus:ring-teal-600"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={
                  !exam ||
                  !studentName.trim() ||
                  isLoadingExam ||
                  isCheckingAttempts ||
                  Boolean(exam.maxAttempts && exam.maxAttempts > 0 && studentAttemptsCount >= exam.maxAttempts)
                }
                className="w-full py-3 px-4 rounded-xl bg-teal-600 hover:bg-teal-700 active:bg-teal-800 disabled:opacity-50 text-white font-bold text-sm shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
              >
                <span>
                  {exam && exam.maxAttempts && exam.maxAttempts > 0 && studentAttemptsCount >= exam.maxAttempts
                    ? 'Đã Hết Số Lượt Làm Bài'
                    : 'Bắt Đầu Làm Bài'}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // ==================== SCREEN 2: ACTIVE TEST TAKING ====================
  const minutes = Math.floor(timeRemainingSeconds / 60);
  const seconds = timeRemainingSeconds % 60;
  const isTimeRunningLow = timeRemainingSeconds < 300; // < 5 mins

  return (
    <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6">
      {/* Sticky Test Header with Comprehensive Progress Bar */}
      <div className="sticky top-16 z-30 bg-white/95 backdrop-blur-md border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-sm mb-6 space-y-3">
        {/* Top row: Student Info, Live Countdown, Submit Button */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-lg bg-teal-50 text-teal-800 flex items-center justify-center font-bold text-xs border border-teal-200 shrink-0">
              {studentClass ? studentClass.slice(0, 3) : 'HS'}
            </span>
            <div>
              <span className="text-xs sm:text-sm font-bold text-slate-900 block leading-tight">
                {studentName} {studentClass ? `(${studentClass})` : ''}
              </span>
              <span className="text-[11px] text-slate-500 line-clamp-1">
                {exam?.title}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Live Countdown Timer */}
            <div
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-mono font-bold tabular-nums shrink-0 ${
                isTimeRunningLow
                  ? 'bg-rose-50 text-rose-700 border-rose-200 animate-pulse'
                  : 'bg-slate-50 text-slate-800 border-slate-200'
              }`}
            >
              <Clock className="w-4 h-4 text-slate-500" />
              <span>
                {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
              </span>
            </div>

            {/* Submit Button */}
            <button
              onClick={() => setShowConfirmModal(true)}
              className="px-4 py-2 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 active:bg-teal-800 rounded-xl transition-colors shadow-xs flex items-center gap-1.5 shrink-0"
            >
              <Send className="w-3.5 h-3.5" />
              <span>NỘP BÀI</span>
            </button>
          </div>
        </div>

        {/* Prominent Progress Bar Section */}
        <div className="pt-2 border-t border-slate-100 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-800">
                Tiến độ làm bài:
              </span>
              <span className="font-mono font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200 tabular-nums">
                {answeredCount} / {totalQuestions} câu
              </span>
            </div>

            <div className="flex items-center gap-3">
              <span className="font-mono font-bold text-slate-700 tabular-nums">
                {progressPercent}%
              </span>
              <button
                type="button"
                onClick={() => setShowPalette(!showPalette)}
                className="text-[11px] text-teal-700 hover:text-teal-900 font-semibold underline underline-offset-2 flex items-center gap-1"
              >
                {showPalette ? 'Ẩn bảng câu hỏi' : 'Mở bảng câu hỏi'}
              </button>
            </div>
          </div>

          {/* Full-width gradient progress bar */}
          <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200">
            <div
              className="h-full bg-gradient-to-r from-teal-500 via-teal-600 to-emerald-500 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {/* Section mini badges */}
          <div className="flex flex-wrap items-center gap-2 pt-0.5 text-[11px] text-slate-500">
            <span className="px-2 py-0.5 bg-slate-50 rounded border border-slate-200">
              Phần 1: <strong>{sec1Answered}/{sec1Questions.length}</strong>
            </span>
            <span className="px-2 py-0.5 bg-slate-50 rounded border border-slate-200">
              Phần 2: <strong>{sec2Answered}/{sec2Questions.length}</strong>
            </span>
            <span className="px-2 py-0.5 bg-slate-50 rounded border border-slate-200">
              Phần 3: <strong>{sec3Answered}/{sec3Questions.length}</strong>
            </span>
          </div>

          {/* Collapsible Question Palette Grid */}
          {showPalette && (
            <div className="mt-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200 animate-in fade-in duration-200">
              <span className="text-[11px] font-semibold text-slate-600 block mb-2">
                Bảng câu hỏi (bấm để di chuyển đến câu tương ứng):
              </span>
              <div className="flex flex-wrap gap-1.5">
                {exam?.questions.map((q) => {
                  const done = isQuestionAnswered(q);
                  return (
                    <button
                      key={q.id}
                      type="button"
                      onClick={() => scrollToQuestion(q.questionNumber)}
                      className={`w-7 h-7 rounded-lg text-xs font-bold transition-all ${
                        done
                          ? 'bg-teal-600 text-white shadow-2xs'
                          : 'bg-white text-slate-600 border border-slate-300 hover:border-slate-400'
                      }`}
                      title={`Câu ${q.questionNumber} (Phần ${q.section}): ${done ? 'Đã trả lời' : 'Chưa làm'}`}
                    >
                      {q.questionNumber}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Questions Form */}
      <div className="space-y-8">
        {/* ==================== PHẦN 1 ==================== */}
        {exam?.questions.some(q => q.section === 1) && (
          <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
            <div className="border-b border-slate-100 pb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-teal-700 block">
                PHẦN 1. CÂU HỎI TRẮC NGHIỆM NHIỀU PHƯƠNG ÁN LỰA CHỌN
              </span>
              <p className="text-xs text-slate-500 mt-0.5">
                Thí sinh chọn 01 phương án đúng nhất trong 4 phương án A, B, C, D.
              </p>
            </div>

            <div className="space-y-8 divide-y divide-slate-100">
              {exam.questions.filter(q => q.section === 1).map((q) => {
                const currentChoice = answers[q.id];

                return (
                  <div key={q.id} id={`q-${q.questionNumber}`} className="pt-6 first:pt-0">
                    <div className="flex items-start gap-3 mb-3">
                      <span className="text-xs font-bold text-slate-900 bg-slate-100 px-2 py-1 rounded shrink-0">
                        Câu {q.questionNumber}
                      </span>
                      <div className="flex-1">
                        <ChemistryRenderer content={q.questionContent} images={q.images} />
                      </div>
                    </div>

                    {/* Options list */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-3 pl-0 sm:pl-10">
                      {q.options?.map(opt => {
                        const isSelected = currentChoice === opt.id;

                        return (
                          <button
                            type="button"
                            key={opt.id}
                            onClick={() => handleSelectOption(q.id, opt.id)}
                            className={`p-3.5 rounded-xl border text-left flex items-start gap-3 transition-all ${
                              isSelected
                                ? 'bg-teal-50/80 border-teal-500 ring-2 ring-teal-500/20 text-slate-900 font-medium'
                                : 'bg-slate-50/50 hover:bg-slate-50 border-slate-200 text-slate-700'
                            }`}
                          >
                            <span
                              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-colors ${
                                isSelected
                                  ? 'bg-teal-600 text-white'
                                  : 'bg-white text-slate-600 border border-slate-300'
                              }`}
                            >
                              {opt.label}
                            </span>
                            <div className="flex-1 text-sm pt-0.5">
                              <ChemistryRenderer content={opt.text} />
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ==================== PHẦN 2 ==================== */}
        {exam?.questions.some(q => q.section === 2) && (
          <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
            <div className="border-b border-slate-100 pb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-teal-700 block">
                PHẦN 2. CÂU HỎI TRẮC NGHIỆM ĐÚNG - SAI
              </span>
              <p className="text-xs text-slate-500 mt-0.5">
                Trong mỗi ý a), b), c), d) ở mỗi câu, thí sinh chọn Đúng hoặc Sai.
              </p>
            </div>

            <div className="space-y-8 divide-y divide-slate-100">
              {exam.questions.filter(q => q.section === 2).map((q) => {
                const subAnswers = answers[q.id] || {};

                return (
                  <div key={q.id} id={`q-${q.questionNumber}`} className="pt-6 first:pt-0">
                    <div className="flex items-start gap-3 mb-3">
                      <span className="text-xs font-bold text-slate-900 bg-slate-100 px-2 py-1 rounded shrink-0">
                        Câu {q.questionNumber}
                      </span>
                      <div className="flex-1">
                        <ChemistryRenderer content={q.questionContent} images={q.images} />
                      </div>
                    </div>

                    {/* Sub-items table */}
                    <div className="space-y-2 mt-3 pl-0 sm:pl-10">
                      {q.trueFalseItems?.map(item => {
                        const currentVal = subAnswers[item.id];

                        return (
                          <div
                            key={item.id}
                            className="p-3 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-sm"
                          >
                            <div className="flex items-start gap-2.5 flex-1">
                              <span className="font-bold text-slate-900 uppercase shrink-0">
                                {item.label})
                              </span>
                              <ChemistryRenderer content={item.text} />
                            </div>

                            {/* True / False toggle buttons */}
                            <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-auto">
                              <button
                                type="button"
                                onClick={() => handleSelectTrueFalse(q.id, item.id, true)}
                                className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all ${
                                  currentVal === true
                                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                                    : 'bg-white text-slate-600 border-slate-300 hover:border-slate-400'
                                }`}
                              >
                                Đúng
                              </button>
                              <button
                                type="button"
                                onClick={() => handleSelectTrueFalse(q.id, item.id, false)}
                                className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all ${
                                  currentVal === false
                                    ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                                    : 'bg-white text-slate-600 border-slate-300 hover:border-slate-400'
                                }`}
                              >
                                Sai
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ==================== PHẦN 3 ==================== */}
        {exam?.questions.some(q => q.section === 3) && (
          <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
            <div className="border-b border-slate-100 pb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-teal-700 block">
                PHẦN 3. CÂU HỎI TRẮC NGHIỆM TRẢ LỜI NGẮN
              </span>
              <p className="text-xs text-slate-500 mt-0.5">
                Thí sinh nhập câu trả lời vào ô tương ứng (chấp nhận số thập phân dấu phẩy hoặc chấm).
              </p>
            </div>

            <div className="space-y-8 divide-y divide-slate-100">
              {exam.questions.filter(q => q.section === 3).map((q) => {
                const currentText = answers[q.id] || '';

                return (
                  <div key={q.id} id={`q-${q.questionNumber}`} className="pt-6 first:pt-0">
                    <div className="flex items-start gap-3 mb-3">
                      <span className="text-xs font-bold text-slate-900 bg-slate-100 px-2 py-1 rounded shrink-0">
                        Câu {q.questionNumber}
                      </span>
                      <div className="flex-1">
                        <ChemistryRenderer content={q.questionContent} images={q.images} />
                      </div>
                    </div>

                    {/* Short Answer Input Box */}
                    <div className="mt-3 pl-0 sm:pl-10">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                        <label className="text-xs font-semibold text-slate-600 shrink-0">
                          Nhập câu trả lời của bạn:
                        </label>
                        <input
                          type="text"
                          placeholder="Ví dụ: 0,25 hoặc 28..."
                          value={currentText}
                          onChange={e => handleShortAnswerChange(q.id, e.target.value)}
                          className="max-w-xs rounded-xl border border-slate-300 px-3.5 py-2 text-sm font-mono font-bold text-slate-900 focus:outline-hidden focus:border-teal-600 focus:ring-1 focus:ring-teal-600 bg-white"
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Bottom Giant Submit Button */}
        <div className="p-8 bg-white border border-slate-200 rounded-2xl shadow-xs text-center space-y-4">
          <p className="text-xs text-slate-500">
            Bạn đã hoàn thành <strong>{answeredCount} / {totalQuestions}</strong> câu hỏi. Hãy kiểm tra kỹ bài làm trước khi bấm nộp.
          </p>
          <button
            type="button"
            onClick={() => setShowConfirmModal(true)}
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 mx-auto"
          >
            <Send className="w-4 h-4" />
            <span>NỘP BÀI THI</span>
          </button>
        </div>
      </div>

      {/* ==================== SUBMISSION CONFIRMATION MODAL ==================== */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-md w-full p-6 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-teal-50 text-teal-700 flex items-center justify-center mx-auto">
              <HelpCircle className="w-6 h-6" />
            </div>

            <h3 className="text-base font-bold text-slate-900">
              Xác Nhận Nộp Bài Thi
            </h3>

            <p className="text-xs text-slate-600 leading-relaxed">
              Bạn có chắc chắn muốn nộp bài không? Sau khi nộp, hệ thống sẽ tự động chấm điểm và bạn <span className="font-semibold text-rose-600">không thể thay đổi câu trả lời</span>.
            </p>

            {answeredCount < totalQuestions && (
              <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-xs text-left">
                ⚠️ Lưu ý: Bạn còn <strong>{totalQuestions - answeredCount}</strong> câu chưa trả lời.
              </div>
            )}

            <div className="pt-2 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                disabled={isSubmitting}
                className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 rounded-xl transition-colors"
              >
                HỦY BỎ
              </button>

              <button
                type="button"
                onClick={() => handleSubmitFinal(false)}
                disabled={isSubmitting}
                className="px-5 py-2.5 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-xl transition-colors shadow-xs"
              >
                {isSubmitting ? 'Đang chấm điểm...' : 'XÁC NHẬN NỘP BÀI'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
