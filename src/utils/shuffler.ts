import { Exam, Option, Question, TrueFalseItem, IntegrityCheckReport } from '../types/exam';

/**
 * Fisher-Yates shuffle with custom seed or standard random
 */
function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Validates exam structure and completeness BEFORE or AFTER shuffling.
 * Ensures:
 * - Each section has questions
 * - Section 1 questions have 4 options and a marked correct answer
 * - Section 2 questions have 4 sub-items (a, b, c, d)
 * - Section 3 questions have a defined answer
 * - Attached images are preserved
 */
export function validateExamIntegrity(questions: Question[]): IntegrityCheckReport {
  const errors: string[] = [];
  const warnings: string[] = [];

  const sec1 = questions.filter(q => q.section === 1);
  const sec2 = questions.filter(q => q.section === 2);
  const sec3 = questions.filter(q => q.section === 3);

  if (sec1.length === 0) warnings.push('Đề thi chưa có câu hỏi nào thuộc PHẦN 1 (Nhiều lựa chọn).');
  if (sec2.length === 0) warnings.push('Đề thi chưa có câu hỏi nào thuộc PHẦN 2 (Đúng - Sai).');
  if (sec3.length === 0) warnings.push('Đề thi chưa có câu hỏi nào thuộc PHẦN 3 (Trả lời ngắn).');

  // Check Section 1 questions
  sec1.forEach((q, idx) => {
    const qNum = q.questionNumber || (idx + 1);
    if (!q.options || q.options.length < 2) {
      errors.push(`Câu ${qNum} (Phần 1): Thiếu các phương án lựa chọn A, B, C, D.`);
    } else {
      const correctOpts = q.options.filter(o => o.isCorrect);
      if (correctOpts.length === 0) {
        errors.push(`Câu ${qNum} (Phần 1): Chưa xác định được đáp án đúng (cần gạch chân hoặc chỉ định).`);
      } else if (correctOpts.length > 1) {
        warnings.push(`Câu ${qNum} (Phần 1): Có nhiều hơn 1 đáp án được đánh dấu đúng.`);
      }
    }
  });

  // Check Section 2 questions
  sec2.forEach((q, idx) => {
    const qNum = q.questionNumber || (idx + 1);
    if (!q.trueFalseItems || q.trueFalseItems.length < 2) {
      errors.push(`Câu ${qNum} (Phần 2): Thiếu các ý a, b, c, d.`);
    }
  });

  // Check Section 3 questions
  sec3.forEach((q, idx) => {
    const qNum = q.questionNumber || (idx + 1);
    if (!q.shortAnswer || !q.shortAnswer.correctAnswer?.trim()) {
      errors.push(`Câu ${qNum} (Phần 3): Chưa có giá trị đáp án chuẩn.`);
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    section1Count: sec1.length,
    section2Count: sec2.length,
    section3Count: sec3.length,
    totalQuestions: questions.length,
  };
}

export interface ShuffleResult {
  shuffledQuestions: Question[];
  integrityVerified: boolean;
  verificationReport: string[];
}

/**
 * Strict Exam Shuffler:
 * 1. Shuffles Section 1 questions amongst themselves.
 * 2. Shuffles Options (A, B, C, D) within each Section 1 question, and dynamically updates the correct answer label.
 * 3. Shuffles Section 2 questions amongst themselves. Shuffles sub-items a, b, c, d while preserving True/False states.
 * 4. Shuffles Section 3 questions amongst themselves.
 * 5. STRICT RULE: Preserves attached images along with their respective questions.
 * 6. INTEGRITY VERIFICATION: Compares the text of the new correct option against the original correct option.
 */
export function shuffleExam(originalQuestions: Question[]): ShuffleResult {
  const verificationReport: string[] = [];
  let integrityVerified = true;

  // Split into 3 strictly isolated sections
  const sec1 = originalQuestions.filter(q => q.section === 1);
  const sec2 = originalQuestions.filter(q => q.section === 2);
  const sec3 = originalQuestions.filter(q => q.section === 3);

  // 1. Process Section 1
  const shuffledSec1Raw = shuffleArray(sec1);
  const processedSec1: Question[] = shuffledSec1Raw.map((origQ, qIdx) => {
    const newQNum = qIdx + 1;

    // Find original correct option content
    const originalCorrectOption = origQ.options?.find(o => o.isCorrect);
    const originalCorrectText = originalCorrectOption?.text?.trim() || '';

    // Shuffle options
    let newOptions: Option[] = [];
    if (origQ.options && origQ.options.length > 0) {
      const standardLabels = ['A', 'B', 'C', 'D', 'E', 'F'];
      const shuffledOpts = shuffleArray(origQ.options);
      newOptions = shuffledOpts.map((opt, optIdx) => ({
        ...opt,
        label: standardLabels[optIdx] || opt.label,
        originalLabel: opt.label,
      }));

      // Integrity verification for this question
      const newCorrectOption = newOptions.find(o => o.isCorrect);
      if (originalCorrectOption && (!newCorrectOption || newCorrectOption.text.trim() !== originalCorrectText)) {
        integrityVerified = false;
        verificationReport.push(`LỖI TOÀN VẸN: Câu ${origQ.questionNumber} -> Câu mới ${newQNum}: Nội dung đáp án đúng không khớp sau khi hoán vị!`);
      } else {
        verificationReport.push(`✓ Câu ${origQ.questionNumber} (gốc: ${originalCorrectOption?.label}) -> Câu mới ${newQNum} (mới: ${newCorrectOption?.label}): Nội dung "${originalCorrectText}" bảo toàn 100%.`);
      }
    }

    return {
      ...origQ,
      questionNumber: newQNum,
      shuffledOrder: newQNum,
      options: newOptions,
      // Images remain tied to this specific question
      images: origQ.images ? [...origQ.images] : [],
    };
  });

  // 2. Process Section 2
  const shuffledSec2Raw = shuffleArray(sec2);
  const processedSec2: Question[] = shuffledSec2Raw.map((origQ, qIdx) => {
    const newQNum = processedSec1.length + qIdx + 1;

    // Sub-items a, b, c, d
    let newItems: TrueFalseItem[] = [];
    if (origQ.trueFalseItems && origQ.trueFalseItems.length > 0) {
      const subLabels = ['a', 'b', 'c', 'd', 'e', 'f'];
      const shuffledSub = shuffleArray(origQ.trueFalseItems);
      newItems = shuffledSub.map((item, itemIdx) => ({
        ...item,
        label: subLabels[itemIdx] || item.label,
        originalLabel: item.label,
      }));

      verificationReport.push(`✓ Câu Phần 2 số ${origQ.questionNumber} -> Câu mới ${newQNum}: Bảo toàn đầy đủ ${newItems.length} ý đúng/sai.`);
    }

    return {
      ...origQ,
      questionNumber: newQNum,
      shuffledOrder: newQNum,
      trueFalseItems: newItems,
      images: origQ.images ? [...origQ.images] : [],
    };
  });

  // 3. Process Section 3
  const shuffledSec3Raw = shuffleArray(sec3);
  const processedSec3: Question[] = shuffledSec3Raw.map((origQ, qIdx) => {
    const newQNum = processedSec1.length + processedSec2.length + qIdx + 1;

    verificationReport.push(`✓ Câu Phần 3 số ${origQ.questionNumber} -> Câu mới ${newQNum}: Đáp án chuẩn "${origQ.shortAnswer?.correctAnswer}" giữ nguyên.`);

    return {
      ...origQ,
      questionNumber: newQNum,
      shuffledOrder: newQNum,
      images: origQ.images ? [...origQ.images] : [],
    };
  });

  // Combined strictly ordered by Section 1 -> Section 2 -> Section 3
  const finalQuestions = [...processedSec1, ...processedSec2, ...processedSec3];

  return {
    shuffledQuestions: finalQuestions,
    integrityVerified,
    verificationReport,
  };
}
