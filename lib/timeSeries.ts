// Generador determinista de series temporales mensuales.
// Misma entrada → misma salida (seed-based PRNG).

import type { TimeSeriesPoint } from "./types";

/* ----------------------------- PRNG (mulberry32) ------------------------- */

function hashString(s: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(seed: number) {
  let t = seed >>> 0;
  return () => {
    t = (t + 0x6D2B79F5) >>> 0;
    let r = t;
    r = Math.imul(r ^ (r >>> 15), r | 1);
    r ^= r + Math.imul(r ^ (r >>> 7), r | 61);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

/* -------------------------- Calendario de la app ------------------------- */

/** Mes "actual" de la app — Mayo 2026 (último mes con datos). */
export const CURRENT_YEAR = 2026;
export const CURRENT_MONTH = 5; // 1..12

/** Devuelve los 24 últimos meses como YYYY-MM, en orden ascendente. */
export function last24Months(): string[] {
  const out: string[] = [];
  let y = CURRENT_YEAR;
  let m = CURRENT_MONTH;
  for (let i = 0; i < 24; i++) {
    out.unshift(`${y}-${String(m).padStart(2, "0")}`);
    m--;
    if (m === 0) {
      m = 12;
      y--;
    }
  }
  return out;
}

/** Igual que last24Months pero parametrizable */
export function lastNMonths(n: number): string[] {
  const all = last24Months();
  return all.slice(-Math.min(n, all.length));
}

/* ---------------------- Estacionalidades preestablecidas ----------------- */

/** Combustible turismo: pico verano y antes navidad */
export const SEASON_FUEL_TURISMO = [
  0.92, 0.90, 0.97, 1.00, 1.03, 1.07,
  1.13, 1.15, 1.02, 0.97, 0.95, 0.99,
];

/** Combustible profesional / B2B: más plano */
export const SEASON_FUEL_B2B = [
  0.96, 0.94, 1.00, 1.02, 1.03, 1.04,
  1.06, 1.04, 1.03, 1.02, 0.98, 0.94,
];

/** Bebidas frías: pico verano */
export const SEASON_BEBIDAS_FRIAS = [
  0.80, 0.78, 0.88, 0.95, 1.05, 1.20,
  1.35, 1.32, 1.10, 0.95, 0.85, 0.95,
];

/** Bebidas calientes: pico invierno */
export const SEASON_BEBIDAS_CALIENTES = [
  1.30, 1.28, 1.15, 1.00, 0.85, 0.72,
  0.65, 0.65, 0.80, 1.00, 1.20, 1.30,
];

/** Snacks: estable */
export const SEASON_FLAT: number[] = [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1];

/** Tabaco: muy estable */
export const SEASON_TABACO: number[] = [
  0.98, 0.97, 1.00, 1.01, 1.02, 1.03,
  1.04, 1.03, 1.01, 1.00, 0.97, 0.94,
];

/** Recarga EV: crecimiento sin estacionalidad fuerte */
export const SEASON_RECARGA: number[] = [
  0.95, 0.94, 0.98, 1.00, 1.02, 1.05,
  1.08, 1.06, 1.02, 1.00, 0.97, 0.93,
];

/** Lavado: pico primavera/verano */
export const SEASON_LAVADO: number[] = [
  0.85, 0.88, 1.00, 1.10, 1.20, 1.25,
  1.20, 1.10, 1.05, 1.00, 0.90, 0.85,
];

/** Prensa: declive más acelerado, sin estacionalidad */
export const SEASON_PRENSA: number[] = [
  1.05, 1.02, 1.00, 0.98, 0.95, 0.93,
  0.90, 0.92, 0.95, 0.98, 1.00, 1.03,
];

/* -------------------------- Generador principal -------------------------- */

export interface GenerateSeriesOpts {
  /** Valor medio mensual (la "base") */
  monthlyBase: number;
  /** Variación anual (ej. -0.025 = -2,5%/año) */
  trendAnnualPct: number;
  /** 12 multiplicadores mensuales (índice 0 = enero) */
  seasonality?: number[];
  /** Magnitud del ruido (ej. 0.10 = ±10%) */
  noisePct?: number;
  /** Seed reproducible */
  seed: string;
  /** Meses a generar (default 24) */
  months?: number;
}

/**
 * Genera una serie mensual con tendencia exponencial, estacionalidad y ruido.
 * La serie SIEMPRE empieza con base ajustada hacia atrás y termina con
 * base ajustada hacia adelante por la tendencia, de forma que el centro
 * de la serie coincide aproximadamente con monthlyBase.
 */
export function generateSeries(opts: GenerateSeriesOpts): TimeSeriesPoint[] {
  const {
    monthlyBase,
    trendAnnualPct,
    seasonality = SEASON_FLAT,
    noisePct = 0.08,
    seed,
    months = 24,
  } = opts;

  const rand = mulberry32(hashString(seed));
  const monthLabels = lastNMonths(months);

  // Tendencia mensual (compounding) — ej. -2,5% anual → factor mensual
  const monthlyTrendFactor = Math.pow(1 + trendAnnualPct, 1 / 12);

  // Pivot: el valor en el centro de la serie es ~monthlyBase
  const centerOffset = (months - 1) / 2;

  return monthLabels.map((label, i) => {
    const monthIdx = parseInt(label.slice(5), 10) - 1; // 0..11
    const trendMultiplier = Math.pow(monthlyTrendFactor, i - centerOffset);
    const seasonalMultiplier = seasonality[monthIdx] ?? 1;
    const noise = 1 + (rand() - 0.5) * 2 * noisePct;
    const value = monthlyBase * trendMultiplier * seasonalMultiplier * noise;
    return { date: label, value: Math.max(0, value) };
  });
}

/* ------------------------ Helpers sobre series ----------------------- */

/** Último valor de la serie */
export function lastValue(s: TimeSeriesPoint[]): number {
  return s[s.length - 1]?.value ?? 0;
}

/** Valor del mes anterior (i-1) */
export function prevValue(s: TimeSeriesPoint[]): number {
  return s[s.length - 2]?.value ?? 0;
}

/** Valor de hace 12 meses */
export function yoyValue(s: TimeSeriesPoint[]): number {
  return s[s.length - 13]?.value ?? 0;
}

/** Suma de los últimos N valores */
export function sumLastN(s: TimeSeriesPoint[], n: number): number {
  return s.slice(-n).reduce((a, b) => a + b.value, 0);
}

/** Promedio de los últimos N valores */
export function avgLastN(s: TimeSeriesPoint[], n: number): number {
  if (!s.length) return 0;
  const k = Math.min(n, s.length);
  return sumLastN(s, k) / k;
}

/** Suma de dos series punto a punto (asume mismas fechas) */
export function sumSeries(a: TimeSeriesPoint[], b: TimeSeriesPoint[]): TimeSeriesPoint[] {
  return a.map((p, i) => ({ date: p.date, value: p.value + (b[i]?.value ?? 0) }));
}

/** Escala una serie por un factor */
export function scaleSeries(s: TimeSeriesPoint[], factor: number): TimeSeriesPoint[] {
  return s.map((p) => ({ date: p.date, value: p.value * factor }));
}
