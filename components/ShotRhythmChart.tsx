import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  CartesianGrid,
  ReferenceLine
} from 'recharts';
import { StructuralBeat } from '../types';
import {
  Scissors,
  Clock,
  Zap,
  TrendingUp,
  Play,
  Layers,
  Sparkles,
  Info
} from 'lucide-react';

interface ShotRhythmChartProps {
  timeline: StructuralBeat[];
  overallAvgShotLength: number;
  onSeek?: (seconds: number) => void;
}

type MetricMode = 'duration' | 'frequency' | 'cut_count';

const BEAT_COLOR_PALETTE: Record<string, string> = {
  Hook: '#f43f5e', // rose-500
  Intro: '#f59e0b', // amber-500
  Teaser: '#f59e0b',
  'Core Content': '#0284c7', // sky-600
  Exposition: '#0284c7',
  'Exposition Setup': '#0284c7',
  'Story Arc': '#6366f1', // indigo-500
  Montage: '#a855f7', // purple-500
  Climax: '#10b981', // emerald-500
  'CTA/Outro': '#64748b', // slate-500
  Outro: '#64748b',
  Transition: '#06b6d4' // cyan-500
};

const getBeatColor = (type: string): string => {
  return BEAT_COLOR_PALETTE[type] || '#38bdf8';
};

const parseTimestampDuration = (ts: string, startSec: number, endSec?: number): number => {
  if (typeof endSec === 'number' && endSec > startSec) {
    return Math.max(1, endSec - startSec);
  }
  // Try parsing "MM:SS - MM:SS"
  const match = ts.match(/(\d+):(\d+)\s*-\s*(\d+):(\d+)/);
  if (match) {
    const s = parseInt(match[1], 10) * 60 + parseInt(match[2], 10);
    const e = parseInt(match[3], 10) * 60 + parseInt(match[4], 10);
    if (e > s) return Math.max(1, e - s);
  }
  return 15; // default 15s fallback if segment duration cannot be determined
};

