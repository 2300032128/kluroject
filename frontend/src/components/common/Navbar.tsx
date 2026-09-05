'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Bot, GraduationCap, LayoutDashboard, HelpCircle, FileText, Layers, ShieldAlert, BarChart3, BookOpen, RefreshCw } from 'lucide-react';
import { seedDemoData } from '@/lib/api';

export default function Navbar() {
  const pathname = usePathname();

  const handleResetDemo = async () => {
    await seedDemoData();
    window.location.reload();
  };

  const isStudentRoute = pathname.startsWith('/student');
  const isInstructorRoute = pathname.startsWith('/instructor');

  return (
    <header className="sticky top-0 z-50 glass-panel border-b border-slate-800/80 px-4 lg:px-8 py-3">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        
        {/* Brand Logo & Title */}
        <div className="flex items-center justify-between w-full md:w-auto">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-500 to-purple-500 p-0.5 shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform">
              <div className="h-full w-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Bot className="h-5 w-5 text-blue-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                  EDUAGENT AI
                </span>
                <span className="text-[10px] font-semibold tracking-wide px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  PHASE 2
                </span>
              </div>
              <p className="text-[11px] text-slate-400">AI Teaching Assistant Agent</p>
            </div>
          </Link>

          {/* Mobile Demo Badge */}
          <div className="md:hidden flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[11px] font-medium">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Demo Mode</span>
          </div>
        </div>

        {/* Main Navigation Bar */}
        <div className="flex items-center gap-1 bg-slate-900/90 p-1.5 rounded-xl border border-slate-800 text-xs overflow-x-auto max-w-full">
          
          <Link
            href="/student"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
              pathname === '/student'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <GraduationCap className="h-3.5 w-3.5" />
            <span>Student Dashboard</span>
          </Link>

          <Link
            href="/student/ask"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
              pathname === '/student/ask'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <HelpCircle className="h-3.5 w-3.5" />
            <span>Ask Doubt</span>
          </Link>

          <div className="h-4 w-px bg-slate-800 mx-1"></div>

          <Link
            href="/instructor"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
              pathname === '/instructor'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <LayoutDashboard className="h-3.5 w-3.5" />
            <span>Instructor Overview</span>
          </Link>

          <Link
            href="/instructor/escalations"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
              pathname === '/instructor/escalations'
                ? 'bg-amber-600 text-white shadow-md shadow-amber-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <ShieldAlert className="h-3.5 w-3.5" />
            <span>Escalation Queue</span>
          </Link>

          <Link
            href="/instructor/analytics"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
              pathname === '/instructor/analytics'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <BarChart3 className="h-3.5 w-3.5" />
            <span>Question Analytics</span>
          </Link>

          <Link
            href="/instructor/materials"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
              pathname === '/instructor/materials'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <BookOpen className="h-3.5 w-3.5" />
            <span>Course Materials</span>
          </Link>

        </div>

        {/* Right Status Badge */}
        <div className="hidden md:flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-medium">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Demo Mode Active</span>
          </div>

          <button
            onClick={handleResetDemo}
            title="Reset Demo State"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 rounded-lg transition-colors"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Reset Demo</span>
          </button>
        </div>

      </div>
    </header>
  );
}
