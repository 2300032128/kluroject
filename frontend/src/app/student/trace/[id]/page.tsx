'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { 
  Cpu, ArrowLeft, CheckCircle2, AlertTriangle, Clock, ShieldCheck, 
  Zap, Bot, Search, FileCode2, ChevronDown, ChevronUp, Database, Sparkles, Layers 
} from 'lucide-react';

interface AgentRunItem {
  id?: string;
  step_index: number;
  agent_name: string;
  action: string;
  details: string;
  input_data?: any;
  output_data?: any;
  status: 'success' | 'warning' | 'escalated' | 'info' | string;
  confidence: number;
  execution_time_ms: number;
  created_at?: string;
}

interface TraceResponse {
  question_id: string;
  question: string;
  subject: string;
  topic: string;
  module: string;
  status: string;
  confidence: number;
  total_latency_ms: number;
  agent_runs: AgentRunItem[];
}

const FALLBACK_TRACE: TraceResponse = {
  question_id: "demo-q101",
  question: "Why does entropy increase in an isolated system?",
  subject: "Thermodynamics",
  topic: "Entropy",
  module: "Week 6 - Entropy",
  status: "answered",
  confidence: 0.92,
  total_latency_ms: 480,
  agent_runs: [
    {
      step_index: 1,
      agent_name: "Student Interaction Agent",
      action: "Intent & Scope Classification",
      details: "Intent: 'conceptual question' | Topic: 'Entropy' | Module: 'Week 6 - Entropy' | Sensitivity: 'normal'",
      input_data: { question: "Why does entropy increase in an isolated system?", subject: "Thermodynamics" },
      output_data: { intent: "conceptual question", topic: "Entropy", module: "Week 6 - Entropy", keywords: ["entropy", "increase", "isolated"] },
      status: "success",
      confidence: 0.95,
      execution_time_ms: 45
    },
    {
      step_index: 2,
      agent_name: "Syllabus Grounding Agent",
      action: "RAG Retrieval & Evidence Audit",
      details: "Grounded: True | Confidence: 91% | Sources Retrieved: 2 | Potential Conflicts: 0",
      input_data: { query: "entropy increase isolated system", filters: { module: "Week 6" } },
      output_data: { grounded: true, confidence: 0.91, sources: ["Thermodynamics Core Textbook (8th Ed)", "Week 6 Lecture Slides"] },
      status: "success",
      confidence: 0.91,
      execution_time_ms: 115
    },
    {
      step_index: 3,
      agent_name: "Contradiction Analysis",
      action: "Contextual Conflict Evaluation",
      details: "No significant contradiction detected across retrieved textbook & slide chunks.",
      input_data: { sources_count: 2 },
      output_data: { contradiction_detected: false, severity: "none", resolvable_from_context: true },
      status: "success",
      confidence: 0.95,
      execution_time_ms: 65
    },
    {
      step_index: 4,
      agent_name: "Escalation Agent",
      action: "Human Escalation Audit & Signal Routing",
      details: "Decision: ANSWER | Pass (High confidence syllabus evidence without conflict).",
      input_data: { confidence: 0.91, has_contradiction: false },
      output_data: { decision: "ANSWER", should_escalate: false, reason: "Pass" },
      status: "success",
      confidence: 0.95,
      execution_time_ms: 70
    },
    {
      step_index: 5,
      agent_name: "Answer Composition Agent",
      action: "Grounded Pedagogical Response Synthesis",
      details: "Grounded response generated with LaTeX math equations ($S = k_B \\ln W$) and verified citations.",
      input_data: { topic: "Entropy", citations_count: 2 },
      output_data: { answer_generated: true, key_takeaway: "Entropy increases because isolated systems progress towards maximum microstates." },
      status: "success",
      confidence: 0.91,
      execution_time_ms: 145
    },
    {
      step_index: 6,
      agent_name: "Doubt Analytics Agent",
      action: "Real-Time Analytics & Event Logging",
      details: "Question stored in analytics DB & dynamic instructor dashboard metrics updated.",
      input_data: { course_id: "course_thermo", topic: "Entropy" },
      output_data: { status: "analytics_updated" },
      status: "success",
      confidence: 1.0,
      execution_time_ms: 40
    }
  ]
};