export const ShotRhythmChart: React.FC<ShotRhythmChartProps> = ({
  timeline,
  overallAvgShotLength,
  onSeek
}) => {
  const [metricMode, setMetricMode] = useState<MetricMode>('duration');
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Normalize and calculate chart data
  const chartData = useMemo(() => {
    if (!timeline || timeline.length === 0) return [];

    return timeline.map((beat, index) => {
      const segmentDuration = parseTimestampDuration(beat.timestamp, beat.startSeconds, beat.endSeconds);
      
      // Calculate or retrieve shot duration
      let shotDuration = beat.estimated_avg_shot_duration;
      if (!shotDuration || shotDuration <= 0) {
        // Derive intelligent baseline from beat_type and overall ASL
        if (beat.beat_type === 'Hook' || beat.title.toLowerCase().includes('hook')) {
          shotDuration = Math.max(1.2, Number((overallAvgShotLength * 0.55).toFixed(1)));
        } else if (beat.beat_type === 'Montage') {
          shotDuration = Math.max(0.9, Number((overallAvgShotLength * 0.45).toFixed(1)));
        } else if (beat.beat_type === 'Climax') {
          shotDuration = Math.max(1.5, Number((overallAvgShotLength * 0.65).toFixed(1)));
        } else if (beat.beat_type === 'Core Content' || beat.beat_type === 'Story Arc') {
          shotDuration = Number((overallAvgShotLength * 1.15).toFixed(1));
        } else {
          shotDuration = overallAvgShotLength;
        }
      }

      // Calculate cuts per minute
      let cutsPerMinute = beat.cuts_per_minute;
      if (!cutsPerMinute || cutsPerMinute <= 0) {
        cutsPerMinute = Math.round(60 / shotDuration);
      }

      // Calculate estimated total cuts in segment
      let cutCount = beat.estimated_cut_count;
      if (!cutCount || cutCount <= 0) {
        cutCount = Math.max(1, Math.round(segmentDuration / shotDuration));
      }

      const shortLabel = beat.timestamp.split('-')[0]?.trim() || `B${index + 1}`;

      return {
        index,
        label: shortLabel,
        fullTimestamp: beat.timestamp,
        title: beat.title,
        beatType: beat.beat_type,
        startSeconds: beat.startSeconds,
        durationSeconds: segmentDuration,
        shotDuration: Number(shotDuration.toFixed(1)),
        cutsPerMinute: cutsPerMinute,
        cutCount: cutCount,
        visualFocus: beat.visual_focus,
        editorialTechnique: beat.editorial_technique,
        color: getBeatColor(beat.beat_type)
      };
    });
  }, [timeline, overallAvgShotLength]);

  // Key Statistics
  const stats = useMemo(() => {
    if (chartData.length === 0) return null;

    let fastest = chartData[0];
    let deliberate = chartData[0];
    let totalCuts = 0;

    chartData.forEach((d) => {
      totalCuts += d.cutCount;
      if (d.shotDuration < fastest.shotDuration) fastest = d;
      if (d.shotDuration > deliberate.shotDuration) deliberate = d;
    });

    const avgShots = Number(
      (chartData.reduce((acc, curr) => acc + curr.shotDuration, 0) / chartData.length).toFixed(1)
    );

    return {
      fastest,
      deliberate,
      totalCuts,
      avgShots
    };
  }, [chartData]);

  if (!timeline || timeline.length === 0) {
    return null;
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-950/95 border border-slate-700 p-3 rounded-xl shadow-2xl backdrop-blur-md max-w-xs text-xs space-y-2 pointer-events-none z-50">
          <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-1.5">
            <span className="font-mono font-bold text-sky-300">{data.fullTimestamp}</span>
            <span
              className="text-[10px] px-2 py-0.5 rounded font-semibold"
              style={{ backgroundColor: `${data.color}25`, color: data.color, border: `1px solid ${data.color}50` }}
            >
              {data.beatType}
            </span>
          </div>

          <div className="font-semibold text-slate-100 text-sm">{data.title}</div>

          <div className="grid grid-cols-2 gap-2 bg-slate-900/90 p-2 rounded-lg border border-slate-800/80">
            <div>
              <span className="text-[10px] text-slate-400 block">Avg. Shot Length</span>
              <span className="text-xs font-mono font-bold text-amber-300">{data.shotDuration}s</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block">Cut Frequency</span>
              <span className="text-xs font-mono font-bold text-sky-300">{data.cutsPerMinute} cuts/min</span>
            </div>
          </div>

          <div className="text-[11px] text-slate-300 leading-relaxed">
            <span className="text-slate-500 font-medium mr-1">Technique:</span>
            {data.editorialTechnique}
          </div>

          <div className="pt-1 text-[10px] text-sky-400 flex items-center font-medium border-t border-slate-800/60">
            <Play className="w-2.5 h-2.5 mr-1 fill-current" />
            Click bar to seek video to {data.fullTimestamp.split('-')[0]?.trim()}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-slate-900/95 rounded-xl p-5 border border-slate-800 shadow-xl space-y-4">
      {/* Header with Mode Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div>
          <h3 className="text-sm font-bold text-slate-100 flex items-center">
            <Scissors className="w-4 h-4 mr-2 text-sky-400" />
            Timeline Cut Frequency & Shot Duration Distribution
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Visualize how editing cadence and shot lingering shift across scenes. Click any bar to jump the video player.
          </p>
        </div>

        {/* View metric toggle */}
        <div className="flex items-center p-1 bg-slate-950 rounded-lg border border-slate-800 text-xs self-start sm:self-auto shrink-0">
          <button
            type="button"
            onClick={() => setMetricMode('duration')}
            className={`px-2.5 py-1 rounded-md transition font-medium flex items-center ${
              metricMode === 'duration'
                ? 'bg-sky-500 text-white shadow-sm font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Clock className="w-3 h-3 mr-1.5" />
            Shot Duration (s)
          </button>
          <button
            type="button"
            onClick={() => setMetricMode('frequency')}
            className={`px-2.5 py-1 rounded-md transition font-medium flex items-center ${
              metricMode === 'frequency'
                ? 'bg-sky-500 text-white shadow-sm font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Zap className="w-3 h-3 mr-1.5" />
            Cuts / Min
          </button>
          <button
            type="button"
            onClick={() => setMetricMode('cut_count')}
            className={`px-2.5 py-1 rounded-md transition font-medium flex items-center ${
              metricMode === 'cut_count'
                ? 'bg-sky-500 text-white shadow-sm font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-3 h-3 mr-1.5" />
            Total Cuts
          </button>
        </div>
      </div>

      {/* Analytics KPI Micro-Pills */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800/80">
            <div className="text-[10px] text-slate-400 flex items-center">
              <Zap className="w-3 h-3 mr-1 text-rose-400" />
              Fastest Paced Scene
            </div>
            <div className="text-xs font-bold text-rose-300 truncate mt-1">
              {stats.fastest.title}
            </div>
            <div className="text-[10px] text-slate-400 font-mono">
              {stats.fastest.shotDuration}s/shot ({stats.fastest.cutsPerMinute} cuts/min)
            </div>
          </div>

          <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800/80">
            <div className="text-[10px] text-slate-400 flex items-center">
              <Clock className="w-3 h-3 mr-1 text-sky-400" />
              Most Deliberate Scene
            </div>
            <div className="text-xs font-bold text-sky-300 truncate mt-1">
              {stats.deliberate.title}
            </div>
            <div className="text-[10px] text-slate-400 font-mono">
              {stats.deliberate.shotDuration}s/shot ({stats.deliberate.cutsPerMinute} cuts/min)
            </div>
          </div>

          <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800/80">
            <div className="text-[10px] text-slate-400 flex items-center">
              <Layers className="w-3 h-3 mr-1 text-emerald-400" />
              Sampled Cut Volume
            </div>
            <div className="text-sm font-mono font-bold text-emerald-300 mt-1">
              ~{stats.totalCuts} Cuts
            </div>
            <div className="text-[10px] text-slate-400">across timeline beats</div>
          </div>

          <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800/80">
            <div className="text-[10px] text-slate-400 flex items-center">
              <TrendingUp className="w-3 h-3 mr-1 text-purple-400" />
              Overall Video ASL
            </div>
            <div className="text-sm font-mono font-bold text-purple-300 mt-1">
              {overallAvgShotLength}s
            </div>
            <div className="text-[10px] text-slate-400">weighted benchmark</div>
          </div>
        </div>
      )}

      {/* Main Bar Chart */}
      <div className="w-full h-64 pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 15, right: 10, left: -20, bottom: 25 }}
            onClick={(state) => {
              if (state && state.activePayload && state.activePayload.length) {
                const target = state.activePayload[0].payload;
                if (onSeek && typeof target.startSeconds === 'number') {
                  onSeek(target.startSeconds);
                }
              }
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
            <XAxis
              dataKey="label"
              stroke="#64748b"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: '#334155' }}
              dy={10}
            />
            <YAxis
              stroke="#64748b"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: '#334155' }}
              unit={metricMode === 'duration' ? 's' : ''}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }} />

            {/* Benchmark line for overall average shot length */}
            {metricMode === 'duration' && overallAvgShotLength > 0 && (
              <ReferenceLine
                y={overallAvgShotLength}
                stroke="#38bdf8"
                strokeDasharray="4 4"
                strokeWidth={1.5}
                label={{
                  value: `Avg: ${overallAvgShotLength}s`,
                  fill: '#38bdf8',
                  fontSize: 10,
                  position: 'right'
                }}
              />
            )}

            <Bar
              dataKey={
                metricMode === 'duration'
                  ? 'shotDuration'
                  : metricMode === 'frequency'
                  ? 'cutsPerMinute'
                  : 'cutCount'
              }
              radius={[6, 6, 0, 0]}
              className="cursor-pointer"
              onMouseEnter={(_, index) => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.color}
                  fillOpacity={hoveredIndex === index ? 1 : 0.85}
                  stroke={hoveredIndex === index ? '#ffffff' : entry.color}
                  strokeWidth={hoveredIndex === index ? 1.5 : 0}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Interactive Legend & Seek prompt */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800 text-[11px] text-slate-400">
        <div className="flex flex-wrap items-center gap-3">
          <span className="font-semibold text-slate-300">Beat Legend:</span>
          {Array.from(new Set(chartData.map((d) => d.beatType))).map((type) => (
            <div key={type} className="flex items-center space-x-1.5">
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: getBeatColor(type) }}
              />
              <span className="text-slate-300">{type}</span>
            </div>
          ))}
        </div>

        <div className="flex items-center text-sky-400/90 font-medium">
          <Sparkles className="w-3 h-3 mr-1" />
          Click any bar to seek the embedded player directly
        </div>
      </div>
    </div>
  );
};

export default ShotRhythmChart;
