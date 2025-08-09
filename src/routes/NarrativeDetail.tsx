import React, { useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useNarrative } from '../api/hooks';
import { Loading } from '../components/Loading';
import { ErrorState } from '../components/ErrorState';
import { BiasRadar } from '../components/BiasRadar';
import { BiasSparkline } from '../components/BiasSparkline';
import { SourceComparisonHeatmap } from '../components/SourceComparisonHeatmap';

export const NarrativeDetail: React.FC = () => {
  const { id } = useParams();
  const { data, isLoading, error, refetch } = useNarrative(id);

  const sortedPhrases = useMemo(() => {
    if (!data?.commonPhrases) return [] as Array<[string, number]>;
    return Object.entries(data.commonPhrases).sort((a,b) => b[1]-a[1]).slice(0,20);
  }, [data]);
  const sources = useMemo(() => {
    if (!data?.sourceCount) return [] as Array<[string, number]>;
    return Object.entries(data.sourceCount).sort((a,b) => b[1]-a[1]);
  }, [data]);

  return (
    <div className="space-y-8">
      {isLoading && <Loading label="Loading narrative" />}
      {error && <ErrorState error={error} retry={refetch} />}
      {data && (
        <>
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl md:text-3xl font-display font-semibold tracking-tight text-slate-900">{data.title}</h1>
              <span className="text-xs px-2 py-1 rounded bg-indigo-50 text-indigo-600 ring-1 ring-indigo-100 font-medium uppercase tracking-wide">{data.topic}</span>
            </div>
            <p className="text-sm text-slate-600">Framing: <span className="font-medium text-slate-700">{data.framingType}</span></p>
            <p className="text-xs text-slate-500">Timespan: {data.timeSpan.earliest ? new Date(data.timeSpan.earliest).toLocaleString() : '—'} → {data.timeSpan.latest ? new Date(data.timeSpan.latest).toLocaleString() : '—'}</p>
          </div>
          <div className="grid gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-8">
              <section className="grid gap-6 md:grid-cols-2">
                <div className="p-4 rounded-xl bg-white/80 ring-1 ring-slate-200 backdrop-blur">
                  <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-600 mb-3">Bias Distribution</h2>
                  <div className="flex h-4 w-full overflow-hidden rounded-full ring-1 ring-slate-200 mb-2">
                    {['left','center','right'].map(key => {
                      const dist = data.biasDistribution as { left: number; center: number; right: number };
                      const val = (dist as Record<string, number>)[key] || 0;
                      const total = data.biasDistribution.left + data.biasDistribution.center + data.biasDistribution.right || 1;
                      const pct = (val/total)*100;
                      const color = key==='left' ? 'from-indigo-500 to-indigo-400' : key==='center' ? 'from-slate-400 to-slate-300' : 'from-rose-500 to-rose-400';
                      return <div key={key} className={`bg-gradient-to-r ${color}`} style={{ width: pct+'%' }} title={`${key} ${val}`} />;
                    })}
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-500 font-medium">
                    <span>L {data.biasDistribution.left}</span>
                    <span>C {data.biasDistribution.center}</span>
                    <span>R {data.biasDistribution.right}</span>
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-white/80 ring-1 ring-slate-200 backdrop-blur space-y-4">
                  <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-600 mb-3">Average Scores</h2>
                  <div className="grid grid-cols-5 gap-2">
                    {Object.entries(data.avgScores).map(([k,v]) => (
                      <div key={k} className="flex flex-col items-center gap-1">
                        <span className="text-[10px] uppercase tracking-wide font-semibold text-slate-500">{k.replace(/([A-Z])/g,' $1').split(' ')[0]}</span>
                        <span className="text-xs font-semibold text-slate-800">{Math.round(v)}</span>
                        <div className="h-1 w-full rounded bg-slate-100 overflow-hidden">
                          <div className="h-full bg-indigo-500" style={{ width: `${v}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                  {data.framingEvolution && data.framingEvolution.length > 2 && (
                    <div className="mt-2">
                      <BiasSparkline
                        label="Ideological Trend"
                        points={data.framingEvolution.filter(e=>e.biasSnapshot?.ideological!==undefined).map(e=>({ t: new Date(e.timestamp).getTime(), v: e.biasSnapshot!.ideological! }))}
                      />
                    </div>
                  )}
                </div>
              </section>
              {data.representativeArticle && data.representativeArticle.biasScores && (
                <section className="p-4 rounded-xl bg-white/80 ring-1 ring-slate-200 backdrop-blur space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-sm font-semibold tracking-wide uppercase text-slate-600">Representative Article</h2>
                    <Link to={`/articles/${data.representativeArticle.id}`} className="text-xs font-medium text-indigo-600 hover:underline">Open</Link>
                  </div>
                  <h3 className="text-base font-semibold text-slate-900 leading-snug">{data.representativeArticle.headline}</h3>
                  <BiasRadar scores={data.representativeArticle.biasScores} />
                </section>
              )}
              {data.framingEvolution && data.framingEvolution.length > 0 && (
                <section className="p-4 rounded-xl bg-white/80 ring-1 ring-slate-200 backdrop-blur">
                  <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-600 mb-4">Framing Evolution</h2>
                  <ol className="space-y-4 border-l border-slate-200 pl-4">
                    {data.framingEvolution.slice(0,15).map((e,i) => (
                      <li key={i} className="relative">
                        <span className="absolute -left-2 top-1.5 h-3 w-3 rounded-full bg-indigo-500 ring-4 ring-indigo-100" />
                        <div className="text-xs text-slate-500 mb-0.5 flex gap-2 flex-wrap">
                          <time dateTime={e.timestamp}>{new Date(e.timestamp).toLocaleString()}</time>
                          <span className="text-slate-400">{e.source}</span>
                          {e.keyFramingShift && <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 font-medium uppercase text-[10px]">{e.keyFramingShift}</span>}
                        </div>
                        <p className="text-sm font-medium text-slate-800 leading-snug">{e.headline}</p>
                      </li>
                    ))}
                  </ol>
                </section>
              )}
              <section className="p-4 rounded-xl bg-white/80 ring-1 ring-slate-200 backdrop-blur">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-600 mb-3">Cluster Articles</h2>
                <ul className="divide-y divide-slate-200">
                  {data.articles.map(a => (
                    <li key={a.id} className="py-3 flex flex-col gap-1">
                      <Link to={`/articles/${a.id}`} className="text-sm font-medium text-slate-900 hover:text-indigo-600 leading-snug line-clamp-2">{a.headline}</Link>
                      <div className="flex flex-wrap gap-3 text-[11px] text-slate-500">
                        <span>{a.source}</span>
                        <time dateTime={a.publishedAt}>{new Date(a.publishedAt).toLocaleDateString()}</time>
                        {a.biasScores && <span className="font-semibold text-indigo-600">Bias {a.biasScores.overallBiasLevel}</span>}
                      </div>
                    </li>
                  ))}
                </ul>
              </section>
            </div>
            <aside className="space-y-8">
              <section className="p-4 rounded-xl bg-white/80 ring-1 ring-slate-200 backdrop-blur">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-600 mb-3">Top Phrases</h2>
                <ul className="flex flex-wrap gap-2">
                  {sortedPhrases.map(([p,c]) => (
                    <li key={p} className="px-2 py-1 rounded-full bg-slate-100 text-xs font-medium text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 transition" title={`${c} occurrences`}>{p}</li>
                  ))}
                </ul>
              </section>
              <section className="p-4 rounded-xl bg-white/80 ring-1 ring-slate-200 backdrop-blur">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-600 mb-3">Sources</h2>
                <ul className="space-y-2 text-sm">
                  {sources.map(([s,c]) => (
                    <li key={s} className="flex items-center justify-between">
                      <span className="text-slate-700">{s}</span>
                      <span className="text-xs font-semibold text-slate-500">{c}</span>
                    </li>
                  ))}
                </ul>
              </section>
              {data.sourceAnalysis && (
                <section className="p-4 rounded-xl bg-white/80 ring-1 ring-slate-200 backdrop-blur">
                  <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-600 mb-3">Source Comparison</h2>
                  <SourceComparisonHeatmap sourceAnalysis={data.sourceAnalysis} />
                </section>
              )}
            </aside>
          </div>
        </>
      )}
    </div>
  );
};