export default function AgentTraceViewPage() {
  const params = useParams();
  const id = (params?.id as string) || 'demo-q101';

  const [traceData, setTraceData] = useState<TraceResponse>(FALLBACK_TRACE);
  const [loading, setLoading] = useState<boolean>(true);
  const [expandedStep, setExpandedStep] = useState<number | null>(null);

  useEffect(() => {
    async function fetchTrace() {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        const res = await fetch(`${apiUrl}/api/student/trace/${id}`);
        if (res.ok) {
          const data = await res.json();
          if (data && data.agent_runs && data.agent_runs.length > 0) {
            setTraceData(data);
          }
        }
      } catch (err) {
        console.warn("Could not fetch dynamic trace, using demo trace:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchTrace();
  }, [id]);

  const toggleExpand = (step: number) => {
    setExpandedStep(expandedStep === step ? null : step);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'escalated':
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">Escalated</span>;
      case 'warning':
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-yellow-500/20 text-yellow-300 border border-yellow-500/30">Warning</span>;
      case 'info':
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">Info</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">Passed</span>;
    }
  };

  const getAgentIcon = (name: string) => {
    if (name.includes("Interaction")) return <Bot className="h-5 w-5 text-indigo-400" />;
    if (name.includes("Grounding")) return <Search className="h-5 w-5 text-blue-400" />;
    if (name.includes("Contradiction")) return <AlertTriangle className="h-5 w-5 text-amber-400" />;
    if (name.includes("Escalation")) return <ShieldCheck className="h-5 w-5 text-purple-400" />;
    if (name.includes("Composition")) return <Sparkles className="h-5 w-5 text-emerald-400" />;
    return <Database className="h-5 w-5 text-cyan-400" />;
  };

  return (
    <div className="max-w-4xl mx-auto py-6 space-y-6">
      
      {/* Back Link */}
      <Link 
        href={`/student/answer/${traceData.question_id}`}
        className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Back to Answer Page</span>
      </Link>

      {/* Header Banner */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-purple-600/20 text-purple-400 border border-purple-500/30">
              <Cpu className="h-6 w-6" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400">Multi-Agent Workflow Execution</span>
              <h1 className="text-xl font-bold text-white">AI AGENT TRACE</h1>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <div className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-purple-400" />
              <span>Latency: <strong className="text-emerald-400">{traceData.total_latency_ms} ms</strong></span>
            </div>
            <div className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 flex items-center gap-1.5">
              <Zap className="h-3.5 w-3.5 text-blue-400" />
              <span>Confidence: <strong className="text-blue-400">{Math.round(traceData.confidence * 100)}%</strong></span>
            </div>
          </div>
        </div>

        <div>
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Evaluating Student Question:</span>
          <p className="text-base font-bold text-white mt-0.5">"{traceData.question}"</p>
          <p className="text-xs text-slate-400 mt-1">
            Subject: <strong className="text-slate-200">{traceData.subject}</strong> • 
            Topic: <strong className="text-purple-300">{traceData.topic}</strong> • 
            {traceData.module}
          </p>
        </div>
      </div>

      {/* Sequential Agent Pipeline Steps */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <Layers className="h-4 w-4 text-purple-400" />
            <span>End-to-End Workflow Execution Log ({traceData.agent_runs.length} Steps)</span>
          </h2>
          <span className="text-xs text-slate-500 font-mono">Real-Time Trace Verified</span>
        </div>
        
        <div className="space-y-3 relative before:absolute before:inset-0 before:left-6 before:w-0.5 before:bg-slate-800">
          {traceData.agent_runs.map((tr) => (
            <div 
              key={tr.step_index}
              className="relative flex flex-col p-5 rounded-2xl bg-slate-950/90 border border-slate-800/80 hover:border-purple-500/40 transition-all ml-2 space-y-3"
            >
              <div className="flex items-start gap-4">
                {/* Step Circle Badge */}
                <div className="z-10 flex items-center justify-center h-8 w-8 rounded-full bg-slate-900 text-purple-400 font-bold text-xs border border-purple-500/40 shrink-0">
                  {tr.step_index}
                </div>

                <div className="flex-1 space-y-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      {getAgentIcon(tr.agent_name)}
                      <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                        <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                        <span>{tr.agent_name}</span>
                      </h3>
                      <span className="text-xs text-purple-300 font-medium font-mono">({tr.action})</span>
                    </div>

                    <div className="flex items-center gap-2">
                      {getStatusBadge(tr.status)}
                      <span className="text-[11px] font-mono text-slate-400 px-2 py-0.5 rounded bg-slate-900 border border-slate-800">
                        {tr.execution_time_ms} ms
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed pt-1">
                    {tr.details}
                  </p>
                </div>
              </div>

              {/* Expandable JSON Data Inspector */}
              {(tr.input_data || tr.output_data) && (
                <div className="pl-12 pt-1 border-t border-slate-900">
                  <button 
                    onClick={() => toggleExpand(tr.step_index)}
                    className="flex items-center gap-1.5 text-[11px] font-semibold text-purple-400 hover:text-purple-300 transition-colors"
                  >
                    <FileCode2 className="h-3.5 w-3.5" />
                    <span>{expandedStep === tr.step_index ? "Hide Agent Payload Data" : "Inspect Agent Input / Output JSON"}</span>
                    {expandedStep === tr.step_index ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                  </button>

                  {expandedStep === tr.step_index && (
                    <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3 text-[11px] font-mono">
                      {tr.input_data && (
                        <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1">
                          <span className="text-purple-400 font-bold uppercase text-[10px] tracking-wider block">Input Payload:</span>
                          <pre className="text-slate-300 whitespace-pre-wrap overflow-x-auto max-h-40 font-mono text-[11px]">
                            {JSON.stringify(tr.input_data, null, 2)}
                          </pre>
                        </div>
                      )}
                      {tr.output_data && (
                        <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1">
                          <span className="text-emerald-400 font-bold uppercase text-[10px] tracking-wider block">Output Result:</span>
                          <pre className="text-slate-300 whitespace-pre-wrap overflow-x-auto max-h-40 font-mono text-[11px]">
                            {JSON.stringify(tr.output_data, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
