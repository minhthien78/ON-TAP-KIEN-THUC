import { Exam, Question } from '../types/exam';

/**
 * Đề Thi Mẫu Chuẩn Thầy Thiện - Đề thi chính thức cập nhật theo tài liệu đính kèm
 * Cấu trúc chuẩn Bộ GD&ĐT:
 * - PHẦN 1: 10 câu trắc nghiệm nhiều lựa chọn A. B. C. D.
 * - PHẦN 2: 4 câu trắc nghiệm đúng - sai a) b) c) d)
 * - PHẦN 3: 3 câu trắc nghiệm trả lời ngắn
 */
export const SAMPLE_CHEMISTRY_QUESTIONS: Question[] = [
  // ==================== PHẦN 1: CÂU HỎI TRẮC NGHIỆM NHIỀU PHƯƠNG ÁN LỰA CHỌN (10 CÂU) ====================
  {
    id: 'Q-SEC1-001',
    section: 1,
    questionNumber: 1,
    originalOrder: 1,
    questionContent: 'Công thức chung của oxide kim loại nguyên tố nhóm IA là',
    options: [
      { id: 'opt-1-a', label: 'A', text: 'R₂O₃.', isCorrect: false },
      { id: 'opt-1-b', label: 'B', text: 'RO₂.', isCorrect: false },
      { id: 'opt-1-c', label: 'C', text: 'R₂O.', isCorrect: true },
      { id: 'opt-1-d', label: 'D', text: 'RO.', isCorrect: false }
    ],
    explanation: 'Kim loại kiềm (nhóm IA) có hóa trị I trong hợp chất, do đó oxide tương ứng có công thức chung là R₂O.'
  },
  {
    id: 'Q-SEC1-002',
    section: 1,
    questionNumber: 2,
    originalOrder: 2,
    questionContent: 'Phương trình hoá học của phản ứng nào sau đây không đúng?',
    options: [
      { id: 'opt-2-a', label: 'A', text: 'Ca + 2H₂O → Ca(OH)₂ + H₂', isCorrect: false },
      { id: 'opt-2-b', label: 'B', text: 'BeO + H₂O → Be(OH)₂', isCorrect: true },
      { id: 'opt-2-c', label: 'C', text: 'Mg + H₂SO₄ → MgSO₄ + H₂', isCorrect: false },
      { id: 'opt-2-d', label: 'D', text: 'Be + 2NaOH → Na₂BeO₂ + H₂', isCorrect: false }
    ],
    explanation: 'BeO là oxide lưỡng tính có liên kết cộng hóa trị rất bền vững, không tác dụng với nước ở bất kì nhiệt độ nào.'
  },
  {
    id: 'Q-SEC1-003',
    section: 1,
    questionNumber: 3,
    originalOrder: 3,
    questionContent: 'Trong dãy kim loại nhóm IA từ Li đến Cs. Nhiệt độ nóng chảy giảm dần là do nguyên nhân nào sau đây?',
    options: [
      { id: 'opt-3-a', label: 'A', text: 'Độ bền liên kết kim loại giảm dần.', isCorrect: true },
      { id: 'opt-3-b', label: 'B', text: 'Số electron hóa trị tăng dần.', isCorrect: false },
      { id: 'opt-3-c', label: 'C', text: 'Khối lượng nguyên tử tăng dần.', isCorrect: false },
      { id: 'opt-3-d', label: 'D', text: 'Độ âm điện giảm dần.', isCorrect: false }
    ],
    explanation: 'Từ Li đến Cs, bán kính nguyên tử tăng dần làm mật độ electron tự do giảm và độ bền liên kết kim loại giảm dần, dẫn tới nhiệt độ nóng chảy giảm dần.'
  },
  {
    id: 'Q-SEC1-004',
    section: 1,
    questionNumber: 4,
    originalOrder: 4,
    questionContent: 'Trong các mẫu nước cứng sau đây, nước cứng tạm thời là',
    options: [
      { id: 'opt-4-a', label: 'A', text: 'dung dịch Ca(HCO₃)₂.', isCorrect: true },
      { id: 'opt-4-b', label: 'B', text: 'dung dịch MgSO₄.', isCorrect: false },
      { id: 'opt-4-c', label: 'C', text: 'dung dịch CaCl₂.', isCorrect: false },
      { id: 'opt-4-d', label: 'D', text: 'dung dịch Mg(NO₃)₂.', isCorrect: false }
    ],
    explanation: 'Nước cứng tạm thời là nước cứng chứa các muối Ca(HCO₃)₂ và Mg(HCO₃)₂ (chứa ion HCO₃⁻).'
  },
  {
    id: 'Q-SEC1-005',
    section: 1,
    questionNumber: 5,
    originalOrder: 5,
    questionContent: 'Theo chiều tăng dần của điện tích hạt nhân nguyên tử, sự biến đổi tính chất của các nguyên tố nhóm IA nào sau đây đúng?',
    options: [
      { id: 'opt-5-a', label: 'A', text: 'Bán kính nguyên tử giảm dần.', isCorrect: false },
      { id: 'opt-5-b', label: 'B', text: 'Nhiệt độ nóng chảy tăng dần.', isCorrect: false },
      { id: 'opt-5-c', label: 'C', text: 'Độ cứng giảm dần.', isCorrect: true },
      { id: 'opt-5-d', label: 'D', text: 'Khối lượng riêng của đơn chất giảm dần.', isCorrect: false }
    ],
    explanation: 'Theo chiều tăng điện tích hạt nhân trong nhóm IA, liên kết kim loại yếu dần nên độ cứng của các kim loại kiềm giảm dần từ Li đến Cs.'
  },
  {
    id: 'Q-SEC1-006',
    section: 1,
    questionNumber: 6,
    originalOrder: 6,
    questionContent: 'Khi đun nóng nước tự nhiên, muối nào sau đây bị phân huỷ tạo thành cặn đá vôi trong phích nước, ấm đun nước?',
    options: [
      { id: 'opt-6-a', label: 'A', text: 'Ca₃(PO₄)₂.', isCorrect: false },
      { id: 'opt-6-b', label: 'B', text: 'CaCl₂.', isCorrect: false },
      { id: 'opt-6-c', label: 'C', text: 'CaSO₄.', isCorrect: false },
      { id: 'opt-6-d', label: 'D', text: 'Ca(HCO₃)₂.', isCorrect: true }
    ],
    explanation: 'Phương trình phân hủy: Ca(HCO₃)₂ ⎯(t°)→ CaCO₃↓ (cặn đá vôi) + CO₂↑ + H₂O.'
  },
  {
    id: 'Q-SEC1-007',
    section: 1,
    questionNumber: 7,
    originalOrder: 7,
    questionContent: 'Nước thải công nghiệp thường chứa các ion kim loại nặng như Hg²⁺, Pb²⁺, Fe³⁺. Để xử lí sơ bộ và làm giảm nồng độ các ion kim loại nặng với chi phí thấp, người ta sử dụng dung dịch chất nào sau đây?',
    options: [
      { id: 'opt-7-a', label: 'A', text: 'HCl.', isCorrect: false },
      { id: 'opt-7-b', label: 'B', text: 'NaCl.', isCorrect: false },
      { id: 'opt-7-c', label: 'C', text: 'Ca(OH)₂.', isCorrect: true },
      { id: 'opt-7-d', label: 'D', text: 'K₂SO₄.', isCorrect: false }
    ],
    explanation: 'Dung dịch vôi tôi Ca(OH)₂ rẻ tiền và cung cấp ion OH⁻ để kết tủa các ion kim loại nặng dưới dạng hydroxide không tan: Fe(OH)₃, Pb(OH)₂, HgO.'
  },
  {
    id: 'Q-SEC1-008',
    section: 1,
    questionNumber: 8,
    originalOrder: 8,
    questionContent: 'Cho 0,69 gam một kim loại kiềm tác dụng với nước (dư) thu được 0,37185 lít khí hydrogen (ở đkc). Kim loại kiềm là (Cho Li = 7, Na = 23, K = 39, Rb = 85)',
    options: [
      { id: 'opt-8-a', label: 'A', text: 'Rb.', isCorrect: false },
      { id: 'opt-8-b', label: 'B', text: 'Li.', isCorrect: false },
      { id: 'opt-8-c', label: 'C', text: 'Na.', isCorrect: true },
      { id: 'opt-8-d', label: 'D', text: 'K.', isCorrect: false }
    ],
    explanation: 'Số mol H₂ = 0,37185 / 24,79 = 0,015 mol. Kim loại kiềm R: n_R = 2 × n_H₂ = 0,03 mol. Khối lượng mol M_R = 0,69 / 0,03 = 23 (g/mol) → Na.'
  },
  {
    id: 'Q-SEC1-009',
    section: 1,
    questionNumber: 9,
    originalOrder: 9,
    questionContent: 'Nhiệt phân hoàn toàn m gam NaHCO₃ thu được 26,5 gam Na₂CO₃. Giá trị của m là',
    options: [
      { id: 'opt-9-a', label: 'A', text: '24.', isCorrect: false },
      { id: 'opt-9-b', label: 'B', text: '10.', isCorrect: false },
      { id: 'opt-9-c', label: 'C', text: '21.', isCorrect: false },
      { id: 'opt-9-d', label: 'D', text: '42.', isCorrect: true }
    ],
    explanation: '2NaHCO₃ ⎯(t°)→ Na₂CO₃ + CO₂ + H₂O. Số mol Na₂CO₃ = 26,5 / 106 = 0,25 mol → n_NaHCO₃ = 0,5 mol → m = 0,5 × 84 = 42 gam.'
  },
  {
    id: 'Q-SEC1-010',
    section: 1,
    questionNumber: 10,
    originalOrder: 10,
    questionContent: 'Để xử lý độ chua (tăng pH) cho một ao nuôi tôm diện tích 2000m², người dân sử dụng vôi bột (CaO) với hàm lượng 6kg/100m². Khối lượng vôi bột cần dùng là',
    options: [
      { id: 'opt-10-a', label: 'A', text: '120 kg.', isCorrect: true },
      { id: 'opt-10-b', label: 'B', text: '80 kg.', isCorrect: false },
      { id: 'opt-10-c', label: 'C', text: '100 kg.', isCorrect: false },
      { id: 'opt-10-d', label: 'D', text: '240 kg.', isCorrect: false }
    ],
    explanation: 'Khối lượng CaO = (2000 / 100) × 6 = 120 kg.'
  },

  // ==================== PHẦN 2: TRẮC NGHIỆM ĐÚNG - SAI (4 CÂU) ====================
  {
    id: 'Q-SEC2-001',
    section: 2,
    questionNumber: 11,
    originalOrder: 11,
    questionContent: `Các muối carbonate của kim loại nhóm IIA đều bị phân hủy bởi nhiệt. Xét phản ứng nhiệt phân:
MCO₃ ⎯(t°)→ MO + CO₂. Cho biết bảng số liệu:
<div class="my-3 overflow-x-auto">
  <table class="min-w-full text-xs border border-slate-300 text-center">
    <thead class="bg-slate-100 font-semibold">
      <tr>
        <th class="border border-slate-300 px-3 py-1.5">Muối</th>
        <th class="border border-slate-300 px-3 py-1.5">MgCO₃(s)</th>
        <th class="border border-slate-300 px-3 py-1.5">CaCO₃(s)</th>
        <th class="border border-slate-300 px-3 py-1.5">SrCO₃(s)</th>
        <th class="border border-slate-300 px-3 py-1.5">BaCO₃(s)</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td class="border border-slate-300 px-3 py-1.5 font-medium">ΔrH°₂₉₈ (kJ)</td>
        <td class="border border-slate-300 px-3 py-1.5">100,7</td>
        <td class="border border-slate-300 px-3 py-1.5">179,2</td>
        <td class="border border-slate-300 px-3 py-1.5">234,6</td>
        <td class="border border-slate-300 px-3 py-1.5">271,5</td>
      </tr>
    </tbody>
  </table>
</div>
Nhiệt độ bắt đầu xảy ra phản ứng nhiệt phân (sắp xếp ngẫu nhiên) các muối carbonate là 882°C; 1360°C; 542°C; 1155°C.`,
    trueFalseItems: [
      { id: 'tf-1-a', label: 'a', text: 'Độ bền nhiệt của các muối tăng dần từ MgCO₃ đến BaCO₃.', isCorrect: true },
      { id: 'tf-1-b', label: 'b', text: 'Các phản ứng nhiệt phân ở trên đều là phản ứng toả nhiệt.', isCorrect: false },
      { id: 'tf-1-c', label: 'c', text: 'Ở nhiệt độ 1155°C, phản ứng nhiệt phân SrCO₃ bắt đầu xảy ra.', isCorrect: true },
      { id: 'tf-1-d', label: 'd', text: 'Trong quá trình nung vôi xảy ra phản ứng nhiệt phân CaCO₃.', isCorrect: true }
    ],
    explanation: 'Ý b sai vì ΔrH°₂₉₈ > 0 là các phản ứng thu nhiệt. Nhiệt độ phân hủy tương ứng là MgCO₃ (542°C) < CaCO₃ (882°C) < SrCO₃ (1155°C) < BaCO₃ (1360°C).'
  },
  {
    id: 'Q-SEC2-002',
    section: 2,
    questionNumber: 12,
    originalOrder: 12,
    questionContent: 'Mỗi phát biểu sau là đúng hay sai về các nguyên tố kim loại chuyển tiếp dãy thứ nhất?',
    trueFalseItems: [
      { id: 'tf-2-a', label: 'a', text: 'Ở trạng thái cơ bản, lớp ngoài cùng của nguyên tử kim loại chuyển tiếp dãy thứ nhất có tối đa hai electron.', isCorrect: true },
      { id: 'tf-2-b', label: 'b', text: 'Nguyên tố kim loại chuyển tiếp dãy thứ nhất đều có nhiều số oxi hoá trong các hợp chất.', isCorrect: false },
      { id: 'tf-2-c', label: 'c', text: 'Phân lớp 3d trong nguyên tử các kim loại chuyển tiếp dãy thứ nhất đều chưa bão hoà.', isCorrect: false },
      { id: 'tf-2-d', label: 'd', text: 'Các kim loại chuyển tiếp dãy thứ nhất đều là các nguyên tố nhóm B.', isCorrect: true }
    ],
    explanation: 'Ý b sai vì Sc chỉ có số oxi hóa +3, Zn chỉ có +2. Ý c sai vì Cu (3d¹⁰4s¹) và Zn (3d¹⁰4s²) có phân lớp 3d đã bão hòa.'
  },
  {
    id: 'Q-SEC2-003',
    section: 2,
    questionNumber: 13,
    originalOrder: 13,
    questionContent: 'Khi mới cắt, miếng sodium có bề mặt sáng trắng của kim loại. Sau khi để một lát trong không khí thì bề mặt đó không còn sáng nữa mà bị xám lại.',
    trueFalseItems: [
      { id: 'tf-3-a', label: 'a', text: 'Miếng sodium sau khi cắt, bề mặt bị xám do ánh sáng mặt trời phản quang làm biến đổi màu sắc.', isCorrect: false },
      { id: 'tf-3-b', label: 'b', text: 'Sodium là kim loại có tính khử mạnh nên dễ bị oxi hoá trong không khí chuyển thành oxide dẫn đến màu sắc dễ bị thay đổi.', isCorrect: true },
      { id: 'tf-3-c', label: 'c', text: 'Sản phẩm thu được khi để sodium lâu trong không khí là Na₂O và Na₂O₂.', isCorrect: false },
      { id: 'tf-3-d', label: 'd', text: 'Trong không khí ẩm, các oxide dễ tác dụng với nước tạo thành các hydroxide, sau đó kết hợp với khí carbonic trong không khí sẽ thành muối.', isCorrect: true }
    ],
    explanation: 'Ý a sai vì bề mặt xám là do phản ứng hóa học tạo oxide/hydroxide, không phải quang học. Ý c sai vì để lâu trong không khí ẩm, sản phẩm cuối cùng là Na₂CO₃.'
  },
  {
    id: 'Q-SEC2-004',
    section: 2,
    questionNumber: 14,
    originalOrder: 14,
    questionContent: 'Muối CuSO₄ khan là chất rắn màu trắng. Khi hòa tan một lượng nhỏ muối này vào ống nghiệm chứa nước, thu được dung dịch có màu xanh do hình thành phức chất [Cu(OH₂)₆]²⁺. Thêm tiếp dung dịch hydrochloric acid đặc vào dung dịch trên thì thu được dung dịch X có màu vàng theo cân bằng sau:\n[Cu(OH₂)₆]²⁺(aq) + 4Cl⁻(aq) ⇌ [CuCl₄]²⁻(aq) + 6H₂O(l), ΔrH°₂₉₈ > 0 (*)',
    trueFalseItems: [
      { id: 'tf-4-a', label: 'a', text: 'Nếu đặt ống nghiệm chứa dung dịch X vào cốc nước nóng thì dung dịch chuyển từ màu vàng sang màu xanh.', isCorrect: false },
      { id: 'tf-4-b', label: 'b', text: 'CuSO₄ là hợp chất của kim loại chuyển tiếp.', isCorrect: true },
      { id: 'tf-4-c', label: 'c', text: 'Trong phức chất [Cu(OH₂)₆]²⁺, liên kết giữa nguyên tử trung tâm và phối tử là liên kết ion.', isCorrect: false },
      { id: 'tf-4-d', label: 'd', text: 'Trong phức chất [CuCl₄]²⁻, số oxi hóa của nguyên tử trung tâm là +2.', isCorrect: true }
    ],
    explanation: 'Ý a sai vì phản ứng thuận thu nhiệt (ΔrH° > 0), khi tăng nhiệt độ cân bằng chuyển dịch theo chiều thuận tạo thêm [CuCl₄]²⁻ có màu vàng đậm hơn. Ý c sai vì liên kết giữa nguyên tử Cu²⁺ và phối tử H₂O là liên kết phối trí (cho - nhận).'
  },

  // ==================== PHẦN 3: CÂU HỎI TRẢ LỜI NGẮN (3 CÂU) ====================
  {
    id: 'Q-SEC3-001',
    section: 3,
    questionNumber: 15,
    originalOrder: 15,
    questionContent: 'Số lượng phối tử trong phức chất [PtCl₄(NH₃)₂]²⁻ là bao nhiêu?',
    shortAnswer: {
      correctAnswer: '6',
      tolerance: 0,
      explanation: 'Trong phức chất [PtCl₄(NH₃)₂]²⁻, nguyên tử trung tâm Pt liên kết với 4 phối tử Cl⁻ và 2 phối tử NH₃, tổng số lượng phối tử là 4 + 2 = 6.'
    },
    explanation: 'Số phối tử = 4 (Cl⁻) + 2 (NH₃) = 6.'
  },
  {
    id: 'Q-SEC3-002',
    section: 3,
    questionNumber: 16,
    originalOrder: 16,
    questionContent: 'Ở 25°C, độ tan của KNO₃ là 38,0 g trong 100 g nước. Ở nhiệt độ này, dung dịch KNO₃ bão hòa có nồng độ a%. Tính giá trị của a (làm tròn đến 1 chữ số thập phân).',
    shortAnswer: {
      correctAnswer: '27,5',
      tolerance: 0.1,
      explanation: 'Khối lượng dung dịch = 38,0 + 100 = 138,0 g. Nồng độ C% = (38,0 / 138,0) × 100% ≈ 27,536% → a = 27,5.'
    },
    explanation: 'C% = (38 / 138) × 100% = 27,5%.'
  },
  {
    id: 'Q-SEC3-003',
    section: 3,
    questionNumber: 17,
    originalOrder: 17,
    questionContent: 'Cationite là một loại nhựa trao đổi cation được sử dụng để loại bỏ ion Ca²⁺, Mg²⁺. Khi nước cứng đi qua cột nhựa, các ion Ca²⁺, Mg²⁺ (kí hiệu chung là M²⁺) sẽ được giữ lại và thay thế bằng các ion H⁺, Na⁺ theo phản ứng sau: M²⁺ + 2R–SO₃X → (R–SO₃)₂M + 2X⁺ (X⁺ là H⁺ hoặc Na⁺).\nMột loại cationite có chứa 7,94% khối lượng sulfur được sử dụng để loại bỏ các ion Mg²⁺, Ca²⁺ trong nước cứng. Giả sử một cột nhựa trao đổi ion trong thiết bị lọc nước gia đình có khối lượng cationite là 1,00 kg thì tổng số mol Mg²⁺ và Ca²⁺ tối đa có thể được loại bỏ là bao nhiêu mol? (Kết quả làm tròn đến hàng phần trăm). Biết nguyên tử khối sulfur là 32.',
    shortAnswer: {
      correctAnswer: '1,24',
      tolerance: 0.02,
      explanation: 'Khối lượng sulfur m_S = 1000 × 7,94% = 79,4 g. Số mol nhóm –SO₃X = n_S = 79,4 / 32 = 2,48125 mol. Theo phương trình: n_M²⁺ = n_S / 2 = 2,48125 / 2 ≈ 1,24 mol.'
    },
    explanation: 'Số mol sulfur = (1000 × 0,0794) / 32 = 2,48125 mol. Cứ 2 nhóm –SO₃ liên kết 1 ion M²⁺, do đó tổng số mol Mg²⁺ và Ca²⁺ = 2,48125 / 2 = 1,24 mol.'
  }
];

