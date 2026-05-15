// Torre de Control EESS — Fuente única de datos
// Mapeado directamente desde Torre_de_Control_EESS_BBDD.xlsx
//
// Estructura del IMP (Índice Maestro de Priorización):
//   IMP = SEI × 30% + OAI × 20% + CTI × 25% + RPC × 10% + FCC × 15%

import type {
  Alerta,
  CategoriaIMP,
  EstacionCompleta,
  RankingIMP,
} from "./types";

/* -------------------------------------------------------------------------- */
/*                       PESOS Y CATEGORÍAS DEL IMP                           */
/* -------------------------------------------------------------------------- */

export const PESOS_IMP = {
  SEI: 0.30,
  OAI: 0.20,
  CTI: 0.25,
  RPC: 0.10,
  FCC: 0.15,
} as const;

export const NOMBRES_INDICES = {
  SEI: "Salud Económica",
  OAI: "Operación y Activo",
  CTI: "Contexto y Transición",
  RPC: "Reputación y Percepción",
  FCC: "Fidelización",
} as const;

export const DESCRIPCION_INDICES = {
  SEI: "Rendimiento económico actual y resiliencia operativa.",
  OAI: "Estado físico del activo, capacidad, eficiencia y gestión de personal.",
  CTI: "Tráfico, entorno, competencia, transición energética y marco regulatorio.",
  RPC: "Valoración digital, sentimiento, menciones y mystery shopper.",
  FCC: "Base de clientes Waylet, recurrencia, valor y atracción/fuga.",
} as const;

export const CATEGORIAS_IMP: CategoriaIMP[] = [
  {
    rango: [80, 100],
    nombre: "★ Estrella",
    recomendacion: "Proteger · Blindar contra competencia · Pilotar nuevos formatos",
    color: "estrella",
    colorMapa: "#1f7a4d",
  },
  {
    rango: [65, 79],
    nombre: "Sólida",
    recomendacion: "Mantener inversión continua · Optimización selectiva",
    color: "solida",
    colorMapa: "#2faa66",
  },
  {
    rango: [50, 64],
    nombre: "Estable con riesgos",
    recomendacion:
      "Plan de mejora dirigido al sub-índice más débil · Revisión trimestral",
    color: "estable",
    colorMapa: "#d9a23a",
  },
  {
    rango: [35, 49],
    nombre: "Vulnerable",
    recomendacion:
      "Decisión activa: reconversión, reposicionamiento o desinversión",
    color: "vulnerable",
    colorMapa: "#e07a3b",
  },
  {
    rango: [0, 34],
    nombre: "Crítica",
    recomendacion: "Candidata a cierre · Venta de suelo · Cambio radical de uso",
    color: "critica",
    colorMapa: "#c14454",
  },
];

export function categoriaPorIMP(imp: number): CategoriaIMP {
  return (
    CATEGORIAS_IMP.find((c) => imp >= c.rango[0] && imp <= c.rango[1]) ??
    CATEGORIAS_IMP[CATEGORIAS_IMP.length - 1]
  );
}

/* -------------------------------------------------------------------------- */
/*                        UNIVERSO DE ESTACIONES                              */
/* -------------------------------------------------------------------------- */

