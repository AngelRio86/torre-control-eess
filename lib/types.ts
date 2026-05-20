// lib/types.ts
// Torre de Control EESS — modelo de 6 scores independientes + arquetipos.
// Mantiene los tipos legacy (IMP, sub-índices) para no romper componentes existentes.

/* -------------------------------------------------------------------------- */
/*                            NUEVO MODELO (V2)                               */
/* -------------------------------------------------------------------------- */

export type TimeFilterKey = "1M" | "3M" | "6M" | "12M" | "YTD" | "ALL";

export type ScoreCode = "FDS" | "EVH" | "CRT" | "FLT" | "REO" | "CMT";

export type Score = {
  codigo: ScoreCode;
  nombre: string;       // ES — para UI
  nombreEN: string;     // EN — para contexto / tooltips
  descripcion: string;
  score: number;        // 0-100
};

export type ScoresEstacion = {
  FDS: Score; // Fuel Defense
  EVH: Score; // EV Hub Potential
  CRT: Score; // Convenience Retail
  FLT: Score; // Fleet & Commercial
  REO: Score; // Real Estate Optionality
  CMT: Score; // Competitive Moat
};

export type ArquetipoCode =
  | "MULTI_HIGHWAY"
  | "URBAN_CONVENIENCE"
  | "FLEET_COMMERCIAL"
  | "CONVENIENCE_LOCAL"
  | "CORRIDOR_MULTI"
  | "CONTROLLED_DECLINE";

export type Arquetipo = {
  codigo: ArquetipoCode;
  nombre: string;
  descripcion: string;
  scoresClave: ScoreCode[];   // 2-3 scores que definen el arquetipo
  recomendacion: string;
  inversion: "alta" | "media" | "baja" | "desinversion";
  color: string;       // clave semántica (igual que CATEGORIAS_IMP.color)
  colorMapa: string;   // hex para marcadores y leyenda
};

/* -------------------------------------------------------------------------- */
/*                           TIPOS COMPARTIDOS                                */
/* -------------------------------------------------------------------------- */

export type PnL = {
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
};

export type Alerta = {
  id: number;
  fecha: string;
  estacionId: string;
  estacionNombre: string;
  tipo: string;
  subIndice: string;                // ahora contiene códigos del nuevo modelo (FDS-A, EVH-A, ...)
  severidad: "ALTA" | "MEDIA" | "INFO";
  disparador: string;
  descripcion: string;
  accion: string;
  responsable: string;
};

/* -------------------------------------------------------------------------- */
/*                  TIPOS LEGACY (mantener para compatibilidad)               */
/*  Otros componentes (StationsTable, NetworkMap, IMPDistribution, cockpit,   */
/*  comparar) leen estos campos. Se mantienen poblados con datos derivados    */
/*  del nuevo modelo para no romper la build.                                 */
/* -------------------------------------------------------------------------- */

export type CategoriaIMP = {
  rango: [number, number];
  nombre: string;
  recomendacion: string;
  color: string;
  colorMapa: string;
};

export type SubDimension = {
  codigo: string;
  nombre: string;
  peso: number;
  score: number;
};

export type SubIndice = {
  codigo: "SEI" | "OAI" | "CTI" | "RPC" | "FCC";
  nombre: string;
  descripcion: string;
  peso: number;
  score: number;
  subdimensiones: SubDimension[];
};

export type SubIndices = {
  SEI: SubIndice;
  OAI: SubIndice;
  CTI: SubIndice;
  RPC: SubIndice;
  FCC: SubIndice;
};

export type RankingIMP = {
  posicion: number;
  estacionId: string;
  sei: number;
  oai: number;
  cti: number;
  rpc: number;
  fcc: number;
  imp: number;
  recomendacion: string;
  categoria: string;
};

/* -------------------------------------------------------------------------- */
/*                          ESTACIÓN COMPLETA                                 */
/* -------------------------------------------------------------------------- */

export type EstacionCompleta = {
  // Identificación
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
  perfil: string;

  // Nuevo modelo (V2)
  scores: ScoresEstacion;
  arquetipo: ArquetipoCode;

  // P&L (sin cambios)
  pnl: PnL;

  // Alertas (estructura sin cambios, códigos nuevos en subIndice)
  alertas: Alerta[];

  // Legacy — derivados del nuevo modelo para no romper componentes existentes
  ranking: RankingIMP;
  subIndices: SubIndices;
};
