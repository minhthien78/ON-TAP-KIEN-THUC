import express, { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { Exam, StudentSubmission } from './src/types/exam.js';
import { gradeSubmission } from './src/utils/grading.js';
import { createDefaultExam } from './src/utils/sampleExam.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_DIR = path.join(__dirname, 'data');
const EXAMS_FILE = path.join(DATA_DIR, 'exams.json');
const SUBMISSIONS_FILE = path.join(DATA_DIR, 'submissions.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Helper to read / write exams
function getStoredExams(): Exam[] {
  try {
    if (!fs.existsSync(EXAMS_FILE)) {
      const defaultExam = createDefaultExam();
      fs.writeFileSync(EXAMS_FILE, JSON.stringify([defaultExam], null, 2), 'utf-8');
      return [defaultExam];
    }
    const data = fs.readFileSync(EXAMS_FILE, 'utf-8');
    const parsed = JSON.parse(data);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      const defaultExam = createDefaultExam();
      fs.writeFileSync(EXAMS_FILE, JSON.stringify([defaultExam], null, 2), 'utf-8');
      return [defaultExam];
    }
    return parsed;
  } catch (err) {
    console.error('Error reading exams:', err);
    return [createDefaultExam()];
  }
}

function saveStoredExams(exams: Exam[]): void {
  fs.writeFileSync(EXAMS_FILE, JSON.stringify(exams, null, 2), 'utf-8');
}

// Helper to read / write submissions
function getStoredSubmissions(): StudentSubmission[] {
  try {
    if (!fs.existsSync(SUBMISSIONS_FILE)) {
      fs.writeFileSync(SUBMISSIONS_FILE, JSON.stringify([], null, 2), 'utf-8');
      return [];
    }
    const data = fs.readFileSync(SUBMISSIONS_FILE, 'utf-8');
    return JSON.parse(data) || [];
  } catch (err) {
    console.error('Error reading submissions:', err);
    return [];
  }
}

function saveStoredSubmissions(submissions: StudentSubmission[]): void {
  fs.writeFileSync(SUBMISSIONS_FILE, JSON.stringify(submissions, null, 2), 'utf-8');
}

// Middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// ==================== REST API ROUTES ====================

// Health check
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', app: 'Học Hóa Cùng Thầy Thiện', time: new Date().toISOString() });
});

// App configuration & public URL resolver
app.get('/api/config', (_req: Request, res: Response) => {
  const envUrl = process.env.APP_URL || '';
  // Convert dev URL to preview/shared URL (ais-dev-... -> ais-pre-...)
  const sharedUrl = envUrl.includes('ais-dev-')
    ? envUrl.replace('ais-dev-', 'ais-pre-')
    : envUrl || 'https://ais-pre-z5jwqiuhoa4rlqgc6rht27-264778226641.asia-southeast1.run.app';

  res.json({
    appUrl: envUrl || 'https://ais-dev-z5jwqiuhoa4rlqgc6rht27-264778226641.asia-southeast1.run.app',
    sharedUrl,
    appletId: '0a2b0a74-9984-4c40-a81d-a7c601cf67ba',
  });
});

// GET all exams (with submission counts)
app.get('/api/exams', (_req: Request, res: Response) => {
  const exams = getStoredExams();
  const submissions = getStoredSubmissions();

  const summaries = exams.map(exam => {
    const subs = submissions.filter(s => s.examCode === exam.code);
    return {
      ...exam,
      submissionsCount: subs.length,
    };
  });

  res.json(summaries);
});

