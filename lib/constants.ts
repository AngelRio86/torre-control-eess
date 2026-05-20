// lib/constants.ts
// Torre de Control EESS — Fuente única de datos (modelo V2).
//
// MODELO V2: 6 scores independientes por estación, sin índice maestro.
//   FDS · Defensa Combustible          (Fuel Defense)
//   EVH · Potencial Hub EV             (EV Hub Potential)
//   CRT · Conveniencia y Retail        (Convenience Retail)
//   FLT · Flotas y B2B                 (Fleet & Commercial)
//   REO · Opcionalidad Inmobiliaria    (Real Estate Optionality)
//   CMT · Foso Competitivo             (Competitive Moat)
//
// Cada estación se clasifica en un ARQUETIPO de cartera (Multi-Highway, Urban
// Convenience, Fleet & Commercial, Convenience Local, Corridor Multi-Energy,
// Controlled Decline) con su recomendación de inversión asociada.

import type {
  Alerta,
  Arquetipo,
  ArquetipoCode,
  CategoriaIMP,
  EstacionCompleta,
  RankingIMP,
  Score,
  ScoreCode,
  ScoresEstacion,
  SubDimension,
  SubIndice,
  SubIndices,
} from "./types";

/* -------------------------------------------------------------------------- */
/*                          6 SCORES — METADATA                               */
/* -------------------------------------------------------------------------- */

export const SCORE_CODES: ScoreCode[] = ["FDS", "EVH", "CRT", "FLT", "REO", "CMT"];

export const NOMBRES_SCORES: Record<ScoreCode, string> = {
  FDS: "Defensa Combustible",
  EVH: "Potencial Hub EV",
  CRT: "Conveniencia y Retail",
  FLT: "Flotas y B2B",
  REO: "Opcionalidad Inmobiliaria",
  CMT: "Foso Competitivo",
};

export const NOMBRES_SCORES_EN: Record<ScoreCode, string> = {
  FDS: "Fuel Defense",
  EVH: "EV Hub Potential",
  CRT: "Convenience Retail",
  FLT: "Fleet & Commercial",
  REO: "Real Estate Optionality",
  CMT: "Competitive Moat",
};

export const DESCRIPCION_SCORES: Record<ScoreCode, string> = {
  FDS: "Capacidad para defender margen y volumen de combustible frente a low-cost, EV y ZBE.",
  EVH: "Potencial como hub de recarga eléctrica por ubicación, capacidad y demanda EV.",
  CRT: "Oportunidad de conveniencia y retail: tienda, food-service, lockers, drive-thru.",
  FLT: "Demanda B2B y flotas: diésel profesional, e-truck, servicios para profesionales.",
  REO: "Valor del suelo como activo inmobiliario alternativo al uso EESS actual.",
  CMT: "Sostenibilidad del posicionamiento frente a la competencia local en 3-5 años.",
};

/* -------------------------------------------------------------------------- */
/*                       ARQUETIPOS DE PORTFOLIO                              */
/* -------------------------------------------------------------------------- */

