'use client';

import { useState } from 'react';
import { askDoubt, AskDoubtResponse } from '@/lib/api';
import AgentReasoningStep from './AgentReasoningStep';
import GroundingSources from './GroundingSources';
import { Send, Sparkles, Bot, AlertTriangle, ShieldAlert, CheckCircle2, User, RefreshCw, Cpu } from 'lucide-react';

const SUGGESTED_DOUBTS = [
  {
    label: "⚡ Recursion Memory Doubt",
    text: "Does recursion always use O(N) stack space?"
  },
  {
    label: "⚠️ Material Contradiction Demo",
    text: "In Assignment 2, do we use 1-based indexing as shown in slides or 0-based as in notes?"
  },
  {
    label: "📚 Complexity Query",
    text: "What is the average and worst-case time complexity of Binary Search?"
  }
];

export default function DoubtChat() {
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [responses, setResponses] = useState<AskDoubtResponse[]>([]);

  const handleAsk = async (textToAsk?: string) => {
    const query = textToAsk || question;
    if (!query.trim() || loading) return;

    setLoading(true);
    try {
      const result = await askDoubt(query);
      setResponses((prev) => [result, ...prev]);
      if (!textToAsk) setQuestion('');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Ask Doubt Form Card */}
      <div className="glass-panel rounded-2xl p-5 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-blue-600/20 text-blue-400 border border-blue-500/30">
              <Bot className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">Ask your CS101 Doubt</h2>
              <p className="text-xs text-slate-400">Grounding via Syllabus & Uploaded Course Materials</p>
            </div>
          </div>
          <span className="text-xs px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 font-medium">
            Gemini 2.5 RAG Ready
          </span>
        </div>

        {/* Text Area & Submit */}
        <div className="space-y-3">
          <div className="relative">
            <textarea
              rows={3}
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="e.g. Does recursion always use O(N) stack space, or can it be optimized?"
              className="w-full bg-slate-950/80 rounded-xl p-3.5 text-sm text-slate-100 placeholder-slate-500 border border-slate-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none resize-none"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleAsk();
                }
              }}
            />
            <button
              onClick={() => handleAsk()}
              disabled={loading || !question.trim()}
              className="absolute bottom-3 right-3 flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-lg text-xs font-semibold shadow-md shadow-blue-600/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {loading ? (
                <>
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                  <span>Agent Reasoning...</span>
                </>
              ) : (
                <>
                  <Send className="h-3.5 w-3.5" />
                  <span>Ask AI Assistant</span>
                </>
              )}
            </button>
          </div>

          {/* Quick Preset Buttons for Hackathon Demo */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
              Quick Hackathon Demo Scenarios:
            </span>
            <div className="flex flex-wrap gap-2">
              {SUGGESTED_DOUBTS.map((btn, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setQuestion(btn.text);
                    handleAsk(btn.text);
                  }}
                  disabled={loading}
                  className="text-xs px-3 py-1.5 rounded-lg bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 hover:border-blue-500/40 transition-all flex items-center gap-1.5"
                >
                  <Sparkles className="h-3 w-3 text-blue-400" />
                  <span>{btn.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Live Agent Processing Loader */}
      {loading && (
        <div className="glass-card rounded-2xl p-6 border border-blue-500/30 animate-pulse space-y-4">
          <div className="flex items-center gap-3">
            <Cpu className="h-5 w-5 text-blue-400 animate-spin" />
            <div>
              <h3 className="text-sm font-semibold text-white">Running 5-Agent Pipeline</h3>
              <p className="text-xs text-slate-400">Interaction → RAG Grounding → Contradiction Scan → Composition → Escalation</p>
            </div>
          </div>
          <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 animate-pulse w-3/4"></div>
          </div>
        </div>
      )}

      {/* Answers Feed */}
      <div className="space-y-6">
        {responses.map((resp) => (
          <div key={resp.doubt_id} className="glass-card rounded-2xl p-6 border border-slate-800 space-y-4">
            
            {/* Student Question Header */}
            <div className="flex items-start justify-between border-b border-slate-800 pb-3">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-slate-800 text-slate-300">
                  <User className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white">{resp.question}</h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Topic: <span className="text-blue-400 font-medium">{resp.detected_topic}</span>
                  </p>
                </div>
              </div>

              {/* Status Badge */}
              {resp.has_contradiction || resp.status === 'escalated' ? (
                <div className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/30">
                  <ShieldAlert className="h-3.5 w-3.5" />
                  <span>Escalated to Instructor</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>AI Grounded Answer</span>
                </div>
              )}
            </div>

            {/* 5-Agent Execution Trace Component */}
            {resp.reasoning_trace && resp.reasoning_trace.length > 0 && (
              <AgentReasoningStep 
                steps={resp.reasoning_trace} 
                topicName={resp.detected_topic}
                confidenceScore={resp.confidence_score}
                hasContradiction={resp.has_contradiction}
              />
            )}

            {/* Contradiction Alert Box if triggered */}
            {resp.has_contradiction && (
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 space-y-1.5 text-xs">
                <div className="flex items-center gap-2 font-semibold text-amber-200">
                  <AlertTriangle className="h-4 w-4 text-amber-400" />
                  <span>Course Material Contradiction Alert</span>
                </div>
                <p className="text-amber-200/90 leading-relaxed">{resp.contradiction_details}</p>
              </div>
            )}

            {/* AI Grounded Answer Markdown Text */}
            <div className="bg-slate-950/60 rounded-xl p-4 border border-slate-800/80 text-sm text-slate-200 leading-relaxed whitespace-pre-line">
              {resp.answer_text}
            </div>

            {/* Grounded Citation Sources */}
            {resp.citations && resp.citations.length > 0 && (
              <GroundingSources citations={resp.citations} />
            )}

          </div>
        ))}
      </div>

    </div>
  );
}
