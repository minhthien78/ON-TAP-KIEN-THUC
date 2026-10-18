import { Exam, StudentSubmission } from '../types/exam';
import { createDefaultExam } from '../utils/sampleExam';

const LOCAL_STORAGE_EXAMS_KEY = 'hhtt_exams_data';
const LOCAL_STORAGE_SUBMISSIONS_KEY = 'hhtt_submissions_data';

// Helper for localStorage fallback
function getLocalExams(): Exam[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_EXAMS_KEY);
    if (!raw) {
      const def = createDefaultExam();
      localStorage.setItem(LOCAL_STORAGE_EXAMS_KEY, JSON.stringify([def]));
      return [def];
    }
    return JSON.parse(raw);
  } catch {
    return [createDefaultExam()];
  }
}

function saveLocalExams(exams: Exam[]) {
  try {
    localStorage.setItem(LOCAL_STORAGE_EXAMS_KEY, JSON.stringify(exams));
  } catch (e) {
    console.warn('LocalStorage save failed', e);
  }
}

function getLocalSubmissions(): StudentSubmission[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_SUBMISSIONS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalSubmissions(subs: StudentSubmission[]) {
  try {
    localStorage.setItem(LOCAL_STORAGE_SUBMISSIONS_KEY, JSON.stringify(subs));
  } catch (e) {
    console.warn('LocalStorage save failed', e);
  }
}

export const api = {
  // Fetch all exams with bi-directional sync to guarantee persistence
  async getExams(): Promise<Exam[]> {
    try {
      const res = await fetch('/api/exams');
      if (res.ok) {
        const serverExams: Exam[] = await res.json();
        const localExams = getLocalExams();

        // Bi-directional sync: if teacher has local exams not on server (e.g. after server restart), sync to server
        let merged = [...serverExams];
        for (const localExam of localExams) {
          if (!merged.some(se => se.code.trim().toUpperCase() === localExam.code.trim().toUpperCase())) {
            merged.push(localExam);
            // Re-sync up to server in background
            fetch('/api/exams', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(localExam),
            }).catch(() => {});
          }
        }

        saveLocalExams(merged);
        return merged;
      }
    } catch (e) {
      console.warn('API getExams fallback to local', e);
    }
    return getLocalExams();
  },

  // Get student-safe exam (no answer keys)
  async getStudentExam(code: string): Promise<Exam> {
    const cleanCode = (code || '').trim();
    try {
      const res = await fetch(`/api/exams/${encodeURIComponent(cleanCode)}`);
      if (res.ok) {
        const data = await res.json();
        const local = getLocalExams().filter(e => e.code.trim().toUpperCase() !== cleanCode.toUpperCase());
        saveLocalExams([data, ...local]);
        return data;
      }

      const errData = await res.json().catch(() => null);
      if (errData?.error) {
        const localExams = getLocalExams();
        const localExam = localExams.find(e => e.code.trim().toUpperCase() === cleanCode.toUpperCase());
        if (localExam) return localExam;
        throw new Error(errData.error);
      }
    } catch (e: any) {
      if (e?.message && !e.message.includes('fetch') && !e.message.includes('Failed')) {
        throw e;
      }
      console.warn('API getStudentExam fallback to local', e);
    }

    const localExams = getLocalExams();
    const exam = localExams.find(e => e.code.trim().toUpperCase() === cleanCode.toUpperCase());
    if (!exam) throw new Error(`Không tìm thấy bài kiểm tra với mã: ${code}`);

    // Return safe stripped copy
    return {
      ...exam,
      questions: exam.questions.map(q => ({
        ...q,
        options: q.options?.map(o => ({ id: o.id, label: o.label, text: o.text, isCorrect: false })),
        trueFalseItems: q.trueFalseItems?.map(i => ({ id: i.id, label: i.label, text: i.text, isCorrect: false })),
        shortAnswer: q.shortAnswer ? { correctAnswer: '', tolerance: q.shortAnswer.tolerance } : undefined,
      }))
    };
  },

  // Get teacher full exam (with answers)
  async getTeacherExam(code: string): Promise<Exam> {
    try {
      const res = await fetch(`/api/exams/${encodeURIComponent(code)}/teacher`);
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.warn('API getTeacherExam fallback to local', e);
    }

    const localExams = getLocalExams();
    const exam = localExams.find(e => e.code.toUpperCase() === code.toUpperCase());
    if (!exam) throw new Error(`Không tìm thấy đề thi với mã: ${code}`);
    return exam;
  },

  // Save or update exam
  async saveExam(exam: Exam): Promise<Exam> {
    try {
      const res = await fetch('/api/exams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(exam),
      });
      if (res.ok) {
        const data = await res.json();
        // sync local
        const local = getLocalExams().filter(e => e.code !== exam.code);
        saveLocalExams([exam, ...local]);
        return data.exam || exam;
      }
    } catch (e) {
      console.warn('API saveExam fallback to local', e);
    }

    const local = getLocalExams().filter(e => e.code !== exam.code);
    saveLocalExams([exam, ...local]);
    return exam;
  },

  // Delete exam
  async deleteExam(code: string): Promise<void> {
    const clean = (code || '').trim().toUpperCase();
    try {
      await fetch(`/api/exams/${encodeURIComponent(clean)}`, { method: 'DELETE' });
    } catch (e) {
      console.warn('API deleteExam fallback to local', e);
    }
    const local = getLocalExams().filter(e => e.code.trim().toUpperCase() !== clean);
    saveLocalExams(local);
  },

  // Check student attempts
  async checkStudentAttempts(
    code: string,
    studentName: string
  ): Promise<{ attempts: number; maxAttempts: number; canTake: boolean }> {
    const cleanCode = (code || '').trim().toUpperCase();
    const cleanName = (studentName || '').trim();
    if (!cleanName) return { attempts: 0, maxAttempts: 0, canTake: true };

    try {
      const res = await fetch(
        `/api/exams/${encodeURIComponent(cleanCode)}/check-attempts?studentName=${encodeURIComponent(cleanName)}`
      );
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.warn('checkStudentAttempts fetch fallback', e);
    }

    const localSubs = getLocalSubmissions().filter(
      s => s.examCode.trim().toUpperCase() === cleanCode &&
           s.studentName.trim().toLowerCase() === cleanName.toLowerCase()
    );
    return {
      attempts: localSubs.length,
      maxAttempts: 0,
      canTake: true,
    };
  },

  // Submit student answers
  async submitExam(
    code: string,
    payload: {
      studentName: string;
      studentClass: string;
      answers: Record<string, any>;
      startedAt: string;
    }
  ): Promise<StudentSubmission> {
    const cleanCode = (code || '').trim().toUpperCase();
    const res = await fetch(`/api/exams/${encodeURIComponent(cleanCode)}/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      const data = await res.json();
      const subs = getLocalSubmissions();
      saveLocalSubmissions([data.submission, ...subs]);
      return data.submission;
    }

    // If server rejected (e.g. 403 exceeded max attempts, 400 invalid data)
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || `Lỗi máy chủ (${res.status}): Không thể nộp bài`);
  },

  // Get submissions
  async getSubmissions(code: string): Promise<StudentSubmission[]> {
    try {
      const res = await fetch(`/api/exams/${encodeURIComponent(code)}/submissions`);
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.warn('API getSubmissions fallback to local', e);
    }

    const subs = getLocalSubmissions();
    return subs.filter(s => s.examCode.toUpperCase() === code.toUpperCase());
  }
};
