import React, { useState, useEffect } from 'react';
import { Header, ActiveTab } from './components/Header';
import { TeacherExamList } from './components/TeacherExamList';
import { TeacherCreateExam } from './components/TeacherCreateExam';
import { TeacherResults } from './components/TeacherResults';
import { StudentExamRoom } from './components/StudentExamRoom';
import { TeacherGuide } from './components/TeacherGuide';
import { Exam, StudentSubmission } from './types/exam';
import { api } from './services/api';
import {
  FileText,
  Plus,
  BarChart3,
  Sparkles,
  FlaskConical,
  Lock,
  X,
  KeyRound,
  ShieldCheck,
  CheckCircle2,
  UserCheck
} from 'lucide-react';

export type TeacherSubView = 'exams' | 'create' | 'results';

export default function App() {
  // Teacher Authentication state: persisted in localStorage
  const [isTeacherLoggedIn, setIsTeacherLoggedIn] = useState<boolean>(() => {
    return localStorage.getItem('thay_thien_teacher_auth') === 'true';
  });

  const [activeTab, setActiveTab] = useState<ActiveTab>(() => {
    const isLogged = localStorage.getItem('thay_thien_teacher_auth') === 'true';
    return isLogged ? 'teacher' : 'student';
  });

  const [teacherSubView, setTeacherSubView] = useState<TeacherSubView>('exams');
  
  const [exams, setExams] = useState<Exam[]>([]);
  const [selectedExamForResults, setSelectedExamForResults] = useState<Exam | null>(null);
  const [submissionsForSelectedExam, setSubmissionsForSelectedExam] = useState<StudentSubmission[]>([]);
  const [studentExamCode, setStudentExamCode] = useState<string>('');
  const [examBeingEdited, setExamBeingEdited] = useState<Exam | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Security: Student Mode Locking
  // When active or when not logged in as teacher, the app strictly locks into Student Room
  const [isStudentMode, setIsStudentMode] = useState<boolean>(false);
  const [showTeacherAuthModal, setShowTeacherAuthModal] = useState<boolean>(false);
  const [teacherPassword, setTeacherPassword] = useState<string>('');
  const [authError, setAuthError] = useState<string | null>(null);

  // Parse URL query parameter: ?code=HHTT-xxx or ?role=student
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const codeParam = params.get('code');
    const roleParam = params.get('role');

    // If student link or code is provided, strictly lock into Student-Only Mode
    if (roleParam === 'student' || codeParam) {
      setIsStudentMode(true);
      setActiveTab('student');
    }
    if (codeParam) {
      setStudentExamCode(codeParam.trim().toUpperCase());
    }
  }, []);

  // Fetch initial exams list
  useEffect(() => {
    loadExams();
  }, []);

  const loadExams = async () => {
    setIsLoading(true);
    try {
      const data = await api.getExams();
      setExams(data);
    } catch (err) {
      console.error('Error fetching exams:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Switch to results view for a specific exam
  const handleSelectExamResults = async (exam: Exam) => {
    setSelectedExamForResults(exam);
    setTeacherSubView('results');
    try {
      const subs = await api.getSubmissions(exam.code);
      setSubmissionsForSelectedExam(subs);
    } catch (err) {
      console.error('Error fetching submissions:', err);
      setSubmissionsForSelectedExam([]);
    }
  };

  // After teacher creates or edits an exam
  const handleExamCreated = async (savedExam: Exam) => {
    await api.saveExam(savedExam);
    await loadExams();
    setExamBeingEdited(null);
  };

  // Edit existing exam
  const handleEditExam = (exam: Exam) => {
    if (!isTeacherLoggedIn) {
      setShowTeacherAuthModal(true);
      return;
    }
    setExamBeingEdited(exam);
    setTeacherSubView('create');
  };

  // Delete an exam
  const handleDeleteExam = async (code: string) => {
    if (!isTeacherLoggedIn) {
      setShowTeacherAuthModal(true);
      return;
    }
    await api.deleteExam(code);
    await loadExams();
  };

  // Go to student room with a specific code (from Teacher view preview)
  const handleGoToStudentRoom = (code: string) => {
    setStudentExamCode(code);
    setActiveTab('student');
  };

  // Teacher Login Authentication
  const handleTeacherLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const pass = teacherPassword.trim();
    // Accepted passwords/PINs for Thầy Thiện
    const validCredentials = ['123456', 'thien123', 'thaythien', '2026', 'thienchoai'];

    if (validCredentials.includes(pass) || pass.toLowerCase() === 'thien123') {
      setIsTeacherLoggedIn(true);
      localStorage.setItem('thay_thien_teacher_auth', 'true');
      setIsStudentMode(false);
      setActiveTab('teacher');
      setShowTeacherAuthModal(false);
      setTeacherPassword('');
      setAuthError(null);
    } else {
      setAuthError('Mật khẩu không chính xác. Vui lòng kiểm tra lại.');
    }
  };

  // Teacher Logout
  const handleTeacherLogout = () => {
    setIsTeacherLoggedIn(false);
    localStorage.removeItem('thay_thien_teacher_auth');
    setActiveTab('student');
    setTeacherSubView('exams');
    setExamBeingEdited(null);
  };

  // Switch tab with authentication guard
  const handleTabSwitch = (tab: ActiveTab) => {
    if (tab === 'teacher' || tab === 'guide') {
      if (!isTeacherLoggedIn) {
        setShowTeacherAuthModal(true);
        return;
      }
    }
    setActiveTab(tab);
    if (tab === 'teacher' && teacherSubView === 'results' && !selectedExamForResults) {
      setTeacherSubView('exams');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans antialiased text-slate-900">
      {/* Top Header Bar */}
      <Header
        activeTab={activeTab}
        setActiveTab={handleTabSwitch}
        onNewExamClick={() => {
          if (!isTeacherLoggedIn) {
            setShowTeacherAuthModal(true);
            return;
          }
          setExamBeingEdited(null);
          setActiveTab('teacher');
          setTeacherSubView('create');
        }}
        isStudentMode={!isTeacherLoggedIn || isStudentMode}
        isTeacherLoggedIn={isTeacherLoggedIn}
        onTeacherLoginClick={() => {
          setShowTeacherAuthModal(true);
          setTeacherPassword('');
          setAuthError(null);
        }}
        onTeacherLogoutClick={handleTeacherLogout}
      />

      {/* Main App Content */}
      <main className="flex-1">
        {/* ==================== TEACHER TAB (STRICTLY REQUIRE LOGIN) ==================== */}
        {isTeacherLoggedIn && !isStudentMode && activeTab === 'teacher' && (
          <div>
            {/* Teacher Sub-navigation Bar */}
            <div className="bg-white border-b border-slate-200">
              <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between h-12">
                <div className="flex items-center gap-1 sm:gap-2">
                  <button
                    onClick={() => {
                      setExamBeingEdited(null);
                      setTeacherSubView('exams');
                    }}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer ${
                      teacherSubView === 'exams'
                        ? 'bg-teal-50 text-teal-800'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Kho Đề Thi ({exams.length})</span>
                  </button>

                  <button
                    onClick={() => {
                      setExamBeingEdited(null);
                      setTeacherSubView('create');
                    }}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer ${
                      teacherSubView === 'create'
                        ? 'bg-teal-50 text-teal-800'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{examBeingEdited ? `Chỉnh Sửa: ${examBeingEdited.code}` : 'Tạo & Trộn Đề Mới'}</span>
                  </button>

                  {selectedExamForResults && (
                    <button
                      onClick={() => setTeacherSubView('results')}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer ${
                        teacherSubView === 'results'
                          ? 'bg-teal-50 text-teal-800'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <BarChart3 className="w-3.5 h-3.5" />
                      <span>Kết Quả: {selectedExamForResults.code}</span>
                    </button>
                  )}
                </div>

                <div className="text-[11px] text-slate-500 hidden sm:flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3 text-teal-600" />
                  <span>Chuẩn Cấu Trúc Bộ GD&ĐT 2025/2026</span>
                </div>
              </div>
            </div>

            {/* Views */}
            {teacherSubView === 'exams' && (
              <TeacherExamList
                exams={exams}
                onSelectExamResults={handleSelectExamResults}
                onGoToStudentRoom={handleGoToStudentRoom}
                onCreateNewExam={() => {
                  setExamBeingEdited(null);
                  setTeacherSubView('create');
                }}
                onEditExam={handleEditExam}
                onDeleteExam={handleDeleteExam}
              />
            )}

            {teacherSubView === 'create' && (
              <TeacherCreateExam
                onExamCreated={handleExamCreated}
                onGoToStudentRoom={handleGoToStudentRoom}
                initialExam={examBeingEdited}
                onCancelEdit={() => {
                  setExamBeingEdited(null);
                  setTeacherSubView('exams');
                }}
              />
            )}

            {teacherSubView === 'results' && selectedExamForResults && (
              <TeacherResults
                exam={selectedExamForResults}
                submissions={submissionsForSelectedExam}
                onBackToExams={() => setTeacherSubView('exams')}
                onGoToTest={handleGoToStudentRoom}
              />
            )}
          </div>
        )}

        {/* ==================== STUDENT TAB (DEFAULT FOR ALL STUDENTS) ==================== */}
        {(activeTab === 'student' || (!isTeacherLoggedIn && activeTab === 'teacher')) && (
          <StudentExamRoom
            initialCode={studentExamCode || exams[0]?.code}
            isStudentMode={true}
          />
        )}

        {/* ==================== GUIDE TAB ==================== */}
        {isTeacherLoggedIn && !isStudentMode && activeTab === 'guide' && (
          <TeacherGuide
            onLoadSampleExam={() => {
              setExamBeingEdited(null);
              setActiveTab('teacher');
              setTeacherSubView('create');
            }}
          />
        )}
      </main>

      {/* Clean Educational Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 font-medium text-slate-700">
            <FlaskConical className="w-4 h-4 text-teal-600" />
            <span className="font-bold text-slate-900">HỌC HÓA CÙNG THẦY THIỆN</span>
            <span className="text-slate-300">·</span>
            <span className="text-slate-500">Hệ Thống Kiểm Tra Trực Tuyến & Chống Biến Dạng Công Thức Hóa Học</span>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-slate-400 hidden md:inline">
              Bảo toàn công thức H₂O, CO₂, SO₄²⁻, NH₄⁺, CH₂=CH₂ & hình ảnh
            </span>

            {/* Discrete Teacher Unlock for Thầy Thiện */}
            {!isTeacherLoggedIn ? (
              <button
                type="button"
                onClick={() => {
                  setShowTeacherAuthModal(true);
                  setTeacherPassword('');
                  setAuthError(null);
                }}
                className="text-[11px] text-slate-400 hover:text-teal-700 transition-colors flex items-center gap-1 cursor-pointer"
              >
                <Lock className="w-3 h-3" />
                <span>Đăng Nhập Giáo Viên</span>
              </button>
            ) : (
              <div className="flex items-center gap-2 text-[11px] text-teal-800 font-semibold bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                <UserCheck className="w-3 h-3 text-teal-600" />
                <span>Thầy Thiện đang đăng nhập</span>
              </div>
            )}
          </div>
        </div>
      </footer>

      {/* Teacher Authentication Modal */}
      {showTeacherAuthModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl border border-slate-200 space-y-4 animate-fadeIn relative">
            <button
              onClick={() => setShowTeacherAuthModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-lg cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center">
              <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center mx-auto mb-2 border border-teal-200">
                <Lock className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">
                Đăng Nhập Giáo Viên
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Khu vực quản lý đề thi, tạo đề mới và chấm điểm dành riêng cho Thầy Thiện.
              </p>
            </div>

            {authError && (
              <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs text-center font-medium">
                {authError}
              </div>
            )}

            <form onSubmit={handleTeacherLogin} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Mật khẩu hoặc mã PIN:
                </label>
                <input
                  type="password"
                  autoFocus
                  placeholder="Nhập mật khẩu quản lý..."
                  value={teacherPassword}
                  onChange={e => setTeacherPassword(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs text-slate-900 focus:outline-hidden focus:border-teal-600 focus:ring-1 focus:ring-teal-600"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 active:bg-teal-800 rounded-xl transition-colors shadow-xs cursor-pointer"
              >
                Đăng Nhập Quản Lý
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
