// Torre de Control EESS — Modelo de datos
// Generated from Torre_de_Control_EESS_BBDD.xlsx

export type IMPCategoria =
  | "★ Estrella"
  | "Sólida"
  | "Estable con riesgos"
  | "Vulnerable"
  | "Crítica";

export type AlertaSeveridad = "ALTA" | "MEDIA" | "INFO";

export type SubIndice = "SEI" | "OAI" | "CTI" | "RPC" | "FCC";

export interface Estacion {
  id: string;
  nombre: string;
  marca: string;
  modeloOperacion: string;
  direccion: string;
  municipio: string;
  provincia: string;
  cp: string;
  latitud: number;
  longitud: number;
  tipologia: string;
  horario: string;
  anyoApertura: number;
  ultimaReforma: number;
  protagonista?: boolean;
  perfil?: PerfilEstacion;
}

export type PerfilEstacion =
  | "premium-urbana"
  | "corredor-24h"
  | "low-cost-urbana"
  | "poligono-b2b"
  | "critica";

export interface SubIndiceScore {
  codigo: SubIndice;
  nombre: string;
  descripcion: string;
  peso: number;
  score: number;
  subdimensiones: SubDimension[];
}

export interface SubDimension {
  codigo: string;
  nombre: string;
  peso: number;
  score: number;
}

export interface PnL {
  volumenFuelTotal: number;
  beneficioBrutoFuel: number;
  ventasTotalTienda: number;
  ingresosServicios: number;
  beneficioBrutoTotal: number;
  opexTotal: number;
  ebitda: number;
  margenEbitda: number;
  activoNeto: number;
  superficieParcela: number;
  roic: number;
  ebitdaPorM2: number;
}

export interface RankingIMP {
  posicion: number;
  estacionId: string;
  sei: number;
  oai: number;
  cti: number;
  rpc: number;
  fcc: number;
  imp: number;
  categoria: IMPCategoria;
  recomendacion: string;
}

export interface Alerta {
  id: number;
  fecha: string;
  estacionId: string;
  estacionNombre: string;
  tipo: string;
  subIndice: string;
  severidad: AlertaSeveridad;
  disparador: string;
  descripcion: string;
  responsable: string;
  accion?: string;
}

export interface EstacionCompleta extends Estacion {
  ranking: RankingIMP;
  subIndices: {
    SEI: SubIndiceScore;
    OAI: SubIndiceScore;
    CTI: SubIndiceScore;
    RPC: SubIndiceScore;
    FCC: SubIndiceScore;
  };
  pnl: PnL;
  alertas: Alerta[];
}

export interface CategoriaIMP {
  rango: [number, number];
  nombre: IMPCategoria;
  recomendacion: string;
  color: string;
  colorMapa: string;
}

/* -------------------------------------------------------------------------- */
/*                  V2 — SERIES TEMPORALES Y GRANULARIDAD                     */
/* -------------------------------------------------------------------------- */

export interface TimeSeriesPoint {
  date: string;
  value: number;
}

export type TimeFilterKey = "12m" | "3m" | "yoy" | "vs-prev-year";

export interface TimeFilter {
  key: TimeFilterKey;
  label: string;
  description: string;
}

export interface GranularMetric {
  codigo: string;
  nombre: string;
  unidad: string;
  valorActual: number;
  valorMesAnterior: number;
  valorYoY: number;
  serie: TimeSeriesPoint[];
}

export type CategoriaTiendaCodigo =
  | "bebidas-frias"
  | "bebidas-calientes"
  | "snacks"
  | "chicles-caramelos"
  | "tabaco"
  | "prensa-revistas"
  | "conveniencia"
  | "higiene";

export interface Sku {
  codigo: string;
  nombre: string;
  marca: string;
  categoria: CategoriaTiendaCodigo;
  formato: string;
  precioVenta: number;
  margenPct: number;
  pesoBase: number;
}

export interface CategoriaTienda {
  codigo: CategoriaTiendaCodigo;
  nombre: string;
  descripcion: string;
}

export interface SkuVentas {
  sku: Sku;
  unidadesMes: number;
  ingresosMes: number;
  margenMes: number;
  unidadesMesAnterior: number;
  unidadesYoY: number;
  serieUnidades: TimeSeriesPoint[];
  serieIngresos: TimeSeriesPoint[];
}

export interface CategoriaVentas {
  categoria: CategoriaTienda;
  unidadesMes: number;
  ingresosMes: number;
  ingresosMesAnterior: number;
  ingresosYoY: number;
  serieIngresos: TimeSeriesPoint[];
  skus: SkuVentas[];
}

export interface ComparacionFila {
  codigo: string;
  nombre: string;
  valores: { estacionId: string; valor: number; color?: string }[];
}
