import React, { useState, useEffect } from 'react';
import {
  FileText,
  Copy,
  Check,
  Eye,
  BarChart3,
  Trash2,
  Calendar,
  Users,
  Clock,
  Sparkles,
  ExternalLink,
  Plus,
  QrCode,
  Smartphone,
  AlertTriangle,
  X,
  Edit3
} from 'lucide-react';
import { Exam } from '../types/exam';
import { fetchServerConfig, getStudentExamLink, getExamQrCodeUrl, ServerConfig } from '../utils/urlHelper';

interface TeacherExamListProps {
  exams: Exam[];
  onSelectExamResults: (exam: Exam) => void;
  onGoToStudentRoom: (code: string) => void;
  onCreateNewExam: () => void;
  onEditExam: (exam: Exam) => void;
  onDeleteExam: (code: string) => void;
}

export const TeacherExamList: React.FC<TeacherExamListProps> = ({
  exams,
  onSelectExamResults,
  onGoToStudentRoom,
  onCreateNewExam,
  onEditExam,
  onDeleteExam,
}) => {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [serverConfig, setServerConfig] = useState<ServerConfig | null>(null);
  const [qrModalExam, setQrModalExam] = useState<Exam | null>(null);
  const [examToDelete, setExamToDelete] = useState<Exam | null>(null);

  useEffect(() => {
    fetchServerConfig().then(cfg => setServerConfig(cfg));
  }, []);

  const handleCopy = (code: string) => {
    const url = getStudentExamLink(code, serverConfig);
    navigator.clipboard.writeText(url);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 space-y-6">
      {/* Top Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">
            Kho Đề Thi Hóa Học Của Thầy Thiện
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Quản lý tất cả các bài kiểm tra đã tạo, theo dõi số lượng học sinh làm bài và lấy link an toàn gửi cho lớp (Zalo/Điện thoại).
          </p>
        </div>

        <button
          onClick={onCreateNewExam}
          className="px-4 py-2.5 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-xl transition-colors shadow-xs flex items-center gap-1.5 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Tạo Đề Thi Mới</span>
        </button>
      </div>

      {/* Helpful Mobile Link Notice */}
      <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 flex items-start gap-3 text-xs text-amber-900">
        <Smartphone className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="font-bold text-amber-950 block">
            Hướng dẫn gửi link cho học sinh làm bài trên điện thoại (Zalo / Safari / Chrome):
          </span>
          <p className="text-amber-900/90 leading-relaxed">
            Hệ thống đã tự động tạo đường dẫn trực tiếp trên Cloud Run độc lập. Hãy bấm nút <strong>"Sao Chép Link Gửi Học Sinh"</strong> hoặc bấm icon <strong>Mã QR</strong> để học sinh quét bằng Zalo. Tránh copy link từ thanh địa chỉ trình duyệt trên máy tính để tránh lỗi 403 Google.
          </p>
        </div>
      </div>

      {/* Exam Grid */}
      {exams.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Chưa có bài kiểm tra nào</h3>
            <p className="text-xs text-slate-500 mt-1">
              Thầy cô hãy nạp file đề hoặc tạo bài kiểm tra đầu tiên để bắt đầu.
            </p>
          </div>
          <button
            onClick={onCreateNewExam}
            className="px-4 py-2 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-xl transition-colors shadow-xs"
          >
            Nạp Đề Mới Ngay
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {exams.map(exam => {
            const sec1Count = exam.questions.filter(q => q.section === 1).length;
            const sec2Count = exam.questions.filter(q => q.section === 2).length;
            const sec3Count = exam.questions.filter(q => q.section === 3).length;
            const isCopied = copiedCode === exam.code;

            return (
              <div
                key={exam.id}
                className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs hover:border-teal-300 transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-xs font-mono font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                      {exam.code}
                    </span>
                    <span className="text-[11px] text-slate-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{exam.durationMinutes} phút</span>
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-sm font-bold text-slate-900 line-clamp-2 leading-snug">
                    {exam.title}
                  </h3>

                  {/* Badges / Metrics */}
                  <div className="mt-3 py-2 px-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1 text-xs">
                    <div className="flex items-center justify-between text-slate-600">
                      <span>Cấu trúc 3 phần:</span>
                      <span className="font-semibold text-slate-900">
                        {sec1Count} TN · {sec2Count} Đ/S · {sec3Count} TLN
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-slate-600">
                      <span className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5 text-slate-400" />
                        <span>Đã nộp bài:</span>
                      </span>
                      <span className="font-bold text-teal-700 tabular-nums">
                        {exam.submissionsCount || 0} học sinh
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-slate-600 pt-0.5 border-t border-slate-100">
                      <span>Lượt làm bài:</span>
                      <span className="font-semibold text-slate-900">
                        {exam.maxAttempts && exam.maxAttempts > 0
                          ? `Tối đa ${exam.maxAttempts} lần`
                          : 'Làm lại tự do'}
                      </span>
                    </div>
                  </div>

                  <div className="mt-2 text-[11px] text-slate-400 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    <span>Tạo ngày: {new Date(exam.createdAt).toLocaleDateString('vi-VN')}</span>
                  </div>
                </div>

                {/* Actions Footer */}
                <div className="mt-5 pt-4 border-t border-slate-100 space-y-2">
                  {/* Primary Link Button for Students */}
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleCopy(exam.code)}
                      className={`flex-1 py-2 px-3 rounded-xl border text-xs font-semibold transition-all flex items-center justify-center gap-1.5 shadow-2xs ${
                        isCopied
                          ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                          : 'bg-white border-teal-300 text-teal-800 hover:bg-teal-50'
                      }`}
                    >
                      {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5 text-teal-600" />}
                      <span>{isCopied ? 'Đã Sao Chép Link!' : 'Sao Chép Link Gửi Học Sinh'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setQrModalExam(exam)}
                      title="Xem mã QR để học sinh quét bằng Zalo"
                      className="p-2 rounded-xl border border-slate-200 text-slate-700 hover:text-teal-700 hover:bg-teal-50 transition-colors"
                    >
                      <QrCode className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onSelectExamResults(exam)}
                      className="flex-1 px-3 py-2 text-xs font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <BarChart3 className="w-3.5 h-3.5" />
                      <span>Xem Điểm ({exam.submissionsCount || 0})</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => onEditExam(exam)}
                      title="Chỉnh sửa nội dung đề thi này"
                      className="p-2 rounded-xl text-slate-500 hover:text-teal-700 hover:bg-teal-50 border border-slate-200 hover:border-teal-300 transition-colors cursor-pointer"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => onGoToStudentRoom(exam.code)}
                      title="Vào làm bài thử"
                      className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
                    >
                      <Eye className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => setExamToDelete(exam)}
                      title="Xóa đề này"
                      className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Exam Confirmation Modal */}
      {examToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl border border-slate-200 space-y-4 text-center animate-fadeIn relative">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-1 border border-rose-200">
              <Trash2 className="w-6 h-6" />
            </div>

            <div>
              <span className="text-xs font-mono font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                {examToDelete.code}
              </span>
              <h3 className="text-base font-bold text-slate-900 mt-2">
                Xác Nhận Xóa Đề Thi?
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Thầy cô có chắc chắn muốn xóa bài kiểm tra <strong className="text-slate-800">"{examToDelete.title}"</strong> không? Toàn bộ câu hỏi và bài làm liên quan của học sinh sẽ bị gỡ bỏ.
              </p>
            </div>

            <div className="pt-2 flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => setExamToDelete(null)}
                className="flex-1 py-2.5 px-4 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
              >
                Hủy Bỏ
              </button>

              <button
                type="button"
                onClick={() => {
                  onDeleteExam(examToDelete.code);
                  setExamToDelete(null);
                }}
                className="flex-1 py-2.5 px-4 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 active:bg-rose-800 rounded-xl transition-colors shadow-xs cursor-pointer"
              >
                Xóa Vĩnh Viễn
              </button>
            </div>
          </div>
        </div>
      )}

      {/* QR Code Popup Modal */}
      {qrModalExam && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl border border-slate-200 space-y-4 text-center animate-fadeIn relative">
            <button
              onClick={() => setQrModalExam(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <span className="text-xs font-mono font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                {qrModalExam.code}
              </span>
              <h3 className="text-sm font-bold text-slate-900 mt-2 line-clamp-2">
                {qrModalExam.title}
              </h3>
            </div>

            {/* QR Image */}
            <div className="flex justify-center">
              <img
                src={getExamQrCodeUrl(getStudentExamLink(qrModalExam.code, serverConfig), 260)}
                alt={`Mã QR ${qrModalExam.code}`}
                className="w-48 h-48 rounded-xl border border-slate-300 p-2 bg-white shadow-xs"
              />
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Học sinh mở <strong>Zalo</strong> hoặc <strong>Camera điện thoại</strong> quét mã QR này để vào phòng thi trực tuyến ngay.
            </p>

            <div className="pt-2 flex flex-col gap-2">
              <button
                type="button"
                onClick={() => {
                  handleCopy(qrModalExam.code);
                }}
                className="w-full py-2.5 px-4 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-xl transition-colors shadow-xs flex items-center justify-center gap-1.5"
              >
                <Copy className="w-4 h-4" />
                <span>Sao Chép Link Làm Bài</span>
              </button>

              <button
                type="button"
                onClick={() => setQrModalExam(null)}
                className="w-full py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 rounded-xl"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
