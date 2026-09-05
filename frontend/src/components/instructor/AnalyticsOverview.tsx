'use client';

import { OverviewMetrics } from '@/lib/api';
import { HelpCircle, CheckCircle2, ShieldAlert, AlertTriangle, Layers, Cpu } from 'lucide-react';

interface Props {
  metrics: OverviewMetrics;
}

export default function AnalyticsOverview({ metrics }: Props) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      
      {/* Total Doubts */}
      <div className="glass-panel rounded-2xl p-5 border border-slate-800 flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Doubts Logged</p>
          <h3 className="text-2xl font-bold text-white mt-1">{metrics.total_doubts}</h3>
          <p className="text-[11px] text-slate-400 mt-1">Across 4 CS101 Modules</p>
        </div>
        <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
          <HelpCircle className="h-6 w-6" />
        </div>
      </div>

      {/* AI Resolution Rate */}
      <div className="glass-panel rounded-2xl p-5 border border-slate-800 flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">AI Resolution Rate</p>
          <h3 className="text-2xl font-bold text-emerald-400 mt-1">{metrics.ai_resolution_rate}%</h3>
          <p className="text-[11px] text-slate-400 mt-1">{metrics.ai_resolved_count} Grounded Answers</p>
        </div>
        <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          <CheckCircle2 className="h-6 w-6" />
        </div>
      </div>

      {/* Escalated Queue */}
      <div className="glass-panel rounded-2xl p-5 border border-slate-800 flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Escalation Queue</p>
          <h3 className="text-2xl font-bold text-amber-400 mt-1">{metrics.escalated_count}</h3>
          <p className="text-[11px] text-slate-400 mt-1">Requires Instructor Review</p>
        </div>
        <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
          <ShieldAlert className="h-6 w-6" />
        </div>
      </div>

      {/* Contradiction Alerts */}
      <div className="glass-panel rounded-2xl p-5 border border-slate-800 flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Material Contradictions</p>
          <h3 className="text-2xl font-bold text-rose-400 mt-1">{metrics.contradiction_alerts_count}</h3>
          <p className="text-[11px] text-slate-400 mt-1">Conflicting Specs Flagged</p>
        </div>
        <div className="p-3 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
          <AlertTriangle className="h-6 w-6" />
        </div>
      </div>

    </div>
  );
}
