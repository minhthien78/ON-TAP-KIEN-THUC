import React from 'react';
import { FlaskConical, GraduationCap, FileText, CheckCircle2, BookOpen, Lock, LogOut, UserCheck } from 'lucide-react';

export type ActiveTab = 'teacher' | 'student' | 'guide';

interface HeaderProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  examCodeForStudent?: string;
  onNewExamClick?: () => void;
  isStudentMode?: boolean;
  isTeacherLoggedIn?: boolean;
  onTeacherLoginClick?: () => void;
  onTeacherLogoutClick?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onNewExamClick,
  isStudentMode = false,
  isTeacherLoggedIn = false,
  onTeacherLoginClick,
  onTeacherLogoutClick,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-2xs">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        {/* Row 1: Logo & Brand Wordmark + Actions */}
        <div className="flex items-center justify-between py-2.5 sm:py-3">
          {/* Brand Wordmark (Compact font so it NEVER wraps on mobile) */}
          <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-teal-600 flex items-center justify-center text-white shadow-xs shrink-0">
              <FlaskConical className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
            <div className="min-w-0">
              <span className="text-[13px] sm:text-base md:text-lg font-bold tracking-tight text-slate-900 font-sans whitespace-nowrap block">
                HỌC HÓA CÙNG THẦY THIỆN
              </span>
              <span className="text-[10px] text-slate-500 hidden sm:block truncate">
                Hệ Thống Trộn Đề & Thi Trực Tuyến Hóa Học THPT Chuẩn 3 Phần
              </span>
            </div>
          </div>

          {/* Right Action: Teacher Login Status / Actions */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {isTeacherLoggedIn ? (
              <>
                <div className="hidden sm:flex items-center gap-1 px-2.5 py-1 bg-teal-50 border border-teal-200 rounded-lg text-xs font-semibold text-teal-800">
                  <UserCheck className="w-3.5 h-3.5 text-teal-600" />
                  <span>Thầy Thiện</span>
                </div>

                {activeTab === 'teacher' && onNewExamClick && (
                  <button
                    onClick={onNewExamClick}
                    className="px-2.5 sm:px-3 py-1.5 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 active:bg-teal-800 rounded-lg transition-colors shadow-2xs whitespace-nowrap flex items-center gap-1 cursor-pointer"
                  >
                    <span>+ Tạo Đề Mới</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={onTeacherLogoutClick}
                  className="px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:text-rose-600 bg-slate-100 hover:bg-rose-50 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                  title="Đăng xuất giáo viên"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Đăng Xuất</span>
                </button>
              </>
            ) : (
              <>
                <div className="hidden sm:flex items-center gap-1 text-[11px] sm:text-xs text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 sm:px-2.5 py-1 rounded-lg shrink-0">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span className="font-semibold whitespace-nowrap">Thi Bảo Mật</span>
                </div>

                {onTeacherLoginClick && (
                  <button
                    type="button"
                    onClick={onTeacherLoginClick}
                    className="px-2.5 sm:px-3 py-1.5 text-xs font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
                  >
                    <Lock className="w-3.5 h-3.5 text-teal-700" />
                    <span>Đăng Nhập Giáo Viên</span>
                  </button>
                )}
              </>
            )}
          </div>
        </div>

        {/* Row 2: Navigation Links placed UNDERNEATH for clean mobile view */}
        {isTeacherLoggedIn && !isStudentMode ? (
          <div className="pb-2 pt-1 border-t border-slate-100 flex justify-center sm:justify-start">
            <nav className="flex items-center p-1 bg-slate-100/90 rounded-xl w-full sm:w-auto justify-center sm:justify-start gap-1">
              <button
                onClick={() => setActiveTab('teacher')}
                className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-semibold rounded-lg transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === 'teacher'
                    ? 'bg-white text-teal-800 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <FileText className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                <span>Khu Vực Giáo Viên</span>
              </button>

              <button
                onClick={() => setActiveTab('student')}
                className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-semibold rounded-lg transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === 'student'
                    ? 'bg-white text-teal-800 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <GraduationCap className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                <span>Khu Vực Học Sinh</span>
              </button>

              <button
                onClick={() => setActiveTab('guide')}
                className={`hidden md:flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-semibold rounded-lg transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === 'guide'
                    ? 'bg-white text-teal-800 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <span>Hướng Dẫn & Đề Chuẩn</span>
              </button>
            </nav>
          </div>
        ) : (
          <div className="pb-2 pt-0.5 flex justify-center">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-teal-50 border border-teal-200 rounded-lg text-xs font-bold text-teal-800">
              <GraduationCap className="w-3.5 h-3.5 text-teal-600" />
              <span>Phòng Thi Trực Tuyến Học Sinh</span>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
