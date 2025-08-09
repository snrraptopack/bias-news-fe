import React from 'react';

interface ColdStartNoticeProps { onClose: () => void }

export const ColdStartNotice: React.FC<ColdStartNoticeProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
      <div role="dialog" aria-modal="true" className="relative w-full max-w-md rounded-lg bg-white shadow-xl ring-1 ring-slate-900/10 p-6 space-y-4">
        <div className="space-y-2">
          <h2 className="text-lg font-semibold text-slate-900">Warming up backend</h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            The API runs on a free Render instance that sleeps when idle. The first request after inactivity can take 30–60 seconds while it cold starts.
          </p>
          <ul className="text-xs text-slate-500 list-disc pl-5 space-y-1">
            <li>If you see an initial network error, wait a bit.</li>
            <li>Then click <span className="font-medium text-slate-700">Refresh</span> or reload the page.</li>
            <li>Once awake, responses are fast.</li>
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
