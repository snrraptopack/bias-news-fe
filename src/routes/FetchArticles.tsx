import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { Article } from '../types';
import { Loading } from '../components/Loading';
import { ErrorState } from '../components/ErrorState';
import { Link } from 'react-router-dom';

interface FetchPayload { topic: string; sources?: string[] }
interface FetchResult { message: string; articles: Article[]; topic: string; timestamp: string }

export const FetchArticles: React.FC = () => {
  const [topic, setTopic] = useState('');
  const [sources, setSources] = useState('');
  const qc = useQueryClient();
  const [result, setResult] = useState<FetchResult | null>(null);
  const mutation = useMutation({
    mutationFn: async (payload: FetchPayload) => {
      // Use same API base as other endpoints; fallback handled in fetchJSON.
      const res = await fetch(`${(import.meta.env.VITE_API_BASE || 'https://bias-news-backend.onrender.com/api').replace(/\/$/,'')}/articles/fetch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: payload.topic.trim(), sources: payload.sources && payload.sources.length ? payload.sources : undefined })
      });
      if (!res.ok) {
        const text = await res.text().catch(()=> '');
        throw new Error(`Fetch failed ${res.status}: ${text || res.statusText}`);
      }
      return res.json() as Promise<FetchResult>;
    },
    onSuccess: (data) => {
      setResult(data);
      qc.invalidateQueries();
    }
  });

  const runFetch = () => {
    const srcArr = sources.split(/[,\n]/).map(s=>s.trim()).filter(Boolean);
    mutation.mutate({ topic, sources: srcArr });
  };

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="text-2xl font-display font-semibold tracking-tight text-slate-900">Fetch & Analyze Articles</h1>
        <p className="text-sm text-slate-600 mt-1">Trigger ingestion of up to 10 new articles for a topic and view results immediately.</p>
      </div>
  <form onSubmit={e => { e.preventDefault(); runFetch(); }} className="space-y-6">
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-1 md:col-span-1">
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-600">Topic<span className="text-rose-500">*</span></label>
            <input value={topic} onChange={e=>setTopic(e.target.value)} required minLength={3} className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50" placeholder="e.g. climate change" />
          </div>
          <div className="space-y-1 md:col-span-1">
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-600">Sources <span className="text-slate-400 font-normal">(comma or newline)</span></label>
            <textarea value={sources} onChange={e=>setSources(e.target.value)} rows={3} className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50" placeholder="reuters.com\nbbc.com" />
          </div>
        </div>
        <button type="submit" disabled={mutation.isPending || topic.trim().length < 3} className="inline-flex items-center gap-2 rounded-md bg-indigo-600 text-white text-sm font-medium px-4 py-2 shadow-soft hover:bg-indigo-700 disabled:opacity-50">{mutation.isPending ? 'Fetching…' : 'Fetch & Analyze'}</button>
      </form>
      {mutation.isPending && <Loading label="Fetching & analyzing" />}
      {mutation.isError && <ErrorState error={mutation.error as Error} retry={runFetch} />}
      {result && (
        <div className="space-y-6">
          <div className="p-4 rounded-xl bg-white/80 ring-1 ring-slate-200 backdrop-blur">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-600 mb-2">Result</h2>
            <p className="text-sm text-slate-700">{result.message}</p>
            <p className="text-xs text-slate-500 mt-1">Topic: {result.topic} • Articles: {result.articles?.length || 0}</p>
          </div>
          {result.articles?.length > 0 && (
            <ul className="divide-y divide-slate-200 rounded-xl overflow-hidden ring-1 ring-slate-200 bg-white/80 backdrop-blur">
              {result.articles.map((a) => (
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
                      <div className="text-[10px] text-slate-500 flex flex-col items-end gap-1">
                        <span>Bias {a.biasScores.overallBiasLevel}</span>
                        {a.biasScores.analysisStatus && <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">{a.biasScores.analysisStatus}</span>}
                      </div>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};
