// Formatters localizados a es-ES

const eurFormatter = new Intl.NumberFormat("es-ES", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
});

const eurFormatterCompacto = new Intl.NumberFormat("es-ES", {
  style: "currency",
  currency: "EUR",
  notation: "compact",
  maximumFractionDigits: 1,
});

const numFormatter = new Intl.NumberFormat("es-ES", {
  maximumFractionDigits: 0,
});

const pctFormatter = new Intl.NumberFormat("es-ES", {
  style: "percent",
  maximumFractionDigits: 1,
});

const fechaFormatter = new Intl.DateTimeFormat("es-ES", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

const fechaCortaFormatter = new Intl.DateTimeFormat("es-ES", {
  day: "2-digit",
  month: "short",
});

export function eur(value: number): string {
  return eurFormatter.format(value);
}

export function eurCompacto(value: number): string {
  return eurFormatterCompacto.format(value);
}

export function num(value: number): string {
  return numFormatter.format(value);
}

export function pct(value: number): string {
  return pctFormatter.format(value);
}

export function score(value: number): string {
  return value.toFixed(1);
}

export function fecha(value: string): string {
  return fechaFormatter.format(new Date(value));
}

export function fechaCorta(value: string): string {
  return fechaCortaFormatter.format(new Date(value));
}
