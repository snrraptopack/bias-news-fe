import React from 'react';
import { useDiagnosticsStatus } from '../api/hooks';
import { useQueryClient } from '@tanstack/react-query';

// Floating diagnostics/status widget showing counts of recent analyses by status key.
export const DiagnosticsWidget: React.FC = () => {
  const qc = useQueryClient();
  const { data, isLoading, isError, refetch, isFetching } = useDiagnosticsStatus();
  const [open, setOpen] = React.useState(false);

  const lastUpdated = React.useMemo(() => {
    if (!data?.timestamp) return '';
    const ts = new Date(data.timestamp).getTime();
    const diff = Date.now() - ts;
    if (diff < 0) return 'just now';
    const sec = Math.floor(diff / 1000);
    if (sec < 60) return `${sec}s ago`;
    const min = Math.floor(sec / 60);
    if (min < 60) return `${min}m ago`;
    const hr = Math.floor(min / 60);
    return `${hr}h ago`;
  }, [data?.timestamp]);

  const summaryEntries = Object.entries(data?.summary || {}).sort((a,b) => a[0].localeCompare(b[0]));

  return (
    <div className="fixed z-30 bottom-4 left-4 text-xs font-medium select-none">
      <div
        className={`group shadow-lg rounded-lg border border-slate-200 bg-white/80 backdrop-blur flex flex-col transition-all ${open ? 'w-72' : 'w-40'} ${open ? 'h-52' : 'h-10'} overflow-hidden`}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
      >
        <button
          onClick={() => setOpen(o => !o)}
          className="flex items-center justify-between gap-2 px-3 py-2 text-slate-600 hover:text-slate-900"
          aria-expanded={open}
        >
          <span className="inline-flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" aria-hidden />
            Diagnostics
          </span>
          <span className="text-[10px] font-semibold text-slate-400">{open ? '▼' : '▲'}</span>
        </button>
        <div className="px-3 pb-3 flex-1 flex flex-col">
          {isLoading && <div className="text-slate-400">Loading…</div>}
          {isError && <div className="text-rose-500">Error loading status</div>}
          {!isLoading && !isError && (
            <>
              <div className="flex justify-between items-center mb-2">
                <div className="text-[10px] uppercase tracking-wide text-slate-400">Recent</div>
                <button
                  onClick={() => { refetch(); qc.invalidateQueries({ queryKey: ['diagnostics','status'] }); }}
                  className="text-[10px] text-indigo-600 hover:text-indigo-700 disabled:opacity-40"
                  disabled={isFetching}
                >{isFetching ? '…' : 'Refresh'}</button>
              </div>
              <div className="grid grid-cols-2 gap-1 mb-3">
                {summaryEntries.length === 0 && <div className="col-span-2 text-slate-400">No data</div>}
                {summaryEntries.map(([k,v]) => (
                  <div key={k} className="flex items-center justify-between rounded border border-slate-100 bg-slate-50 px-2 py-1">
                    <span className="truncate text-slate-500">{k}</span>
                    <span className="ml-2 text-slate-700 font-semibold">{v}</span>
                  </div>
                ))}
              </div>
              <div className="mt-auto flex justify-between items-center text-[10px] text-slate-400">
                <span>Total: <span className="text-slate-600 font-semibold">{data?.total ?? 0}</span></span>
                <span>{lastUpdated}</span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
