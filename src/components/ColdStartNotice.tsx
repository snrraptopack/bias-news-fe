import React from 'react';

interface ColdStartNoticeProps { onClose: () => void }

export const ColdStartNotice: React.FC<ColdStartNoticeProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
      <div role="dialog" aria-modal="true" className="relative w-full max-w-md rounded-lg bg-white shadow-xl ring-1 ring-slate-900/10 p-6 space-y-4">
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-slate-900">Backend Warming Up</h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            The API is on a <span className="font-medium">free Render instance</span> and uses an <span className="font-medium">in‑memory SQL store</span>. After idle periods the server sleeps, then restarts empty. First request may take 30–60s and initial lists can look sparse.
          </p>
          <div className="rounded-md bg-indigo-50 border border-indigo-100 p-2 text-[11px] text-indigo-700 leading-relaxed">
            <span className="font-semibold">Need instant data?</span> Open the <span className="font-semibold">Fetch</span> tab and enter a topic (e.g. <code className="font-mono text-indigo-600">election</code>) to pull & analyze up to 10 fresh articles immediately.
          </div>
          <ul className="text-xs text-slate-500 list-disc pl-5 space-y-1">
            <li>See a network error? Wait a few seconds (cold start) then retry.</li>
            <li>Data gone after a while? The in-memory store reset on sleep.</li>
            <li>Use <span className="font-medium text-slate-700">Fetch</span> for quick seeding; results appear across narratives & articles.</li>
          </ul>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <button onClick={onClose} className="rounded-md px-3 py-1.5 text-sm font-medium bg-slate-200 hover:bg-slate-300 text-slate-800">Got it</button>
        </div>
        <button aria-label="Close" onClick={onClose} className="absolute top-2 right-2 h-8 w-8 inline-flex items-center justify-center rounded-md text-slate-500 hover:text-slate-700 hover:bg-slate-100">✕</button>
      </div>
    </div>
  );
};
