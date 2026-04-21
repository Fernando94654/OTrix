'use client';

import { useId } from 'react';

interface LineSeries {
  label: string;
  color: string;
  values: { x: string; y: number }[];
}

interface MultiLineChartProps {
  series: LineSeries[];
  height?: number;
  yLabel?: string;
}

export function MultiLineChart({ series, height = 200, yLabel }: MultiLineChartProps) {
  const width = 640;
  const padding = { top: 20, right: 20, bottom: 30, left: 44 };
  const plotW = width - padding.left - padding.right;
  const plotH = height - padding.top - padding.bottom;

  const allValues = series.flatMap((s) => s.values.map((v) => v.y));
  const max = Math.max(...allValues, 1);
  const length = Math.max(...series.map((s) => s.values.length), 1);
  const xLabels = series[0]?.values ?? [];

  const toPoints = (values: { x: string; y: number }[]) =>
    values.map((v, i) => {
      const x = padding.left + (i / Math.max(length - 1, 1)) * plotW;
      const y = padding.top + plotH - (v.y / max) * plotH;
      return { x, y, raw: v };
    });

  const yTicks = 4;
  const ticks = Array.from({ length: yTicks + 1 }, (_, i) => {
    const value = (max / yTicks) * i;
    const y = padding.top + plotH - (i / yTicks) * plotH;
    return { value: Math.round(value), y };
  });

  const xShown = xLabels.filter((_, i) => i % Math.ceil(length / 6) === 0 || i === length - 1);

  return (
    <div className='stat-chart-wrap'>
      <svg viewBox={`0 0 ${width} ${height}`} className='stat-chart-svg' role='img' aria-label={yLabel ?? 'chart'}>
        {ticks.map((t, i) => (
          <g key={i}>
            <line x1={padding.left} x2={width - padding.right} y1={t.y} y2={t.y} stroke='rgba(255,255,255,0.06)' />
            <text x={padding.left - 8} y={t.y + 3} textAnchor='end' className='stat-chart-axis'>
              {t.value}
            </text>
          </g>
        ))}

        {series.map((s, idx) => {
          const pts = toPoints(s.values);
          const path = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
          return (
            <g key={idx}>
              <path d={path} fill='none' stroke={s.color} strokeWidth={2} strokeLinecap='round' strokeLinejoin='round' />
              {pts.map((p, i) => (
                <circle key={i} cx={p.x} cy={p.y} r={2} fill={s.color}>
                  <title>{`${p.raw.x}: ${p.raw.y}`}</title>
                </circle>
              ))}
            </g>
          );
        })}

        {xShown.map((v, i) => {
          const idx = xLabels.indexOf(v);
          const x = padding.left + (idx / Math.max(length - 1, 1)) * plotW;
          return (
            <text key={i} x={x} y={height - 10} textAnchor='middle' className='stat-chart-axis'>
              {v.x.slice(5)}
            </text>
          );
        })}
      </svg>
      <div className='stat-legend'>
        {series.map((s) => (
          <span key={s.label} className='stat-legend-item'>
            <span className='stat-legend-dot' style={{ background: s.color }} />
            {s.label}
          </span>
        ))}
      </div>
    </div>
  );
}

interface LineChartProps {
  data: { date: string; score: number }[];
  height?: number;
}