export const ARQUETIPOS: Record<ArquetipoCode, Arquetipo> = {
  MULTI_HIGHWAY: {
    codigo: "MULTI_HIGHWAY",
    nombre: "Multi-Energy Highway Hub",
    descripcion: "Hub de corredor con capacidad para ser flagship multi-energía.",
    scoresClave: ["FDS", "EVH", "FLT"],
    recomendacion: "Pilotar flagship · HPC + restauración + servicios B2B premium",
    inversion: "alta",
    color: "estrella",
    colorMapa: "#1f7a4d",
  },
  URBAN_CONVENIENCE: {
    codigo: "URBAN_CONVENIENCE",
    nombre: "Urban Convenience + Destination Charging",
    descripcion: "Estación urbana premium con cliente cautivo y valor inmobiliario alto.",
    scoresClave: ["CRT", "EVH", "REO"],
    recomendacion: "Defender margen premium · HPC selectivo · Opción inmobiliaria 5-7 años",
    inversion: "media",
    color: "solida",
    colorMapa: "#2faa66",
  },
  FLEET_COMMERCIAL: {
    codigo: "FLEET_COMMERCIAL",
    nombre: "Fleet & Commercial Hub",
    descripcion: "Activo dominante en B2B con potencial e-truck.",
    scoresClave: ["FLT", "FDS"],
    recomendacion: "Reforzar paquete B2B · Pilotar HPC e-truck · Servicios profesionales",
    inversion: "media",
    color: "solida",
    colorMapa: "#3fa17a",
  },
  CONVENIENCE_LOCAL: {
    codigo: "CONVENIENCE_LOCAL",
    nombre: "Convenience-Led Local Site",
    descripcion: "Estación local con propuesta de conveniencia / integración retail.",
    scoresClave: ["CRT", "CMT"],
    recomendacion: "Profundizar integración retail · Click & Collect · Promociones cruzadas",
    inversion: "baja",
    color: "estable",
    colorMapa: "#d9a23a",
  },
  CORRIDOR_MULTI: {
    codigo: "CORRIDOR_MULTI",
    nombre: "Corridor Multi-Energy Site",
    descripcion: "Estación de paso con tráfico de corredor y mezcla particular / profesional.",
    scoresClave: ["FDS", "EVH"],
    recomendacion: "Reforzar food-on-the-go · HPC 1-2 puntos · Drive-thru selectivo",
    inversion: "media",
    color: "estable",
    colorMapa: "#e0b85a",
  },
  CONTROLLED_DECLINE: {
    codigo: "CONTROLLED_DECLINE",
    nombre: "Controlled Decline & Land Recovery",
    descripcion: "Activo en deterioro estructural. El valor real está en la opción inmobiliaria.",
    scoresClave: ["REO"],
    recomendacion: "Plan de cierre programado · Tasación inmobiliaria · Cambio de uso",
    inversion: "desinversion",
    color: "critica",
    colorMapa: "#c14454",
  },
};

export const ARQUETIPOS_LIST: Arquetipo[] = Object.values(ARQUETIPOS);

export function getArquetipo(codigo: ArquetipoCode): Arquetipo {
  return ARQUETIPOS[codigo];
}

/* -------------------------------------------------------------------------- */
/*       BACK-COMPAT — alias de categorías (CATEGORIAS_IMP) y pesos           */
/*  Mantener para no romper componentes legacy que las importen.              */
/* -------------------------------------------------------------------------- */

export const PESOS_IMP = {
  SEI: 0.30, OAI: 0.20, CTI: 0.25, RPC: 0.10, FCC: 0.15,
} as const;

export const NOMBRES_INDICES = NOMBRES_SCORES;       // alias amistoso
export const DESCRIPCION_INDICES = DESCRIPCION_SCORES;

export const CATEGORIAS_IMP: CategoriaIMP[] = ARQUETIPOS_LIST.map((a) => ({
  rango: [0, 100],
  nombre: a.nombre,
  recomendacion: a.recomendacion,
  color: a.color,
  colorMapa: a.colorMapa,
}));

export function categoriaPorIMP(_imp: number): CategoriaIMP {
  return CATEGORIAS_IMP[0];
}

/* -------------------------------------------------------------------------- */
/*                       UNIVERSO DE ESTACIONES                               */
/* -------------------------------------------------------------------------- */

type EstacionBase = Omit<
  EstacionCompleta,
  "scores" | "arquetipo" | "pnl" | "alertas" | "ranking" | "subIndices"
>;