// GET single exam for STUDENT (Answer keys stripped for security!)
app.get('/api/exams/:code', (req: Request, res: Response) => {
  const code = (req.params.code || '').trim();
  const exams = getStoredExams();
  const exam = exams.find(e => e.code.trim().toUpperCase() === code.toUpperCase());

  if (!exam) {
    res.status(404).json({ error: `Không tìm thấy bài kiểm tra với mã: ${code}` });
    return;
  }

  // Strip correct answers so student client cannot inspect network payload
  const studentSafeQuestions = exam.questions.map(q => {
    const safeQ: any = {
      id: q.id,
      section: q.section,
      questionNumber: q.questionNumber,
      questionContent: q.questionContent,
      images: q.images || [],
    };

    if (q.options) {
      safeQ.options = q.options.map(opt => ({
        id: opt.id,
        label: opt.label,
        text: opt.text,
      }));
    }

    if (q.trueFalseItems) {
      safeQ.trueFalseItems = q.trueFalseItems.map(item => ({
        id: item.id,
        label: item.label,
        text: item.text,
      }));
    }

    if (q.section === 3) {
      safeQ.shortAnswer = {
        tolerance: q.shortAnswer?.tolerance || 0.01,
      };
    }

    return safeQ;
  });

  const studentSafeExam = {
    id: exam.id,
    code: exam.code,
    title: exam.title,
    grade: exam.grade,
    durationMinutes: exam.durationMinutes,
    maxAttempts: exam.maxAttempts || 0,
    createdAt: exam.createdAt,
    questions: studentSafeQuestions,
  };

  res.json(studentSafeExam);
});

// GET single exam for TEACHER (Full answers included)
app.get('/api/exams/:code/teacher', (req: Request, res: Response) => {
  const { code } = req.params;
  const exams = getStoredExams();
  const exam = exams.find(e => e.code.toUpperCase() === code.toUpperCase());

  if (!exam) {
    res.status(404).json({ error: `Không tìm thấy bài kiểm tra với mã: ${code}` });
    return;
  }

  const submissions = getStoredSubmissions().filter(s => s.examCode === exam.code);
  res.json({ ...exam, submissionsCount: submissions.length });
});

// POST create or update an exam
app.post('/api/exams', (req: Request, res: Response) => {
  const newExam: Exam = req.body;
  if (!newExam || !newExam.title || !newExam.questions || newExam.questions.length === 0) {
    res.status(400).json({ error: 'Dữ liệu bài kiểm tra không hợp lệ hoặc thiếu câu hỏi.' });
    return;
  }

  const exams = getStoredExams();

  // Generate unique code if not provided
  if (!newExam.code) {
    const count = exams.length + 1;
    newExam.code = `HHTT-${new Date().getFullYear()}-${String(count).padStart(3, '0')}`;
  }

  newExam.id = newExam.id || `EXAM-${Date.now()}`;
  newExam.createdAt = newExam.createdAt || new Date().toISOString();

  // Check if already exists, update or append
  const existingIdx = exams.findIndex(e => e.code.toUpperCase() === newExam.code.toUpperCase());
  if (existingIdx >= 0) {
    exams[existingIdx] = newExam;
  } else {
    exams.unshift(newExam);
  }

  saveStoredExams(exams);
  res.json({ success: true, exam: newExam });
});

// DELETE an exam
app.delete('/api/exams/:code', (req: Request, res: Response) => {
  const code = (req.params.code || '').trim().toUpperCase();
  let exams = getStoredExams();
  const initialCount = exams.length;
  const filtered = exams.filter(e => e.code.trim().toUpperCase() !== code);

  saveStoredExams(filtered);

  // Also clean up any submissions for this deleted exam
  let submissions = getStoredSubmissions();
  submissions = submissions.filter(s => s.examCode.trim().toUpperCase() !== code);
  saveStoredSubmissions(submissions);

  res.json({
    success: true,
    message: `Đã xóa bài kiểm tra ${code}`,
    deleted: filtered.length < initialCount
  });
});

