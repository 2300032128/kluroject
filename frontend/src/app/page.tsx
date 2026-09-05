'use client';

import Link from 'next/link';
import { 
  GraduationCap, LayoutDashboard, Sparkles, ArrowRight, Bot, 
  ShieldCheck, CheckCircle2, Zap, Layers, AlertTriangle, BookOpen, Search, Cpu 
} from 'lucide-react';

const QUICK_DEMO_SCENARIOS = [
  {
    title: "Normal Grounded Doubt",
    badge: "100% Grounded",
    badgeColor: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
    question: "Why does entropy increase in an isolated system even though energy is conserved?"
  },
  {
    title: "Contradiction Detection",
    badge: "Escalation Ticket",
    badgeColor: "bg-amber-500/20 text-amber-300 border-amber-500/30",
    question: "Can entropy decrease?"
  },
  {
    title: "Off-Topic Query",
    badge: "Redirected",
    badgeColor: "bg-blue-500/20 text-blue-300 border-blue-500/30",
    question: "Who will win the World Cup?"
  },
  {
    title: "Exam Request",
    badge: "Academic Refusal",
    badgeColor: "bg-purple-500/20 text-purple-300 border-purple-500/30",
    question: "Give me the answers to tomorrow's exam."
  }
];

export default function Home() {
  return (
    <div className="min-h-[85vh] flex flex-col items-center justify-center py-8 px-4 space-y-12 max-w-6xl mx-auto">
      
      {/* Hero Header Section */}
      <div className="text-center space-y-6 max-w-4xl mx-auto animate-fadeIn">
        
        {/* Hackathon Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-bold shadow-lg shadow-purple-500/10">
          <Sparkles className="h-4 w-4 text-purple-400" />
          <span>EDUAGENT AI — Multi-Agent AI Teaching Assistant</span>
        </div>
        
        {/* 10-Second Value Proposition Main Title */}
        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent leading-[1.15]">
          Your AI Teaching Assistant,<br className="hidden sm:inline" />
          <span className="bg-gradient-to-r from-purple-400 via-indigo-300 to-blue-400 bg-clip-text text-transparent">
            Grounded in Your Syllabus.
          </span>
        </h1>
        
        {/* Subtitle */}
        <p className="text-slate-300 text-base sm:text-lg max-w-3xl mx-auto leading-relaxed font-normal">
          Resolve student doubts instantly with verified syllabus evidence, automatically escalate low-confidence or contradictory queries to instructors, and transform classroom questions into real-time teaching analytics.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link
            href="/student"
            className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-8 py-4 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-base shadow-xl shadow-purple-600/30 transition-all hover:scale-105 active:scale-95 cursor-pointer"
          >
            <GraduationCap className="h-5 w-5" />
            <span>Student Portal</span>
            <ArrowRight className="h-4 w-4 ml-1" />
          </Link>

          <Link
            href="/instructor"
            className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-8 py-4 rounded-2xl bg-slate-900 hover:bg-slate-800 text-slate-100 font-bold text-base border border-slate-700/80 hover:border-slate-600 transition-all hover:scale-105 active:scale-95 shadow-lg cursor-pointer"
          >
            <LayoutDashboard className="h-5 w-5 text-purple-400" />
            <span>Instructor SaaS Command Center</span>
            <ArrowRight className="h-4 w-4 ml-1 text-slate-400" />
          </Link>
        </div>

      </div>

      {/* Quick Hackathon Demo Scenarios Bar */}
      <div className="w-full glass-panel p-5 rounded-2xl border border-purple-500/30 bg-purple-950/20 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-purple-300">
            <Zap className="h-4 w-4 text-purple-400 fill-purple-400/20" />
            <span>Hackathon Demo Scenarios (1-Click Launch)</span>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-900/60 text-purple-300 border border-purple-700/50">
            100% Offline / Zero API Key Needed
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 text-xs">
          {QUICK_DEMO_SCENARIOS.map((sc, idx) => (
            <Link
              key={idx}
              href={`/student/ask?q=${encodeURIComponent(sc.question)}`}
              className="flex flex-col text-left p-3 rounded-xl bg-slate-900/80 hover:bg-slate-800/80 border border-slate-800 hover:border-purple-500/40 transition-all group"
            >
              <div className="flex items-center justify-between gap-1 mb-1">
                <span className="font-bold text-white text-xs group-hover:text-purple-300 transition-colors">{sc.title}</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${sc.badgeColor}`}>
                  {sc.badge}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 line-clamp-2 italic">"{sc.question}"</p>
            </Link>
          ))}
        </div>
      </div>

      {/* Visual 5-Agent Architecture Pipeline Diagram */}
      <div className="w-full glass-panel p-6 sm:p-8 rounded-2xl border border-slate-800 space-y-6">
        <div className="text-center space-y-1">
          <span className="text-xs font-bold uppercase tracking-wider text-purple-400 flex items-center justify-center gap-1.5">
            <Layers className="h-4 w-4" />
            <span>Transparent Multi-Agent Architecture</span>
          </span>
          <h2 className="text-xl font-bold text-white">5 Specialized AI Agents Working in Harmony</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
          
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 relative">
            <div className="flex items-center gap-2 text-indigo-400 font-bold">
              <Bot className="h-4 w-4" />
              <span>1. Interaction</span>
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Classifies query intent, scope, keywords, and academic sensitivity.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 relative">
            <div className="flex items-center gap-2 text-blue-400 font-bold">
              <Search className="h-4 w-4" />
              <span>2. Grounding</span>
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Audits syllabus vector chunks & calculates grounding confidence.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 relative">
            <div className="flex items-center gap-2 text-amber-400 font-bold">
              <AlertTriangle className="h-4 w-4" />
              <span>3. Contradiction</span>
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Evaluates contextual conflicts (isolated vs open, $C_p$ vs $C_p(T)$).
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 relative">
            <div className="flex items-center gap-2 text-purple-400 font-bold">
              <ShieldCheck className="h-4 w-4" />
              <span>4. Escalation</span>
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Evaluates 8 risk signals to route to Answer, Clarify, or Escalation Ticket.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 relative">
            <div className="flex items-center gap-2 text-emerald-400 font-bold">
              <Sparkles className="h-4 w-4" />
              <span>5. Composition</span>
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Synthesizes grounded pedagogical answer with LaTeX math & citations.
            </p>
          </div>

        </div>
      </div>

      {/* Highlights Feature Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl w-full pt-4">
        
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center gap-2 text-blue-400 font-bold text-sm">
            <BookOpen className="h-4 w-4" />
            <span>Syllabus Grounded</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Strict RAG verification against course syllabi and uploaded materials with page-level citations.
          </p>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
            <ShieldCheck className="h-4 w-4" />
            <span>Human Escalation</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Automatically detects conflicting specs or low confidence doubts and alerts instructors with pre-analyzed context.
          </p>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center gap-2 text-purple-400 font-bold text-sm">
            <CheckCircle2 className="h-4 w-4" />
            <span>Class Doubt Analytics</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Synthesizes student misconception clusters to help instructors adjust lecture topics.
          </p>
        </div>

      </div>

    </div>
  );
}
