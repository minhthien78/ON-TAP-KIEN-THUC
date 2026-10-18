/**
 * Data structures for "HỌC HÓA CÙNG THẦY THIỆN"
 * Adheres to Vietnamese Ministry of Education 2025/2026 Examination Format (3 Sections)
 */

export type SectionType = 1 | 2 | 3;

export interface Option {
  id: string;
  label: 'A' | 'B' | 'C' | 'D' | string;
  text: string;
  isCorrect: boolean;
  originalLabel?: string;
  originalIndex?: number;
}

export interface TrueFalseItem {
  id: string;
  label: 'a' | 'b' | 'c' | 'd' | string;
  text: string;
  isCorrect: boolean; // true = Đúng, false = Sai
  originalLabel?: string;
}

export interface ShortAnswerData {
  correctAnswer: string;
  tolerance?: number;
  explanation?: string;
}

export interface Question {
  id: string;
  section: SectionType;
  questionNumber: number;
  questionContent: string;
  images?: string[];
  options?: Option[]; // For Section 1
  trueFalseItems?: TrueFalseItem[]; // For Section 2
  shortAnswer?: ShortAnswerData; // For Section 3
  originalOrder: number;
  shuffledOrder?: number;
  explanation?: string;
  validationWarning?: string;
}

export interface Exam {
  id: string;
  code: string; // e.g. "HHTT-2026-001"
  title: string;
  grade?: string; // e.g. "Lớp 12", "Lớp 11", "Lớp 10"
  durationMinutes: number;
  maxAttempts?: number; // 0 or undefined = Không giới hạn, 1 = 1 lần, 2 = 2 lần, etc.
  createdAt: string;
  isShuffled: boolean;
  questions: Question[];
  submissionsCount?: number;
}

export interface StudentSubmission {
  id: string;
  examCode: string;
  studentName: string;
  studentClass: string;
  startedAt: string;
  submittedAt: string;
  durationSeconds: number;
  score: number; // Max 10.0
  correctCount: number;
  incorrectCount: number;
  totalQuestions: number;
  answers: Record<string, any>; // questionId -> student response
  attemptNumber?: number;
  maxAttempts?: number;
  details: SubmissionQuestionDetail[];
}

export interface SubmissionQuestionDetail {
  questionId: string;
  section: SectionType;
  questionNumber: number;
  questionContent: string;
  images?: string[];
  isCorrect: boolean;
  pointsEarned: number;
  maxPoints: number;
  studentAnswer: any;
  correctAnswer: any;
  explanation?: string;
  subItems?: {
    label: string;
    text: string;
    studentChoice: boolean | null;
    correctChoice: boolean;
    isCorrect: boolean;
  }[];
}

export interface IntegrityCheckReport {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  section1Count: number;
  section2Count: number;
  section3Count: number;
  totalQuestions: number;
}
