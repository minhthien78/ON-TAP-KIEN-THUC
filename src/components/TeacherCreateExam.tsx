import React, { useState, useRef, useEffect } from 'react';
import {
  UploadCloud,
  FileCheck2,
  Shuffle,
  Link as LinkIcon,
  CheckCircle2,
  AlertTriangle,
  Copy,
  Check,
  Eye,
  Sparkles,
  Info,
  ChevronRight,
  ShieldCheck,
  RotateCcw,
  Trash2,
  QrCode,
  ExternalLink,
  Share2,
  Smartphone
} from 'lucide-react';
import { Exam, Question } from '../types/exam';
import { ChemistryRenderer } from '../utils/chemistry';
import { parseDocxFile, parseExamFromHtml } from '../utils/docxParser';
import { shuffleExam, validateExamIntegrity, ShuffleResult } from '../utils/shuffler';
import { SAMPLE_CHEMISTRY_QUESTIONS, SAMPLE_RAW_TEXT_EXAM, MINIMAL_DEMO_EXAM_TEXT } from '../utils/sampleExam';
import { fetchServerConfig, getStudentExamLink, getDevExamLink, getExamQrCodeUrl, ServerConfig } from '../utils/urlHelper';

interface TeacherCreateExamProps {
  onExamCreated: (exam: Exam) => void;
  onGoToStudentRoom: (code: string) => void;
  initialExam?: Exam | null;
  onCancelEdit?: () => void;
}

