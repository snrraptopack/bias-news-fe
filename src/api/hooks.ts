import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, queryKeys } from './client';

export function useNarratives() {
  return useQuery({ queryKey: queryKeys.narratives, queryFn: () => api.listNarratives(), staleTime: 30_000 });
}

export function useArticles(params?: { topic?: string; source?: string; limit?: number }) {
  return useQuery({ queryKey: queryKeys.articles(params), queryFn: () => api.listArticles(params), staleTime: 15_000 });
}

export function useArticle(id: string | undefined) {
  return useQuery({ enabled: !!id, queryKey: id ? queryKeys.article(id) : ['article','_'], queryFn: () => api.getArticle(id!), staleTime: 60_000 });
}

export function useNarrative(id: string | undefined) {
  return useQuery({ enabled: !!id, queryKey: id ? queryKeys.narrative(id) : ['narrative','_'], queryFn: () => api.getNarrative(id!), staleTime: 60_000 });
}

export function useDiagnosticsStatus() {
  return useQuery({ queryKey: queryKeys.diagnosticsStatus, queryFn: () => api.diagnosticsStatus(), staleTime: 15_000 });
}

export function useAnalyzeArticle() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.analyzeArticle,
    onSuccess: () => {
      // Invalidate articles list to reflect potential new analysis context (even though not persisted yet can refresh diagnostics)
      qc.invalidateQueries({ queryKey: queryKeys.diagnosticsStatus });
    }
  });
}
