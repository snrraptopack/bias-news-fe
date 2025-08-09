import React from 'react';
import { useArticles } from '../api/hooks';
import { Loading } from '../components/Loading';
import { ErrorState } from '../components/ErrorState';
import { Link } from 'react-router-dom';

export const ArticlesList: React.FC = () => {
  const { data, isLoading, error, refetch, isRefetching } = useArticles({ limit: 20 });
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-display font-semibold tracking-tight text-slate-900">Articles</h1>
          <p className="text-sm text-slate-600 mt-1">Latest analyzed articles with bias score overview.</p>
        </div>
        <button disabled={isRefetching} onClick={() => refetch()} className="inline-flex items-center gap-2 rounded-md bg-indigo-600 text-white text-sm font-medium px-4 py-2 shadow-soft hover:bg-indigo-700 disabled:opacity-50">Refresh</button>
      </div>
      {isLoading && <Loading label="Loading articles" />}
      {error && <ErrorState error={error} retry={refetch} />}
      {!isLoading && !error && (
        <ul className="divide-y divide-slate-200 rounded-xl overflow-hidden ring-1 ring-slate-200 bg-white/80 backdrop-blur">
          {data?.articles.map(a => (
            <li key={a.id} className="p-4 hover:bg-white transition flex flex-col gap-2">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <Link to={`/articles/${a.id}`} className="font-medium text-slate-900 hover:text-indigo-600 line-clamp-1">{a.headline}</Link>
                  <div className="text-[11px] uppercase tracking-wide text-slate-500 mt-1 flex gap-3">
                    <span>{a.source}</span>
                    <time dateTime={a.publishedAt}>{new Date(a.publishedAt).toLocaleDateString()}</time>
                  </div>
                </div>
                {a.biasScores && (
                  <div className="grid grid-cols-5 gap-1 min-w-[180px]">
                    {Object.entries(a.biasScores)
                      .filter(([k]) => !['overallBiasLevel','primarySources','analyzedAt','analysisStatus','isFallback'].includes(k))
                      .map(([k,v]) => {
                        const dim = v as { score?: number };
                        return (
                          <div key={k} className="bg-slate-100 rounded p-1 text-center">
                            <span className="block text-[9px] text-slate-500 capitalize">{k.replace(/([A-Z]).*/,'$1')}</span>
                            <span className="text-[11px] font-semibold text-slate-800">{dim?.score ?? '–'}</span>
                          </div>
                        );
                      })}
                  </div>
                )}
              </div>
              {a.biasScores && <div className="text-[10px] text-slate-500">Overall {a.biasScores.overallBiasLevel}</div>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
