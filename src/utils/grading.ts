import { Exam, Question, StudentSubmission, SubmissionQuestionDetail } from '../types/exam';

/**
 * Normalizes short-answer strings to enable robust comparison.
 * Handles:
 * - Comma as decimal separator ("0,25" -> "0.25")
 * - Trailing/leading whitespace
 * - Minor scientific units like "mol", "g", "ml", "lit", "gam", "%"
 * - Scientific notation (e.g. "1.5e-3")
 * - Fractions (e.g. "1/4" -> 0.25)
 */
export function normalizeAnswer(ans: string | number | undefined | null): string {
  if (ans === undefined || ans === null) return '';
  let str = String(ans).trim().toLowerCase();

  // Replace Vietnamese decimal comma with dot if surrounded by digits
  str = str.replace(/(\d+),(\d+)/g, '$1.$2');

  // Strip trailing unit words like "mol", "gam", "g", "l", "ml", "%"
  str = str.replace(/\s*(mol|gam|g|lit|l|ml|m|cm3|dm3|%)\b/gi, '').trim();

  // If it's a numeric fraction "1/4"
  if (/^\s*(-?\d+(\.\d+)?)\s*\/\s*(\d+(\.\d+)?)\s*$/.test(str)) {
    const parts = str.split('/');
    const numerator = parseFloat(parts[0]);
    const denominator = parseFloat(parts[1]);
    if (denominator !== 0) {
      const val = numerator / denominator;
      return String(Number(val.toFixed(6)));
    }
  }

  // If it parses as a float, standardize to remove trailing zeroes: "0.250" -> "0.25"
  const parsedNum = parseFloat(str);
  if (!isNaN(parsedNum) && !str.includes(' ')) {
    return String(Number(parsedNum.toFixed(6)));
  }

  return str;
}

/**
 * Evaluates whether student short answer matches correct answer
 */
export function compareShortAnswer(studentAns: string, correctAns: string, tolerance: number = 0.01): boolean {
  const normStudent = normalizeAnswer(studentAns);
  const normCorrect = normalizeAnswer(correctAns);

  if (!normStudent) return false;
  if (normStudent === normCorrect) return true;

  const numStudent = parseFloat(normStudent);
  const numCorrect = parseFloat(normCorrect);

  if (!isNaN(numStudent) && !isNaN(numCorrect)) {
    return Math.abs(numStudent - numCorrect) <= tolerance;
  }

  return false;
}

/**
 * MOET 2025 Standard True/False Item Scoring Rubric:
 * - 1 correct sub-item: 0.1 pt
 * - 2 correct sub-items: 0.25 pt
 * - 3 correct sub-items: 0.50 pt
 * - 4 correct sub-items: 1.00 pt
 */
export function calculateTrueFalseScore(correctCount: number): number {
  switch (correctCount) {
    case 1: return 0.10;
    case 2: return 0.25;
    case 3: return 0.50;
    case 4: return 1.00;
    default: return 0.0;
  }
}

/**
 * Grades the entire student submission accurately on a 10.0 scale.
 */
