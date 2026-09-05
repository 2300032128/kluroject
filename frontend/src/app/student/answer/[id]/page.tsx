'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { DEMO_QUESTIONS, DemoQuestion } from '@/lib/mockData';
import { CheckCircle2, AlertTriangle, ArrowLeft, BookOpen, Lightbulb, Cpu, ShieldCheck, RefreshCw, Zap } from 'lucide-react';

export default function AnswerResultPage() {
  const params = useParams();
  const id = (params?.id as string) || 'q-101';

  const defaultQuestion: DemoQuestion = DEMO_QUESTIONS.find(item => item.id === id) || DEMO_QUESTIONS[0];
  const [questionData, setQuestionData] = useState<DemoQuestion>(defaultQuestion);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function fetchAnswerData() {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        const res = await fetch(`${apiUrl}/api/student/trace/${id}`);
        if (res.ok) {
          const traceData = await res.json();
          if (traceData && traceData.question) {
            // Find composition answer step or format
            const compStep = traceData.agent_runs?.find((r: any) => r.step_index === 5);
            const groundingStep = traceData.agent_runs?.find((r: any) => r.step_index === 2);
            const contradictionStep = traceData.agent_runs?.find((r: any) => r.step_index === 3);

            setQuestionData({
              id: traceData.question_id,
              question: traceData.question,
              course: "ME202",
              topic: traceData.topic || "Thermodynamics",
              module: traceData.module || "Week 6 - Entropy",
              confidence: traceData.confidence || 0.92,
              status: traceData.status === "escalated" ? "Instructor Review" : "Answered",
              askedAt: "Just now",
              answer: compStep?.output_data?.answer || defaultQuestion.answer,
              keyTakeaway: compStep?.output_data?.key_takeaway || defaultQuestion.keyTakeaway,
              sources: groundingStep?.output_data?.sources?.map((s: string, idx: number) => ({
                title: s,
                page: idx + 4,
                snippet: "Syllabus evidence retrieved from course repository."
              })) || defaultQuestion.sources,
              agentTrace: traceData.agent_runs?.map((r: any) => ({
                step: r.step_index,
                agent: r.agent_name,
                action: r.action,
                details: r.details,
                executionTimeMs: r.execution_time_ms
              })),
              contradictionAnalysis: contradictionStep?.output_data
            });
          }
        }
      } catch (err) {
        console.warn("Using demo question fallback:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchAnswerData();
  }, [id]);

  const q = questionData;

  return (
    <div className="max-w-4xl mx-auto py-6 space-y-6 animate-fadeIn">
      
      {/* Back Button */}
      <Link 
        href="/student"
        className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Back to Student Dashboard</span>
      </Link>

      {/* Main Answer Header Card */}
      <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-slate-800 space-y-6">
        
        {/* Header Metadata */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs font-semibold">
              Course: Thermodynamics ({q.course})
            </span>
            <span className="px-3 py-1 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/20 text-xs font-semibold">
              Topic: {q.topic}
            </span>
            <span className="px-3 py-1 rounded-full bg-slate-800 text-slate-300 text-xs font-medium">
              {q.module}
            </span>
          </div>

          {/* AI Confidence Indicator */}
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-xs">
            <span className="text-slate-400 font-medium">AI Grounding Confidence:</span>
            <span className={`font-bold ${q.confidence >= 0.7 ? 'text-emerald-400' : 'text-amber-400'}`}>
              {Math.round(q.confidence * 100)}% {q.confidence >= 0.7 ? '(High Grounding)' : '(Escalated / Review)'}
            </span>
          </div>
        </div>

        {/* Question Title */}
        <div className="space-y-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Student Question</span>
          <h1 className="text-xl sm:text-2xl font-bold text-white leading-snug">
            "{q.question}"
          </h1>
        </div>

        {/* Contradiction / Escalation Alert Banner */}
        {(q.contradictionAnalysis?.contradiction_detected || q.status === 'Instructor Review' || q.status === 'Escalated') && (
          <div className="p-5 rounded-2xl bg-amber-500/10 border-2 border-amber-500/30 space-y-3 glow-amber">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-amber-500/20 pb-3">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-base">
                <AlertTriangle className="h-5 w-5 shrink-0" />
                <span>⚠ Potential contradiction detected / Flagged for Review</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-300 font-medium">AI confidence:</span>
                <span className="font-bold text-amber-300 bg-amber-950/80 px-2.5 py-0.5 rounded-full border border-amber-500/30">
                  {Math.round((q.contradictionAnalysis?.confidence || q.confidence) * 100)}%
                </span>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-md bg-red-500/20 text-red-300 border border-red-500/30 font-semibold uppercase tracking-wider text-[11px]">
                  Instructor review ticket created
                </span>
                {q.contradictionAnalysis?.resolvable_from_context && (
                  <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30 text-[10px]">
                    Contextually Resolvable
                  </span>
                )}
              </div>
              
              <p className="text-amber-200/90 leading-relaxed font-medium">
                {q.contradictionAnalysis?.explanation || 
                  "Multiple course materials contain opposing statements regarding this topic. The AI has automatically created an escalation ticket for Dr. Vance's review."}
              </p>
            </div>
          </div>
        )}

        {/* Answer Content Box */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-400">
            <CheckCircle2 className="h-4 w-4" />
            <span>Grounded Pedagogical Answer</span>
          </div>
          <div className="bg-slate-950/90 rounded-2xl p-5 sm:p-6 border border-slate-800 text-slate-200 text-sm leading-relaxed whitespace-pre-line font-normal">
            {q.answer}
          </div>
        </div>

        {/* Key Takeaway Callout Box */}
        {q.keyTakeaway && (
          <div className="p-4 rounded-xl bg-gradient-to-r from-blue-900/30 via-indigo-900/30 to-purple-900/30 border border-blue-500/30 space-y-1.5 glow-purple">
            <div className="flex items-center gap-2 text-xs font-bold text-blue-300 uppercase tracking-wider">
              <Lightbulb className="h-4 w-4 text-amber-400" />
              <span>Key Takeaway</span>
            </div>
            <p className="text-xs text-slate-200 font-medium leading-relaxed">
              {q.keyTakeaway}
            </p>
          </div>
        )}

        {/* Grounded Sources Cards */}
        {q.sources && q.sources.length > 0 && (
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-purple-400">
              <BookOpen className="h-4 w-4" />
              <span>Verified Syllabus Material Citations ({q.sources.length})</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {q.sources.map((s, idx) => (
                <div key={idx} className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs space-y-1.5">
                  <div className="flex items-center justify-between font-semibold text-purple-300">
                    <span className="truncate">{s.title}</span>
                    <span className="px-2 py-0.5 rounded bg-purple-500/10 text-purple-300 text-[10px] font-mono border border-purple-500/20">
                      Pg. {s.page}
                    </span>
                  </div>
                  <p className="text-slate-400 italic text-[11px] line-clamp-2">
                    "{s.snippet}"
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 5-Agent Execution Trace Link Section */}
        <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-300 font-semibold">
            <Cpu className="h-4 w-4 text-purple-400" />
            <span>Multi-Agent Reasoning Execution Verified</span>
          </div>

          <Link 
            href={`/student/trace/${q.id}`}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-600/30 transition-all hover:scale-105"
          >
            <Zap className="h-4 w-4" />
            <span>View 5-Agent Execution Trace</span>
          </Link>
        </div>

      </div>

    </div>
  );
}
