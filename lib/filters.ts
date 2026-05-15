import type { TimeFilter, TimeFilterKey, TimeSeriesPoint } from "./types";

export const FILTROS: TimeFilter[] = [
  {
    key: "12m",
    label: "Últimos 12 meses",
    description: "Serie mensual del último año.",
  },
  {
    key: "3m",
    label: "Últimos 3 meses",
    description: "Zoom al trimestre en curso.",
  },
  {
    key: "yoy",
    label: "YoY mes a mes",
    description: "Cada mes vs mismo mes hace 12 meses.",
  },
  {
    key: "vs-prev-year",
    label: "Año actual vs anterior",
    description: "Dos series superpuestas para comparar año a año.",
  },
];

export interface ChartSeries {
  name: string;
  color: string;
  data: TimeSeriesPoint[];
}

/**
 * Aplica un filtro a una serie y devuelve una o dos series listas para
 * representar en el gráfico de líneas. La estructura difiere por filtro:
 *
 * - "12m":           [{ name: <métrica>, data: últimos 12 meses }]
 * - "3m":            [{ name: <métrica>, data: últimos 3 meses }]
 * - "yoy":           [{ name: "Actual" }, { name: "YoY" }] alineadas
 * - "vs-prev-year":  [{ name: "Año actual" }, { name: "Año anterior" }]
 *                    superpuestas usando "MMM" como eje X.
 */
export function aplicarFiltro(
  serie: TimeSeriesPoint[],
  filtro: TimeFilterKey,
  metricName: string,
  colors: { primary: string; secondary: string }
): ChartSeries[] {
  if (!serie.length) return [];

  if (filtro === "12m") {
    return [
      {
        name: metricName,
        color: colors.primary,
        data: serie.slice(-12),
      },
    ];
  }

  if (filtro === "3m") {
    return [
      {
        name: metricName,
        color: colors.primary,
        data: serie.slice(-3),
      },
    ];
  }

  if (filtro === "yoy") {
    // Sólo tiene sentido si la serie tiene ≥ 24 puntos
    if (serie.length < 24) {
      return [
        { name: metricName, color: colors.primary, data: serie.slice(-12) },
      ];
    }
    const ult12 = serie.slice(-12);
    const prev12 = serie.slice(-24, -12);
    return [
      {
        name: "Actual",
        color: colors.primary,
        data: ult12,
      },
      {
        name: "YoY (12m antes)",
        color: colors.secondary,
        // Reasignamos fechas para que coincidan en el eje X
        data: prev12.map((p, i) => ({ date: ult12[i].date, value: p.value })),
      },
    ];
  }

  if (filtro === "vs-prev-year") {
    if (serie.length < 24) {
      return [
        { name: metricName, color: colors.primary, data: serie.slice(-12) },
      ];
    }
    const months = serie.slice(-12).map((p) => mesCorto(p.date));
    const ult12 = serie.slice(-12);
    const prev12 = serie.slice(-24, -12);
    return [
      {
        name: "Año actual",
        color: colors.primary,
        data: ult12.map((p, i) => ({ date: months[i], value: p.value })),
      },
      {
        name: "Año anterior",
        color: colors.secondary,
        data: prev12.map((p, i) => ({ date: months[i], value: p.value })),
      },
    ];
  }

  return [];
}

const MESES_CORTOS = ["Ene", "Feb", "Mar", "Abr", "May", "Jun",
                      "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

export function mesCorto(date: string): string {
  // "2026-05" → "May"
  const m = parseInt(date.slice(5), 10);
  return MESES_CORTOS[m - 1] ?? date;
}

export function mesLargo(date: string): string {
  // "2026-05" → "May 2026"
  const y = date.slice(0, 4);
  return `${mesCorto(date)} ${y}`;
}

/** Devuelve el % de variación entre dos valores, redondeado a 1 decimal */
export function deltaPct(actual: number, base: number): number {
  if (!base) return 0;
  return ((actual - base) / Math.abs(base)) * 100;
}

/** Formatea un delta para mostrar con signo */
export function formatDelta(deltaPct: number): string {
  const sign = deltaPct > 0 ? "+" : "";
  return `${sign}${deltaPct.toFixed(1)}%`;
}
