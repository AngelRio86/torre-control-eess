"use client";

import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { ChartSeries } from "@/lib/filters";
import { mesCorto } from "@/lib/filters";

interface Props {
  series: ChartSeries[];
  /** Unidad para el tooltip y eje Y (€, %, uds, etc.) */
  unit?: string;
  /** Altura del gráfico en píxeles */
  height?: number;
  /** Formateador opcional del valor en tooltip y eje */
  formatValue?: (v: number) => string;
  /** Mostrar leyenda (default true si hay >1 serie) */
  showLegend?: boolean;
}

const DEFAULT_COLORS = ["#1c3d5a", "#b88a4a", "#2faa66", "#c66524", "#b13c4f"];

export function TimeSeriesChart({
  series,
  unit = "",
  height = 260,
  formatValue,
  showLegend,
}: Props) {
  if (!series.length || !series[0].data.length) {
    return (
      <div
        style={{
          height,
          display: "grid",
          placeItems: "center",
          color: "var(--ink-3)",
          fontSize: 13,
          background: "var(--bg-tint)",
          borderRadius: 12,
        }}
      >
        Sin datos disponibles para este filtro.
      </div>
    );
  }

  // Unificar todas las series en un único dataset con clave por fecha
  const dates = series[0].data.map((p) => p.date);
  const data = dates.map((d, i) => {
    const row: Record<string, string | number> = { date: d };
    series.forEach((s) => {
      row[s.name] = s.data[i]?.value ?? null;
    });
    return row;
  });

  const fmt = (v: number) => {
    if (!isFinite(v)) return "—";
    if (formatValue) return formatValue(v);
    if (Math.abs(v) >= 1000) return `${(v / 1000).toFixed(1)}k${unit ? " " + unit : ""}`;
    if (Math.abs(v) >= 10) return `${v.toFixed(0)}${unit ? " " + unit : ""}`;
    return `${v.toFixed(2)}${unit ? " " + unit : ""}`;
  };

  const showLeg = showLegend ?? series.length > 1;

  return (
    <div style={{ width: "100%", height }}>
      <ResponsiveContainer>
        <LineChart data={data} margin={{ top: 8, right: 14, left: 0, bottom: 4 }}>
          <CartesianGrid stroke="#e3e5dd" strokeDasharray="2 4" vertical={false} />
          <XAxis
            dataKey="date"
            tickFormatter={(d: string | number) => mesCorto(String(d))}
            stroke="#8a8f9c"
            tick={{ fontSize: 11, fill: "#6c7385" }}
            axisLine={{ stroke: "#c9ccc1" }}
            tickLine={false}
          />
          <YAxis
            stroke="#8a8f9c"
            tick={{ fontSize: 11, fill: "#6c7385" }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v: number) => fmt(Number(v))}
            width={56}
          />
          <Tooltip
            contentStyle={{
              background: "#ffffff",
              border: "1px solid #e3e5dd",
              borderRadius: 8,
              fontSize: 12,
              boxShadow: "0 4px 14px -2px rgba(20,28,40,0.08)",
            }}
            formatter={(v) => [fmt(Number(v)), ""]}
            labelFormatter={(label) => mesCorto(String(label))}
          />
          {showLeg && (
            <Legend
              wrapperStyle={{ fontSize: 11, paddingTop: 8 }}
              iconType="circle"
              iconSize={8}
            />
          )}
          {series.map((s, idx) => (
            <Line
              key={s.name}
              type="monotone"
              dataKey={s.name}
              stroke={s.color || DEFAULT_COLORS[idx % DEFAULT_COLORS.length]}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