export function LineChart({ data, height = 180 }: LineChartProps) {
  const width = 600;
  const padding = { top: 18, right: 18, bottom: 26, left: 40 };
  const gradientId = useId();
  const lineId = useId();

  const max = Math.max(...data.map((d) => d.score), 1);
  const plotW = width - padding.left - padding.right;
  const plotH = height - padding.top - padding.bottom;

  const points = data.map((d, i) => {
    const x = padding.left + (i / Math.max(data.length - 1, 1)) * plotW;
    const y = padding.top + plotH - (d.score / max) * plotH;
    return { x, y, ...d };
  });

  const path = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
  const lastX = points[points.length - 1]?.x.toFixed(1) ?? padding.left;
  const area = `${path} L${lastX},${(padding.top + plotH).toFixed(1)} L${padding.left},${(padding.top + plotH).toFixed(1)} Z`;

  const yTicks = 4;
  const ticks = Array.from({ length: yTicks + 1 }, (_, i) => ({
    value: Math.round((max / yTicks) * i),
    y: padding.top + plotH - (i / yTicks) * plotH
  }));
  const xLabels = points.filter((_, i) => i % Math.ceil(points.length / 6) === 0 || i === points.length - 1);

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className='stat-chart-svg' role='img' aria-label='Score trend'>
      <defs>
        <linearGradient id={gradientId} x1='0' y1='0' x2='0' y2='1'>
          <stop offset='0%' stopColor='#cd163f' stopOpacity='0.45' />
          <stop offset='100%' stopColor='#cd163f' stopOpacity='0' />
        </linearGradient>
        <linearGradient id={lineId} x1='0' y1='0' x2='1' y2='0'>
          <stop offset='0%' stopColor='#ff6a88' />
          <stop offset='100%' stopColor='#cd163f' />
        </linearGradient>
      </defs>
      {ticks.map((t, i) => (
        <g key={i}>
          <line x1={padding.left} x2={width - padding.right} y1={t.y} y2={t.y} stroke='rgba(255,255,255,0.06)' />
          <text x={padding.left - 8} y={t.y + 3} textAnchor='end' className='stat-chart-axis'>
            {t.value}
          </text>
        </g>
      ))}
      <path d={area} fill={`url(#${gradientId})`} />
      <path d={path} fill='none' stroke={`url(#${lineId})`} strokeWidth={2.5} strokeLinecap='round' strokeLinejoin='round' />
      {points.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={2.5} fill='#fff' stroke='#cd163f' strokeWidth={1.5}>
          <title>{`${p.date}: ${p.score}`}</title>
        </circle>
      ))}
      {xLabels.map((p, i) => (
        <text key={i} x={p.x} y={height - 8} textAnchor='middle' className='stat-chart-axis'>
          {p.date.slice(5)}
        </text>
      ))}
    </svg>
  );
}

interface BarChartProps {
  items: { label: string; value: number; max: number; color: string; sublabel?: string }[];
}

