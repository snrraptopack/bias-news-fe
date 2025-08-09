import React, { Suspense, useState } from 'react';
import type { BiasScores } from '../types';
import { DIMENSION_KEYS, DIMENSION_LABELS, DIMENSION_COLORS } from '../types';
const LazyRadar = React.lazy(() => import('./RadarLazy.tsx'));

export const BiasRadar: React.FC<{ scores: BiasScores; compact?: boolean }> = ({ scores, compact }) => {
  const [activeDims, setActiveDims] = useState<Set<string>>(new Set(DIMENSION_KEYS));
  const toggle = (k: string) => {
    setActiveDims(s => {
      const next = new Set(s);
      if (next.has(k)) next.delete(k); else next.add(k);
      return next;
    });
  };
  const data = DIMENSION_KEYS.filter(k => activeDims.has(k)).map(k => ({
    dimension: DIMENSION_LABELS[k],
    score: scores[k].score,
    confidence: Math.round(scores[k].score * scores[k].confidence)
  }));
  return (
    <div className={`rounded-xl bg-white/80 backdrop-blur ring-1 ring-slate-200 p-4 ${compact ? 'p-3' : ''}`}>
      <div className="flex items-center justify-between mb-3 flex-wrap gap-3">
        <h2 className="text-sm font-semibold tracking-wide text-slate-600 uppercase">Bias Profile</h2>
        <span className="text-[11px] text-slate-500">Overall {scores.overallBiasLevel}</span>
      </div>
      <div className="flex flex-wrap gap-2 mb-3">
        {DIMENSION_KEYS.map(k => (
          <button key={k} type="button" onClick={() => toggle(k)} className={`text-[10px] px-2 py-1 rounded-full ring-1 transition ${activeDims.has(k) ? 'bg-indigo-600 text-white ring-indigo-500' : 'bg-slate-100 text-slate-500 ring-slate-300 hover:bg-slate-200'}`}>{DIMENSION_LABELS[k]}</button>
        ))}
      </div>
      <Suspense fallback={<div className="h-64 flex items-center justify-center text-xs text-slate-500">Loading chart…</div>}>
        <LazyRadar data={data} />
      </Suspense>
      <div className="mt-4 grid grid-cols-5 gap-2">
        {DIMENSION_KEYS.map(k => {
          const dim = scores[k];
            const ci = dim.confidenceInterval;
            return (
              <div key={k} className="flex flex-col gap-1">
                <span className="text-[10px] font-medium capitalize flex items-center gap-1">
                  <span className="h-2 w-2 rounded-sm" style={{ background: `var(--tw-color-${DIMENSION_COLORS[k]})` }} />
                  <span className="text-slate-500">{DIMENSION_LABELS[k]}</span>
                </span>
                <div className="h-2 w-full bg-slate-100 rounded relative overflow-hidden">
                  {ci && <div className="absolute inset-y-0 bg-indigo-200/60" style={{ left: `${ci.lower}%`, width: `${Math.max(ci.width,2)}%` }} />}
                  <div className="absolute inset-y-0 bg-indigo-600" style={{ left: `${dim.score-1}%`, width: '2%' }} />
                </div>
                <div className="flex justify-between text-[9px] text-slate-500">
                  <span>{ci ? `${ci.lower}` : dim.score}</span>
                  <span>{ci ? `${ci.upper}` : ''}</span>
                </div>
              </div>
            );
        })}
      </div>
      <div className="mt-3 flex flex-wrap gap-3 text-[10px] text-slate-500">
        {DIMENSION_KEYS.map(k => (
          <span key={k} className="inline-flex items-center gap-1">
            <span className="h-2 w-2 rounded-sm" style={{ background: `var(--tw-color-${DIMENSION_COLORS[k]})` }} />
            {DIMENSION_LABELS[k]}
          </span>
        ))}
      </div>
    </div>
  );
};