const universo: EstacionBase[] = [
  { id: "EESS-001", nombre: "Sestao - La Paz",            marca: "Petronor-Repsol", modeloOperacion: "Franquicia (Gasolinera Sestao SL)", direccion: "Cl Grupo La Paz, 1 (BI-3739 km 4,7)", municipio: "Sestao",            provincia: "Bizkaia", cp: "48910", latitud: 43.3128987, longitud: -3.0103638, tipologia: "Urbana de proximidad",         horario: "06:00-23:00", anyoApertura: 1998, ultimaReforma: 2014, protagonista: true, perfil: "low-cost-urbana" },
  { id: "EESS-002", nombre: "Sestao - Kareaga (Eroski)",  marca: "Eroski",          modeloOperacion: "Cadena distribución",                direccion: "Calle Kareaga, 40",                  municipio: "Sestao",            provincia: "Bizkaia", cp: "48910", latitud: 43.3162,    longitud: -3.0028,    tipologia: "Low-cost urbana",                horario: "06:30-22:00", anyoApertura: 2005, ultimaReforma: 2019, perfil: "low-cost-urbana" },
  { id: "EESS-003", nombre: "Bilbao - Ercilla",           marca: "Repsol",          modeloOperacion: "Repsol DO (operación directa)",      direccion: "Calle Ercilla, 27",                  municipio: "Bilbao",            provincia: "Bizkaia", cp: "48010", latitud: 43.2613,    longitud: -2.9358,    tipologia: "Urbana premium",                 horario: "24h",          anyoApertura: 1987, ultimaReforma: 2021, perfil: "premium-urbana" },
  { id: "EESS-004", nombre: "Valle de Trápaga - Aparkabisa", marca: "Petronor",     modeloOperacion: "Franquicia",                         direccion: "Pol. Ind. Aparkabisa, El Juncal",    municipio: "Valle de Trápaga",  provincia: "Bizkaia", cp: "48510", latitud: 43.2935,    longitud: -3.0301,    tipologia: "Polígono / industrial",          horario: "05:00-23:00", anyoApertura: 2001, ultimaReforma: 2018, perfil: "poligono-b2b" },
  { id: "EESS-005", nombre: "Barakaldo - Cruces N-634",   marca: "Repsol",          modeloOperacion: "Franquicia",                         direccion: "N-634 km 116",                       municipio: "Barakaldo",         provincia: "Bizkaia", cp: "48903", latitud: 43.2871,    longitud: -2.9852,    tipologia: "Corredor / paso",                horario: "24h",          anyoApertura: 1995, ultimaReforma: 2016, perfil: "corredor-24h" },
  { id: "EESS-006", nombre: "Getxo - Algorta",            marca: "Repsol",          modeloOperacion: "Repsol DO",                          direccion: "Avenida Basagoiti, 75",              municipio: "Getxo",             provincia: "Bizkaia", cp: "48991", latitud: 43.3543,    longitud: -3.0148,    tipologia: "Urbana premium residencial",     horario: "06:00-23:00", anyoApertura: 1992, ultimaReforma: 2022, perfil: "premium-urbana" },
  { id: "EESS-007", nombre: "Erandio - A-8 Hub",          marca: "Petronor",        modeloOperacion: "Repsol DO",                          direccion: "AP-8 km 122 (área servicio)",        municipio: "Erandio",           provincia: "Bizkaia", cp: "48950", latitud: 43.3041,    longitud: -2.9758,    tipologia: "Hub multiservicio",              horario: "24h",          anyoApertura: 2009, ultimaReforma: 2023, perfil: "corredor-24h" },
  { id: "EESS-008", nombre: "Bilbao - Rekalde",           marca: "Repsol",          modeloOperacion: "Franquicia",                         direccion: "Calle Camilo Villabaso, 18",         municipio: "Bilbao",            provincia: "Bizkaia", cp: "48012", latitud: 43.2502,    longitud: -2.9412,    tipologia: "Vulnerable / ZBE",               horario: "07:00-22:00", anyoApertura: 1979, ultimaReforma: 2008, perfil: "critica" },
];

/* -------------------------------------------------------------------------- */
/*       VALORES SINTÉTICOS DE LOS 6 SCORES (índice = posición en universo)   */
/* -------------------------------------------------------------------------- */
/*
 * Calibrados a partir del perfil de cada estación:
 *   EESS-001 Sestao La Paz   — Vulnerable: low-cost cerca, ZBE 500m, 46 años
 *   EESS-002 Kareaga Eroski  — Low-cost integrada con super
 *   EESS-003 Bilbao Ercilla  — Premium urbana 24h, suelo de alto valor
 *   EESS-004 Aparkabisa      — Polígono / B2B dominante
 *   EESS-005 Cruces N-634    — Corredor 24h, one-shot alto
 *   EESS-006 Getxo Algorta   — Premium residencial, reformada 2022
 *   EESS-007 Erandio A-8     — ★ Flagship A-8, hub multiservicio
 *   EESS-008 Bilbao Rekalde  — Crítica: ZBE incoming, uptime roto
 */

