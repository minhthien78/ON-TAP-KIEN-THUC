import React from 'react';
import {
  BookOpen,
  FlaskConical,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
  Shuffle,
  ShieldCheck,
  Sparkles
} from 'lucide-react';

interface TeacherGuideProps {
  onLoadSampleExam: () => void;
}

export const TeacherGuide: React.FC<TeacherGuideProps> = ({ onLoadSampleExam }) => {
  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 space-y-8">
      {/* Title */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center">
            <FlaskConical className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">
              Cẩm Nang & Quy Chuẩn Đề Thi Hóa Học Thầy Thiện
            </h1>
            <span className="text-xs text-slate-500">
              Chuẩn cấu trúc Đề thi Tốt nghiệp THPT Bộ Giáo dục & Đào tạo từ năm 2025
            </span>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mt-3">
          Hệ thống được thiết kế đặc thù cho bộ môn Hóa học THPT, giải quyết triệt để bài toán biến dạng công thức hóa học (chỉ số dưới, chỉ số trên, điện tích ion, liên kết đôi/ba) và thất lạc hình ảnh khi xáo trộn đề thi.
        </p>

        <div className="mt-5 p-4 rounded-xl bg-teal-50 border border-teal-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-xs font-bold text-teal-950 block">
              Trải nghiệm ngay với Đề mẫu chuẩn Bộ GD&ĐT 2026:
            </span>
            <span className="text-xs text-teal-800">
              Có sẵn 5 câu Phần 1, 2 câu Phần 2 (8 ý), 3 câu Phần 3 và hình vẽ thí nghiệm.
            </span>
          </div>
          <button
            onClick={onLoadSampleExam}
            className="px-4 py-2 text-xs font-bold text-white bg-teal-700 hover:bg-teal-800 rounded-lg transition-colors whitespace-nowrap shadow-xs"
          >
            Nạp Đề Mẫu & Trộn Thử
          </button>
        </div>
      </div>

      {/* Guide Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Section 1 Guide */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
          <span className="text-xs font-bold text-teal-700 uppercase tracking-wider block">
            PHẦN 1: Nhiều Lựa Chọn
          </span>
          <h3 className="text-sm font-bold text-slate-900">
            Trắc Nghiệm 4 Phương Án
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            - <strong>Quy ước phương án:</strong> Nhận diện các phương án chuẩn <code className="bg-slate-100 px-1 py-0.5 rounded text-teal-800">A.</code>, <code className="bg-slate-100 px-1 py-0.5 rounded text-teal-800">B.</code>, <code className="bg-slate-100 px-1 py-0.5 rounded text-teal-800">C.</code>, <code className="bg-slate-100 px-1 py-0.5 rounded text-teal-800">D.</code> (có dấu chấm, không dùng dấu ngoặc đơn).<br/>
            - <strong>Xác định đáp án:</strong> Gạch chân chữ cái hoặc nội dung phương án đúng trong Word (ví dụ: <code className="bg-slate-100 px-1 py-0.5 rounded text-teal-800"><u>A.</u> NaOH</code> hoặc <code className="bg-slate-100 px-1 py-0.5 rounded text-teal-800"><u>C. H₂SO₄</u></code>), hoặc dòng <code className="bg-slate-100 px-1 py-0.5 rounded text-teal-800">Đáp án: C</code>.<br/>
            - <strong>Quy tắc trộn:</strong> Trộn câu hỏi và trộn 4 phương án trong phạm vi Phần 1, tự động cập nhật đáp án đúng mới tương ứng.
          </p>
        </div>

        {/* Section 2 Guide */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
          <span className="text-xs font-bold text-teal-700 uppercase tracking-wider block">
            PHẦN 2: Đúng - Sai
          </span>
          <h3 className="text-sm font-bold text-slate-900">
            Mỗi Câu 4 Ý a, b, c, d
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            - Mỗi câu gồm 4 nhận định độc lập a), b), c), d).<br/>
            - <strong>Chấm điểm chuẩn:</strong> 1 ý đúng = 0.1đ; 2 ý đúng = 0.25đ; 3 ý đúng = 0.5đ; 4 ý đúng = 1.0đ.<br/>
            - <strong>Quy tắc trộn:</strong> Chỉ trộn trong phạm vi Phần 2, bảo toàn liên kết ý.
          </p>
        </div>

        {/* Section 3 Guide */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
          <span className="text-xs font-bold text-teal-700 uppercase tracking-wider block">
            PHẦN 3: Trả Lời Ngắn
          </span>
          <h3 className="text-sm font-bold text-slate-900">
            Điền Số & Chuẩn Hóa
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            - Câu hỏi tính toán định lượng số mol, khối lượng, pH, hiệu suất.<br/>
            - <strong>Quy ước đáp án trong file:</strong> Đặt dòng <code className="bg-slate-100 px-1 py-0.5 rounded text-teal-800">A. [giá trị]</code> (Ví dụ: <code className="bg-slate-100 px-1 py-0.5 rounded text-teal-800">A. 0,25</code>). Hệ thống nhận diện "A." là ký hiệu đáp án đúng và "0,25" là giá trị.<br/>
            - <strong>Chuẩn hóa tự động:</strong> Chấp nhận cả <code className="bg-slate-100 px-1 py-0.5 rounded">0,25</code> và <code className="bg-slate-100 px-1 py-0.5 rounded">0.25</code>, loại bỏ đơn vị thừa khi so khớp, có biên độ sai số làm tròn hợp lý.
          </p>
        </div>
      </div>

      {/* Strict Chemistry Formula Preservation Guide */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-teal-600" />
          <span>Bảo Toàn Định Dạng Công Thức Hóa Học & Hình Ảnh Minh Họa</span>
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                <th className="py-2.5 px-3">Hạng Mục</th>
                <th className="py-2.5 px-3">Ví Dụ Tiêu Biểu</th>
                <th className="py-2.5 px-3">Cơ Chế Bảo Toàn</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr>
                <td className="py-2.5 px-3 font-semibold text-slate-900">Chỉ số dưới</td>
                <td className="py-2.5 px-3 font-mono text-teal-800">H₂O, CO₂, Na₂SO₄, C₂H₅OH</td>
                <td className="py-2.5 px-3 text-slate-600">Giữ nguyên thẻ &lt;sub&gt; hoặc mã Unicode, không biến thành H2O</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-semibold text-slate-900">Điện tích ion / Số oxi hóa</td>
                <td className="py-2.5 px-3 font-mono text-teal-800">SO₄²⁻, NH₄⁺, Fe³⁺, Al³⁺, OH⁻</td>
                <td className="py-2.5 px-3 text-slate-600">Giữ nguyên đồng thời cả chỉ số dưới và điện tích trên</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-semibold text-slate-900">Liên kết hóa học</td>
                <td className="py-2.5 px-3 font-mono text-teal-800">CH₂=CH₂ (đôi), CH≡CH (ba)</td>
                <td className="py-2.5 px-3 text-slate-600">Không bị mất dấu liên kết hay biến dạng thành chữ thường</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-semibold text-slate-900">Mũi tên phản ứng & Nhiệt độ</td>
                <td className="py-2.5 px-3 font-mono text-teal-800">→, ⇄, ⇌, ⎯⎯(t°)→</td>
                <td className="py-2.5 px-3 text-slate-600">Hiển thị chuẩn mũi tên một chiều và cân bằng thuận nghịch</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-semibold text-slate-900">Hình ảnh minh họa thí nghiệm</td>
                <td className="py-2.5 px-3 text-teal-800">Sơ đồ điều chế khí, đồ thị chuẩn độ pH</td>
                <td className="py-2.5 px-3 text-slate-600">Hình ảnh gắn chặt với câu hỏi, khi câu hỏi chuyển vị trí thì ảnh chuyển theo 100%</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