const universo: Omit<EstacionCompleta, "ranking" | "subIndices" | "pnl" | "alertas">[] = [
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
/*           SCORES POR SUB-ÍNDICE (TOTAL + DESGLOSE POR SUB-DIMENSIÓN)       */
/* -------------------------------------------------------------------------- */

const scoresPorEstacion = [
  {
    indice: "SEI" as const,
    subdims: [
      { codigo: "A", nombre: "Combustible",                  peso: 0.40, valores: [46.2, 46.2, 64.2, 62.4, 60.1, 64.1, 86.9, 36.9] },
      { codigo: "B", nombre: "Tienda y conveniencia",        peso: 0.25, valores: [59.6, 42.4, 79.4, 55.3, 73.9, 86.1, 92.9, 48.6] },
      { codigo: "C", nombre: "Servicios complementarios",    peso: 0.15, valores: [27.2,  7.2, 49.7, 27.3, 46.2, 40.8, 100,  21.2] },
      { codigo: "D", nombre: "Rentabilidad y eficiencia",    peso: 0.20, valores: [ 0,    42,   0.4, 66.4, 80,   36,   89.6,  0  ] },
    ],
    total: [37.5, 38.6, 53.1, 56.2, 65.4, 60.5, 90.9, 30.1],
  },
  {
    indice: "OAI" as const,
    subdims: [
      { codigo: "A", nombre: "Estado físico",                peso: 0.35, valores: [52.4, 77.7, 89.7, 71.5, 55,   92.6, 93.5, 25.2] },
      { codigo: "B", nombre: "Capacidad operativa",          peso: 0.20, valores: [13.5, 18.7, 47.6, 33.7, 58.7, 46.2, 100,  12.7] },
      { codigo: "C", nombre: "Eficiencia operativa",         peso: 0.30, valores: [34.6, 60.7, 76.2, 51.5, 56.9, 81.7, 83.8,  3  ] },
      { codigo: "D", nombre: "Gestión de personal",          peso: 0.15, valores: [30.5, 53.4, 70.6, 46.8, 43.3, 80.2, 69.9,  9.9] },
    ],
    total: [36, 57.2, 74.4, 54.2, 54.6, 78.2, 88.4, 13.7],
  },
  {
    indice: "CTI" as const,
    subdims: [
      { codigo: "A", nombre: "Tráfico y accesibilidad",      peso: 0.25, valores: [34.3, 44,   57,   60.5, 80,   46.5, 96.3, 25.9] },
      { codigo: "B", nombre: "Sociodemografía",              peso: 0.20, valores: [38.8, 41.2, 81.5, 45.1, 50.4, 72.7, 48.2, 53  ] },
      { codigo: "C", nombre: "Competencia y posicionamiento",peso: 0.25, valores: [18.8, 73.8, 27.3, 47.6, 21.6, 59.7, 75.8, 11.7] },
      { codigo: "D", nombre: "Transición energética",        peso: 0.20, valores: [36.2, 38.5, 30,   63,   42.1,  8.7, 59.5, 28.1] },
      { codigo: "E", nombre: "Marco regulatorio",            peso: 0.10, valores: [82,   82,   45.7, 94,   86,   90,   91,   11  ] },
    ],
    total: [36.5, 53.6, 47.9, 58, 52.5, 51.8, 73.7, 26.7],
  },
  {
    indice: "RPC" as const,
    subdims: [
      { codigo: "A", nombre: "Valoración digital",           peso: 0.40, valores: [50.1, 50.3, 75.8, 51,   58.4, 70.7, 85.1, 40  ] },
      { codigo: "B", nombre: "Análisis cualitativo",         peso: 0.30, valores: [46.9, 53.9, 67,   56.4, 43.7, 75.8, 67.8, 27.5] },
      { codigo: "C", nombre: "Menciones y conversación",     peso: 0.15, valores: [58.3, 72.4, 86.6, 67,   75.3, 89.7, 86.1, 18  ] },
      { codigo: "D", nombre: "Mystery shopper / NPS",        peso: 0.15, valores: [65.6, 68.3, 82,   70.5, 63.5, 87.8, 82.6, 48.6] },
    ],
    total: [52.7, 57.4, 75.7, 57.9, 57.3, 77.6, 79.7, 34.2],
  },
  {
    indice: "FCC" as const,
    subdims: [
      { codigo: "A", nombre: "Base de clientes (Waylet)",    peso: 0.25, valores: [56.1, 42,   82.4, 62.6, 63.7, 83.2, 86.7, 41.2] },
      { codigo: "B", nombre: "Recurrencia y frecuencia",     peso: 0.30, valores: [49.9, 70.1, 62.6, 92.4, 35.4, 63,   45.1, 32  ] },
      { codigo: "C", nombre: "Valor del cliente",            peso: 0.25, valores: [42.1, 35.7, 74.3, 70,   49.6, 84.4, 74.9, 31.8] },
      { codigo: "D", nombre: "Atracción vs. fuga",           peso: 0.20, valores: [48,   68.4, 63.8, 68.8, 48.3, 66.1, 67.9, 24.7] },
    ],
    total: [49.1, 54.1, 70.7, 74.6, 48.6, 74, 67.5, 32.8],
  },
];

/* -------------------------------------------------------------------------- */
/*                            P&L (de SEI-D)                                  */
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
/*                         IMP RANKING                                        */
/* -------------------------------------------------------------------------- */

const rankingData: Omit<RankingIMP, "categoria">[] = [
  { posicion: 7, estacionId: "EESS-001", sei: 37.5, oai: 36,   cti: 36.5, rpc: 52.7, fcc: 49.1, imp: 40.2, recomendacion: "Reconversión o reposicionamiento · Decisión activa" },
  { posicion: 6, estacionId: "EESS-002", sei: 38.6, oai: 57.2, cti: 53.6, rpc: 57.4, fcc: 54.1, imp: 50.3, recomendacion: "Plan de mejora dirigido al sub-índice más débil" },
  { posicion: 3, estacionId: "EESS-003", sei: 53.1, oai: 74.4, cti: 47.9, rpc: 75.7, fcc: 70.7, imp: 61.0, recomendacion: "Plan de mejora dirigido al sub-índice más débil" },
  { posicion: 4, estacionId: "EESS-004", sei: 56.2, oai: 54.2, cti: 58.0, rpc: 57.9, fcc: 74.6, imp: 59.2, recomendacion: "Plan de mejora dirigido al sub-índice más débil" },
  { posicion: 5, estacionId: "EESS-005", sei: 65.4, oai: 54.6, cti: 52.5, rpc: 57.3, fcc: 48.6, imp: 56.7, recomendacion: "Plan de mejora dirigido al sub-índice más débil" },
  { posicion: 2, estacionId: "EESS-006", sei: 60.5, oai: 78.2, cti: 51.8, rpc: 77.6, fcc: 74.0, imp: 65.6, recomendacion: "Mantener inversión · Optimización selectiva" },
  { posicion: 1, estacionId: "EESS-007", sei: 90.9, oai: 88.4, cti: 73.7, rpc: 79.7, fcc: 67.5, imp: 81.5, recomendacion: "Proteger · Pilotar nuevos formatos" },
  { posicion: 8, estacionId: "EESS-008", sei: 30.1, oai: 13.7, cti: 26.7, rpc: 34.2, fcc: 32.8, imp: 26.8, recomendacion: "Candidata a cierre · Venta de suelo · Cambio de uso" },
];

/* -------------------------------------------------------------------------- */
/*                              ALERTAS ACTIVAS                               */
/*  V2 — añadido campo `accion` con la próxima acción concreta                */
/* -------------------------------------------------------------------------- */

export const ALERTAS: Alerta[] = [
  { id: 1,  fecha: "2026-05-08", estacionId: "EESS-001", estacionNombre: "Sestao - La Paz",
    tipo: "Caída de volumen", subIndice: "SEI-A", severidad: "ALTA",
    disparador: "Vol. mensual 95 < -10% YoY (mes 3 consecutivo)",
    descripcion: "Volumen G95 acumulado -6,2% YoY. Sospecha de pérdida ante low-cost cercanos (Carrefour 200m, Eroski 1,1km, Euskadi Low Cost 1,5km).",
    accion: "Activar precio dinámico semanal · Lanzar cupón Waylet x3 para clientes G95 · Reunión gestor zona en 7 días",
    responsable: "Director comercial · Gestor zona" },

  { id: 2,  fecha: "2026-05-05", estacionId: "EESS-001", estacionNombre: "Sestao - La Paz",
    tipo: "Nuevo competidor", subIndice: "CTI-C", severidad: "ALTA",
    disparador: "Apertura competidor en radio <500m",
    descripcion: "Apertura de Plenoil low-cost a 380m (febrero 2026). Riesgo de erosión adicional de cuota local.",
    accion: "Estudio shock-test cuota 3-6-12m · Acelerar decisión de reconversión a hub urbano · Evaluar reducción mangueras 6→4",
    responsable: "Director comercial · Inteligencia mercado" },

  { id: 3,  fecha: "2026-05-01", estacionId: "EESS-001", estacionNombre: "Sestao - La Paz",
    tipo: "Deterioro reputacional", subIndice: "RPC-A", severidad: "MEDIA",
    disparador: "Rating Google ↓ -0,15 pts en 6 meses",
    descripcion: "Caída a 3,8 estrellas (-0,15). Quejas crecientes sobre tiempo de espera (caja) y limpieza de aseos.",
    accion: "Protocolo limpieza aseos cada 90 min · Segunda caja en horas pico · Plan respuesta a reviews <24h",
    responsable: "Gestor estación · Operaciones" },

  { id: 4,  fecha: "2026-04-22", estacionId: "EESS-001", estacionNombre: "Sestao - La Paz",
    tipo: "Alerta de fidelización", subIndice: "FCC-D", severidad: "MEDIA",
    disparador: "Tasa churn 32,5% (umbral red: 25%)",
    descripcion: "Pérdida acelerada de clientes recurrentes. Velocidad de fuga 6,5 meses post-último ticket. Investigar promociones de competencia.",
    accion: "Campaña reactivación Waylet dirigida a 220 clientes en churn · Cupón doble puntos 30 días",
    responsable: "Marketing · Programa Waylet" },

  { id: 5,  fecha: "2026-05-09", estacionId: "EESS-008", estacionNombre: "Bilbao - Rekalde",
    tipo: "Caída de volumen", subIndice: "SEI-A", severidad: "ALTA",
    disparador: "Vol. mensual < -10% YoY (mes 4 consecutivo)",
    descripcion: "Caída sostenida 9,2% YoY combustibles. Probable efecto ZBE Bilbao (perímetro a 500m) + envejecimiento de la estación (46 años).",
    accion: "Activar plan de cierre programado (12m) · Comité de portfolio · Iniciar tasación inmobiliaria",
    responsable: "Comité de portfolio" },

  { id: 6,  fecha: "2026-05-07", estacionId: "EESS-008", estacionNombre: "Bilbao - Rekalde",
    tipo: "Pérdida de disponibilidad", subIndice: "OAI-C", severidad: "MEDIA",
    disparador: "Uptime surtidores 92,8% (umbral: 97%)",
    descripcion: "68 incidencias/año (4× media red). Tiempo medio resolución 28h. Recomendado plan urgente de mantenimiento o evaluar cierre.",
    accion: "Mantener mínimos servicio hasta cierre programado · No nuevas inversiones · Plan de baja gradual surtidores",
    responsable: "Mantenimiento · Operaciones" },

  { id: 7,  fecha: "2026-04-15", estacionId: "EESS-008", estacionNombre: "Bilbao - Rekalde",
    tipo: "Alerta regulatoria", subIndice: "CTI-E", severidad: "ALTA",
    disparador: "Ampliación ZBE Bilbao prevista 2026",
    descripcion: "El Ayuntamiento ha anunciado fase 2 ZBE incluyendo Rekalde. Impacto severo en tráfico esperado. Evaluar cambio de uso del suelo.",
    accion: "Iniciar conversaciones con Ayuntamiento sobre usos alternativos · Tasación con 3 escenarios (residencial/logística/mixto)",
    responsable: "Director estrategia · Asuntos públicos" },

  { id: 8,  fecha: "2026-04-28", estacionId: "EESS-002", estacionNombre: "Sestao - Kareaga (Eroski)",
    tipo: "Erosión de margen", subIndice: "SEI-A", severidad: "MEDIA",
    disparador: "Margen blended ↓ -120 bps trimestre",
    descripcion: "Guerra de precios local. Eroski responde a aperturas low-cost con descuentos adicionales. Comprometida rentabilidad.",
    accion: "Renegociar política comercial conjunta con Eroski · Lanzar Click & Collect Eroski para sostener tráfico",
    responsable: "Director comercial" },

  { id: 9,  fecha: "2026-05-06", estacionId: "EESS-003", estacionNombre: "Bilbao - Ercilla",
    tipo: "Señal de transición", subIndice: "CTI-D", severidad: "MEDIA",
    disparador: "Apertura recarga rápida competidor <1km",
    descripcion: "Iberdrola ha abierto 4×150kW a 850m. Necesidad de evaluar upgrade de los 350kW propios y posibles partnerships.",
    accion: "Solicitar 3 propuestas a Iberdrola/Powerdot/Zunder · Decisión recarga 350kW en 60 días",
    responsable: "Director estrategia · Energía" },

  { id: 10, fecha: "2026-04-30", estacionId: "EESS-005", estacionNombre: "Barakaldo - Cruces N-634",
    tipo: "Alerta de fidelización", subIndice: "FCC-B", severidad: "MEDIA",
    disparador: "% one-shot 58% (vs media red 40%)",
    descripcion: "Estación de corredor muy estresada por clientes de paso. Baja conversión a tienda (23,5%). Oportunidad de revisar oferta food.",
    accion: "Pilotar drive-thru café (Costa/Starbucks) · Mercadona RTE estand · Cupón cena para llevar",
    responsable: "Marketing · Retail" },

  { id: 11, fecha: "2026-05-04", estacionId: "EESS-007", estacionNombre: "Erandio - A-8 Hub",
    tipo: "Repunte positivo en menciones", subIndice: "RPC-C", severidad: "INFO",
    disparador: "+185 menciones positivas en 12m (+85% YoY)",
    descripcion: "Crecimiento muy positivo de notoriedad. Confirmar como flagship y considerar amplificación en marketing de marca.",
    accion: "Amplificar en marketing de marca · Documentar mejores prácticas para replicar al resto de red",
    responsable: "Marketing · Comunicación" },

  { id: 12, fecha: "2026-04-18", estacionId: "EESS-004", estacionNombre: "Valle de Trápaga - Aparkabisa",
    tipo: "Cambio en tráfico", subIndice: "CTI-A", severidad: "MEDIA",
    disparador: "IMD industrial -18% últimos 6m (datos DGT)",
    descripcion: "Caída de actividad en el polígono Aparkabisa. Posible efecto cierre de 2 empresas medianas (Q4-25). Evaluar B2B alternativo.",
    accion: "Equipo B2B sustituye 2 cuentas perdidas en 90 días · Lanzar paquete trucker (ducha + microondas + Solred)",
    responsable: "Director comercial · B2B" },

  { id: 13, fecha: "2026-05-03", estacionId: "EESS-006", estacionNombre: "Getxo - Algorta",
    tipo: "Repunte positivo en menciones", subIndice: "RPC-A", severidad: "INFO",
    disparador: "Rating Google +0,15 pts en 6 meses",
    descripcion: "Mejora reputacional notable tras reforma 2022. Posicionamiento premium consolidado. Validar como referencia interna de UX retail.",
    accion: "Documentar protocolos · Sesión de aprendizaje con resto gestores · Validar para piloto Waylet Gold",
    responsable: "Marketing · Operaciones" },
];

/* -------------------------------------------------------------------------- */
/*                  ENSAMBLADO: ESTACIONES COMPLETAS                          */
/* -------------------------------------------------------------------------- */

function buildEstacionCompleta(idx: number): EstacionCompleta {
  const base = universo[idx];
  const rankBase = rankingData.find((r) => r.estacionId === base.id)!;
  const categoria = categoriaPorIMP(rankBase.imp).nombre;
  const ranking: RankingIMP = { ...rankBase, categoria };

  const buildSubIndice = (idxName: "SEI" | "OAI" | "CTI" | "RPC" | "FCC") => {
    const block = scoresPorEstacion.find((b) => b.indice === idxName)!;
    return {
      codigo: idxName,
      nombre: NOMBRES_INDICES[idxName],
      descripcion: DESCRIPCION_INDICES[idxName],
      peso: PESOS_IMP[idxName],
      score: block.total[idx],
      subdimensiones: block.subdims.map((s) => ({
        codigo: s.codigo,
        nombre: s.nombre,
        peso: s.peso,
        score: s.valores[idx],
      })),
    };
  };

  return {
    ...base,
    ranking,
    subIndices: {
      SEI: buildSubIndice("SEI"),
      OAI: buildSubIndice("OAI"),
      CTI: buildSubIndice("CTI"),
      RPC: buildSubIndice("RPC"),
      FCC: buildSubIndice("FCC"),
    },
    pnl: pnlPorEstacion[idx],
    alertas: ALERTAS.filter((a) => a.estacionId === base.id),
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
  return [...ESTACIONES].sort((a, b) => b.ranking.imp - a.ranking.imp);
}

export function getResumenRed() {
  const total = ESTACIONES.length;
  const impMedio = ESTACIONES.reduce((s, e) => s + e.ranking.imp, 0) / total;
  const ebitdaTotal = ESTACIONES.reduce((s, e) => s + e.pnl.ebitda, 0);
  const alertasAltas = ALERTAS.filter((a) => a.severidad === "ALTA").length;
  const alertasMedias = ALERTAS.filter((a) => a.severidad === "MEDIA").length;
  const alertasInfo = ALERTAS.filter((a) => a.severidad === "INFO").length;
  const porCategoria = CATEGORIAS_IMP.map((cat) => ({
    categoria: cat.nombre,
    count: ESTACIONES.filter((e) => e.ranking.categoria === cat.nombre).length,
    color: cat.colorMapa,
  }));
  return {
    total, impMedio, ebitdaTotal,
    alertasAltas, alertasMedias, alertasInfo,
    alertasTotal: ALERTAS.length,
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
