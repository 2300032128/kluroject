'use client';

import { useState } from 'react';
import { EscalationItem, resolveEscalation } from '@/lib/api';
import { ShieldAlert, AlertTriangle, CheckCircle2, MessageSquare, BookOpen, Send, Sparkles } from 'lucide-react';

interface Props {
  escalations: EscalationItem[];
  onRefresh: () => void;
}

export default function EscalationQueue({ escalations, onRefresh }: Props) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [instructorAnswer, setInstructorAnswer] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const activeItem = escalations.find(e => e.id === selectedId);

  const handleResolve = async () => {
    if (!selectedId || !instructorAnswer.trim()) return;
    setSubmitting(true);
    try {
      await resolveEscalation(selectedId, instructorAnswer);
      setSelectedId(null);
      setInstructorAnswer('');
      onRefresh();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="glass-panel rounded-2xl p-5 border border-slate-800 space-y-4">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <ShieldAlert className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">Escalation Triage Queue</h3>
            <p className="text-xs text-slate-400">Doubts flagged for human instructor intervention</p>
          </div>
        </div>
        <span className="text-xs px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 font-medium">
          {escalations.length} Pending
        </span>
      </div>

      {escalations.length === 0 ? (
        <div className="py-8 text-center text-slate-400 text-xs">
          <CheckCircle2 className="h-8 w-8 text-emerald-400 mx-auto mb-2 opacity-80" />
          <p className="font-semibold text-slate-300">All escalated doubts resolved!</p>
          <p className="mt-1">No pending student doubts require manual review.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {escalations.map((item) => (
            <div 
              key={item.id} 
              className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3 hover:border-amber-500/30 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-semibold uppercase tracking-wide text-amber-400 px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20">
                    {item.has_contradiction ? 'Contradiction Alert' : 'Low AI Confidence'}
                  </span>
                  <h4 className="text-sm font-semibold text-white mt-1.5">{item.question}</h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Topic: <span className="text-blue-400 font-medium">{item.detected_topic_name}</span>
                  </p>
                </div>

                <button
                  onClick={() => setSelectedId(selectedId === item.id ? null : item.id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 text-xs font-semibold border border-amber-500/30 transition-colors"
                >
                  <MessageSquare className="h-3.5 w-3.5" />
                  <span>Review & Respond</span>
                </button>
              </div>

              {item.contradiction_details && (
                <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                  <p>{item.contradiction_details}</p>
                </div>
              )}

              {/* Expand Response Input Modal/Drawer */}
              {selectedId === item.id && (
                <div className="pt-3 border-t border-slate-800 space-y-3 animate-fadeIn">
                  {item.draft_ai_answer && (
                    <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 text-xs text-slate-300 space-y-1">
                      <div className="flex items-center gap-1.5 text-blue-400 font-semibold">
                        <Sparkles className="h-3.5 w-3.5" />
                        <span>AI Draft Suggestion:</span>
                      </div>
                      <p className="whitespace-pre-line text-slate-400">{item.draft_ai_answer}</p>
                    </div>
                  )}

                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-300">Your Instructor Clarification:</label>
                    <textarea
                      rows={3}
                      value={instructorAnswer}
                      onChange={(e) => setInstructorAnswer(e.target.value)}
                      placeholder="Type the official answer / policy clarification for the student..."
                      className="w-full bg-slate-900 rounded-xl p-3 text-xs text-slate-100 placeholder-slate-500 border border-slate-800 focus:border-amber-500 outline-none"
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => setSelectedId(null)}
                        className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleResolve}
                        disabled={submitting || !instructorAnswer.trim()}
                        className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md shadow-emerald-600/30 disabled:opacity-50"
                      >
                        <Send className="h-3.5 w-3.5" />
                        <span>Approve & Post Answer</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

            </div>
          ))}
        </div>
      )}
    </div>
  );
}