const scoresValores: Record<ScoreCode, number[]> = {
  // pos:  001   002   003   004   005   006   007   008
  FDS:    [32.0, 42.0, 55.0, 72.0, 68.0, 65.0, 88.0, 18.0],
  EVH:    [28.0, 30.0, 62.0, 55.0, 60.0, 70.0, 85.0, 22.0],
  CRT:    [42.0, 75.0, 52.0, 42.0, 50.0, 58.0, 78.0, 28.0],
  FLT:    [18.0, 22.0, 25.0, 82.0, 52.0, 28.0, 82.0, 15.0],
  REO:    [48.0, 38.0, 85.0, 35.0, 45.0, 82.0, 52.0, 62.0],
  CMT:    [25.0, 52.0, 58.0, 65.0, 48.0, 72.0, 80.0, 20.0],
};

const arquetipoPorEstacion: ArquetipoCode[] = [
  "CONTROLLED_DECLINE",  // EESS-001
  "CONVENIENCE_LOCAL",   // EESS-002
  "URBAN_CONVENIENCE",   // EESS-003
  "FLEET_COMMERCIAL",    // EESS-004
  "CORRIDOR_MULTI",      // EESS-005
  "URBAN_CONVENIENCE",   // EESS-006
  "MULTI_HIGHWAY",       // EESS-007
  "CONTROLLED_DECLINE",  // EESS-008
];

/* -------------------------------------------------------------------------- */
/*                           P&L (de SEI-D, sin cambios)                      */
/* -------------------------------------------------------------------------- */

const pnlPorEstacion = [
  { volumenFuelTotal: 3168000, beneficioBrutoFuel: 265465,  ventasTotalTienda:  350000, ingresosServicios:  62500, beneficioBrutoTotal:  432265, opexTotal:  480000, ebitda:  -47735, margenEbitda: -0.1104, activoNeto:  780000, superficieParcela:  980, roic: -0.0612, ebitdaPorM2:  -48.71 },
  { volumenFuelTotal: 4250000, beneficioBrutoFuel: 263740,  ventasTotalTienda:  155000, ingresosServicios:   3600, beneficioBrutoTotal:  308415, opexTotal:  248000, ebitda:   60415, margenEbitda:  0.1959, activoNeto:  420000, superficieParcela:  850, roic:  0.1438, ebitdaPorM2:   71.08 },
  { volumenFuelTotal: 4367000, beneficioBrutoFuel: 442385,  ventasTotalTienda:  561000, ingresosServicios: 177000, beneficioBrutoTotal:  811247, opexTotal:  810000, ebitda:    1247, margenEbitda:  0.0015, activoNeto: 1650000, superficieParcela: 1250, roic:  0.0008, ebitdaPorM2:    1.00 },
  { volumenFuelTotal: 4910000, beneficioBrutoFuel: 448255,  ventasTotalTienda:  301000, ingresosServicios:  71800, beneficioBrutoTotal:  602830, opexTotal:  427000, ebitda:  175830, margenEbitda:  0.2917, activoNeto:  920000, superficieParcela: 1680, roic:  0.1911, ebitdaPorM2:  104.66 },
  { volumenFuelTotal: 6730000, beneficioBrutoFuel: 507165,  ventasTotalTienda:  726000, ingresosServicios: 164200, beneficioBrutoTotal:  880453, opexTotal:  617000, ebitda:  263453, margenEbitda:  0.2992, activoNeto: 1180000, superficieParcela: 1850, roic:  0.2233, ebitdaPorM2:  142.41 },
  { volumenFuelTotal: 3770000, beneficioBrutoFuel: 394395,  ventasTotalTienda:  654000, ingresosServicios: 147000, beneficioBrutoTotal:  775527, opexTotal:  653000, ebitda:  122527, margenEbitda:  0.158,  activoNeto: 1850000, superficieParcela: 1420, roic:  0.0662, ebitdaPorM2:   86.29 },
  { volumenFuelTotal:10300000, beneficioBrutoFuel: 923180,  ventasTotalTienda: 1162000, ingresosServicios: 434500, beneficioBrutoTotal: 1723710, opexTotal: 1203000, ebitda:  520710, margenEbitda:  0.3021, activoNeto: 3850000, superficieParcela: 3850, roic:  0.1352, ebitdaPorM2:  135.25 },
  { volumenFuelTotal: 1888000, beneficioBrutoFuel: 164995,  ventasTotalTienda:  212000, ingresosServicios:  29200, beneficioBrutoTotal:  253131, opexTotal:  408000, ebitda: -154869, margenEbitda: -0.6118, activoNeto:  580000, superficieParcela:  750, roic: -0.267,  ebitdaPorM2: -206.49 },
];