export function gradeSubmission(
  exam: Exam,
  studentName: string,
  studentClass: string,
  answers: Record<string, any>,
  startedAt: string,
  submittedAt: string = new Date().toISOString()
): StudentSubmission {
  const questions = exam.questions;
  const details: SubmissionQuestionDetail[] = [];

  let sec1Correct = 0;
  let sec2PointsSum = 0;
  let sec3Correct = 0;

  const sec1Questions = questions.filter(q => q.section === 1);
  const sec2Questions = questions.filter(q => q.section === 2);
  const sec3Questions = questions.filter(q => q.section === 3);

  // Default raw max points for sections based on standard MOET weightings:
  // Part 1: Multiple choice (approx 4.5 pts total)
  // Part 2: True/False (approx 4.0 pts total, 1 pt per question)
  // Part 3: Short answer (approx 1.5 pts total)
  // If question counts vary, we dynamically distribute proportionally to 10.0!

  const sec1Weight = sec1Questions.length > 0 ? (sec2Questions.length > 0 || sec3Questions.length > 0 ? 4.5 : 10.0) : 0;
  const sec2Weight = sec2Questions.length > 0 ? (sec1Questions.length > 0 || sec3Questions.length > 0 ? 4.0 : 10.0) : 0;
  const sec3Weight = sec3Questions.length > 0 ? (sec1Questions.length > 0 || sec2Questions.length > 0 ? 1.5 : 10.0) : 0;
  const totalWeight = (sec1Weight + sec2Weight + sec3Weight) || 10;

  // Process Part 1
  sec1Questions.forEach(q => {
    const studentChoice = answers[q.id];
    const correctOption = q.options?.find(o => o.isCorrect);
    const isCorrect = studentChoice !== undefined && studentChoice !== null && String(studentChoice) === correctOption?.id;

    if (isCorrect) sec1Correct++;

    const maxPts = sec1Questions.length > 0 ? (sec1Weight / sec1Questions.length) : 0;
    const earned = isCorrect ? maxPts : 0;

    details.push({
      questionId: q.id,
      section: 1,
      questionNumber: q.questionNumber,
      questionContent: q.questionContent,
      images: q.images,
      isCorrect,
      pointsEarned: earned,
      maxPoints: maxPts,
      studentAnswer: q.options?.find(o => o.id === studentChoice)?.label || 'Chưa chọn',
      correctAnswer: correctOption?.label || '',
      explanation: q.explanation,
    });
  });

  // Process Part 2
  sec2Questions.forEach(q => {
    const subAnswers = answers[q.id] || {}; // { [subId]: boolean }
    let subCorrectCount = 0;
    const subItems = (q.trueFalseItems || []).map(item => {
      const studentVal = subAnswers[item.id] !== undefined ? subAnswers[item.id] : null;
      const match = studentVal === item.isCorrect;
      if (match) subCorrectCount++;
      return {
        label: item.label,
        text: item.text,
        studentChoice: studentVal,
        correctChoice: item.isCorrect,
        isCorrect: match,
      };
    });

    const moetRawScore = calculateTrueFalseScore(subCorrectCount); // 0 to 1.0
    const maxPts = sec2Questions.length > 0 ? (sec2Weight / sec2Questions.length) : 1;
    const earned = moetRawScore * maxPts;
    sec2PointsSum += earned;

    const isAllCorrect = subCorrectCount === (q.trueFalseItems?.length || 4);

    details.push({
      questionId: q.id,
      section: 2,
      questionNumber: q.questionNumber,
      questionContent: q.questionContent,
      images: q.images,
      isCorrect: isAllCorrect,
      pointsEarned: earned,
      maxPoints: maxPts,
      studentAnswer: `${subCorrectCount}/${q.trueFalseItems?.length || 4} ý đúng`,
      correctAnswer: (q.trueFalseItems || []).map(i => `${i.label}: ${i.isCorrect ? 'Đúng' : 'Sai'}`).join(', '),
      explanation: q.explanation,
      subItems,
    });
  });

  // Process Part 3
  sec3Questions.forEach(q => {
    const studentAns = answers[q.id] || '';
    const correctAns = q.shortAnswer?.correctAnswer || '';
    const isCorrect = compareShortAnswer(studentAns, correctAns, q.shortAnswer?.tolerance || 0.01);

    if (isCorrect) sec3Correct++;

    const maxPts = sec3Questions.length > 0 ? (sec3Weight / sec3Questions.length) : 0;
    const earned = isCorrect ? maxPts : 0;

    details.push({
      questionId: q.id,
      section: 3,
      questionNumber: q.questionNumber,
      questionContent: q.questionContent,
      images: q.images,
      isCorrect,
      pointsEarned: earned,
      maxPoints: maxPts,
      studentAnswer: studentAns || 'Chưa trả lời',
      correctAnswer: correctAns,
      explanation: q.explanation,
    });
  });

  // Calculate final score normalized to 10.0 scale
  const rawSec1Points = sec1Questions.length > 0 ? (sec1Correct / sec1Questions.length) * sec1Weight : 0;
  const rawSec3Points = sec3Questions.length > 0 ? (sec3Correct / sec3Questions.length) * sec3Weight : 0;
  const totalScoreUnscaled = rawSec1Points + sec2PointsSum + rawSec3Points;
  const scaledScore = (totalScoreUnscaled / totalWeight) * 10;
  const finalScore = Math.min(10, Math.max(0, Math.round(scaledScore * 100) / 100));

  const totalQuestions = questions.length;
  const correctCount = details.filter(d => d.isCorrect).length;
  const incorrectCount = totalQuestions - correctCount;

  const durationSeconds = Math.max(1, Math.round((new Date(submittedAt).getTime() - new Date(startedAt).getTime()) / 1000));

  return {
    id: `SUB-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    examCode: exam.code,
    studentName: studentName.trim(),
    studentClass: studentClass.trim() || 'Tự do',
    startedAt,
    submittedAt,
    durationSeconds,
    score: finalScore,
    correctCount,
    incorrectCount,
    totalQuestions,
    answers,
    details,
  };
}
