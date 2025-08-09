import React from 'react';
import { useQueryClient } from '@tanstack/react-query';
import type { NarrativeCluster } from '../types';
import { Link } from 'react-router-dom';
import { api } from '../api/client';

interface Props { cluster: NarrativeCluster }

export const NarrativeClusterCard: React.FC<Props> = ({ cluster }) => {
  const qc = useQueryClient();
  const prefetch = () => {
    qc.ensureQueryData({ queryKey: ['narrative', cluster.id], queryFn: () => api.getNarrative(cluster.id), staleTime: 60_000 });
  };
  const { biasDistribution, avgScores } = cluster;
  const total = biasDistribution.left + biasDistribution.center + biasDistribution.right || 1;
  const dist = [
    { key: 'left', value: biasDistribution.left, color: 'from-indigo-500 to-indigo-400' },
    { key: 'center', value: biasDistribution.center, color: 'from-slate-400 to-slate-300' },
    { key: 'right', value: biasDistribution.right, color: 'from-rose-500 to-rose-400' }
  ];
  return (
  <Link onMouseEnter={prefetch} to={`/narratives/${cluster.id}`} className="group block rounded-xl bg-white/80 backdrop-blur hover:bg-white shadow-soft ring-1 ring-slate-200 hover:ring-indigo-200 transition overflow-hidden">
      <div className="p-5 flex flex-col h-full">
        <div className="flex items-start justify-between gap-4 mb-3">
          <h3 className="font-semibold text-slate-900 leading-snug line-clamp-2 group-hover:text-indigo-600 transition">{cluster.title}</h3>
          <span className="text-[10px] uppercase tracking-wide font-semibold px-2 py-1 rounded bg-indigo-50 text-indigo-600 ring-1 ring-indigo-100">{cluster.topic}</span>
        </div>
        <p className="text-xs text-slate-600 mb-4 line-clamp-2">Framing: {cluster.framingType}</p>
        <div className="mb-4">
          <div className="flex h-2 w-full overflow-hidden rounded-full ring-1 ring-slate-200">
            {dist.map(d => (
              <div key={d.key} style={{ width: `${(d.value/total)*100}%` }} className={`bg-gradient-to-r ${d.color}`} title={`${d.key}: ${d.value}`} />
            ))}
          </div>
          <div className="mt-1 flex justify-between text-[10px] text-slate-500 font-medium">
            <span>L {biasDistribution.left}</span>
            <span>C {biasDistribution.center}</span>
            <span>R {biasDistribution.right}</span>
          </div>
        </div>
        <div className="grid grid-cols-5 gap-1 mb-4">
          {Object.entries(avgScores).map(([k,v]) => (
            <div key={k} className="flex flex-col items-center bg-slate-50 rounded p-1.5">
              <span className="text-[9px] font-medium text-slate-500 capitalize">{k.replace(/([A-Z])/g,' $1').split(' ').slice(0,1)}</span>
              <span className="text-xs font-semibold text-slate-800">{Math.round(v)}</span>
            </div>
          ))}
        </div>
        <div className="mt-auto flex items-center justify-between text-[11px] text-slate-500 font-medium">
          <span>{cluster.articles.length} articles</span>
          <span className="group-hover:text-indigo-600 transition">Explore →</span>
        </div>
      </div>
    </Link>
  );
};
