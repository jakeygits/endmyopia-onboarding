"use client";

import { useEffect, useRef } from "react";

export default function ProgressionChart({
  years,
  leftEye,
  rightEye,
}: {
  years: number;
  leftEye: number;
  rightEye: number;
}) {
  const pathRef = useRef<SVGPathElement>(null);
  const avg = (Math.abs(leftEye) + Math.abs(rightEye)) / 2;

  // Chart dimensions
  const W = 320;
  const H = 160;
  const PAD = { top: 16, right: 24, bottom: 32, left: 40 };
  const chartW = W - PAD.left - PAD.right;
  const chartH = H - PAD.top - PAD.bottom;

  // Scale: x = years, y = diopters (0 at bottom, avg at top — line goes UP)
  const xScale = (yr: number) => PAD.left + (yr / years) * chartW;
  const yScale = (d: number) => PAD.top + chartH - (d / avg) * chartH;

  // Build path: slow start (genetic baseline ~-0.5 in year 1), then accelerates
  const points: [number, number][] = [];
  const numPts = Math.min(years, 20);
  for (let i = 0; i <= numPts; i++) {
    const yr = (i / numPts) * years;
    // Progression curve: starts slow, accelerates early, plateaus slightly
    const t = i / numPts;
    const d = avg * (0.15 + 0.85 * Math.pow(t, 0.75));
    points.push([xScale(yr), yScale(d)]);
  }

  // Smooth path using bezier
  const d = points.reduce((acc, [x, y], i) => {
    if (i === 0) return `M ${x} ${y}`;
    const [px, py] = points[i - 1];
    const cx1 = px + (x - px) * 0.5;
    const cy1 = py;
    const cx2 = px + (x - px) * 0.5;
    const cy2 = y;
    return `${acc} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${x} ${y}`;
  }, "");

  // Year tick marks
  const tickYears = years <= 5
    ? Array.from({ length: years + 1 }, (_, i) => i)
    : years <= 10
    ? [0, Math.round(years / 2), years]
    : [0, Math.round(years / 3), Math.round((2 * years) / 3), years];

  useEffect(() => {
    const path = pathRef.current;
    if (!path) return;
    const len = path.getTotalLength();
    path.style.strokeDasharray = `${len}`;
    path.style.strokeDashoffset = `${len}`;
    path.style.transition = "none";
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        path.style.transition = "stroke-dashoffset 1.6s cubic-bezier(0.4,0,0.2,1)";
        path.style.strokeDashoffset = "0";
      });
    });
  }, []);

  const [endX, endY] = points[points.length - 1];

  return (
    <div className="rounded-xl bg-zinc-900 border border-zinc-800 p-4">
      <p className="text-xs text-zinc-500 uppercase tracking-wider mb-3">
        Your estimated diopter progression
      </p>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full"
        style={{ height: 160 }}
      >
        {/* Grid lines */}
        {[0.25, 0.5, 0.75, 1].map((t) => (
          <line
            key={t}
            x1={PAD.left}
            y1={PAD.top + t * chartH}
            x2={PAD.left + chartW}
            y2={PAD.top + t * chartH}
            stroke="#27272a"
            strokeWidth="1"
          />
        ))}

        {/* Y axis label */}
        <text
          x={PAD.left - 6}
          y={PAD.top}
          textAnchor="end"
          fill="#71717a"
          fontSize="9"
          dominantBaseline="middle"
        >
          -{avg.toFixed(1)}D
        </text>
        <text
          x={PAD.left - 6}
          y={PAD.top + chartH}
          textAnchor="end"
          fill="#71717a"
          fontSize="9"
          dominantBaseline="middle"
        >
          0D
        </text>
        {/* Baseline at 0D (bottom) */}
        <line
          x1={PAD.left}
          y1={PAD.top + chartH}
          x2={PAD.left + chartW}
          y2={PAD.top + chartH}
          stroke="#3f3f46"
          strokeWidth="1"
        />

        {/* X axis ticks */}
        {tickYears.map((yr) => (
          <text
            key={yr}
            x={xScale(yr)}
            y={H - 8}
            textAnchor="middle"
            fill="#52525b"
            fontSize="9"
          >
            {yr === 0 ? "Start" : yr === years ? "Today" : `Yr ${yr}`}
          </text>
        ))}

        {/* Area fill under curve */}
        <path
          d={`${d} L ${endX} ${PAD.top + chartH} L ${PAD.left} ${PAD.top + chartH} Z`}
          fill="url(#redGrad)"
          opacity="0.15"
        />

        {/* Gradient definition */}
        <defs>
          <linearGradient id="redGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Main path */}
        <path
          ref={pathRef}
          d={d}
          fill="none"
          stroke="#f59e0b"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* End point dot */}
        <circle cx={endX} cy={endY} r="4" fill="#f59e0b" />
        <circle cx={endX} cy={endY} r="7" fill="#f59e0b" fillOpacity="0.2" />

        {/* "Today" label */}
        <text
          x={endX + 8}
          y={endY - 2}
          fill="#f59e0b"
          fontSize="9"
          fontWeight="bold"
        >
          -{avg.toFixed(1)}D
        </text>
      </svg>

      <p className="text-xs text-zinc-600 text-center mt-1">
        Under standard care. Every year. Nobody flagged it.
      </p>
    </div>
  );
}
