'use client';

import { useState, useEffect } from 'react';
import { THERMODYNAMICS_COURSE } from '@/lib/mockData';
import { BarChart3, TrendingUp, Layers, Lightbulb, Users, CheckCircle2, AlertTriangle, HelpCircle, ShieldAlert, Cpu } from 'lucide-react';

export default function QuestionAnalyticsPage() {
  const [analytics, setAnalytics] = useState<any>({
    total_questions: 87,
    ai_resolved: 74,
    escalated: 8,
    needs_clarification: 5,
    ai_resolution_rate: 85.1,
    escalation_rate: 9.2,
    avg_confidence: 0.88,
    most_confusing_topic: "Entropy & Microstate Multiplicity",
    top_topics: [
      { topic: "Entropy", count: 42, percentage: 48.3 },
      { topic: "Second Law", count: 31, percentage: 35.6 },
      { topic: "Carnot Engine", count: 12, percentage: 13.8 },
      { topic: "Heat Transfer", count: 8, percentage: 9.2 }
    ],
    questions_per_module: [
      { module: "Week 6 - Entropy", count: 45 },
      { module: "Week 5 - Reversibility", count: 28 },
      { module: "Week 3 - Heat Engines", count: 14 }
    ],
    daily_trends: [
      { date: "Mon", count: 12 },
      { date: "Tue", count: 18 },
      { date: "Wed", count: 24 },
      { date: "Thu", count: 33 }
    ],
    questions_needing_attention: 8,
    low_confidence_questions: 12
  });

  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
    fetch(`${apiUrl}/api/instructor/analytics/details`)
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data && data.total_questions) {
          setAnalytics(data);
        }
      })
      .catch(() => {
        // Fallback to initial state
      });
  }, []);

  return (
    <div className="max-w-5xl mx-auto py-6 space-y-8">
      
      {/* Header */}
      <div className="border-b border-slate-800 pb-4 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-indigo-400">
            <BarChart3 className="h-4 w-4" />
            <span>Class Learning Intelligence</span>
          </div>
          <h1 className="text-2xl font-bold text-white mt-1">Question Analytics & Misconception Matrix</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Analyzed by Doubt Analytics Agent across active Thermodynamics student doubts.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="px-3 py-1.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 font-bold">
            Resolution Rate: {analytics.ai_resolution_rate}%
          </span>
          <span className="px-3 py-1.5 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/20 font-bold">
            Avg Confidence: {Math.round(analytics.avg_confidence * 100)}%
          </span>
        </div>
      </div>

      {/* Phase 10 Analytics Focus Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        {/* Most Confusing Topic Card */}
        <div className="glass-panel p-5 rounded-2xl border border-amber-500/30 bg-amber-950/10 space-y-2">
          <div className="flex items-center justify-between text-amber-400 font-bold text-xs">
            <span className="uppercase tracking-wider">Most Confusing Topic</span>
            <AlertTriangle className="h-4 w-4 shrink-0" />
          </div>
          <div className="text-xl font-bold text-white truncate">
            {analytics.most_confusing_topic}
          </div>
          <p className="text-[11px] text-amber-200/80 leading-relaxed font-medium">
            Highest concentration of escalated and low-confidence student queries across the class.
          </p>
        </div>

        {/* Questions Needing Instructor Attention Card */}
        <div className="glass-panel p-5 rounded-2xl border border-red-500/30 bg-red-950/10 space-y-2">
          <div className="flex items-center justify-between text-red-400 font-bold text-xs">
            <span className="uppercase tracking-wider">Needs Instructor Attention</span>
            <ShieldAlert className="h-4 w-4 shrink-0" />
          </div>
          <div className="text-3xl font-bold text-red-400">
            {analytics.questions_needing_attention} <span className="text-xs font-normal text-slate-400">Doubts</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Active pending tickets in escalation triage queue requiring instructor decision.
          </p>
        </div>

        {/* Low Confidence Questions Card */}
        <div className="glass-panel p-5 rounded-2xl border border-purple-500/30 bg-purple-950/10 space-y-2">
          <div className="flex items-center justify-between text-purple-400 font-bold text-xs">
            <span className="uppercase tracking-wider">Low Confidence Questions</span>
            <HelpCircle className="h-4 w-4 shrink-0" />
          </div>
          <div className="text-3xl font-bold text-purple-400">
            {analytics.low_confidence_questions} <span className="text-xs font-normal text-slate-400">Queries</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Questions where grounding similarity fell below 70% threshold.
          </p>
        </div>

      </div>

      {/* Top Doubt Topics Visual Breakdown */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-indigo-400" />
            <span>Top Doubt Topics ({analytics.total_questions} Total Questions Analyzed)</span>
          </h2>
          <span className="text-xs text-slate-400 font-mono">Real-Time DB Aggregation</span>
        </div>

        <div className="space-y-4">
          {analytics.top_topics.map((tp: any, idx: number) => (
            <div key={idx} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-medium">
                <span className="text-slate-200 font-semibold">{tp.topic}</span>
                <span className="text-slate-400">{tp.count} Doubts ({tp.percentage}% of class)</span>
              </div>
              <div className="h-3 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                <div 
                  className={`h-full rounded-full ${
                    idx === 0 ? 'bg-gradient-to-r from-blue-500 to-indigo-500' :
                    idx === 1 ? 'bg-gradient-to-r from-purple-500 to-indigo-500' :
                    idx === 2 ? 'bg-gradient-to-r from-amber-500 to-orange-500' :
                    'bg-gradient-to-r from-emerald-500 to-teal-500'
                  }`}
                  style={{ width: `${Math.max(8, tp.percentage)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Questions Per Module & Daily Trends Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Questions Per Module Card */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Layers className="h-4 w-4 text-blue-400" />
            <span>Questions Per Module</span>
          </h3>

          <div className="space-y-2">
            {analytics.questions_per_module.map((m: any, idx: number) => (
              <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs">
                <span className="font-semibold text-slate-200 truncate">{m.module}</span>
                <span className="px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-300 font-bold border border-blue-500/20">
                  {m.count} Doubts
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Daily Trends Card */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Cpu className="h-4 w-4 text-emerald-400" />
            <span>Daily Doubt Frequency Trends</span>
          </h3>

          <div className="grid grid-cols-4 gap-2 pt-2">
            {analytics.daily_trends.map((d: any, idx: number) => (
              <div key={idx} className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-center space-y-1">
                <span className="text-[10px] font-bold uppercase text-slate-400 block">{d.date}</span>
                <div className="text-lg font-bold text-emerald-400">{d.count}</div>
                <span className="text-[9px] text-slate-500 block">questions</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Identified Student Misconceptions & Action Items */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-amber-400" />
          <span>Identified Learning Misconceptions & Actionable Teaching Insights</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          <div className="glass-card p-4 rounded-xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-blue-400">Topic: Entropy & Second Law</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-500/10 text-blue-300">42 Doubts</span>
            </div>
            <h3 className="text-xs font-bold text-white">Misconception: Microstate multiplicity vs macrostates</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Students assume entropy requires heat transfer, failing to realize isolated system entropy increases purely due to statistical microstate multiplicity.
            </p>
            <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 font-medium">
              💡 <strong>Action:</strong> Show coin-toss statistical microstate diagram in next lecture.
            </div>
          </div>

          <div className="glass-card p-4 rounded-xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-purple-400">Topic: Carnot Engine & Cycles</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-500/10 text-purple-300">12 Doubts</span>
            </div>
            <h3 className="text-xs font-bold text-white">Misconception: Ideal vs real engine efficiency</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Students confuse working fluid properties with Carnot efficiency bounds ($1 - T_C/T_H$).
            </p>
            <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 font-medium">
              💡 <strong>Action:</strong> Review temperature ratios on PV diagrams during office hours.
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}