export function createDefaultExam(): Exam {
  return {
    id: 'EXAM-DEFAULT-001',
    code: 'HHTT-2026-001',
    title: 'Đề Kiểm Tra Hóa Học 12 - Thầy Thiện (Kim Loại Kiềm, Nước Cứng, Phức Chất & Trao Đổi Ion)',
    grade: 'Lớp 12',
    durationMinutes: 50,
    createdAt: new Date().toISOString(),
    isShuffled: false,
    questions: SAMPLE_CHEMISTRY_QUESTIONS,
    submissionsCount: 0
  };
}

/**
 * Đề mẫu văn bản chuẩn 3 phần Bộ GD&ĐT 2025/2026
 * Dùng để dán trực tiếp vào ô văn bản hoặc kiểm tra parser
 */
export const SAMPLE_RAW_TEXT_EXAM = `PHẦN I. CÂU HỎI TRẮC NGHIỆM NHIỀU PHƯƠNG ÁN LỰA CHỌN
Thí sinh trả lời từ câu 1 đến câu 10. Mỗi câu hỏi thí sinh chỉ chọn một phương án.

Câu 1. Công thức chung của oxide kim loại nguyên tố nhóm IA là
A. R₂O₃.
B. RO₂.
<u>C. R₂O.</u>
D. RO.

Câu 2. Phương trình hoá học của phản ứng nào sau đây không đúng?
A. Ca + 2H₂O → Ca(OH)₂ + H₂
<u>B. BeO + H₂O → Be(OH)₂</u>
C. Mg + H₂SO₄ → MgSO₄ + H₂
D. Be + 2NaOH → Na₂BeO₂ + H₂

Câu 3. Trong dãy kim loại nhóm IA từ Li đến Cs. Nhiệt độ nóng chảy giảm dần là do nguyên nhân nào sau đây?
<u>A. Độ bền liên kết kim loại giảm dần.</u>
B. Số electron hóa trị tăng dần.
C. Khối lượng nguyên tử tăng dần.
D. Độ âm điện giảm dần.

Câu 4. Trong các mẫu nước cứng sau đây, nước cứng tạm thời là
<u>A. dung dịch Ca(HCO₃)₂.</u>
B. dung dịch MgSO₄.
C. dung dịch CaCl₂.
D. dung dịch Mg(NO₃)₂.

Câu 5. Theo chiều tăng dần của điện tích hạt nhân nguyên tử, sự biến đổi tính chất của các nguyên tố nhóm IA nào sau đây đúng?
A. Bán kính nguyên tử giảm dần.
B. Nhiệt độ nóng chảy tăng dần.
<u>C. Độ cứng giảm dần.</u>
D. Khối lượng riêng của đơn chất giảm dần.

Câu 6. Khi đun nóng nước tự nhiên, muối nào sau đây bị phân huỷ tạo thành cặn đá vôi trong phích nước, ấm đun nước?
A. Ca₃(PO₄)₂.
B. CaCl₂.
C. CaSO₄.
<u>D. Ca(HCO₃)₂.</u>

Câu 7. Nước thải công nghiệp thường chứa các ion kim loại nặng như Hg²⁺, Pb²⁺, Fe³⁺. Để xử lí sơ bộ và làm giảm nồng độ các ion kim loại nặng với chi phí thấp, người ta sử dụng dung dịch chất nào sau đây?
A. HCl.
B. NaCl.
<u>C. Ca(OH)₂.</u>
D. K₂SO₄.

Câu 8. Cho 0,69 gam một kim loại kiềm tác dụng với nước (dư) thu được 0,37185 lít khí hydrogen (ở đkc). Kim loại kiềm là (Cho Li = 7, Na = 23, K = 39, Rb = 85)
A. Rb.
B. Li.
<u>C. Na.</u>
D. K.

Câu 9. Nhiệt phân hoàn toàn m gam NaHCO₃ thu được 26,5 gam Na₂CO₃. Giá trị của m là
A. 24.
B. 10.
C. 21.
<u>D. 42.</u>

Câu 10. Để xử lý độ chua (tăng pH) cho một ao nuôi tôm diện tích 2000m², người dân sử dụng vôi bột (CaO) với hàm lượng 6kg/100m². Khối lượng vôi bột cần dùng là
<u>A. 120 kg.</u>
B. 80 kg.
C. 100 kg.
D. 240 kg.

PHẦN II. CÂU HỎI TRẮC NGHIỆM ĐÚNG - SAI
Thí sinh trả lời từ câu 11 đến câu 14. Trong mỗi ý a), b), c), d) ở mỗi câu, thí sinh chọn đúng hoặc sai.

Câu 11. Các muối carbonate của kim loại nhóm IIA đều bị phân hủy bởi nhiệt. Xét phản ứng nhiệt phân MCO₃ ⎯(t°)→ MO + CO₂.
a) Độ bền nhiệt của các muối tăng dần từ MgCO₃ đến BaCO₃. : Đúng
b) Các phản ứng nhiệt phân ở trên đều là phản ứng toả nhiệt. : Sai
c) Ở nhiệt độ 1155°C, phản ứng nhiệt phân SrCO₃ bắt đầu xảy ra. : Đúng
d) Trong quá trình nung vôi xảy ra phản ứng nhiệt phân CaCO₃. : Đúng

Câu 12. Mỗi phát biểu sau là đúng hay sai về các nguyên tố kim loại chuyển tiếp dãy thứ nhất?
a) Ở trạng thái cơ bản, lớp ngoài cùng của nguyên tử kim loại chuyển tiếp dãy thứ nhất có tối đa hai electron. : Đúng
b) Nguyên tố kim loại chuyển tiếp dãy thứ nhất đều có nhiều số oxi hoá trong các hợp chất. : Sai
c) Phân lớp 3d trong nguyên tử các kim loại chuyển tiếp dãy thứ nhất đều chưa bão hoà. : Sai
d) Các kim loại chuyển tiếp dãy thứ nhất đều là các nguyên tố nhóm B. : Đúng

Câu 13. Khi mới cắt, miếng sodium có bề mặt sáng trắng của kim loại. Sau khi để một lát trong không khí thì bề mặt đó không còn sáng nữa mà bị xám lại.
a) Miếng sodium sau khi cắt, bề mặt bị xám do ánh sáng mặt trời phản quang làm biến đổi màu sắc. : Sai
b) Sodium là kim loại có tính khử mạnh nên dễ bị oxi hoá trong không khí chuyển thành oxide dẫn đến màu sắc dễ bị thay đổi. : Đúng
c) Sản phẩm thu được khi để sodium lâu trong không khí là Na₂O và Na₂O₂. : Sai
d) Trong không khí ẩm, các oxide dễ tác dụng với nước tạo thành các hydroxide, sau đó kết hợp với khí carbonic trong không khí sẽ thành muối. : Đúng

Câu 14. Muối CuSO₄ khan là chất rắn màu trắng. Khi hòa tan vào nước thu được dung dịch màu xanh do hình thành phức chất [Cu(OH₂)₆]²⁺. Thêm dung dịch HCl đặc vào tạo cân bằng: [Cu(OH₂)₆]²⁺(aq) + 4Cl⁻(aq) ⇌ [CuCl₄]²⁻(aq) + 6H₂O(l), ΔrH°₂₉₈ > 0 (*).
a) Nếu đặt ống nghiệm chứa dung dịch X vào cốc nước nóng thì dung dịch chuyển từ màu vàng sang màu xanh. : Sai
b) CuSO₄ là hợp chất của kim loại chuyển tiếp. : Đúng
c) Trong phức chất [Cu(OH₂)₆]²⁺, liên kết giữa nguyên tử trung tâm và phối tử là liên kết ion. : Sai
d) Trong phức chất [CuCl₄]²⁻, số oxi hóa của nguyên tử trung tâm là +2. : Đúng

PHẦN III. CÂU HỎI TRẮC NGHIỆM TRẢ LỜI NGẮN
Thí sinh trả lời từ câu 15 đến câu 17.

Câu 15. Số lượng phối tử trong phức chất [PtCl₄(NH₃)₂]²⁻ là bao nhiêu?
A. 6

Câu 16. Ở 25°C, độ tan của KNO₃ là 38,0 g trong 100 g nước. Ở nhiệt độ này, dung dịch KNO₃ bão hòa có nồng độ a%. Tính giá trị của a (làm tròn đến 1 chữ số thập phân).
A. 27,5

Câu 17. Cationite là một loại nhựa trao đổi cation được sử dụng để loại bỏ ion Ca²⁺, Mg²⁺. Một loại cationite có chứa 7,94% khối lượng sulfur được sử dụng để loại bỏ các ion Mg²⁺, Ca²⁺ trong nước cứng. Khối lượng cationite là 1,00 kg thì tổng số mol Mg²⁺ và Ca²⁺ tối đa có thể được loại bỏ là bao nhiêu mol? (Kết quả làm tròn đến hàng phần trăm). Biết nguyên tử khối sulfur là 32.
A. 1,24`;