/* -------------------------------------------------------------------------- */
/*       ALERTAS ACTIVAS — recodificadas al nuevo framework de 6 scores       */
/* -------------------------------------------------------------------------- */

export const ALERTAS: Alerta[] = [
  { id: 1,  fecha: "2026-05-08", estacionId: "EESS-001", estacionNombre: "Sestao - La Paz",
    tipo: "Caída de volumen", subIndice: "FDS-A", severidad: "ALTA",
    disparador: "Vol. mensual 95 < -10% YoY (mes 3 consecutivo)",
    descripcion: "Volumen G95 acumulado -6,2% YoY. Sospecha de pérdida ante low-cost cercanos (Carrefour 200m, Eroski 1,1km, Euskadi Low Cost 1,5km).",
    accion: "Activar precio dinámico semanal · Lanzar cupón Waylet x3 para clientes G95 · Reunión gestor zona en 7 días",
    responsable: "Director comercial · Gestor zona" },

  { id: 2,  fecha: "2026-05-05", estacionId: "EESS-001", estacionNombre: "Sestao - La Paz",
    tipo: "Nuevo competidor", subIndice: "CMT-A", severidad: "ALTA",
    disparador: "Apertura competidor en radio <500m",
    descripcion: "Apertura de Plenoil low-cost a 380m (febrero 2026). Riesgo de erosión adicional de cuota local.",
    accion: "Estudio shock-test cuota 3-6-12m · Acelerar decisión de reconversión a hub urbano · Evaluar reducción mangueras 6→4",
    responsable: "Director comercial · Inteligencia mercado" },

  { id: 3,  fecha: "2026-05-01", estacionId: "EESS-001", estacionNombre: "Sestao - La Paz",
    tipo: "Deterioro reputacional", subIndice: "CRT-A", severidad: "MEDIA",
    disparador: "Rating Google ↓ -0,15 pts en 6 meses",
    descripcion: "Caída a 3,8 estrellas (-0,15). Quejas crecientes sobre tiempo de espera (caja) y limpieza de aseos.",
    accion: "Protocolo limpieza aseos cada 90 min · Segunda caja en horas pico · Plan respuesta a reviews <24h",
    responsable: "Gestor estación · Operaciones" },

  { id: 4,  fecha: "2026-04-22", estacionId: "EESS-001", estacionNombre: "Sestao - La Paz",
    tipo: "Alerta de fidelización", subIndice: "CRT-B", severidad: "MEDIA",
    disparador: "Tasa churn 32,5% (umbral red: 25%)",
    descripcion: "Pérdida acelerada de clientes recurrentes. Velocidad de fuga 6,5 meses post-último ticket. Investigar promociones de competencia.",
    accion: "Campaña reactivación Waylet dirigida a 220 clientes en churn · Cupón doble puntos 30 días",
    responsable: "Marketing · Programa Waylet" },

  { id: 5,  fecha: "2026-05-09", estacionId: "EESS-008", estacionNombre: "Bilbao - Rekalde",
    tipo: "Caída de volumen", subIndice: "FDS-A", severidad: "ALTA",
    disparador: "Vol. mensual < -10% YoY (mes 4 consecutivo)",
    descripcion: "Caída sostenida 9,2% YoY combustibles. Probable efecto ZBE Bilbao (perímetro a 500m) + envejecimiento de la estación (46 años).",
    accion: "Activar plan de cierre programado (12m) · Comité de portfolio · Iniciar tasación inmobiliaria",
    responsable: "Comité de portfolio" },

  { id: 6,  fecha: "2026-05-07", estacionId: "EESS-008", estacionNombre: "Bilbao - Rekalde",
    tipo: "Pérdida de disponibilidad", subIndice: "FDS-C", severidad: "MEDIA",
    disparador: "Uptime surtidores 92,8% (umbral: 97%)",
    descripcion: "68 incidencias/año (4× media red). Tiempo medio resolución 28h. Recomendado plan urgente de mantenimiento o evaluar cierre.",
    accion: "Mantener mínimos servicio hasta cierre programado · No nuevas inversiones · Plan de baja gradual surtidores",
    responsable: "Mantenimiento · Operaciones" },

  { id: 7,  fecha: "2026-04-15", estacionId: "EESS-008", estacionNombre: "Bilbao - Rekalde",
    tipo: "Alerta regulatoria", subIndice: "REO-A", severidad: "ALTA",
    disparador: "Ampliación ZBE Bilbao prevista 2026",
    descripcion: "El Ayuntamiento ha anunciado fase 2 ZBE incluyendo Rekalde. Impacto severo en tráfico esperado. Evaluar cambio de uso del suelo.",
    accion: "Iniciar conversaciones con Ayuntamiento sobre usos alternativos · Tasación con 3 escenarios (residencial/logística/mixto)",
    responsable: "Director estrategia · Asuntos públicos" },

  { id: 8,  fecha: "2026-04-28", estacionId: "EESS-002", estacionNombre: "Sestao - Kareaga (Eroski)",
    tipo: "Erosión de margen", subIndice: "FDS-B", severidad: "MEDIA",
    disparador: "Margen blended ↓ -120 bps trimestre",
    descripcion: "Guerra de precios local. Eroski responde a aperturas low-cost con descuentos adicionales. Comprometida rentabilidad.",
    accion: "Renegociar política comercial conjunta con Eroski · Lanzar Click & Collect Eroski para sostener tráfico",
    responsable: "Director comercial" },

  { id: 9,  fecha: "2026-05-06", estacionId: "EESS-003", estacionNombre: "Bilbao - Ercilla",
    tipo: "Señal de transición", subIndice: "EVH-A", severidad: "MEDIA",
    disparador: "Apertura recarga rápida competidor <1km",
    descripcion: "Iberdrola ha abierto 4×150kW a 850m. Necesidad de evaluar upgrade de los 350kW propios y posibles partnerships.",
    accion: "Solicitar 3 propuestas a Iberdrola/Powerdot/Zunder · Decisión recarga 350kW en 60 días",
    responsable: "Director estrategia · Energía" },

  { id: 10, fecha: "2026-04-30", estacionId: "EESS-005", estacionNombre: "Barakaldo - Cruces N-634",
    tipo: "Conversión retail baja", subIndice: "CRT-C", severidad: "MEDIA",
    disparador: "% one-shot 58% (vs media red 40%)",
    descripcion: "Estación de corredor muy estresada por clientes de paso. Baja conversión a tienda (23,5%). Oportunidad de revisar oferta food.",
    accion: "Pilotar drive-thru café (Costa/Starbucks) · Mercadona RTE estand · Cupón cena para llevar",
    responsable: "Marketing · Retail" },

  { id: 11, fecha: "2026-05-04", estacionId: "EESS-007", estacionNombre: "Erandio - A-8 Hub",
    tipo: "Señal positiva", subIndice: "CMT-B", severidad: "INFO",
    disparador: "+185 menciones positivas en 12m (+85% YoY)",
    descripcion: "Crecimiento muy positivo de notoriedad. Confirmar como flagship y considerar amplificación en marketing de marca.",
    accion: "Amplificar en marketing de marca · Documentar mejores prácticas para replicar al resto de red",
    responsable: "Marketing · Comunicación" },

  { id: 12, fecha: "2026-04-18", estacionId: "EESS-004", estacionNombre: "Valle de Trápaga - Aparkabisa",
    tipo: "Cambio en tráfico B2B", subIndice: "FLT-A", severidad: "MEDIA",
    disparador: "IMD industrial -18% últimos 6m (datos DGT)",
    descripcion: "Caída de actividad en el polígono Aparkabisa. Posible efecto cierre de 2 empresas medianas (Q4-25). Evaluar B2B alternativo.",
    accion: "Equipo B2B sustituye 2 cuentas perdidas en 90 días · Lanzar paquete trucker (ducha + microondas + Solred)",
    responsable: "Director comercial · B2B" },

  { id: 13, fecha: "2026-05-03", estacionId: "EESS-006", estacionNombre: "Getxo - Algorta",
    tipo: "Señal positiva", subIndice: "CRT-D", severidad: "INFO",
    disparador: "Rating Google +0,15 pts en 6 meses",
    descripcion: "Mejora reputacional notable tras reforma 2022. Posicionamiento premium consolidado. Validar como referencia interna de UX retail.",
    accion: "Documentar protocolos · Sesión de aprendizaje con resto gestores · Validar para piloto Waylet Gold",
    responsable: "Marketing · Operaciones" },
];

