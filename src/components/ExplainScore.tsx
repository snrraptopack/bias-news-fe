import React from 'react';
import type { BiasDimension } from '../types';

interface Props { label: string; dim: BiasDimension; }

export const ExplainScore: React.FC<Props> = ({ label, dim }) => {
  const [open, setOpen] = React.useState(false);
  const phrases = (dim.highlightedPhrases || []).slice(0, 12);
  return (
    <div className="relative inline-block">
      <button type="button" onClick={() => setOpen(o=>!o)} className="text-[10px] px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-600 font-medium">
        Explain
      </button>
      {open && (
        <div className="absolute z-40 mt-2 w-64 p-3 rounded-lg bg-white shadow-lg ring-1 ring-slate-200 text-[11px] space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-slate-700">{label} Score</span>
            <button onClick={()=>setOpen(false)} className="text-slate-400 hover:text-slate-600">×</button>
          </div>
          <div className="flex flex-wrap gap-1">
            {phrases.length ? phrases.map(p => <span key={p} className="px-1 py-0.5 rounded bg-indigo-50 text-indigo-600 border border-indigo-100">{p}</span>) : <span className="text-slate-400">No phrases</span>}
          </div>
          {dim.reasoning && <p className="text-slate-600 leading-snug line-clamp-4">{dim.reasoning}</p>}
          {dim.confidenceInterval && (
            <div className="text-slate-500">CI: {dim.confidenceInterval.lower}–{dim.confidenceInterval.upper}</div>
          )}
        </div>
      )}
    </div>
  );
};
