'use client';

import { ContradictionAlert } from '@/lib/api';
import { AlertTriangle, FileText, ArrowRightLeft } from 'lucide-react';

interface Props {
  alerts: ContradictionAlert[];
}

export default function ContradictionAlerts({ alerts }: Props) {
  if (!alerts || alerts.length === 0) return null;

  return (
    <div className="glass-panel rounded-2xl p-5 border border-slate-800 space-y-4">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <AlertTriangle className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">Course Material Contradiction Alert Hub</h3>
            <p className="text-xs text-slate-400">AI detected conflicting specifications across uploaded documents</p>
          </div>
        </div>
        <span className="text-xs px-2.5 py-1 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 font-medium">
          {alerts.length} High Severity
        </span>
      </div>

      <div className="space-y-4">
        {alerts.map((a) => (
          <div key={a.id} className="p-4 rounded-xl bg-slate-950/70 border border-rose-500/30 space-y-3">
            
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-rose-300">Topic: {a.topic_name}</span>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                {a.severity} Severity
              </span>
            </div>

            <p className="text-xs text-slate-300 font-medium leading-relaxed">
              {a.explanation}
            </p>

            {/* Side by side conflicting source quotes */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 border-t border-slate-800/80">
              
              {/* Source A */}
              <div className="p-3 rounded-lg bg-slate-900/90 border border-slate-800 text-xs space-y-1">
                <div className="flex items-center gap-1.5 font-semibold text-slate-300">
                  <FileText className="h-3.5 w-3.5 text-blue-400" />
                  <span>Source A: {a.source_a_title}</span>
                </div>
                <p className="text-slate-400 italic text-[11px]">"{a.source_a_quote}"</p>
              </div>

              {/* Source B */}
              <div className="p-3 rounded-lg bg-slate-900/90 border border-slate-800 text-xs space-y-1">
                <div className="flex items-center gap-1.5 font-semibold text-slate-300">
                  <FileText className="h-3.5 w-3.5 text-purple-400" />
                  <span>Source B: {a.source_b_title}</span>
                </div>
                <p className="text-slate-400 italic text-[11px]">"{a.source_b_quote}"</p>
              </div>

            </div>

          </div>
        ))}
      </div>
    </div>
  );
}
