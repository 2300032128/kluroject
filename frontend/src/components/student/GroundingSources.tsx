'use client';

import { Citation } from '@/lib/api';
import { BookOpen, FileText } from 'lucide-react';

interface Props {
  citations: Citation[];
}

export default function GroundingSources({ citations }: Props) {
  if (!citations || citations.length === 0) return null;

  return (
    <div className="mt-3 bg-slate-900/80 rounded-xl p-3.5 border border-slate-800 space-y-2">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
        <BookOpen className="h-3.5 w-3.5 text-purple-400" />
        <span>Grounded Syllabus Sources ({citations.length})</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {citations.map((c, i) => (
          <div key={i} className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800 text-xs hover:border-purple-500/30 transition-colors">
            <div className="flex items-center justify-between font-medium text-slate-200 mb-1">
              <span className="truncate flex items-center gap-1.5 text-purple-300">
                <FileText className="h-3.5 w-3.5" />
                {c.material_title}
              </span>
              <span className="px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-300 text-[10px] font-semibold border border-purple-500/20">
                Pg. {c.page_number}
              </span>
            </div>
            <p className="text-slate-400 line-clamp-2 italic text-[11px] leading-relaxed">
              "{c.snippet}"
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
