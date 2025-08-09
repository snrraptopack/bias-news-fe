import React from 'react';

export const ErrorState: React.FC<{ error: unknown; retry?: () => void }> = ({ error, retry }) => {
  const msg = error instanceof Error ? error.message : String(error);
  return (
    <div className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 flex flex-col gap-3">
      <div className="font-semibold">Something went wrong</div>
      <pre className="whitespace-pre-wrap text-xs text-rose-600/80">{msg}</pre>
      {retry && <button onClick={retry} className="self-start rounded bg-rose-600 text-white text-xs font-medium px-3 py-1.5 hover:bg-rose-700">Retry</button>}
    </div>
  );
};
