'use client';

import { useState } from 'react';
import { DEMO_QUESTIONS, DemoQuestion } from '@/lib/mockData';
import { ShieldAlert, AlertTriangle, CheckCircle2, MessageSquare, Send, BookOpen, User, RefreshCw } from 'lucide-react';

export default function EscalationQueuePage() {
  const [escalations, setEscalations] = useState<DemoQuestion[]>(
    DEMO_QUESTIONS.filter(q => q.status === 'Instructor Review' || q.status === 'Escalated')
  );
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [responseInput, setResponseInput] = useState('');
  const [resolvedIds, setResolvedIds] = useState<string[]>([]);

  const [actionStatus, setActionStatus] = useState<Record<string, 'PENDING' | 'REVIEWED' | 'RESOLVED'>>({
    'q-103': 'PENDING',
    'q-105': 'PENDING'
  });

  const handleTicketAction = (id: string, action: 'approve_answer' | 'edit_answer' | 'send_to_student' | 'mark_resolved') => {
    if (action === 'edit_answer') {
      setActionStatus(prev => ({ ...prev, [id]: 'REVIEWED' }));
    } else {
      setActionStatus(prev => ({ ...prev, [id]: 'RESOLVED' }));
      setResolvedIds(prev => [...prev, id]);
    }
    setSelectedId(null);
  };

  return (
    <div className="max-w-5xl mx-auto py-6 space-y-6">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-400">
            <ShieldAlert className="h-4 w-4" />
            <span>Human Triage Queue</span>
          </div>
          <h1 className="text-2xl font-bold text-white mt-1">Escalated Doubts Queue</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Doubts automatically routed to Dr. Vance due to low AI confidence score, material contradiction flags, or policy queries.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs px-3 py-1.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 font-bold">
            {escalations.filter(e => (actionStatus[e.id] || 'PENDING') !== 'RESOLVED').length} Pending
          </span>
          <span className="text-xs px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
            {escalations.filter(e => actionStatus[e.id] === 'RESOLVED').length} Resolved
          </span>
        </div>
      </div>

      {/* Escalation Cards */}
      <div className="space-y-4">
        {escalations.map((item) => {
          const currentStatus = actionStatus[item.id] || 'PENDING';
          const isResolved = currentStatus === 'RESOLVED';
          const isExpanded = selectedId === item.id;

          return (
            <div 
              key={item.id}
              className={`glass-panel p-6 rounded-2xl border transition-all ${
                isResolved 
                  ? 'border-emerald-500/30 opacity-80 bg-emerald-950/10' 
                  : currentStatus === 'REVIEWED'
                  ? 'border-blue-500/30 bg-blue-950/10'
                  : 'border-slate-800 hover:border-amber-500/30'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    {/* Status Badges */}
                    {currentStatus === 'PENDING' && (
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        PENDING
                      </span>
                    )}
                    {currentStatus === 'REVIEWED' && (
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                        REVIEWED
                      </span>
                    )}
                    {currentStatus === 'RESOLVED' && (
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        RESOLVED
                      </span>
                    )}

                    <span className="text-xs text-slate-400 font-medium">{item.askedAt}</span>
                    <span className="text-xs text-slate-500">• {item.studentName} ({item.studentId})</span>
                  </div>

                  <h3 className="text-base font-bold text-white leading-snug">
                    "{item.question}"
                  </h3>

                  <div className="flex items-center gap-3 text-xs text-slate-400">
                    <span>Topic: <strong className="text-blue-400">{item.topic}</strong></span>
                    <span>Module: <strong className="text-slate-300">{item.module}</strong></span>
                    <span>AI Confidence: <strong className="text-amber-400">{Math.round(item.confidence * 100)}%</strong></span>
                  </div>
                </div>

                <div className="shrink-0">
                  {isResolved ? (
                    <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-400 text-xs font-bold border border-emerald-500/30">
                      <CheckCircle2 className="h-4 w-4" />
                      Resolved by Instructor
                    </span>
                  ) : (
                    <button
                      onClick={() => setSelectedId(isExpanded ? null : item.id)}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 text-xs font-bold border border-amber-500/30 transition-colors"
                    >
                      <MessageSquare className="h-4 w-4" />
                      <span>{isExpanded ? 'Close Actions' : 'Instructor Actions'}</span>
                    </button>
                  )}
                </div>

              </div>

              {/* Draft AI Answer & Context Snippets */}
              <div className="mt-4 pt-4 border-t border-slate-800/80 space-y-3">
                <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 text-xs text-slate-300 space-y-1">
                  <span className="font-bold text-amber-400 block mb-1">AI Analysis & Draft Answer:</span>
                  <p className="text-slate-400 leading-relaxed font-mono text-[11px] whitespace-pre-line">{item.answer}</p>
                </div>

                {item.sources && (
                  <div className="flex flex-wrap gap-2 text-xs">
                    <span className="text-slate-400 font-medium">Retrieved Sources:</span>
                    {item.sources.map((s, idx) => (
                      <span key={idx} className="px-2.5 py-0.5 rounded bg-slate-900 text-purple-300 border border-slate-800 text-[11px]">
                        📄 {s.title} (Pg. {s.page})
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Phase 9 Instructor Action Toolbar */}
              {isExpanded && !isResolved && (
                <div className="mt-4 pt-4 border-t border-slate-800 space-y-3 animate-fadeIn">
                  <label className="text-xs font-bold text-white block">Instructor Action & Response Editor:</label>
                  <textarea
                    rows={3}
                    value={responseInput || item.answer || ''}
                    onChange={(e) => setResponseInput(e.target.value)}
                    placeholder="Edit AI answer or type official instructor response..."
                    className="w-full bg-slate-950 rounded-xl p-3 text-xs text-slate-100 placeholder-slate-500 border border-slate-800 focus:border-amber-500 outline-none"
                  />

                  {/* 4 Explicit Phase 9 Action Buttons */}
                  <div className="flex flex-wrap items-center justify-end gap-2 pt-1">
                    <button
                      onClick={() => handleTicketAction(item.id, 'approve_answer')}
                      className="px-3.5 py-1.5 rounded-xl bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-300 border border-emerald-500/30 font-semibold text-xs transition-colors flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>Approve AI Answer</span>
                    </button>

                    <button
                      onClick={() => handleTicketAction(item.id, 'edit_answer')}
                      className="px-3.5 py-1.5 rounded-xl bg-blue-600/30 hover:bg-blue-600/50 text-blue-300 border border-blue-500/30 font-semibold text-xs transition-colors flex items-center gap-1.5"
                    >
                      <RefreshCw className="h-3.5 w-3.5" />
                      <span>Edit Answer</span>
                    </button>

                    <button
                      onClick={() => handleTicketAction(item.id, 'send_to_student')}
                      className="px-3.5 py-1.5 rounded-xl bg-purple-600/30 hover:bg-purple-600/50 text-purple-300 border border-purple-500/30 font-semibold text-xs transition-colors flex items-center gap-1.5"
                    >
                      <Send className="h-3.5 w-3.5" />
                      <span>Send to Student</span>
                    </button>

                    <button
                      onClick={() => handleTicketAction(item.id, 'mark_resolved')}
                      className="px-3.5 py-1.5 rounded-xl bg-amber-600/30 hover:bg-amber-600/50 text-amber-300 border border-amber-500/30 font-semibold text-xs transition-colors flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>Mark Resolved</span>
                    </button>
                  </div>
                </div>
              )}

            </div>
          );
        })}
      </div>

    </div>
  );
}