/* -------------------------------------------------------------------------- */
/*                  ENSAMBLADO: ESTACIONES COMPLETAS                          */
/* -------------------------------------------------------------------------- */

function buildScores(idx: number): ScoresEstacion {
  const mk = (codigo: ScoreCode): Score => ({
    codigo,
    nombre: NOMBRES_SCORES[codigo],
    nombreEN: NOMBRES_SCORES_EN[codigo],
    descripcion: DESCRIPCION_SCORES[codigo],
    score: scoresValores[codigo][idx],
  });
  return {
    FDS: mk("FDS"),
    EVH: mk("EVH"),
    CRT: mk("CRT"),
    FLT: mk("FLT"),
    REO: mk("REO"),
    CMT: mk("CMT"),
  };
}

// Posición de ranking — basada en promedio de los 6 scores (solo para ordenación visual)
function scoreAvg(idx: number): number {
  return SCORE_CODES.reduce((s, c) => s + scoresValores[c][idx], 0) / 6;
}

const ordenPorScoreAvg: number[] = universo
  .map((_, i) => ({ i, avg: scoreAvg(i) }))
  .sort((a, b) => b.avg - a.avg)
  .map((x) => x.i);

const posicionPorIdx: Record<number, number> = {};
ordenPorScoreAvg.forEach((i, rank) => {
  posicionPorIdx[i] = rank + 1;
});

