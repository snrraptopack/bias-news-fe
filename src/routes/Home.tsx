import React from 'react';
import { useNarratives } from '../api/hooks';
import { Loading } from '../components/Loading';
import { ErrorState } from '../components/ErrorState';
import { NarrativeClusterCard } from '../components/NarrativeClusterCard';

export const Home: React.FC = () => {
  const { data, isLoading, error, refetch, isRefetching } = useNarratives();
  const clusters = data?.clusters.slice(0,5) || [];
  return (
    <div className="space-y-10">
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-display font-semibold tracking-tight text-slate-900">Trending Narratives</h1>
            <p className="text-sm text-slate-600 mt-1 max-w-xl">Real-time clusters of how major outlets frame emerging stories. Hover to inspect, click to dive deeper.</p>
          </div>
          <button disabled={isRefetching} onClick={() => refetch()} className="inline-flex items-center gap-2 rounded-md bg-indigo-600 text-white text-sm font-medium px-4 py-2 shadow-soft hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed">
            <span className="h-3 w-3 rounded-full border-2 border-white border-t-transparent animate-spin" hidden={!isRefetching} />
            Refresh
          </button>
        </div>
      </div>
      {isLoading && <Loading label="Loading narratives" />}
      {error && <ErrorState error={error} retry={refetch} />}
      {!isLoading && !error && (
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {clusters.map(c => <NarrativeClusterCard key={c.id} cluster={c} />)}
        </div>
      )}
      {!isLoading && !error && clusters.length === 0 && (
        <div className="text-sm text-slate-500">No narratives available yet.</div>
      )}
    </div>
  );
};
