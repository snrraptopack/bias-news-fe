import React from 'react';

export const Loading: React.FC<{ label?: string; className?: string }> = ({ label = 'Loading', className }) => (
  <div className={`flex items-center gap-2 text-slate-500 ${className||''}`}>
    <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-indigo-500" />
    <span className="text-sm font-medium">{label}…</span>
  </div>
);
