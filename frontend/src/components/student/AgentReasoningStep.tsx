'use client';

import { ReasoningStep } from '@/lib/api';
import { CheckCircle2, AlertTriangle, Info, Bot, Search, FileCode2, ShieldAlert, Cpu } from 'lucide-react';

interface Props {
  steps: ReasoningStep[];
  topicName?: string;
  confidenceScore?: number;
  hasContradiction?: boolean;
}

export default function AgentReasoningStep({ steps, topicName, confidenceScore, hasContradiction }: Props) {
  const getAgentIcon = (agent: string) => {
    if (agent.includes('Interaction')) return <Bot className="h-4 w-4 text-blue-400" />;
    if (agent.includes('Grounding')) return <Search className="h-4 w-4 text-purple-400" />;
    if (agent.includes('Composition')) return <FileCode2 className="h-4 w-4 text-emerald-400" />;
    if (agent.includes('Escalation')) return <ShieldAlert className="h-4 w-4 text-amber-400" />;
    return <Cpu className="h-4 w-4 text-slate-400" />;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return (
          <span className="flex items-center gap-1 text-[11px] font-medium text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
            <CheckCircle2 className="h-3 w-3" />
            Verified
          </span>
        );
      case 'warning':
        return (
          <span className="flex items-center gap-1 text-[11px] font-medium text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
            <AlertTriangle className="h-3 w-3" />
            Alert Flagged
          </span>
        );
      case 'escalated':
        return (
          <span className="flex items-center gap-1 text-[11px] font-medium text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
            <ShieldAlert className="h-3 w-3" />
            Escalated to Instructor
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1 text-[11px] font-medium text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
            <Info className="h-3 w-3" />
            Info
          </span>
        );
    }
  };

  return (
    <div className="bg-slate-900/90 rounded-xl p-4 border border-slate-800 space-y-3">
      <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
        <div className="flex items-center gap-2">
          <Cpu className="h-4 w-4 text-blue-400" />
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
            5-Agent Reasoning Execution Trace
          </span>
        </div>
        {confidenceScore !== undefined && (
          <div className="text-xs text-slate-400">
            Confidence: <span className={`font-semibold ${confidenceScore >= 0.7 ? 'text-emerald-400' : 'text-amber-400'}`}>{intScore(confidenceScore)}%</span>
          </div>
        )}
      </div>

      <div className="space-y-2">
        {steps.map((s, idx) => (
          <div key={idx} className="flex items-start gap-3 text-xs bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/60">
            <div className="mt-0.5 p-1 rounded-md bg-slate-800/80">
              {getAgentIcon(s.agent)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-200">{s.agent} — <span className="text-slate-400 font-normal">{s.title}</span></span>
                {getStatusBadge(s.status)}
              </div>
              <p className="text-slate-400 mt-1 leading-relaxed">{s.details}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function intScore(val: number): number {
  return Math.round(val * 100);
}