export function BarChart({ items }: BarChartProps) {
  return (
    <div className='stat-bars'>
      {items.map((item) => {
        const pct = Math.min(100, (item.value / Math.max(item.max, 1)) * 100);
        return (
          <div key={item.label} className='stat-bar-row'>
            <div className='stat-bar-head'>
              <span className='stat-bar-label'>{item.label}</span>
              <span className='stat-bar-value'>
                {item.value.toLocaleString()} <span className='stat-bar-max'>/ {item.max.toLocaleString()}</span>
              </span>
            </div>
            <div className='stat-bar-track'>
              <div
                className='stat-bar-fill'
                style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${item.color}, ${item.color}cc)` }}
              />
            </div>
            {item.sublabel && <span className='stat-bar-sub'>{item.sublabel}</span>}
          </div>
        );
      })}
    </div>
  );
}

interface DonutProps {
  segments: { label: string; value: number; color: string }[];
  size?: number;
  centerLabel?: string;
}

export function Donut({ segments, size = 180, centerLabel }: DonutProps) {
  const total = segments.reduce((sum, s) => sum + s.value, 0) || 1;
  const radius = size / 2;
  const inner = radius * 0.62;
  const cx = radius;
  const cy = radius;

  let cursor = -Math.PI / 2;
  const paths = segments.map((seg) => {
    const angle = (seg.value / total) * Math.PI * 2;
    const start = cursor;
    const end = cursor + angle;
    cursor = end;

    const x1 = cx + radius * Math.cos(start);
    const y1 = cy + radius * Math.sin(start);
    const x2 = cx + radius * Math.cos(end);
    const y2 = cy + radius * Math.sin(end);
    const x3 = cx + inner * Math.cos(end);
    const y3 = cy + inner * Math.sin(end);
    const x4 = cx + inner * Math.cos(start);
    const y4 = cy + inner * Math.sin(start);
    const large = angle > Math.PI ? 1 : 0;

    const d = [
      `M${x1.toFixed(2)},${y1.toFixed(2)}`,
      `A${radius},${radius} 0 ${large} 1 ${x2.toFixed(2)},${y2.toFixed(2)}`,
      `L${x3.toFixed(2)},${y3.toFixed(2)}`,
      `A${inner},${inner} 0 ${large} 0 ${x4.toFixed(2)},${y4.toFixed(2)}`,
      'Z'
    ].join(' ');

    return { d, color: seg.color, label: seg.label, value: seg.value };
  });

  return (
    <div className='stat-donut-wrap'>
      <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size} role='img'>
        {paths.map((p, i) => (
          <path key={i} d={p.d} fill={p.color}>
            <title>{`${p.label}: ${p.value}`}</title>
          </path>
        ))}
        <text x={cx} y={cy - 4} textAnchor='middle' className='stat-donut-total'>
          {total}
        </text>
        <text x={cx} y={cy + 16} textAnchor='middle' className='stat-donut-sub'>
          {centerLabel ?? 'total'}
        </text>
      </svg>
      <ul className='stat-donut-legend'>
        {segments.map((s) => (
          <li key={s.label}>
            <span className='stat-donut-dot' style={{ background: s.color }} />
            <span className='stat-donut-legend-label'>{s.label}</span>
            <span className='stat-donut-legend-value'>{s.value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Sparkline({ values, color = '#cd163f' }: { values: number[]; color?: string }) {
  const width = 120;
  const height = 36;
  if (values.length === 0) return null;
  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);
  const range = max - min || 1;
  const path = values
    .map((v, i) => {
      const x = (i / Math.max(values.length - 1, 1)) * width;
      const y = height - ((v - min) / range) * height;
      return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');
  return (
    <svg viewBox={`0 0 ${width} ${height}`} className='stat-kpi-spark'>
      <path d={path} fill='none' stroke={color} strokeWidth={2} strokeLinecap='round' strokeLinejoin='round' />
    </svg>
  );
}

interface FunnelProps {
  stages: { stage: string; count: number }[];
}

export function FunnelChart({ stages }: FunnelProps) {
  const top = stages[0]?.count ?? 1;
  return (
    <ol className='stat-funnel'>
      {stages.map((s, i) => {
        const pct = (s.count / top) * 100;
        const relPct = i === 0 ? 100 : (s.count / (stages[i - 1]?.count || 1)) * 100;
        return (
          <li key={s.stage}>
            <div className='stat-funnel-head'>
              <span className='stat-funnel-label'>{s.stage}</span>
              <span className='stat-funnel-count'>
                {s.count.toLocaleString()}
                <span className='stat-funnel-pct'>{pct.toFixed(0)}%</span>
              </span>
            </div>
            <div className='stat-funnel-track'>
              <div className='stat-funnel-fill' style={{ width: `${pct}%` }} />
            </div>
            {i > 0 && (
              <span className='stat-funnel-drop'>
                {relPct.toFixed(0)}% from previous step
              </span>
            )}
          </li>
        );
      })}
    </ol>
  );
}

interface HeatmapProps {
  data: number[][];
  rowLabels: string[];
  colLabels: string[];
  colorStops?: { threshold: number; color: string }[];
}

export function Heatmap({ data, rowLabels, colLabels, colorStops }: HeatmapProps) {
  const max = Math.max(1, ...data.flat());
  const stops = colorStops ?? [
    { threshold: 0, color: '#1f2332' },
    { threshold: 0.25, color: '#3a1d2b' },
    { threshold: 0.5, color: '#7a1733' },
    { threshold: 0.75, color: '#cd163f' },
    { threshold: 1, color: '#ff6a88' }
  ];

  const pickColor = (value: number) => {
    const ratio = value / max;
    let color = stops[0].color;
    for (const s of stops) {
      if (ratio >= s.threshold) color = s.color;
    }
    return color;
  };

  return (
    <div className='stat-heatmap'>
      <div className='stat-heatmap-grid' style={{ gridTemplateColumns: `auto repeat(${colLabels.length}, 1fr)` }}>
        <div />
        {colLabels.map((c) => (
          <span key={c} className='stat-heatmap-col-label'>
            {c}
          </span>
        ))}
        {rowLabels.map((row, ri) => (
          <div key={row} style={{ display: 'contents' }}>
            <span className='stat-heatmap-row-label'>{row}</span>
            {data[ri]?.map((value, ci) => (
              <span
                key={ci}
                className='stat-heatmap-cell'
                style={{ background: pickColor(value) }}
                title={`${row} ${colLabels[ci]}: ${value}`}
              />
            ))}
          </div>
        ))}
      </div>
      <div className='stat-heatmap-legend'>
        <span>less</span>
        <div className='stat-heatmap-scale'>
          {stops.map((s, i) => (
            <span key={i} style={{ background: s.color }} />
          ))}
        </div>
        <span>more</span>
      </div>
    </div>
  );
}
