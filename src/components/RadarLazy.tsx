import React from 'react';
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, PolarRadiusAxis, Tooltip } from 'recharts';

interface Props { data: { dimension: string; score: number; confidence: number }[] }

interface TooltipPayloadItem { payload: { dimension: string; score: number } }
interface TooltipProps { active?: boolean; payload?: TooltipPayloadItem[] }
const CustomTooltip: React.FC<TooltipProps> = ({ active, payload }) => {
  if (!active || !payload || !payload.length) return null;
  const p = payload[0].payload;
  return <div className="rounded bg-slate-800 text-white text-xs px-2 py-1.5 shadow-soft">{p.dimension}: {p.score}</div>;
};

const RadarLazy: React.FC<Props> = ({ data }) => {
  return (
    <div className="w-full h-64 sm:h-72">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={data} outerRadius={window.innerWidth < 420 ? 70 : 90}>
          <PolarGrid stroke="#cbd5e1" radialLines={false} />
          <PolarAngleAxis dataKey="dimension" tick={{ fill: '#475569', fontSize: 10 }} />
          <PolarRadiusAxis tick={false} axisLine={false} angle={90} domain={[0,100]} />
          <Tooltip content={<CustomTooltip />} />
          <Radar dataKey="score" stroke="#6366F1" fill="#6366F1" fillOpacity={0.35} />
          <Radar dataKey="confidence" stroke="#6366F1" fill="#6366F1" fillOpacity={0.15} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default RadarLazy;
