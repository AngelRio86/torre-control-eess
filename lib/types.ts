// lib/types.ts
// Torre de Control EESS — Tipos TypeScript compartidos (modelo V2).

/* -------------------------------------------------------------------------- */
/*                            NUEVO MODELO (V2)                               */
/* -------------------------------------------------------------------------- */

export type TimeFilterKey = "1M" | "3M" | "6M" | "12M" | "YTD" | "ALL";

export type SubIndiceCode = "SEI" | "OAI" | "CTI" | "RPC" | "FCC";

export type ScoreCode = "FDS" | "EVH" | "CRT" | "FLT" | "REO" | "CMT";

export interface Score {
  codigo: ScoreCode;
  nombre: string;
  score: number; // 0-100
}

export interface ScoresEstacion {
  FDS: number;
  EVH: number;
  CRT: number;
  FLT: number;
  REO: number;
  CMT: number;
}

export type ArquetipoCode =
  | "MULTI_HIGHWAY"
  | "URBAN_CONV"
  | "FLEET_HUB"
  | "CONV_LOCAL"
  | "CORRIDOR"
  | "DECLINE";

export interface Arquetipo {
  codigo: ArquetipoCode;
  nombre: string;
  descripcion: string;
  colorMapa: string;
  inversion: "Alta" | "Media" | "Baja" | "Desinversión";
}

/* -------------------------------------------------------------------------- */
/*                        LEGACY MODEL (V1 — IMP)                             */
/* -------------------------------------------------------------------------- */

export interface SubDimension {
  codigo: string;
  nombre: string;
  score: number;
}

export interface SubIndice {
  codigo: string;
  nombre: string;
  score: number;
  peso: number;
  subdimensiones: SubDimension[];
}

export type SubIndiceScore = SubIndice;

export interface SubIndices {
  SEI: SubIndice;
  OAI: SubIndice;
  CTI: SubIndice;
  RPC: SubIndice;
  FCC: SubIndice;
}

export interface RankingIMP {
  posicion: number;
  imp: number;
  categoria: string;
  sei: number;
  oai: number;
  cti: number;
  rpc: number;
  fcc: number;
  recomendacion: string;
}

export interface CategoriaIMP {
  nombre: string;
  rango: [number, number];
  color: string;
  colorMapa: string;
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
  roic: number;
  superficieParcela: number;
  ebitdaPorM2: number;
}

export interface Alerta {
  id: string;
  estacionId: string;
  estacionNombre: string;
  fecha: string;
  tipo: string;
  severidad: "ALTA" | "MEDIA" | "INFO";
  subIndice: string;
  disparador: string;
  descripcion: string;
  accion?: string;
  responsable: string;
}

export interface EstacionCompleta {
  id: string;
  nombre: string;
  marca: string;
  tipologia: string;
  modeloOperacion: string;
  direccion: string;
  municipio: string;
  latitud: number;
  longitud: number;
  horario: string;
  anyoApertura: number;
  ultimaReforma: number;
  protagonista: boolean;
  scores: ScoresEstacion;
  arquetipo: Arquetipo;
  subIndices: SubIndices;
  ranking: RankingIMP;
  pnl: PnL;
  alertas: Alerta[];
}

/* -------------------------------------------------------------------------- */
/*                     TIME SERIES & FILTERS                                  */
/* -------------------------------------------------------------------------- */

export interface TimeSeriesPoint {
  date: string;
  value: number;
}

export interface TimeFilter {
  key: TimeFilterKey;
  label: string;
  description: string;
}

/* -------------------------------------------------------------------------- */
/*                     GRANULAR DATA TYPES (LEGACY)                           */
/* -------------------------------------------------------------------------- */

export interface CategoriaVentas {
  categoria: {
    codigo: string;
    nombre: string;
  };
  skus: SkuVentas[];
  ingresosMes: number;
  ingresosMesAnterior: number;
  ingresosYoY: number;
  unidadesMes: number;
  serieIngresos: TimeSeriesPoint[];
}

export interface SkuVentas {
  sku: {
    codigo: string;
    nombre: string;
    marca: string;
    formato: string;
    precioVenta: number;
  };
  unidadesMes: number;
  unidadesMesAnterior: number;
  unidadesYoY: number;
  ingresosMes: number;
  serieIngresos: TimeSeriesPoint[];
}
