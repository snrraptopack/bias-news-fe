import React, { useMemo, useState } from 'react';
import { DIMENSION_KEYS, DIMENSION_LABELS, DIMENSION_COLORS } from '../types';

interface Props {
  sourceAnalysis: Record<string, { articleCount: number; avgBiasScores: Record<string, number>; distinctivePhrases?: string[] }>;
  maxSources?: number;
}

// Source comparison heatmap for average bias scores per dimension.
export const SourceComparisonHeatmap: React.FC<Props> = ({ sourceAnalysis, maxSources = 12 }) => {
  const [focusSource, setFocusSource] = useState<string | null>(null);
  const entries = useMemo(() => Object.entries(sourceAnalysis)
    .sort((a,b) => b[1].articleCount - a[1].articleCount)
    .slice(0, maxSources), [sourceAnalysis, maxSources]);

  const dimMax: Record<string, number> = {};
  for (const dim of DIMENSION_KEYS) {
    dimMax[dim] = Math.max(1, ...entries.map(e => e[1].avgBiasScores[dim] || 0));
  }

  return (
    <div className="space-y-3">
      <div className="overflow-x-auto">
        <table className="w-full text-[11px] border-separate border-spacing-0">
          <thead>
            <tr>
              <th className="sticky left-0 bg-white/90 backdrop-blur z-10 text-left font-semibold text-slate-600 p-2">Source</th>
              {DIMENSION_KEYS.map(dim => (
                <th key={dim} className="font-medium text-slate-500 p-2 text-center">{DIMENSION_LABELS[dim]}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {entries.map(([src, info]) => (
              <tr key={src} className="group">
                <th scope="row" className="sticky left-0 bg-white/80 backdrop-blur z-10 text-left font-medium p-2 text-slate-700 whitespace-nowrap">
                  <button onClick={() => setFocusSource(focusSource === src ? null : src)} className="hover:text-indigo-600 transition">{src}</button>
                  <span className="ml-1 text-slate-400 font-normal">({info.articleCount})</span>
                </th>
                {DIMENSION_KEYS.map(dim => {
                  const val = info.avgBiasScores[dim] ?? 0;
                  const pct = val / (dimMax[dim] || 1); // 0-1
                  const baseColorVar = DIMENSION_COLORS[dim];
                  // Map to custom lightness via CSS variable fallback to Tailwind color
                  const level = pct > 0.85 ? 0.9 : pct > 0.65 ? 0.75 : pct > 0.45 ? 0.6 : pct > 0.25 ? 0.45 : pct > 0.1 ? 0.30 : 0.15;
                  const colorStyle: React.CSSProperties = { backgroundColor: `color-mix(in srgb, var(--tw-color-${baseColorVar}) ${Math.round(level*100)}%, white)` };
                  return (
                    <td key={dim} className="p-0 align-middle">
                      <div className="relative h-9 w-full flex items-center justify-center text-[10px] font-semibold text-slate-700" style={colorStyle} title={`${dim}: ${Math.round(val)}`}> 
                        {Math.round(val)}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {focusSource && sourceAnalysis[focusSource]?.distinctivePhrases && (
        <div className="rounded-md border border-slate-200 bg-slate-50 p-2 text-[11px]">
          <div className="flex items-center justify-between mb-1">
            <span className="font-semibold text-slate-600">Distinctive phrases – {focusSource}</span>
            <button onClick={() => setFocusSource(null)} className="text-slate-400 hover:text-slate-600">×</button>
          </div>
          <div className="flex flex-wrap gap-1">
            {sourceAnalysis[focusSource].distinctivePhrases!.slice(0,24).map(p => (
              <span key={p} className="px-1.5 py-0.5 rounded bg-white border border-slate-200 text-slate-600">{p}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
