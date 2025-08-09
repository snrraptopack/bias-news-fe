import React from 'react';

export const BackgroundGrid: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <div className={`pointer-events-none absolute inset-0 -z-10 overflow-hidden ${className || ''}`} aria-hidden="true">
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `linear-gradient(to right, #e2e8f0 1px, transparent 1px), linear-gradient(to bottom, #e2e8f0 1px, transparent 1px)`,
          backgroundSize: '24px 32px',
          maskImage: 'radial-gradient(ellipse 70% 60% at 50% 0%, #000 60%, transparent 100%)',
          WebkitMaskImage: 'radial-gradient(ellipse 70% 60% at 50% 0%, #000 60%, transparent 100%)'
        }}
      />
      <div className="absolute top-32 left-1/2 -translate-x-1/2 w-[60rem] h-[60rem] max-w-none rounded-full bg-gradient-to-b from-indigo-100/60 via-white to-transparent blur-3xl opacity-60" />
    </div>
  );
};
