import React from 'react';

interface Point { t: number; v: number; }
export const BiasSparkline: React.FC<{ points: Point[]; width?: number; height?: number; label?: string }> = ({ points, width=160, height=40, label }) => {
  if (!points.length) return null;
  const sorted = [...points].sort((a,b)=>a.t-b.t);
  const min = Math.min(...sorted.map(p=>p.v));
  const max = Math.max(...sorted.map(p=>p.v));
  const range = max - min || 1;
  const d = sorted.map((p,i)=>{
    const x = (i/(sorted.length-1))* (width-4) + 2;
    const y = height - 2 - ((p.v - min)/range)*(height-6);
    return `${i===0?'M':'L'}${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');
  const area = d + ` L${width-2},${height-2} L2,${height-2} Z`;
  return (
    <div className="flex flex-col gap-1">
      {label && <span className="text-[10px] uppercase tracking-wide text-slate-500 font-semibold">{label}</span>}
      <svg width={width} height={height} className="overflow-visible">
        <defs>
          <linearGradient id="biasSpark" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#6366F1" stopOpacity={0.5} />
            <stop offset="100%" stopColor="#6366F1" stopOpacity={0} />
          </linearGradient>
        </defs>
        <path d={area} fill="url(#biasSpark)" />
        <path d={d} stroke="#6366F1" strokeWidth={1.5} fill="none" />
      </svg>
      <div className="flex justify-between text-[9px] text-slate-400">
        <span>{min}</span><span>{max}</span>
      </div>
    </div>
  );
};