export const TeacherCreateExam: React.FC<TeacherCreateExamProps> = ({
  onExamCreated,
  onGoToStudentRoom,
  initialExam,
  onCancelEdit,
}) => {
  // Step indicator: 1 = Input/Upload, 2 = Review & Edit, 3 = Shuffled & Verified, 4 = Created & Share Link
  const [currentStep, setCurrentStep] = useState<number>(initialExam ? 2 : 1);
  const [examTitle, setExamTitle] = useState<string>(
    initialExam?.title || 'Đề Kiểm Tra Hóa Học THPT - Thầy Thiện'
  );
  const [examGrade, setExamGrade] = useState<string>(initialExam?.grade || 'Lớp 12');
  const [durationMinutes, setDurationMinutes] = useState<number>(initialExam?.durationMinutes || 50);
  const [maxAttempts, setMaxAttempts] = useState<number>(initialExam?.maxAttempts ?? 0);
  
  const [questions, setQuestions] = useState<Question[]>(initialExam?.questions || []);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [rawText, setRawText] = useState<string>('');

  // Shuffle & Integrity State
  const [shuffleReport, setShuffleReport] = useState<ShuffleResult | null>(null);
  const [createdExam, setCreatedExam] = useState<Exam | null>(null);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [showQrCode, setShowQrCode] = useState<boolean>(false);
  const [serverConfig, setServerConfig] = useState<ServerConfig | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync when initialExam changes
  useEffect(() => {
    if (initialExam) {
      setExamTitle(initialExam.title);
      setExamGrade(initialExam.grade || 'Lớp 12');
      setDurationMinutes(initialExam.durationMinutes || 50);
      setMaxAttempts(initialExam.maxAttempts ?? 0);
      setQuestions(initialExam.questions || []);
      setCurrentStep(2);
    }
  }, [initialExam]);

  // Load server public URLs configuration
  useEffect(() => {
    fetchServerConfig().then(cfg => {
      setServerConfig(cfg);
    });
  }, []);

  // Delete / Reset uploaded exam
  const handleDeleteUploadedExam = () => {
    setQuestions([]);
    setRawText('');
    setShuffleReport(null);
    setCreatedExam(null);
    setErrorMessage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    setCurrentStep(1);
  };

  // Quick load standard THPT chemistry sample exam
  const handleLoadSampleExam = () => {
    setIsLoading(true);
    setErrorMessage(null);
    setTimeout(() => {
      setExamTitle('Đề Thi Thử Hóa Học THPT Quốc Gia Chuẩn 2026 - Thầy Thiện');
      setExamGrade('Lớp 12');
      setDurationMinutes(50);
      setQuestions(JSON.parse(JSON.stringify(SAMPLE_CHEMISTRY_QUESTIONS)));
      setIsLoading(false);
      setCurrentStep(2);
    }, 200);
  };

  // Handle file upload (.docx)
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    setErrorMessage(null);

    try {
      if (file.name.endsWith('.docx')) {
        const parsed = await parseDocxFile(file);
        if (parsed.questions.length === 0) {
          setErrorMessage('Không tìm thấy câu hỏi nào hợp lệ trong file .docx. Hãy kiểm tra định dạng "Câu 1:", "A.", "B.", "C.", "D."');
        } else {
          setExamTitle(parsed.title || file.name.replace('.docx', ''));
          setQuestions(parsed.questions);
          setCurrentStep(2);
        }
      } else {
        // Read as text
        const text = await file.text();
        const parsed = parseExamFromHtml(text, file.name.replace(/\.[^/.]+$/, ''));
        if (parsed.questions.length === 0) {
          setErrorMessage('Không tìm thấy câu hỏi nào hợp lệ. Vui lòng kiểm tra cấu trúc câu hỏi.');
        } else {
          setExamTitle(parsed.title);
          setQuestions(parsed.questions);
          setCurrentStep(2);
        }
      }
    } catch (err: any) {
      console.error('File parse error:', err);
      setErrorMessage(`Lỗi khi đọc file: ${err.message || 'File không đúng định dạng chuẩn'}`);
    } finally {
      setIsLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Handle raw text input parsing
  const handleParseRawText = () => {
    if (!rawText.trim()) {
      setErrorMessage('Vui lòng dán nội dung đề thi vào ô văn bản.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const parsed = parseExamFromHtml(rawText, examTitle);
      if (parsed.questions.length === 0) {
        setErrorMessage('Không nhận diện được câu hỏi. Hãy đảm bảo có cấu trúc "Câu 1: ... A. ... B. ... C. ... D."');
      } else {
        setQuestions(parsed.questions);
        setCurrentStep(2);
      }
    } catch (err: any) {
      setErrorMessage(`Lỗi phân tích: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Step 4 & 5: Trigger strict shuffle and run integrity check
  const handleShuffleExam = () => {
    const integrityCheck = validateExamIntegrity(questions);
    if (!integrityCheck.isValid) {
      setErrorMessage(`Không thể trộn đề vì còn lỗi dữ liệu: ${integrityCheck.errors.join(' | ')}`);
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const result = shuffleExam(questions);
      if (!result.integrityVerified) {
        setErrorMessage('CẢNH BÁO TOÀN VẸN: Phát hiện lệch đáp án trong quá trình hoán vị! Hệ thống đã dừng lại để bảo vệ độ chính xác.');
        setShuffleReport(result);
        return;
      }

      setShuffleReport(result);
      setQuestions(result.shuffledQuestions);
      setCurrentStep(3);
    } catch (err: any) {
      setErrorMessage(`Lỗi khi trộn đề: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Step 6: Create or update online exam
  const handleCreateOnlineExam = () => {
    const code = initialExam?.code || `HHTT-2026-${String(Math.floor(100 + Math.random() * 900))}`;
    const newExam: Exam = {
      id: initialExam?.id || `EXAM-${Date.now()}`,
      code,
      title: examTitle.trim(),
      grade: examGrade,
      durationMinutes,
      maxAttempts,
      createdAt: initialExam?.createdAt || new Date().toISOString(),
      isShuffled: initialExam ? initialExam.isShuffled : !!shuffleReport,
      questions,
      submissionsCount: initialExam?.submissionsCount || 0,
    };

    onExamCreated(newExam);
    setCreatedExam(newExam);
    setCurrentStep(4);
  };

  // Copy shareable link (automatically formatted with role=student)
  const shareableUrl = createdExam
    ? getStudentExamLink(createdExam.code, serverConfig)
    : '';

  const qrCodeUrl = shareableUrl ? getExamQrCodeUrl(shareableUrl, 260) : '';

  const handleCopyLink = () => {
    if (!shareableUrl) return;
    navigator.clipboard.writeText(shareableUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  // Group questions by section
  const sec1Questions = questions.filter(q => q.section === 1);
  const sec2Questions = questions.filter(q => q.section === 2);
  const sec3Questions = questions.filter(q => q.section === 3);

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6">
      {/* Step Wizard Breadcrumb */}
      <div className="mb-8">
        <div className="flex items-center justify-between max-w-3xl mx-auto relative">
          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-slate-200 -translate-y-1/2 z-0" />
          
          {[
            { step: 1, label: '1. Nạp File Đề' },
            { step: 2, label: '2. Phân Tích & Kiểm Tra' },
            { step: 3, label: '3. Trộn Đề & Xác Minh' },
            { step: 4, label: '4. Nhận Link Thi' },
          ].map(s => {
            const isCompleted = currentStep > s.step;
            const isCurrent = currentStep === s.step;

            return (
              <div key={s.step} className="relative z-10 flex flex-col items-center">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    isCompleted
                      ? 'bg-teal-600 text-white ring-4 ring-teal-50'
                      : isCurrent
                      ? 'bg-slate-900 text-white ring-4 ring-slate-100'
                      : 'bg-white text-slate-600 border border-slate-300'
                  }`}
                >
                  {isCompleted ? <Check className="w-4 h-4" /> : s.step}
                </div>
                <span
                  className={`text-xs mt-2 font-medium whitespace-nowrap hidden sm:block ${
                    isCurrent ? 'text-slate-900 font-semibold' : 'text-slate-600'
                  }`}
                >
                  {s.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Error Banner */}
      {errorMessage && (
        <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 flex items-start gap-3 text-sm">
          <AlertTriangle className="w-5 h-5 text-rose-700 shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-semibold block">Thông Báo Hệ Thống:</span>
            <span>{errorMessage}</span>
          </div>
          <button
            onClick={() => setErrorMessage(null)}
            className="text-rose-500 hover:text-rose-700 text-xs font-semibold"
          >
            Đóng
          </button>
        </div>
      )}

      {/* ==================== STEP 1: UPLOAD / INPUT ==================== */}
      {currentStep === 1 && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs">
            <div className="max-w-2xl">
              <h2 className="text-xl font-bold text-slate-900">
                Bước 1: Nạp File Đề Thi Hóa Học
              </h2>
              <p className="text-sm text-slate-600 mt-1">
                Hệ thống tự động nhận diện cấu trúc đề 3 phần chuẩn Bộ GD&ĐT 2025/2026, bảo toàn tối đa chỉ số dưới (H₂O, CO₂), ion (SO₄²⁻, NH₄⁺), liên kết (CH₂=CH₂, CH≡CH) và hình ảnh đồ thị.
              </p>
            </div>

            {/* Quick action: Load Sample THPT Exam */}
            <div className="mt-6 p-4 rounded-xl bg-teal-50/70 border border-teal-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-teal-600 text-white flex items-center justify-center shrink-0">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-teal-950">
                    Đề Mẫu Chuẩn Thầy Thiện (Có Đủ 3 Phần, Công Thức & Hình Ảnh)
                  </h3>
                  <p className="text-xs text-teal-800/80">
                    Gồm 5 câu Nhiều lựa chọn + 2 câu Đúng-Sai (8 ý) + 3 câu Trả lời ngắn, có hình ảnh minh họa thí nghiệm.
                  </p>
                </div>
              </div>
              <button
                onClick={handleLoadSampleExam}
                disabled={isLoading}
                className="w-full sm:w-auto px-4 py-2.5 text-xs font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-lg transition-colors whitespace-nowrap shadow-xs"
              >
                Nạp Đề Mẫu Ngay
              </button>
            </div>

            {/* Upload Zone */}
            <div className="mt-6">
              <input
                ref={fileInputRef}
                type="file"
                accept=".docx,.doc,.txt"
                onChange={handleFileUpload}
                className="hidden"
                id="exam-file-upload"
              />
              <label
                htmlFor="exam-file-upload"
                className="cursor-pointer border-2 border-dashed border-slate-300 hover:border-teal-500 hover:bg-teal-50/30 rounded-2xl p-8 flex flex-col items-center justify-center text-center transition-all group"
              >
                <div className="w-12 h-12 rounded-full bg-slate-100 group-hover:bg-teal-100 text-slate-500 group-hover:text-teal-700 flex items-center justify-center transition-colors mb-3">
                  <UploadCloud className="w-6 h-6" />
                </div>
                <span className="text-sm font-semibold text-slate-800 block">
                  Bấm để chọn file .docx hoặc .txt từ máy tính
                </span>
                <span className="text-xs text-slate-600 mt-1 block">
                  Hỗ trợ định dạng Microsoft Word (.docx) chứa công thức Equation, MathType và hình ảnh
                </span>
              </label>
            </div>

            {/* Alternative: Paste Text */}
            <div className="mt-6 pt-6 border-t border-slate-200">
              <details className="group" open>
                <summary className="text-sm font-semibold text-slate-700 cursor-pointer hover:text-teal-700 flex items-center justify-between">
                  <span>Hoặc dán trực tiếp nội dung đề thi (văn bản/HTML)</span>
                  <ChevronRight className="w-4 h-4 transition-transform group-open:rotate-90" />
                </summary>
                <div className="mt-3 space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs text-slate-500 font-medium">Nạp nhanh mẫu chuẩn:</span>
                    <button
                      type="button"
                      onClick={() => setRawText(SAMPLE_RAW_TEXT_EXAM)}
                      className="px-2.5 py-1 text-xs font-semibold bg-teal-50 text-teal-700 hover:bg-teal-100 border border-teal-200 rounded-md transition-colors"
                    >
                      Dán Đề Mẫu Chuẩn (17 Câu - Đủ 3 Phần)
                    </button>
                    <button
                      type="button"
                      onClick={() => setRawText(MINIMAL_DEMO_EXAM_TEXT)}
                      className="px-2.5 py-1 text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-300 rounded-md transition-colors"
                    >
                      Dán Đề Mẫu Rút Gọn (A.B.C.D | a)b)c)d | A. 0,25)
                    </button>
                    {rawText && (
                      <button
                        type="button"
                        onClick={() => setRawText('')}
                        className="px-2 py-1 text-xs text-rose-600 hover:underline ml-auto"
                      >
                        Xóa nội dung ô nhập
                      </button>
                    )}
                  </div>

                  <textarea
                    rows={8}
                    value={rawText}
                    onChange={e => setRawText(e.target.value)}
                    placeholder="Dán nội dung đề tại đây... Ví dụ:&#10;PHẦN I. CÂU HỎI NHIỀU LỰA CHỌN&#10;Câu 1: Dung dịch nào sau đây làm quỳ tím hóa đỏ?&#10;A. NaOH&#10;B. HCl&#10;C. H₂SO₄&#10;D. NaCl&#10;Đáp án: C&#10;&#10;PHẦN II. CÂU HỎI ĐÚNG - SAI&#10;Câu 2: Cho các phát biểu sau:&#10;a) Ethylene làm mất màu dd bromine. : Đúng&#10;b) Methane làm mất màu dd bromine. : Sai&#10;&#10;PHẦN III. CÂU HỎI TRẢ LỜI NGẮN&#10;Câu 3: Tính số mol NaOH...&#10;A. 0,25"
                    className="w-full rounded-xl border border-slate-300 p-3 text-sm focus:border-teal-600 focus:ring-1 focus:ring-teal-600 font-mono"
                  />
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500">
                      Hệ thống tự động phát hiện 3 phần theo quy ước Bộ GD&ĐT 2026.
                    </span>
                    <button
                      onClick={handleParseRawText}
                      disabled={isLoading || !rawText.trim()}
                      className="px-5 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-50 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
                    >
                      <FileCheck2 className="w-3.5 h-3.5" />
                      <span>Phân Tích Đề Ngay</span>
                    </button>
                  </div>
                </div>
              </details>
            </div>
          </div>
        </div>
      )}

      {/* ==================== STEP 2: PREVIEW & VERIFY BEFORE SHUFFLE ==================== */}
      {currentStep === 2 && (
        <div className="space-y-6">
          {/* Header Bar */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-2 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-teal-800">
                  Bước 2: Xem Trước & Kiểm Tra Tính Toàn Vẹn
                </span>
                <span className="text-xs text-slate-600">·</span>
                <span className="text-xs text-slate-600">{questions.length} câu hỏi</span>
              </div>
              <input
                type="text"
                value={examTitle}
                onChange={e => setExamTitle(e.target.value)}
                className="text-lg font-bold text-slate-900 w-full border-b border-transparent hover:border-slate-300 focus:border-teal-600 focus:outline-hidden py-0.5"
                placeholder="Tiêu đề bài kiểm tra"
              />
              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-700">
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-600">Khối:</span>
                  <select
                    value={examGrade}
                    onChange={e => setExamGrade(e.target.value)}
                    className="bg-slate-100 rounded px-2 py-1 text-slate-800 font-medium"
                  >
                    <option value="Lớp 12">Lớp 12</option>
                    <option value="Lớp 11">Lớp 11</option>
                    <option value="Lớp 10">Lớp 10</option>
                    <option value="Ôn Thi ĐH">Ôn Thi ĐH</option>
                  </select>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-600">Thời gian làm bài:</span>
                  <input
                    type="number"
                    value={durationMinutes}
                    onChange={e => setDurationMinutes(Number(e.target.value) || 50)}
                    className="w-16 bg-slate-100 rounded px-2 py-1 text-slate-800 font-medium text-center"
                    min={5}
                    max={180}
                  />
                  <span>phút</span>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="text-slate-600 font-medium">Số lần làm lại:</span>
                  <select
                    value={maxAttempts}
                    onChange={e => setMaxAttempts(Number(e.target.value))}
                    className="bg-slate-100 rounded px-2.5 py-1 text-slate-800 font-semibold text-xs border border-slate-200"
                  >
                    <option value={0}>Không giới hạn (Làm lại tự do)</option>
                    <option value={1}>1 lần duy nhất</option>
                    <option value={2}>Tối đa 2 lần</option>
                    <option value={3}>Tối đa 3 lần</option>
                    <option value={4}>Tối đa 4 lần</option>
                    <option value={5}>Tối đa 5 lần</option>
                    <option value={10}>Tối đa 10 lần</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              {initialExam && onCancelEdit && (
                <button
                  type="button"
                  onClick={onCancelEdit}
                  className="px-3.5 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                >
                  Hủy Chỉnh Sửa
                </button>
              )}

              {initialExam && (
                <button
                  type="button"
                  onClick={handleCreateOnlineExam}
                  className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 rounded-lg transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>Lưu Thay Đổi Đề</span>
                </button>
              )}

              <button
                type="button"
                onClick={handleDeleteUploadedExam}
                className="px-3.5 py-2 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
                title="Xóa toàn bộ nội dung đề vừa tải lên"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                <span>Xóa Đề Này</span>
              </button>

              {!initialExam && (
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="px-3.5 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 rounded-lg transition-colors cursor-pointer"
                >
                  Tải Lại Đề Khác
                </button>
              )}

              <button
                type="button"
                onClick={handleShuffleExam}
                disabled={isLoading}
                className="px-5 py-2.5 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 active:bg-teal-800 rounded-lg transition-colors shadow-xs flex items-center gap-2 cursor-pointer"
              >
                <Shuffle className="w-4 h-4" />
                <span>{initialExam ? 'Trộn Đổi Thứ Tự' : 'Tiến Hành Trộn Đề'}</span>
              </button>
            </div>
          </div>

          {/* Section Summary Counters */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white border border-slate-200 rounded-xl p-4">
              <span className="text-xs text-slate-600 block">PHẦN 1: Nhiều Lựa Chọn</span>
              <span className="text-xl font-bold text-slate-900 mt-1 block">
                {sec1Questions.length} câu
              </span>
              <span className="text-[11px] text-teal-800 mt-0.5 block">
                Trộn câu hỏi + Trộn 4 phương án A, B, C, D
              </span>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-4">
              <span className="text-xs text-slate-600 block">PHẦN 2: Đúng - Sai</span>
              <span className="text-xl font-bold text-slate-900 mt-1 block">
                {sec2Questions.length} câu
              </span>
              <span className="text-[11px] text-teal-800 mt-0.5 block">
                Trộn câu hỏi + Trộn các ý a, b, c, d
              </span>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-4">
              <span className="text-xs text-slate-600 block">PHẦN 3: Trả Lời Ngắn</span>
              <span className="text-xl font-bold text-slate-900 mt-1 block">
                {sec3Questions.length} câu
              </span>
              <span className="text-[11px] text-teal-800 mt-0.5 block">
                Trộn câu hỏi + Chuẩn hóa số/thập phân
              </span>
            </div>
          </div>

          {/* Questions Render List */}
          <div className="space-y-6">
            {/* Section 1 */}
            {sec1Questions.length > 0 && (
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-5">
                <div className="border-b border-slate-100 pb-3">
                  <h3 className="text-base font-bold text-slate-900">
                    PHẦN 1. CÂU HỎI TRẮC NGHIỆM NHIỀU PHƯƠNG ÁN LỰA CHỌN ({sec1Questions.length} câu)
                  </h3>
                  <p className="text-xs text-slate-600">
                    Mỗi câu hỏi chỉ chọn 1 phương án trả lời đúng.
                  </p>
                </div>

                <div className="space-y-6 divide-y divide-slate-100">
                  {sec1Questions.map((q, idx) => (
                    <div key={q.id} className={idx > 0 ? 'pt-6' : ''}>
                      <div className="flex items-start gap-2.5">
                        <span className="text-xs font-bold text-slate-900 bg-slate-100 px-2 py-1 rounded">
                          Câu {idx + 1}
                        </span>
                        <div className="flex-1">
                          <ChemistryRenderer content={q.questionContent} images={q.images} />
                          
                          {/* Options Grid */}
                          <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                            {q.options?.map(opt => (
                              <div
                                key={opt.id}
                                className={`p-3 rounded-xl border text-sm flex items-start gap-2.5 transition-colors ${
                                  opt.isCorrect
                                    ? 'bg-emerald-50/70 border-emerald-300 text-emerald-950 font-medium'
                                    : 'bg-slate-50/60 border-slate-200 text-slate-700'
                                }`}
                              >
                                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                                  opt.isCorrect
                                    ? 'bg-emerald-600 text-white'
                                    : 'bg-white text-slate-600 border border-slate-300'
                                }`}>
                                  {opt.label}
                                </span>
                                <div className="flex-1">
                                  <ChemistryRenderer content={opt.text} />
                                </div>
                                {opt.isCorrect && (
                                  <span className="text-[11px] font-semibold text-emerald-800 ml-auto shrink-0">
                                    [Đáp án đúng]
                                  </span>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Section 2 */}
            {sec2Questions.length > 0 && (
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-5">
                <div className="border-b border-slate-100 pb-3">
                  <h3 className="text-base font-bold text-slate-900">
                    PHẦN 2. CÂU HỎI TRẮC NGHIỆM ĐÚNG - SAI ({sec2Questions.length} câu)
                  </h3>
                  <p className="text-xs text-slate-600">
                    Trong mỗi ý a), b), c), d) ở mỗi câu, thí sinh chọn đúng hoặc sai.
                  </p>
                </div>

                <div className="space-y-6 divide-y divide-slate-100">
                  {sec2Questions.map((q, idx) => (
                    <div key={q.id} className={idx > 0 ? 'pt-6' : ''}>
                      <div className="flex items-start gap-2.5">
                        <span className="text-xs font-bold text-slate-900 bg-slate-100 px-2 py-1 rounded">
                          Câu {sec1Questions.length + idx + 1}
                        </span>
                        <div className="flex-1">
                          <ChemistryRenderer content={q.questionContent} images={q.images} />

                          {/* Sub-items table */}
                          <div className="mt-3 space-y-2">
                            {q.trueFalseItems?.map(item => (
                              <div
                                key={item.id}
                                className="p-3 rounded-xl border border-slate-200 bg-slate-50/60 flex items-start justify-between gap-3 text-sm"
                              >
                                <div className="flex items-start gap-2">
                                  <span className="font-bold text-slate-900 uppercase">
                                    {item.label})
                                  </span>
                                  <ChemistryRenderer content={item.text} />
                                </div>
                                <span className={`text-xs font-bold px-2 py-0.5 rounded shrink-0 ${
                                  item.isCorrect
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : 'bg-rose-100 text-rose-800'
                                }`}>
                                  {item.isCorrect ? 'ĐÚNG' : 'SAI'}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Section 3 */}
            {sec3Questions.length > 0 && (
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-5">
                <div className="border-b border-slate-100 pb-3">
                  <h3 className="text-base font-bold text-slate-900">
                    PHẦN 3. CÂU HỎI TRẮC NGHIỆM TRẢ LỜI NGẮN ({sec3Questions.length} câu)
                  </h3>
                  <p className="text-xs text-slate-600">
                    Thí sinh nhập câu trả lời vào ô tương ứng (chấp nhận số thập phân dấu phẩy hoặc chấm).
                  </p>
                </div>

                <div className="space-y-6 divide-y divide-slate-100">
                  {sec3Questions.map((q, idx) => (
                    <div key={q.id} className={idx > 0 ? 'pt-6' : ''}>
                      <div className="flex items-start gap-2.5">
                        <span className="text-xs font-bold text-slate-900 bg-slate-100 px-2 py-1 rounded">
                          Câu {sec1Questions.length + sec2Questions.length + idx + 1}
                        </span>
                        <div className="flex-1">
                          <ChemistryRenderer content={q.questionContent} images={q.images} />
                          
                          <div className="mt-3 flex items-center gap-3 p-3 bg-teal-50/60 border border-teal-200/80 rounded-xl text-sm">
                            <span className="text-xs font-semibold text-teal-900">
                              Đáp án chuẩn:
                            </span>
                            <span className="font-mono font-bold text-teal-800 bg-white px-2.5 py-1 rounded border border-teal-200">
                              {q.shortAnswer?.correctAnswer || '0'}
                            </span>
                            {q.shortAnswer?.explanation && (
                              <span className="text-xs text-teal-700 italic">
                                ({q.shortAnswer.explanation})
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ==================== STEP 3: SHUFFLED & VERIFIED ==================== */}
      {currentStep === 3 && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
            <div className="flex items-center gap-3 text-emerald-700">
              <ShieldCheck className="w-8 h-8 text-emerald-600" />
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Trộn Đề Hoàn Tất & Đã Xác Minh Tính Toàn Vẹn 100%!
                </h2>
                <p className="text-xs text-slate-600">
                  Quy tắc trộn chuẩn Bộ GD&ĐT: Chỉ trộn nội bộ Phần 1, Phần 2, Phần 3. Đã tự động cập nhật vị trí đáp án mới và bảo toàn hình ảnh, công thức hóa học.
                </p>
              </div>
            </div>

            {/* Verification log audit */}
            {shuffleReport && (
              <div className="mt-5 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono space-y-1.5 max-h-48 overflow-y-auto">
                <span className="text-slate-500 font-bold block mb-1">
                  Nhật Ký Xác Minh Đối Chiếu Tự Động:
                </span>
                {shuffleReport.verificationReport.map((log, idx) => (
                  <div key={idx} className="text-slate-700">
                    {log}
                  </div>
                ))}
              </div>
            )}

            <div className="mt-6 flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-100">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleDeleteUploadedExam}
                  className="px-3.5 py-2 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                  <span>Xóa Đề Này</span>
                </button>

                <button
                  type="button"
                  onClick={handleShuffleExam}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Trộn Lại Mã Đề Khác</span>
                </button>
              </div>

              <button
                type="button"
                onClick={handleCreateOnlineExam}
                className="px-6 py-2.5 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 active:bg-teal-800 rounded-lg transition-colors shadow-xs flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Tạo Bài Kiểm Tra & Lấy Link</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================== STEP 4: CREATED & SHARE LINK ==================== */}
      {currentStep === 4 && createdExam && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs text-center max-w-2xl mx-auto">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <h2 className="text-xl font-bold text-slate-900">
              Tạo Bài Kiểm Tra Trực Tuyến Thành Công!
            </h2>
            <p className="text-xs text-slate-600 mt-1">
              Bài kiểm tra đã được kích hoạt trên hệ thống. Học sinh chỉ cần mở link để làm bài, không cần cài đặt ứng dụng.
            </p>

            {/* Exam Code Display */}
            <div className="my-6 p-4 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-xs text-slate-500 uppercase font-semibold block">
                MÃ BÀI KIỂM TRA DUY NHẤT
              </span>
              <span className="text-2xl font-mono font-bold text-teal-700 tracking-wider mt-1 block">
                {createdExam.code}
              </span>
              <span className="text-xs text-slate-600 mt-1 block">
                {createdExam.title} ({createdExam.questions.length} câu · {createdExam.durationMinutes} phút · {createdExam.maxAttempts && createdExam.maxAttempts > 0 ? `Tối đa ${createdExam.maxAttempts} lần làm bài` : 'Làm lại không giới hạn'})
              </span>
            </div>

            {/* Shareable Link Box */}
            <div className="space-y-3 text-left">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Smartphone className="w-4 h-4 text-teal-600" />
                  <span className="text-xs font-bold text-slate-900">
                    Đường Dẫn Làm Bài Cho Học Sinh (Đã Khóa Bảo Mật Chỉ Xem Phòng Thi):
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowQrCode(!showQrCode)}
                  className="text-xs font-semibold text-teal-700 hover:text-teal-900 flex items-center gap-1 cursor-pointer"
                >
                  <QrCode className="w-3.5 h-3.5" />
                  <span>{showQrCode ? 'Ẩn mã QR' : 'Hiện mã QR quét Zalo'}</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={shareableUrl}
                  className="flex-1 bg-slate-50 font-semibold text-teal-950 rounded-xl px-3.5 py-2.5 text-xs font-mono border border-teal-300 focus:outline-hidden select-all"
                  onClick={e => (e.target as HTMLInputElement).select()}
                />
                <button
                  onClick={handleCopyLink}
                  className="px-4 py-2.5 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 active:bg-teal-800 rounded-xl transition-colors shrink-0 flex items-center gap-1.5 shadow-xs"
                >
                  {copiedLink ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Đã Sao Chép!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>Sao Chép Link Gửi Lớp</span>
                    </>
                  )}
                </button>
              </div>

              {/* QR Code Section */}
              {showQrCode && qrCodeUrl && (
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col sm:flex-row items-center justify-center gap-4 text-center sm:text-left animate-fadeIn">
                  <img
                    src={qrCodeUrl}
                    alt="Mã QR bài kiểm tra"
                    className="w-36 h-36 rounded-xl border border-slate-300 bg-white p-2 shadow-xs shrink-0"
                  />
                  <div className="space-y-1.5 text-xs text-slate-700 max-w-xs">
                    <span className="font-bold text-slate-900 block text-sm">
                      Mã QR Quét Vào Bài Thi
                    </span>
                    <p className="text-slate-600">
                      Học sinh mở ứng dụng <strong>Zalo</strong> hoặc <strong>Camera điện thoại</strong> quét mã này để vào thẳng phòng thi của học sinh.
                    </p>
                    <a
                      href={qrCodeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-teal-700 hover:underline font-semibold text-xs pt-1"
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span>Tải ảnh mã QR này về máy</span>
                    </a>
                  </div>
                </div>
              )}

              {/* Crucial Note: Protected Student Area */}
              <div className="p-3.5 rounded-2xl bg-teal-50/80 border border-teal-200 text-xs text-teal-950 space-y-1.5">
                <div className="flex items-center gap-2 font-bold text-teal-900">
                  <ShieldCheck className="w-4 h-4 text-teal-600 shrink-0" />
                  <span>Bảo mật tuyệt đối cho kỳ thi:</span>
                </div>
                <p className="text-[11px] leading-relaxed text-teal-900/90">
                  • Đường link này đã được gắn chế độ <strong>Chỉ dành cho Học sinh</strong>. Khi học sinh mở link (trên điện thoại hay máy tính), hệ thống sẽ <strong>ẩn hoàn toàn Khu Vực Giáo Viên</strong>, ẩn thanh menu tạo đề, không cho xem đáp án hay điểm của các bạn khác.
                </p>
                <p className="text-[11px] leading-relaxed text-teal-900/90">
                  • Học sinh chỉ thấy giao diện làm bài, nộp bài và xem điểm thi của chính mình sau khi nộp bài.
                </p>
              </div>

              {/* Crucial Note for Mobile & Zalo sharing to avoid 403 Forbidden */}
              <div className="p-4 rounded-2xl bg-amber-50/90 border border-amber-300 text-xs text-amber-950 space-y-2">
                <div className="flex items-center gap-2 font-bold text-sm text-amber-900">
                  <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
                  <span>Cách khắc phục triệt để lỗi 403 Forbidden trên điện thoại học sinh:</span>
                </div>
                
                <div className="bg-white/80 p-3 rounded-xl border border-amber-200 space-y-2 text-slate-800 text-[11px] leading-relaxed">
                  <div className="font-bold text-rose-700 flex items-center gap-1">
                    <span>1. Lý do báo lỗi 403:</span>
                  </div>
                  <p>
                    Google AI Studio mặc định bảo vệ ứng dụng ở chế độ riêng tư (chỉ Google của Thầy trên laptop mới xem được). Khi học sinh mở bằng điện thoại hoặc Zalo, Google không nhận diện được tài khoản của Thầy nên chặn lại và báo <strong>403 Forbidden</strong>.
                  </p>

                  <div className="font-bold text-teal-800 flex items-center gap-1 pt-1 border-t border-amber-100">
                    <span>2. Cách mở khóa công khai (Thực hiện 1 lần duy nhất):</span>
                  </div>
                  <ol className="list-decimal list-inside space-y-1 pl-1">
                    <li>Nhìn lên thanh công cụ ở <strong>góc trên bên phải màn hình Google AI Studio</strong> (bên cạnh nút Settings).</li>
                    <li>Bấm vào nút <strong>"Share" (Chia sẻ)</strong>.</li>
                    <li>Chọn chế độ <strong>"Anyone with the link can view" (Công khai)</strong> và bấm xác nhận.</li>
                  </ol>
                  <p className="text-teal-900 font-semibold pt-0.5">
                    → Ngay sau khi bấm Share, đường link <code className="bg-slate-100 px-1 py-0.5 rounded text-teal-800 font-mono">ais-pre-...</code> và Mã QR sẽ truy cập mượt mà trên tất cả điện thoại học sinh!
                  </p>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <span className="font-bold">Mẹo tiện lợi:</span>
                  <span>Thầy có thể gửi tin nhắn mẫu cho học sinh: <em>"Các em truy cập web và nhập mã đề: <strong>{createdExam.code}</strong> để làm bài thi Hóa học nhé!"</em></span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={() => onGoToStudentRoom(createdExam.code)}
                className="w-full sm:w-auto px-5 py-2.5 text-xs font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                <Eye className="w-4 h-4" />
                <span>Vào Làm Bài Thử Nghiệm</span>
              </button>

              <button
                onClick={() => {
                  setCurrentStep(1);
                  setCreatedExam(null);
                  setQuestions([]);
                }}
                className="w-full sm:w-auto px-5 py-2.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-colors"
              >
                + Tạo Thêm Đề Mới
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