// GET check student attempts for an exam
app.get('/api/exams/:code/check-attempts', (req: Request, res: Response) => {
  const code = (req.params.code || '').trim().toUpperCase();
  const studentName = String(req.query.studentName || '').trim().toLowerCase();

  const exams = getStoredExams();
  const exam = exams.find(e => e.code.trim().toUpperCase() === code);

  if (!exam) {
    res.status(404).json({ error: 'Không tìm thấy bài kiểm tra.' });
    return;
  }

  const maxAttempts = exam.maxAttempts || 0;
  if (!studentName || maxAttempts === 0) {
    res.json({
      attempts: 0,
      maxAttempts,
      canTake: true
    });
    return;
  }

  const existingSubs = getStoredSubmissions();
  const attempts = existingSubs.filter(
    s => s.examCode.trim().toUpperCase() === code &&
         s.studentName.trim().toLowerCase() === studentName
  ).length;

  res.json({
    attempts,
    maxAttempts,
    canTake: attempts < maxAttempts
  });
});

// POST submit student answers (Autograding & persistence)
app.post('/api/exams/:code/submit', (req: Request, res: Response) => {
  const { code } = req.params;
  const { studentName, studentClass, answers, startedAt } = req.body;

  if (!studentName || !answers) {
    res.status(400).json({ error: 'Vui lòng cung cấp họ tên học sinh và bài làm.' });
    return;
  }

  const exams = getStoredExams();
  const exam = exams.find(e => e.code.toUpperCase() === code.toUpperCase());

  if (!exam) {
    res.status(404).json({ error: 'Không tìm thấy bài kiểm tra tương ứng.' });
    return;
  }

  // Check max attempts allowed
  const existingSubs = getStoredSubmissions();
  const studentAttempts = existingSubs.filter(
    s => s.examCode.toUpperCase() === exam.code.toUpperCase() &&
         s.studentName.trim().toLowerCase() === studentName.trim().toLowerCase()
  ).length;

  if (exam.maxAttempts && exam.maxAttempts > 0) {
    if (studentAttempts >= exam.maxAttempts) {
      res.status(403).json({
        error: `Em đã hoàn thành đủ số lần làm bài cho phép (${exam.maxAttempts} lần) đối với đề thi này.`
      });
      return;
    }
  }

  // Grade submission on server with the master answer key
  const submission = gradeSubmission(
    exam,
    studentName,
    studentClass || 'Tự do',
    answers,
    startedAt || new Date().toISOString()
  );

  // Save full submission for teacher records
  const submissions = getStoredSubmissions();
  submissions.unshift(submission);
  saveStoredSubmissions(submissions);

  // Return student-safe submission (strictly no answer keys or explanations)
  const studentSafeSubmission = {
    id: submission.id,
    examCode: submission.examCode,
    studentName: submission.studentName,
    studentClass: submission.studentClass,
    startedAt: submission.startedAt,
    submittedAt: submission.submittedAt,
    durationSeconds: submission.durationSeconds,
    score: submission.score,
    correctCount: submission.correctCount,
    incorrectCount: submission.incorrectCount,
    totalQuestions: submission.totalQuestions,
    answers: submission.answers,
    attemptNumber: studentAttempts + 1,
    maxAttempts: exam.maxAttempts || 0,
    details: submission.details.map(d => ({
      questionId: d.questionId,
      section: d.section,
      questionNumber: d.questionNumber,
      questionContent: d.questionContent,
      images: d.images,
      isCorrect: d.isCorrect,
      pointsEarned: d.pointsEarned,
      maxPoints: d.maxPoints,
      studentAnswer: d.studentAnswer,
      subItems: d.subItems?.map(s => ({
        label: s.label,
        text: s.text,
        studentChoice: s.studentChoice,
        isCorrect: s.isCorrect,
      }))
    }))
  };

  res.json({
    success: true,
    submission: studentSafeSubmission,
  });
});

// GET submissions for an exam (for teacher dashboard)
app.get('/api/exams/:code/submissions', (req: Request, res: Response) => {
  const { code } = req.params;
  const submissions = getStoredSubmissions();
  const filtered = submissions.filter(s => s.examCode.toUpperCase() === code.toUpperCase());
  res.json(filtered);
});

// ==================== VITE SPA INTEGRATION ====================

async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    // Development mode: Mount Vite middleware
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Production mode: Serve built static files
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`\n🚀 Hệ thống [HỌC HÓA CÙNG THẦY THIỆN] đang chạy tại: http://localhost:${PORT}\n`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