/**
 * Đề mẫu minh họa rút gọn theo đúng ví dụ quy ước của Thầy Thiện
 * Thể hiện đúng 3 dạng:
 * 1. Nhiều lựa chọn A. B. C. D. với C. H₂SO₄
 * 2. Đúng sai a) b) c) d)
 * 3. Trả lời ngắn với A. 0,25
 */
export const MINIMAL_DEMO_EXAM_TEXT = `PHẦN I. CÂU HỎI NHIỀU LỰA CHỌN
Câu 1. Dung dịch chất nào sau đây làm quỳ tím chuyển sang màu đỏ?
A. NaOH
B. HCl
<u>C. H₂SO₄</u>
D. NaCl

PHẦN II. CÂU HỎI ĐÚNG - SAI
Câu 2. Cho các phát biểu sau về liên kết và tính chất hóa học của hydrocarbon:
a) Phân tử ethylene (CH₂=CH₂) chứa liên kết đôi gồm một liên kết σ và một liên kết π. : Đúng
b) Phân tử acetylene (CH≡CH) chứa liên kết ba C≡C. : Đúng
c) Phản ứng trùng hợp ethylene thu được polymer là polyethylene (PE). : Đúng
d) Methane (CH₄) làm mất màu dung dịch bromine ở điều kiện thường. : Sai

PHẦN III. CÂU HỎI TRẢ LỜI NGẮN
Câu 3. Tính số mol NaOH cần dùng để trung hòa vừa đủ 100 mL dung dịch HCl 2,5M.
A. 0,25`;

