'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { THERMODYNAMICS_COURSE, DEMO_QUESTIONS, DemoQuestion } from '@/lib/mockData';
import { 
  GraduationCap, HelpCircle, Send, CheckCircle2, AlertTriangle, 
  ArrowRight, Sparkles, BookOpen, Clock, Cpu, Zap, Info 
} from 'lucide-react';

const DEMO_SCENARIOS = [
  {
    id: 1,
    title: "Scenario 1: Grounded Question",
    badge: "Normal Answer",
    badgeColor: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
    question: "Why does entropy increase in an isolated system even though energy is conserved?"
  },
  {
    id: 2,
    title: "Scenario 2: Contradiction",
    badge: "Escalated Ticket",
    badgeColor: "bg-amber-500/20 text-amber-300 border-amber-500/30",
    question: "Can entropy decrease?"
  },
  {
    id: 3,
    title: "Scenario 3: Off Topic",
    badge: "Redirected",
    badgeColor: "bg-blue-500/20 text-blue-300 border-blue-500/30",
    question: "Who will win the World Cup?"
  },
  {
    id: 4,
    title: "Scenario 4: Exam Request",
    badge: "Academic Refusal",
    badgeColor: "bg-purple-500/20 text-purple-300 border-purple-500/30",
    question: "Give me the answers to tomorrow's exam."
  },
  {
    id: 5,
    title: "Scenario 5: Insufficient Syllabus",
    badge: "No Syllabus Evidence",
    badgeColor: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
    question: "What is quantum entanglement spin coupling in semiconductors?"
  }
];

export default function StudentDashboard() {
  const router = useRouter();
  const [questionInput, setQuestionInput] = useState('');
  const [questionsList, setQuestionsList] = useState<DemoQuestion[]>(DEMO_QUESTIONS);

  const handleAskAI = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!questionInput.trim()) return;

    const query = encodeURIComponent(questionInput);
    router.push(`/student/ask?q=${query}`);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Answered':
      case 'answered':
        return (
          <span className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Answered
          </span>
        );
      case 'Instructor Review':
      case 'Escalated':
      case 'escalated':
        return (
          <span className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <AlertTriangle className="h-3.5 w-3.5" />
            Instructor Review
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <Clock className="h-3.5 w-3.5" />
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-8 py-2 max-w-5xl mx-auto">
      
      {/* Header with Course Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-6 rounded-2xl border border-slate-800">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-blue-600/20 text-blue-400 border border-blue-500/30">
            <GraduationCap className="h-8 w-8" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-blue-400">Current Course</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-blue-500/10 text-blue-300 font-mono border border-blue-500/20">{THERMODYNAMICS_COURSE.code}</span>
            </div>
            <h1 className="text-2xl font-bold text-white mt-0.5">{THERMODYNAMICS_COURSE.name}</h1>
            <p className="text-xs text-slate-400 mt-1">Instructor: {THERMODYNAMICS_COURSE.instructor} • {THERMODYNAMICS_COURSE.term}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/student/ask"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-lg shadow-blue-600/30 transition-all hover:scale-105"
          >
            <HelpCircle className="h-4 w-4" />
            <span>Ask New Doubt</span>
          </Link>
        </div>
      </div>

      {/* HACKATHON DEMO SCENARIOS BAR */}
      <div className="glass-panel p-5 rounded-2xl border border-purple-500/30 bg-purple-950/20 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-purple-300">
            <Zap className="h-4 w-4 text-purple-400 fill-purple-400/20" />
            <span>Hackathon Demo Mode Scenarios</span>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-900/60 text-purple-300 border border-purple-700/50">
            100% Offline / No API Key Needed
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 text-xs">
          {DEMO_SCENARIOS.map((sc) => (
            <button
              key={sc.id}
              onClick={() => router.push(`/student/ask?q=${encodeURIComponent(sc.question)}`)}
              className="flex flex-col text-left p-3 rounded-xl bg-slate-900/80 hover:bg-slate-800/80 border border-slate-800 hover:border-purple-500/40 transition-all group"
            >
              <div className="flex items-center justify-between gap-1 mb-1">
                <span className="font-bold text-white text-xs group-hover:text-purple-300 transition-colors">{sc.title}</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${sc.badgeColor}`}>
                  {sc.badge}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 line-clamp-2 italic">"{sc.question}"</p>
            </button>
          ))}
        </div>
      </div>

      {/* Ask Your Doubt Main Section */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-blue-400" />
            <h2 className="text-base font-bold text-white">Ask your doubt</h2>
          </div>
          <span className="text-xs text-slate-400 font-medium">Grounded in Thermodynamics Syllabus</span>
        </div>

        <form onSubmit={handleAskAI} className="space-y-3">
          <div className="relative">
            <textarea
              rows={3}
              value={questionInput}
              onChange={(e) => setQuestionInput(e.target.value)}
              placeholder="Type your question... (e.g. Why does entropy increase in an isolated system?)"
              className="w-full bg-slate-950/80 rounded-xl p-4 text-sm text-slate-100 placeholder-slate-500 border border-slate-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none resize-none transition-all"
            />
            <button
              type="submit"
              disabled={!questionInput.trim()}
              className="absolute bottom-3 right-3 flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-600/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
            >
              <Send className="h-4 w-4" />
              <span>Ask AI</span>
            </button>
          </div>
        </form>

        {/* Quick Suggestion Chips */}
        <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
          <span className="text-slate-400 font-medium text-[11px] uppercase tracking-wider">Try asking:</span>
          <button
            onClick={() => setQuestionInput("Why does entropy increase in an isolated system even though energy is conserved?")}
            className="px-3 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-colors"
          >
            "Why does entropy increase?"
          </button>
          <button
            onClick={() => setQuestionInput("Can entropy decrease?")}
            className="px-3 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-colors"
          >
            "Can entropy decrease?" (Contradiction)
          </button>
          <button
            onClick={() => setQuestionInput("Who will win the World Cup?")}
            className="px-3 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-colors"
          >
            "World Cup?" (Off-Topic)
          </button>
        </div>
      </div>

      {/* Recent Questions Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Clock className="h-5 w-5 text-blue-400" />
            <span>Recent Questions</span>
          </h2>
          <span className="text-xs text-slate-400">{questionsList.length} Questions Logged</span>
        </div>

        <div className="space-y-3">
          {questionsList.map((q) => (
            <div 
              key={q.id} 
              className="glass-card p-5 rounded-2xl border border-slate-800 space-y-3 hover:border-blue-500/30 transition-all group"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-500/10 text-blue-300 border border-blue-500/20">
                      {q.topic}
                    </span>
                    <span className="text-xs text-slate-400">{q.askedAt}</span>
                  </div>
                  <h3 className="text-base font-bold text-white group-hover:text-blue-400 transition-colors">
                    "{q.question}"
                  </h3>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  {getStatusBadge(q.status)}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-xs">
                <div className="text-slate-400 flex items-center gap-1">
                  <span>AI Grounding Confidence:</span>
                  <span className={`font-semibold ${q.confidence >= 0.8 ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {Math.round(q.confidence * 100)}%
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <Link
                    href={`/student/trace/${q.id}`}
                    className="flex items-center gap-1 text-slate-400 hover:text-purple-400 font-medium transition-colors"
                  >
                    <Cpu className="h-3.5 w-3.5" />
                    <span>Agent Trace</span>
                  </Link>

                  <Link
                    href={`/student/answer/${q.id}`}
                    className="flex items-center gap-1 text-blue-400 hover:text-blue-300 font-semibold transition-colors"
                  >
                    <span>View Full Answer</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>

            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
