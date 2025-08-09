import React from 'react';
import { useParams } from 'react-router-dom';
import { useArticle } from '../api/hooks';
import { Loading } from '../components/Loading';
import { ErrorState } from '../components/ErrorState';
import { BiasRadar } from '../components/BiasRadar';
import { buildHighlights } from '../utils/highlight';
import { DIMENSION_KEYS, DIMENSION_LABELS, DIMENSION_COLORS } from '../types';
import { ExplainScore } from '../components/ExplainScore.tsx';

export const ArticleDetail: React.FC = () => {
  const { id } = useParams();
  const { data, isLoading, error, refetch } = useArticle(id);
  return (
    <div className="space-y-6">
      {isLoading && <Loading label="Loading article" />}
      {error && <ErrorState error={error} retry={refetch} />}
      {data && (
  <article className="prose max-w-none break-words">
          <h1 className="mb-2 text-3xl font-display font-semibold tracking-tight">{data.headline}</h1>
            <div className="text-sm text-slate-500 flex gap-4 mb-6">
              <span>{data.source}</span>
              <time dateTime={data.publishedAt}>{new Date(data.publishedAt).toLocaleString()}</time>
              {data.author && <span>By {data.author}</span>}
            </div>
            {data.biasScores && (
              <div className="space-y-3">
                <div className="flex items-center gap-3 flex-wrap text-xs">
                  {data.biasScores.analysisStatus && (
                    <span className="px-2 py-1 rounded-full bg-slate-100 text-slate-600 font-medium tracking-wide uppercase">{data.biasScores.analysisStatus}</span>
                  )}
                  {data.biasScores.isFallback && (
                    <span className="px-2 py-1 rounded-full bg-amber-100 text-amber-700 font-medium tracking-wide uppercase">fallback</span>
                  )}
                  <span className="text-slate-400">Analyzed {new Date(data.biasScores.analyzedAt).toLocaleString()}</span>
                </div>
                <BiasRadar scores={data.biasScores} />
                <div className="flex flex-wrap items-center gap-3 text-[11px] mt-2">
                  {DIMENSION_KEYS.map(k => (
                    <div key={k} className="flex items-center gap-1">
                      <span className="h-2 w-2 rounded-sm" style={{ background: `var(--tw-color-${DIMENSION_COLORS[k]})` }} />
                      <span className="text-slate-600">{DIMENSION_LABELS[k]}</span>
                      <ExplainScore label={DIMENSION_LABELS[k]} dim={data.biasScores![k]} />
                    </div>
                  ))}
                </div>
              </div>
            )}
            <PhraseHighlights content={data.content} scores={data.biasScores || null} />
            {data.biasScores?.primarySources?.length ? (
              <div className="mt-8">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-600 mb-2">Primary Sources</h2>
                <ul className="list-disc pl-5 text-sm">
                  {data.biasScores.primarySources.map(s => <li key={s}><a className="text-indigo-600 hover:underline" href={s} target="_blank" rel="noreferrer">{s}</a></li>)}
                </ul>
              </div>
            ): null}
        </article>
      )}
    </div>
  );
};

import type { BiasScores } from '../types';
const PhraseHighlights: React.FC<{ content: string; scores: BiasScores | null }> = ({ content, scores }) => {
  const [activeDims, setActiveDims] = React.useState<Set<string>>(new Set(DIMENSION_KEYS));
  const toggle = (k: string) => setActiveDims(s => {
    const n = new Set(s);
    if (n.has(k)) n.delete(k); else n.add(k);
    return n;
  });
  const paragraphs = content.split(/\n+/);
  const colorHex: Record<string,string> = {
    ideologicalStance: '#6366F1',
    factualGrounding: '#0EA5E9',
    framingChoices: '#F59E0B',
    emotionalTone: '#EF4444',
    sourceTransparency: '#10B981'
  };
  return (
    <div className="mt-6 space-y-4 text-sm leading-relaxed">
    <div className="flex flex-wrap gap-2 mb-2">
        {DIMENSION_KEYS.map(k => (
      <button key={k} onClick={()=>toggle(k)} className={`text-[10px] px-2 py-1 rounded-full ring-1 ${activeDims.has(k)?'bg-indigo-600 text-white ring-indigo-500':'bg-slate-100 text-slate-500 ring-slate-300 hover:bg-slate-200'}`}>{DIMENSION_LABELS[k]}</button>
        ))}
      </div>
      {paragraphs.map((paragraph,i)=> {
        if (!scores) return <p key={i}>{paragraph}</p>;
        const spans = buildHighlights(paragraph, scores);
        return (
          <p key={i} className="whitespace-pre-wrap">
            {spans.map((s, idx) => {
              if (!s.dimensions.length) return <span key={idx}>{s.text}</span>;
              const dimsVisible = s.dimensions.some(d => activeDims.has(d));
              if (!dimsVisible) return <span key={idx}>{s.text}</span>;
              const primary = s.dimensions.find(d => activeDims.has(d)) || s.dimensions[0];
              const base = colorHex[primary] || '#FDE68A';
              // Build translucent background using 20% alpha; outline at 40%.
              const bg = hexToRgba(base, 0.25);
              const outline = hexToRgba(base, 0.5);
              return <mark key={idx} className="rounded px-0.5 py-0.5 mx-0.5 text-slate-900" style={{ backgroundColor: bg, outline: `1px solid ${outline}` }}>{s.text}</mark>;
            })}
          </p>
        );
      })}
    </div>
  );
};

function hexToRgba(hex: string, alpha: number) {
  const h = hex.replace('#','');
  const bigint = parseInt(h,16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