// Legacy: poblamos subIndices con los 5 primeros scores (FDS→SEI, EVH→OAI,
// CRT→CTI, FLT→RPC, REO→FCC). El 6º (CMT) sólo vive en `scores`.
// Esto evita que componentes legacy se rompan; los valores que muestren
// reflejarán el nuevo modelo aunque las claves antiguas persistan.
const LEGACY_MAP: Array<[keyof SubIndices, ScoreCode]> = [
  ["SEI", "FDS"],
  ["OAI", "EVH"],
  ["CTI", "CRT"],
  ["RPC", "FLT"],
  ["FCC", "REO"],
];

function buildLegacySubIndices(scores: ScoresEstacion): SubIndices {
  const empty: SubDimension[] = [];
  const out = {} as SubIndices;
  for (const [legacyKey, scoreCode] of LEGACY_MAP) {
    const s = scores[scoreCode];
    const sub: SubIndice = {
      codigo: legacyKey,
      nombre: s.nombre,
      descripcion: s.descripcion,
      peso: PESOS_IMP[legacyKey],
      score: s.score,
      subdimensiones: empty,
    };
    out[legacyKey] = sub;
  }
  return out;
}

function buildEstacionCompleta(idx: number): EstacionCompleta {
  const base = universo[idx];
  const scores = buildScores(idx);
  const arquetipoCode = arquetipoPorEstacion[idx];
  const arquetipo = ARQUETIPOS[arquetipoCode];
  const subIndices = buildLegacySubIndices(scores);
  const avg = scoreAvg(idx);

  const ranking: RankingIMP = {
    posicion: posicionPorIdx[idx],
    estacionId: base.id,
    sei: scores.FDS.score,
    oai: scores.EVH.score,
    cti: scores.CRT.score,
    rpc: scores.FLT.score,
    fcc: scores.REO.score,
    imp: Math.round(avg * 10) / 10,
    recomendacion: arquetipo.recomendacion,
    categoria: arquetipo.nombre,
  };

  return {
    ...base,
    scores,
    arquetipo: arquetipoCode,
    pnl: pnlPorEstacion[idx],
    alertas: ALERTAS.filter((a) => a.estacionId === base.id),
    ranking,
    subIndices,
  };
}

