'use client';

import { DoubtCluster } from '@/lib/api';
import { Layers, Lightbulb, Users, ArrowUpRight } from 'lucide-react';

interface Props {
  clusters: DoubtCluster[];
}

export default function DoubtClusters({ clusters }: Props) {
  return (
    <div className="glass-panel rounded-2xl p-5 border border-slate-800 space-y-4">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <Layers className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">Class Doubt Frequency & Misconception Matrix</h3>
            <p className="text-xs text-slate-400">Synthesized learning bottlenecks across all student questions</p>
          </div>
        </div>
        <span className="text-xs px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-medium">
          Doubt Analytics Agent
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {clusters.map((c) => (
          <div 
            key={c.id} 
            className="glass-card rounded-xl p-4 border border-slate-800 space-y-3 hover:border-indigo-500/40 transition-colors"
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-semibold text-indigo-400 px-2 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20">
                  {c.module_name}
                </span>
                <h4 className="text-sm font-semibold text-white mt-1.5">{c.cluster_title}</h4>
              </div>
              <div className="flex items-center gap-1 text-xs font-bold text-indigo-300 bg-indigo-500/10 px-2.5 py-1 rounded-lg border border-indigo-500/20">
                <Users className="h-3.5 w-3.5" />
                <span>{c.doubt_count} Doubts</span>
              </div>
            </div>

            {/* Identified Misconceptions */}
            {c.key_misconceptions && c.key_misconceptions.length > 0 && (
              <div className="space-y-1 text-xs">
                <p className="text-slate-400 font-medium text-[11px]">Identified Student Misconceptions:</p>
                <ul className="list-disc list-inside space-y-1 text-slate-300">
                  {c.key_misconceptions.map((m, i) => (
                    <li key={i} className="line-clamp-2">{m}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Suggested Action Item for Instructor */}
            {c.suggested_action && (
              <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 flex items-start gap-2">
                <Lightbulb className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold block text-emerald-200">Recommended Action:</span>
                  <p className="mt-0.5 text-emerald-300/90">{c.suggested_action}</p>
                </div>
              </div>
            )}

          </div>
        ))}
      </div>
    </div>
  );
}
