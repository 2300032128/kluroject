'use client';

import { BookOpen, ChevronRight, Layers, HelpCircle } from 'lucide-react';

interface SyllabusModule {
  id: string;
  title: string;
  level: string;
  description: string;
  keywords: string[];
  doubtCount?: number;
}

interface Props {
  modules: SyllabusModule[];
  onSelectTopic?: (topicTitle: string) => void;
}

export default function SyllabusHeatmap({ modules, onSelectTopic }: Props) {
  return (
    <div className="bg-slate-900/80 rounded-2xl p-5 border border-slate-800 space-y-4">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <Layers className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">Course Syllabus Navigator</h3>
            <p className="text-xs text-slate-400">CS101: Data Structures & Algorithms</p>
          </div>
        </div>
        <span className="text-xs px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700 font-medium">
          4 Modules Active
        </span>
      </div>

      <div className="space-y-3">
        {modules.map((m, idx) => (
          <div 
            key={m.id || idx}
            onClick={() => onSelectTopic && onSelectTopic(m.title)}
            className="group p-3.5 rounded-xl bg-slate-950/60 hover:bg-slate-800/60 border border-slate-800/80 hover:border-blue-500/40 transition-all cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="flex items-center justify-center h-6 w-6 rounded-md bg-blue-600/20 text-blue-400 text-xs font-bold border border-blue-500/30">
                  M{idx + 1}
                </span>
                <div>
                  <h4 className="text-xs font-semibold text-slate-200 group-hover:text-blue-400 transition-colors">
                    {m.title}
                  </h4>
                  <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">{m.description}</p>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-slate-500 group-hover:text-blue-400 group-hover:translate-x-0.5 transition-all" />
            </div>

            {m.keywords && m.keywords.length > 0 && (
              <div className="mt-2.5 flex flex-wrap gap-1">
                {m.keywords.map((kw, i) => (
                  <span key={i} className="text-[10px] px-2 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800">
                    #{kw}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