export const ESTACIONES: EstacionCompleta[] = universo.map((_, i) =>
  buildEstacionCompleta(i)
);

/* -------------------------------------------------------------------------- */
/*                          HELPERS DERIVADOS                                 */
/* -------------------------------------------------------------------------- */

export function getEstacion(id: string): EstacionCompleta | undefined {
  return ESTACIONES.find((e) => e.id === id);
}

export function getRankingOrdenado(): EstacionCompleta[] {
  return [...ESTACIONES].sort((a, b) => a.ranking.posicion - b.ranking.posicion);
}

export type ResumenRed = {
  total: number;
  arquetiposUnicos: number;
  ebitdaTotal: number;
  alertasAltas: number;
  alertasMedias: number;
  alertasInfo: number;
  alertasTotal: number;
  // Nuevo modelo
  scoresPromedio: Record<ScoreCode, number>;
  porArquetipo: {
    arquetipo: Arquetipo;
    count: number;
    estaciones: EstacionCompleta[];
  }[];
  // Legacy (componentes que aún lo lean)
  impMedio: number;
  porCategoria: { categoria: string; count: number; color: string }[];
};

export function getResumenRed(): ResumenRed {
  const total = ESTACIONES.length;

  const scoresPromedio = {} as Record<ScoreCode, number>;
  for (const code of SCORE_CODES) {
    scoresPromedio[code] =
      Math.round(
        (ESTACIONES.reduce((s, e) => s + e.scores[code].score, 0) / total) * 10
      ) / 10;
  }

  const ebitdaTotal = ESTACIONES.reduce((s, e) => s + e.pnl.ebitda, 0);
  const alertasAltas = ALERTAS.filter((a) => a.severidad === "ALTA").length;
  const alertasMedias = ALERTAS.filter((a) => a.severidad === "MEDIA").length;
  const alertasInfo = ALERTAS.filter((a) => a.severidad === "INFO").length;

  // Distribución por arquetipo
  const porArquetipo = ARQUETIPOS_LIST
    .map((arq) => {
      const stations = ESTACIONES.filter((e) => e.arquetipo === arq.codigo);
      return { arquetipo: arq, count: stations.length, estaciones: stations };
    })
    .filter((r) => r.count > 0);

  const arquetiposUnicos = porArquetipo.length;

  // Legacy
  const impMedio =
    Math.round(
      (ESTACIONES.reduce((s, e) => s + e.ranking.imp, 0) / total) * 10
    ) / 10;
  const porCategoria = ARQUETIPOS_LIST.map((arq) => ({
    categoria: arq.nombre,
    count: ESTACIONES.filter((e) => e.arquetipo === arq.codigo).length,
    color: arq.colorMapa,
  }));

  return {
    total,
    arquetiposUnicos,
    ebitdaTotal,
    alertasAltas,
    alertasMedias,
    alertasInfo,
    alertasTotal: ALERTAS.length,
    scoresPromedio,
    porArquetipo,
    impMedio,
    porCategoria,
  };
}

export const ALERTAS_ORDENADAS = [...ALERTAS].sort((a, b) => {
  const orden: Record<string, number> = { ALTA: 0, MEDIA: 1, INFO: 2 };
  if (orden[a.severidad] !== orden[b.severidad]) {
    return orden[a.severidad] - orden[b.severidad];
  }
  return b.fecha.localeCompare(a.fecha);
});
