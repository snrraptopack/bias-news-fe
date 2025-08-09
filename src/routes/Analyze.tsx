import React, { useState } from 'react';
import { useAnalyzeArticle } from '../api/hooks';
import { BiasRadar } from '../components/BiasRadar';
import { Loading } from '../components/Loading';
import { ErrorState } from '../components/ErrorState';

export const Analyze: React.FC = () => {
  const [headline, setHeadline] = useState('');
  const [source, setSource] = useState(''); // let backend default to 'user-submitted' when omitted
  const [url, setUrl] = useState('');
  const [content, setContent] = useState('');
  const { mutate, data, isPending, isError, error, reset } = useAnalyzeArticle();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const contentLen = content.trim().length;
  const rawUrl = url.trim();
  const urlLen = rawUrl.length;
  const normalizedUrl = urlLen > 0 && !/^https?:\/\//i.test(rawUrl) ? `https://${rawUrl}` : rawUrl;
  const looksLikeUrl = normalizedUrl.length > 0 && /\./.test(normalizedUrl);
  // Allow submit if content is sufficiently long OR URL appears valid
  const canSubmit = !isPending && (contentLen >= 50 || looksLikeUrl);

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="text-2xl font-display font-semibold tracking-tight text-slate-900">Ad-hoc Article Analysis</h1>
        <p className="text-sm text-slate-600 mt-1">Analyze a single article without persisting it. Provide either sufficient raw text or a URL for the backend to scrape.</p>
        <div className="mt-4 text-[11px] leading-relaxed bg-white/70 ring-1 ring-slate-200 rounded-lg p-3 flex flex-col gap-1">
          <div className="font-semibold text-slate-700 uppercase tracking-wide">Rules</div>
          <ul className="list-disc pl-4 space-y-0.5 text-slate-600">
            <li>Submit raw content (≥ 50 chars) OR a URL that yields ≥ 50 chars after scrape.</li>
            <li>Content &lt; 50 chars without a URL is rejected (400).</li>
            <li>If content missing or &lt; 240 chars and URL present → automatic scrape attempt.</li>
            <li>&lt; 240 chars but ≥ 50 chars still analyzed (may have reduced detail).</li>
            <li>Extremely short / unusable text triggers a fallback-empty bias result.</li>
          </ul>
        </div>
      </div>
      <form
        onSubmit={e => {
          e.preventDefault();
          setSubmitError(null);
          mutate(
            { headline: headline || undefined, source: source || undefined, url: normalizedUrl || undefined, content },
            {
              onError: (err: unknown) => {
                const msg = typeof err === 'object' && err && 'message' in err ? String((err as { message?: string }).message ?? '') : 'Analysis failed';
                let extracted = msg;
                if (/aborted/i.test(msg)) {
                  extracted = 'Client timeout exceeded before analysis finished. Retrying with extended timeout…';
                }
                try {
                  if (msg.includes('{')) {
                    const jsonPart = msg.substring(msg.indexOf('{'));
                    const parsed = JSON.parse(jsonPart);
                    extracted = parsed.error || extracted;
                  }
                } catch {
                  // ignore JSON parse attempt
                }
                setSubmitError(extracted);
              }
            }
          );
        }}
        className="space-y-6"
      >
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-600">Headline</label>
            <input value={headline} onChange={e=>setHeadline(e.target.value)} className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50" placeholder="Optional headline" />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-600 flex items-center justify-between">Source <span className="text-[10px] font-normal text-slate-400">defaults to 'user-submitted'</span></label>
            <input value={source} onChange={e=>setSource(e.target.value)} className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50" placeholder="Optional source name" />
          </div>
          <div className="space-y-1 md:col-span-2">
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-600 flex items-center justify-between">URL {urlLen > 0 && <span className="text-[11px] text-slate-400">{urlLen} chars</span>}</label>
            <input
              value={url}
              onChange={e=>setUrl(e.target.value)}
              className={`w-full rounded-md border ${looksLikeUrl || urlLen === 0 ? 'border-slate-300' : 'border-rose-400'} bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50`}
              placeholder="Enter article URL to auto-scrape (optional if pasting content)"
            />
            <p className="text-[11px] text-slate-500">If content is short/empty we'll attempt a live scrape. {normalizedUrl && looksLikeUrl && !/^https?:/i.test(rawUrl) && 'Protocol added automatically.'}</p>
            {urlLen>0 && !looksLikeUrl && <p className="text-[11px] text-rose-600 font-medium">URL looks invalid. Include a domain like example.com.</p>}
          </div>
          <div className="space-y-1 md:col-span-2">
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-600 flex items-center justify-between">Content <span className="text-[11px] text-slate-400">{content.length} chars</span></label>
            <textarea value={content} onChange={e=>setContent(e.target.value)} rows={12} className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 font-mono" placeholder="Paste full raw article text OR leave blank and just provide a URL above..." />
            <p className="text-[11px] text-slate-500">Need either ≥ 50 chars OR a valid URL. {contentLen>0 && contentLen<50 && !looksLikeUrl && 'Add more text or enter a URL.'}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button type="submit" disabled={!canSubmit} className="inline-flex items-center gap-2 rounded-md bg-indigo-600 text-white text-sm font-medium px-4 py-2 shadow-soft hover:bg-indigo-700 disabled:opacity-50">{isPending ? (contentLen < 50 && looksLikeUrl ? 'Scraping…' : 'Analyzing…') : 'Analyze'}</button>
          <button type="button" onClick={() => { setHeadline(''); setSource(''); setUrl(''); setContent(''); reset(); setSubmitError(null); }} className="text-sm text-slate-500 hover:text-slate-700">Reset</button>
        </div>
        {!canSubmit && (contentLen > 0 && contentLen < 50 && urlLen === 0) && (
          <p className="text-[11px] text-rose-600 font-medium">Add a URL or extend content to at least 50 characters.</p>
        )}
        {submitError && (
          <div className="text-[11px] text-rose-600 font-medium flex items-start gap-2">
            <span className="mt-0.5">⚠</span>
            <span>{submitError}</span>
          </div>
        )}
      </form>
      {isPending && <Loading label="Running analysis" />}
  {isError && <ErrorState error={error as Error} retry={() => mutate({ headline: headline || undefined, source: source || undefined, url: normalizedUrl || undefined, content })} />}
      {data?.article && (
        <div className="space-y-6 p-5 rounded-xl bg-white/80 ring-1 ring-slate-200 backdrop-blur">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <h2 className="text-lg font-semibold text-slate-900 leading-snug">{data.article.headline || 'Analyzed Article'}</h2>
              <div className="text-xs text-slate-500 flex gap-3 flex-wrap mt-1">
                {data.article.source && <span>{data.article.source}</span>}
                {data.article.biasScores?.analysisStatus && <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 uppercase font-medium">{data.article.biasScores.analysisStatus}</span>}
                {data.article.biasScores?.isFallback && <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 uppercase font-medium">fallback</span>}
              </div>
            </div>
            {data.article.biasScores && <BiasRadar scores={data.article.biasScores} />}
          </div>
          {data.article.content && (
            <div className="text-sm leading-relaxed whitespace-pre-wrap border-t border-slate-200 pt-4 max-h-[400px] overflow-auto pr-2">
              {data.article.content}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
