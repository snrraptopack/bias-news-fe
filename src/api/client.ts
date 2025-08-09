import type { Article, NarrativeCluster } from '../types';

// API base: override with VITE_API_BASE, fallback to deployed backend (with /api)
let API_BASE = (import.meta.env.VITE_API_BASE || 'https://bias-news-backend.onrender.com/api').replace(/\/$/, '');

export interface ApiListArticlesResponse { articles: Article[]; total: number; timestamp: string }
export interface ApiNarrativesResponse { clusters: NarrativeCluster[]; totalArticles: number; timestamp: string }
export interface ApiAnalyzeResponse { article: Article }
export interface ApiDiagnosticsStatus { summary: Record<string, number>; total: number; timestamp: string }

async function fetchJSON<T>(path: string, init?: RequestInit & { timeoutMs?: number }): Promise<T> {
  const controller = new AbortController();
  const ms = init?.timeoutMs ?? 10000;
  const timeout = setTimeout(() => controller.abort('timeout'), ms);
  try {
    try {
      return await coreFetch<T>(API_BASE, path, init, controller.signal);
    } catch (err) {
      // If network failed (TypeError: Failed to fetch / CORS) and base contains /api segment, try fallback without /api
      if (err instanceof Error && /Failed to fetch|TypeError/i.test(err.message) && /\/api$/.test(API_BASE)) {
        const altBase = API_BASE.replace(/\/api$/, '');
        try {
          const data = await coreFetch<T>(altBase, path.startsWith('/api/') ? path.substring(4) : path, init, controller.signal);
          API_BASE = altBase; // update for subsequent calls
          return data;
        } catch {
          throw enhanceError(err, path);
        }
      }
      throw enhanceError(err, path);
    }
  } finally {
    clearTimeout(timeout);
  }
}

function enhanceError(err: unknown, path: string) {
  if (err instanceof DOMException && err.name === 'AbortError') {
    return new Error(`Request timeout after waiting: ${path}`);
  }
  if (err instanceof Error) {
    if (/Failed to fetch|TypeError/i.test(err.message)) {
      return new Error(`Network error reaching API (${API_BASE}${path}). Possible causes: server down, CORS blocked, or wrong API path. Original: ${err.message}`);
    }
    return err;
  }
  return new Error(String(err));
}

async function coreFetch<T>(base: string, path: string, init: RequestInit | undefined, signal: AbortSignal): Promise<T> {
  const res = await fetch(`${base}${path}`, { ...init, signal, headers: { 'Content-Type': 'application/json', ...(init?.headers || {}) } });
  if (!res.ok) {
    const text = await res.text().catch(()=> '');
    throw new Error(`Request failed ${res.status}: ${text || res.statusText}`);
  }
  return await res.json() as T;
}

export const api = {
  listArticles: (params?: { topic?: string; source?: string; limit?: number }) => {
    const q = new URLSearchParams();
    if (params) Object.entries(params).forEach(([k,v]) => { if (v !== undefined) q.set(k, String(v)); });
    const qs = q.toString() ? `?${q.toString()}` : '';
    return fetchJSON<ApiListArticlesResponse>(`/articles${qs}`);
  },
  getArticle: (id: string) => fetchJSON<Article>(`/articles/${id}`),
  listNarratives: () => fetchJSON<ApiNarrativesResponse>('/narratives'),
  getNarrative: (id: string) => fetchJSON<NarrativeCluster>(`/narratives/${id}`),
  analyzeArticle: (payload: { headline?: string; source?: string; url?: string; content: string }) =>
    fetchJSON<ApiAnalyzeResponse>('/articles/analyze', { method: 'POST', body: JSON.stringify(payload), timeoutMs: 30000 }),
  diagnosticsStatus: () => fetchJSON<ApiDiagnosticsStatus>('/articles/diagnostics/status'),
  health: () => fetchJSON<{ status: string }>(`/health`)
};

export const queryKeys = {
  articles: (params?: Record<string, unknown>) => ['articles', params] as const,
  article: (id: string) => ['article', id] as const,
  narratives: ['narratives'] as const,
  narrative: (id: string) => ['narrative', id] as const,
  diagnosticsStatus: ['diagnostics','status'] as const,
};
