// Torre de Control EESS — Catálogos granulares y motor de datos sintéticos.
// Aquí viven los SKUs, los tipos de combustible, los servicios, y la lógica
// para generar series temporales coherentes por estación.

import { ESTACIONES, getEstacion } from "./constants";
import {
  generateSeries,
  lastValue,
  prevValue,
  scaleSeries,
  sumSeries,
  SEASON_BEBIDAS_CALIENTES,
  SEASON_BEBIDAS_FRIAS,
  SEASON_FLAT,
  SEASON_FUEL_B2B,
  SEASON_FUEL_TURISMO,
  SEASON_LAVADO,
  SEASON_PRENSA,
  SEASON_RECARGA,
  SEASON_TABACO,
  yoyValue,
} from "./timeSeries";
import type {
  CategoriaTienda,
  CategoriaTiendaCodigo,
  CategoriaVentas,
  EstacionCompleta,
  GranularMetric,
  PerfilEstacion,
  Sku,
  SkuVentas,
  SubIndice,
  TimeSeriesPoint,
} from "./types";

/* -------------------------------------------------------------------------- */
/*                       PERFIL COMERCIAL POR ESTACIÓN                        */
/* -------------------------------------------------------------------------- */

export const PERFIL_POR_ESTACION: Record<string, PerfilEstacion> = {
  "EESS-001": "low-cost-urbana",
  "EESS-002": "low-cost-urbana",
  "EESS-003": "premium-urbana",
  "EESS-004": "poligono-b2b",
  "EESS-005": "corredor-24h",
  "EESS-006": "premium-urbana",
  "EESS-007": "corredor-24h",
  "EESS-008": "critica",
};

export function perfilDe(estacionId: string): PerfilEstacion {
  return PERFIL_POR_ESTACION[estacionId] ?? "low-cost-urbana";
}

/* -------------------------------------------------------------------------- */
/*                       CATEGORÍAS DE TIENDA                                 */
/* -------------------------------------------------------------------------- */

export const CATEGORIAS_TIENDA: CategoriaTienda[] = [
  { codigo: "bebidas-frias",    nombre: "Bebidas frías",         descripcion: "Refrescos, agua, cerveza, energéticas" },
  { codigo: "bebidas-calientes",nombre: "Bebidas calientes",     descripcion: "Café, té, chocolate" },
  { codigo: "snacks",           nombre: "Snacks salados y dulces", descripcion: "Patatas, frutos secos, chocolates, galletas" },
  { codigo: "chicles-caramelos",nombre: "Chicles y caramelos",   descripcion: "Chicles, caramelos, mentas" },
  { codigo: "tabaco",           nombre: "Tabaco",                descripcion: "Cigarrillos y picadura" },
  { codigo: "prensa-revistas",  nombre: "Prensa y revistas",     descripcion: "Diarios, revistas, especiales" },
  { codigo: "conveniencia",     nombre: "Conveniencia",          descripcion: "Pilas, mecheros, cargadores, paraguas" },
  { codigo: "higiene",          nombre: "Higiene y otros",       descripcion: "Pañuelos, gel, mascarillas, papel" },
];

export function getCategoria(codigo: CategoriaTiendaCodigo): CategoriaTienda {
  return CATEGORIAS_TIENDA.find((c) => c.codigo === codigo)!;
}

/* -------------------------------------------------------------------------- */
/*                       CATÁLOGO DE SKUs (41)                                */
/* -------------------------------------------------------------------------- */

export const SKUS: Sku[] = [
  // BEBIDAS FRÍAS (7)
  { codigo: "BF-COCA-ORIG-33",   nombre: "Coca-Cola Original",   marca: "Coca-Cola", categoria: "bebidas-frias", formato: "33cl",   precioVenta: 1.80, margenPct: 0.42, pesoBase: 1.00 },
  { codigo: "BF-COCA-ZERO-33",   nombre: "Coca-Cola Zero",       marca: "Coca-Cola", categoria: "bebidas-frias", formato: "33cl",   precioVenta: 1.80, margenPct: 0.42, pesoBase: 0.88 },
  { codigo: "BF-AQUARIUS-50",    nombre: "Aquarius Limón",       marca: "Aquarius",  categoria: "bebidas-frias", formato: "50cl",   precioVenta: 2.20, margenPct: 0.45, pesoBase: 0.62 },
  { codigo: "BF-REDBULL-25",     nombre: "Red Bull Energy",      marca: "Red Bull",  categoria: "bebidas-frias", formato: "25cl",   precioVenta: 2.80, margenPct: 0.48, pesoBase: 0.75 },
  { codigo: "BF-BEZOYA-1500",    nombre: "Agua Bezoya",          marca: "Bezoya",    categoria: "bebidas-frias", formato: "1,5L",   precioVenta: 1.60, margenPct: 0.40, pesoBase: 0.58 },
  { codigo: "BF-MAHOU-33",       nombre: "Mahou Cinco Estrellas",marca: "Mahou",     categoria: "bebidas-frias", formato: "33cl",   precioVenta: 1.95, margenPct: 0.36, pesoBase: 0.45 },
  { codigo: "BF-SANMIG-00",      nombre: "San Miguel 0,0",       marca: "San Miguel",categoria: "bebidas-frias", formato: "33cl",   precioVenta: 1.85, margenPct: 0.34, pesoBase: 0.32 },

  // BEBIDAS CALIENTES (5)
  { codigo: "BC-CAFE-ESP",       nombre: "Café espresso",        marca: "Lavazza",   categoria: "bebidas-calientes", formato: "vaso",  precioVenta: 1.40, margenPct: 0.70, pesoBase: 1.00 },
  { codigo: "BC-CAFE-LECHE",     nombre: "Café con leche",       marca: "Lavazza",   categoria: "bebidas-calientes", formato: "vaso",  precioVenta: 1.60, margenPct: 0.68, pesoBase: 1.05 },
  { codigo: "BC-CAPUCCINO",      nombre: "Capuccino",            marca: "Lavazza",   categoria: "bebidas-calientes", formato: "vaso",  precioVenta: 1.80, margenPct: 0.66, pesoBase: 0.55 },
  { codigo: "BC-TE-LIPTON",      nombre: "Té Lipton",            marca: "Lipton",    categoria: "bebidas-calientes", formato: "vaso",  precioVenta: 1.40, margenPct: 0.62, pesoBase: 0.30 },
  { codigo: "BC-CHOC-CAL",       nombre: "Chocolate caliente",   marca: "Cola Cao",  categoria: "bebidas-calientes", formato: "vaso",  precioVenta: 1.70, margenPct: 0.60, pesoBase: 0.25 },

  // SNACKS (7)
  { codigo: "SN-LAYS-45",        nombre: "Lay's Original",       marca: "Lay's",     categoria: "snacks", formato: "45g",  precioVenta: 1.95, margenPct: 0.40, pesoBase: 1.00 },
  { codigo: "SN-DORITOS-45",     nombre: "Doritos Tex-Mex",      marca: "Doritos",   categoria: "snacks", formato: "45g",  precioVenta: 1.95, margenPct: 0.40, pesoBase: 0.85 },
  { codigo: "SN-PRINGLES-40",    nombre: "Pringles Original",    marca: "Pringles",  categoria: "snacks", formato: "40g",  precioVenta: 2.50, margenPct: 0.38, pesoBase: 0.62 },
  { codigo: "SN-SNICKERS-50",    nombre: "Snickers",             marca: "Mars",      categoria: "snacks", formato: "50g",  precioVenta: 1.50, margenPct: 0.44, pesoBase: 0.90 },
  { codigo: "SN-KITKAT-45",      nombre: "KitKat",               marca: "Nestlé",    categoria: "snacks", formato: "45g",  precioVenta: 1.30, margenPct: 0.42, pesoBase: 0.78 },
  { codigo: "SN-KINDER-43",      nombre: "Kinder Bueno",         marca: "Kinder",    categoria: "snacks", formato: "43g",  precioVenta: 1.60, margenPct: 0.43, pesoBase: 0.55 },
  { codigo: "SN-FRIT-90",        nombre: "Cacahuetes Frit Ravich",marca: "Frit Ravich",categoria: "snacks", formato: "90g", precioVenta: 1.80, margenPct: 0.46, pesoBase: 0.40 },

  // CHICLES Y CARAMELOS (5)
  { codigo: "CH-TRIDENT-MENTA",  nombre: "Trident Menta",        marca: "Trident",   categoria: "chicles-caramelos", formato: "5 ud.", precioVenta: 1.50, margenPct: 0.50, pesoBase: 1.00 },
  { codigo: "CH-MENTOS-MINT",    nombre: "Mentos Mint",          marca: "Mentos",    categoria: "chicles-caramelos", formato: "rollo", precioVenta: 1.30, margenPct: 0.48, pesoBase: 0.72 },
  { codigo: "CH-HALLS-EUC",      nombre: "Halls Eucalipto",      marca: "Halls",     categoria: "chicles-caramelos", formato: "stick", precioVenta: 1.20, margenPct: 0.46, pesoBase: 0.58 },
  { codigo: "CH-ORBIT-HIERB",    nombre: "Orbit Hierbabuena",    marca: "Orbit",     categoria: "chicles-caramelos", formato: "10 ud.",precioVenta: 1.40, margenPct: 0.50, pesoBase: 0.85 },
  { codigo: "CH-TICTAC-MENTA",   nombre: "Tic Tac Menta",        marca: "Tic Tac",   categoria: "chicles-caramelos", formato: "16g",   precioVenta: 1.00, margenPct: 0.52, pesoBase: 0.45 },

  // TABACO (5)
  { codigo: "TB-MARLBORO-RED",   nombre: "Marlboro Red",         marca: "Marlboro",  categoria: "tabaco", formato: "20 cigs.", precioVenta: 5.40, margenPct: 0.08, pesoBase: 1.00 },
  { codigo: "TB-MARLBORO-GOLD",  nombre: "Marlboro Gold",        marca: "Marlboro",  categoria: "tabaco", formato: "20 cigs.", precioVenta: 5.40, margenPct: 0.08, pesoBase: 0.80 },
  { codigo: "TB-LUCKY-20",       nombre: "Lucky Strike",         marca: "Lucky Strike", categoria: "tabaco", formato: "20 cigs.", precioVenta: 5.20, margenPct: 0.08, pesoBase: 0.55 },
  { codigo: "TB-CAMEL-20",       nombre: "Camel",                marca: "Camel",     categoria: "tabaco", formato: "20 cigs.", precioVenta: 5.30, margenPct: 0.08, pesoBase: 0.45 },
  { codigo: "TB-DRUM-30",        nombre: "Drum Picadura",        marca: "Drum",      categoria: "tabaco", formato: "30g",      precioVenta: 12.50, margenPct: 0.09, pesoBase: 0.30 },

  // PRENSA Y REVISTAS (4)
  { codigo: "PR-ELPAIS",         nombre: "El País",              marca: "El País",   categoria: "prensa-revistas", formato: "diario",  precioVenta: 2.00, margenPct: 0.18, pesoBase: 1.00 },
  { codigo: "PR-ELCORREO",       nombre: "El Correo",            marca: "El Correo", categoria: "prensa-revistas", formato: "diario",  precioVenta: 2.00, margenPct: 0.18, pesoBase: 1.20 },
  { codigo: "PR-MARCA",          nombre: "Marca",                marca: "Marca",     categoria: "prensa-revistas", formato: "diario",  precioVenta: 1.80, margenPct: 0.18, pesoBase: 0.85 },
  { codigo: "PR-HOLA",           nombre: "Hola",                 marca: "Hola",      categoria: "prensa-revistas", formato: "revista", precioVenta: 3.50, margenPct: 0.22, pesoBase: 0.55 },

  // CONVENIENCIA (4)
  { codigo: "CV-BIC-MECH",       nombre: "Mechero Bic",          marca: "Bic",       categoria: "conveniencia", formato: "ud.",       precioVenta: 1.80, margenPct: 0.55, pesoBase: 1.00 },
  { codigo: "CV-PILAS-AA",       nombre: "Pilas AA pack 4",      marca: "Duracell",  categoria: "conveniencia", formato: "pack 4",    precioVenta: 4.90, margenPct: 0.42, pesoBase: 0.42 },
  { codigo: "CV-CARGADOR-USB",   nombre: "Cargador USB-C",       marca: "Genérico",  categoria: "conveniencia", formato: "ud.",       precioVenta: 9.90, margenPct: 0.50, pesoBase: 0.30 },
  { codigo: "CV-PARAGUAS",       nombre: "Paraguas plegable",    marca: "Genérico",  categoria: "conveniencia", formato: "ud.",       precioVenta: 8.50, margenPct: 0.55, pesoBase: 0.20 },

  // HIGIENE (4)
  { codigo: "HG-KLEENEX",        nombre: "Pañuelos Kleenex",     marca: "Kleenex",   categoria: "higiene", formato: "10 paq.", precioVenta: 1.50, margenPct: 0.38, pesoBase: 1.00 },
  { codigo: "HG-GEL-50",         nombre: "Gel hidroalcohólico",  marca: "Sanytol",   categoria: "higiene", formato: "50ml",    precioVenta: 2.20, margenPct: 0.46, pesoBase: 0.55 },
  { codigo: "HG-MASCARILLAS-5",  nombre: "Mascarillas pack 5",   marca: "Genérico",  categoria: "higiene", formato: "pack 5",  precioVenta: 2.50, margenPct: 0.50, pesoBase: 0.35 },
  { codigo: "HG-PAPEL-3R",       nombre: "Papel higiénico viaje",marca: "Scottex",   categoria: "higiene", formato: "3 rollos", precioVenta: 3.20, margenPct: 0.40, pesoBase: 0.42 },
];

export function getSku(codigo: string): Sku | undefined {
  return SKUS.find((s) => s.codigo === codigo);
}

/* -------------------------------------------------------------------------- */
/*                  MULTIPLICADORES POR PERFIL DE ESTACIÓN                    */
/* -------------------------------------------------------------------------- */

/** Multiplicador de demanda por categoría según perfil */
const MULTIPLICADOR_CATEGORIA: Record<PerfilEstacion, Record<CategoriaTiendaCodigo, number>> = {
  "premium-urbana": {
    "bebidas-frias": 1.15,
    "bebidas-calientes": 1.55,
    "snacks": 0.95,
    "chicles-caramelos": 1.05,
    "tabaco": 0.40,
    "prensa-revistas": 1.50,
    "conveniencia": 1.05,
    "higiene": 1.20,
  },
  "corredor-24h": {
    "bebidas-frias": 1.35,
    "bebidas-calientes": 1.40,
    "snacks": 1.35,
    "chicles-caramelos": 1.10,
    "tabaco": 1.20,
    "prensa-revistas": 0.70,
    "conveniencia": 1.20,
    "higiene": 0.90,
  },
  "low-cost-urbana": {
    "bebidas-frias": 0.90,
    "bebidas-calientes": 0.65,
    "snacks": 0.85,
    "chicles-caramelos": 0.85,
    "tabaco": 1.35,
    "prensa-revistas": 0.85,
    "conveniencia": 0.85,
    "higiene": 0.85,
  },
  "poligono-b2b": {
    "bebidas-frias": 1.20,
    "bebidas-calientes": 1.30,
    "snacks": 1.25,
    "chicles-caramelos": 0.90,
    "tabaco": 1.30,
    "prensa-revistas": 0.55,
    "conveniencia": 1.10,
    "higiene": 0.80,
  },
  "critica": {
    "bebidas-frias": 0.55,
    "bebidas-calientes": 0.45,
    "snacks": 0.55,
    "chicles-caramelos": 0.55,
    "tabaco": 0.85,
    "prensa-revistas": 0.50,
    "conveniencia": 0.55,
    "higiene": 0.50,
  },
};

/** Multiplicador específico por SKU sobre el perfil (excepciones) */
const MULTIPLICADOR_SKU: Partial<Record<string, Partial<Record<PerfilEstacion, number>>>> = {
  "BF-COCA-ZERO-33":   { "premium-urbana": 1.30 },
  "BF-MAHOU-33":       { "premium-urbana": 0.50, "low-cost-urbana": 0.85 },
  "BF-SANMIG-00":      { "poligono-b2b": 1.65 },
  "BF-AQUARIUS-50":    { "corredor-24h": 1.20 },
  "BF-REDBULL-25":     { "corredor-24h": 1.40, "premium-urbana": 0.75 },
  "BC-CAPUCCINO":      { "premium-urbana": 1.45 },
  "SN-PRINGLES-40":    { "premium-urbana": 1.30 },
  "TB-DRUM-30":        { "premium-urbana": 0.45 },
  "PR-ELCORREO":       { "premium-urbana": 1.30 },
  "PR-HOLA":           { "premium-urbana": 1.40, "corredor-24h": 0.85 },
};

function multiplicadorSku(skuCodigo: string, perfil: PerfilEstacion): number {
  return MULTIPLICADOR_SKU[skuCodigo]?.[perfil] ?? 1.0;
}

/* -------------------------------------------------------------------------- */
/*               GENERACIÓN DE VENTAS DE TIENDA POR ESTACIÓN                  */
/* -------------------------------------------------------------------------- */

/** Estacionalidad por categoría */
const SEASON_POR_CATEGORIA: Record<CategoriaTiendaCodigo, number[]> = {
  "bebidas-frias": SEASON_BEBIDAS_FRIAS,
  "bebidas-calientes": SEASON_BEBIDAS_CALIENTES,
  "snacks": SEASON_FLAT,
  "chicles-caramelos": SEASON_FLAT,
  "tabaco": SEASON_TABACO,
  "prensa-revistas": SEASON_PRENSA,
  "conveniencia": SEASON_FLAT,
  "higiene": SEASON_FLAT,
};

/** Tendencia YoY por categoría (la dinámica estructural) */
const TREND_POR_CATEGORIA: Record<CategoriaTiendaCodigo, number> = {
  "bebidas-frias": 0.030,
  "bebidas-calientes": 0.045,
  "snacks": 0.025,
  "chicles-caramelos": 0.010,
  "tabaco": -0.035,
  "prensa-revistas": -0.085,
  "conveniencia": 0.020,
  "higiene": 0.015,
};

/** % de ventas totales de tienda que va a cada categoría (mix medio) */
const SHARE_POR_CATEGORIA: Record<CategoriaTiendaCodigo, number> = {
  "bebidas-frias": 0.22,
  "bebidas-calientes": 0.16,
  "snacks": 0.18,
  "chicles-caramelos": 0.06,
  "tabaco": 0.18,
  "prensa-revistas": 0.04,
  "conveniencia": 0.08,
  "higiene": 0.08,
};

/**
 * Genera las ventas de tienda de una estación, por categoría y por SKU,
 * con series temporales de 24 meses.
 */
export function getVentasTiendaEstacion(estacionId: string): CategoriaVentas[] {
  const estacion = getEstacion(estacionId);
  if (!estacion) return [];
  const perfil = perfilDe(estacionId);
  const ventasAnualTienda = estacion.pnl.ventasTotalTienda;

  return CATEGORIAS_TIENDA.map((cat) => {
    const shareCat = SHARE_POR_CATEGORIA[cat.codigo];
    const multCat = MULTIPLICADOR_CATEGORIA[perfil][cat.codigo];
    const ventasAnualCat = ventasAnualTienda * shareCat * multCat;

    const skusDeCat = SKUS.filter((s) => s.categoria === cat.codigo);
    const sumaPesos = skusDeCat.reduce(
      (acc, s) => acc + s.pesoBase * multiplicadorSku(s.codigo, perfil),
      0
    );

    const skusVentas: SkuVentas[] = skusDeCat.map((sku) => {
      const peso = (sku.pesoBase * multiplicadorSku(sku.codigo, perfil)) / sumaPesos;
      const ingresosAnualSku = ventasAnualCat * peso;
      const ingresosMesBase = ingresosAnualSku / 12;
      const unidadesMesBase = ingresosMesBase / sku.precioVenta;

      const serieUnidades = generateSeries({
        monthlyBase: unidadesMesBase,
        trendAnnualPct: TREND_POR_CATEGORIA[cat.codigo],
        seasonality: SEASON_POR_CATEGORIA[cat.codigo],
        noisePct: 0.10,
        seed: `${estacionId}-${sku.codigo}-units`,
      });
      const serieIngresos = scaleSeries(serieUnidades, sku.precioVenta);

      return {
        sku,
        unidadesMes: Math.round(lastValue(serieUnidades)),
        ingresosMes: lastValue(serieIngresos),
        margenMes: lastValue(serieIngresos) * sku.margenPct,
        unidadesMesAnterior: Math.round(prevValue(serieUnidades)),
        unidadesYoY: Math.round(yoyValue(serieUnidades)),
        serieUnidades,
        serieIngresos,
      };
    });

    const serieIngresosCat = skusVentas
      .map((s) => s.serieIngresos)
      .reduce((acc, s) => (acc.length ? sumSeries(acc, s) : s), [] as TimeSeriesPoint[]);

    return {
      categoria: cat,
      unidadesMes: skusVentas.reduce((a, s) => a + s.unidadesMes, 0),
      ingresosMes: lastValue(serieIngresosCat),
      ingresosMesAnterior: prevValue(serieIngresosCat),
      ingresosYoY: yoyValue(serieIngresosCat),
      serieIngresos: serieIngresosCat,
      skus: skusVentas,
    };
  });
}

/* -------------------------------------------------------------------------- */
/*                          COMBUSTIBLES (SEI-A)                              */
/* -------------------------------------------------------------------------- */

export const COMBUSTIBLES: { codigo: string; nombre: string; pesoBase: number; precio: number }[] = [
  { codigo: "G95",    nombre: "Gasolina 95",   pesoBase: 0.34, precio: 1.55 },
  { codigo: "G98",    nombre: "Gasolina 98",   pesoBase: 0.08, precio: 1.68 },
  { codigo: "DSL",    nombre: "Diésel",        pesoBase: 0.42, precio: 1.49 },
  { codigo: "DSL-PR", nombre: "Diésel Premium",pesoBase: 0.12, precio: 1.62 },
  { codigo: "GLP",    nombre: "GLP",           pesoBase: 0.04, precio: 0.99 },
];

const SHARE_COMBUSTIBLE_POR_PERFIL: Record<PerfilEstacion, Record<string, number>> = {
  "premium-urbana":  { "G95": 0.40, "G98": 0.14, "DSL": 0.30, "DSL-PR": 0.14, "GLP": 0.02 },
  "corredor-24h":    { "G95": 0.32, "G98": 0.08, "DSL": 0.45, "DSL-PR": 0.13, "GLP": 0.02 },
  "low-cost-urbana": { "G95": 0.36, "G98": 0.05, "DSL": 0.46, "DSL-PR": 0.08, "GLP": 0.05 },
  "poligono-b2b":    { "G95": 0.18, "G98": 0.04, "DSL": 0.58, "DSL-PR": 0.18, "GLP": 0.02 },
  "critica":         { "G95": 0.38, "G98": 0.05, "DSL": 0.44, "DSL-PR": 0.08, "GLP": 0.05 },
};

export interface CombustibleVentas {
  combustible: typeof COMBUSTIBLES[number];
  litrosMes: number;
  ingresosMes: number;
  litrosMesAnterior: number;
  litrosYoY: number;
  serieLitros: TimeSeriesPoint[];
  serieIngresos: TimeSeriesPoint[];
}

export function getVentasCombustibleEstacion(estacionId: string): CombustibleVentas[] {
  const estacion = getEstacion(estacionId);
  if (!estacion) return [];
  const perfil = perfilDe(estacionId);
  const volumenAnualTotal = estacion.pnl.volumenFuelTotal;
  const seasonality = perfil === "poligono-b2b" ? SEASON_FUEL_B2B : SEASON_FUEL_TURISMO;
  const trend = -0.025;

  return COMBUSTIBLES.map((c) => {
    const share = SHARE_COMBUSTIBLE_POR_PERFIL[perfil][c.codigo] ?? 0;
    const monthlyBaseLitros = (volumenAnualTotal * share) / 12;
    const serieLitros = generateSeries({
      monthlyBase: monthlyBaseLitros,
      trendAnnualPct: trend,
      seasonality,
      noisePct: 0.07,
      seed: `${estacionId}-FUEL-${c.codigo}`,
    });
    const serieIngresos = scaleSeries(serieLitros, c.precio);

    return {
      combustible: c,
      litrosMes: lastValue(serieLitros),
      ingresosMes: lastValue(serieIngresos),
      litrosMesAnterior: prevValue(serieLitros),
      litrosYoY: yoyValue(serieLitros),
      serieLitros,
      serieIngresos,
    };
  });
}

/* -------------------------------------------------------------------------- */
/*                          SERVICIOS (SEI-C)                                 */
/* -------------------------------------------------------------------------- */

export const SERVICIOS: { codigo: string; nombre: string; share: number; precio: number }[] = [
  { codigo: "LAV",  nombre: "Lavado",           share: 0.45, precio: 12 },
  { codigo: "MEC",  nombre: "Mecánica express", share: 0.25, precio: 35 },
  { codigo: "REC",  nombre: "Recarga EV",       share: 0.20, precio: 0.45 },
  { codigo: "OTR",  nombre: "Otros servicios",  share: 0.10, precio: 8 },
];

const SEASON_POR_SERVICIO: Record<string, number[]> = {
  "LAV": SEASON_LAVADO,
  "MEC": SEASON_FLAT,
  "REC": SEASON_RECARGA,
  "OTR": SEASON_FLAT,
};

const TREND_POR_SERVICIO: Record<string, number> = {
  "LAV": 0.020,
  "MEC": 0.015,
  "REC": 0.350,
  "OTR": 0.010,
};

export interface ServicioVentas {
  servicio: typeof SERVICIOS[number];
  ingresosMes: number;
  ingresosMesAnterior: number;
  ingresosYoY: number;
  serieIngresos: TimeSeriesPoint[];
}

export function getVentasServiciosEstacion(estacionId: string): ServicioVentas[] {
  const estacion = getEstacion(estacionId);
  if (!estacion) return [];
  const ingresosAnualTotal = estacion.pnl.ingresosServicios;

  return SERVICIOS.map((s) => {
    const monthlyBase = (ingresosAnualTotal * s.share) / 12;
    const serieIngresos = generateSeries({
      monthlyBase,
      trendAnnualPct: TREND_POR_SERVICIO[s.codigo],
      seasonality: SEASON_POR_SERVICIO[s.codigo],
      noisePct: 0.12,
      seed: `${estacionId}-SVC-${s.codigo}`,
    });
    return {
      servicio: s,
      ingresosMes: lastValue(serieIngresos),
      ingresosMesAnterior: prevValue(serieIngresos),
      ingresosYoY: yoyValue(serieIngresos),
      serieIngresos,
    };
  });
}

/* -------------------------------------------------------------------------- */
/*           RENTABILIDAD MENSUAL (SEI-D) — EBITDA, OPEX, MARGEN              */
/* -------------------------------------------------------------------------- */

export interface RentabilidadMensual {
  ebitdaMes: number;
  opexMes: number;
  margenMes: number;
  serieEbitda: TimeSeriesPoint[];
  serieOpex: TimeSeriesPoint[];
  serieMargen: TimeSeriesPoint[];
}

export function getRentabilidadMensualEstacion(estacionId: string): RentabilidadMensual | null {
  const estacion = getEstacion(estacionId);
  if (!estacion) return null;
  const { ebitda, opexTotal } = estacion.pnl;

  // OPEX = relativamente estable
  const serieOpex = generateSeries({
    monthlyBase: opexTotal / 12,
    trendAnnualPct: 0.025, // inflación OPEX
    noisePct: 0.04,
    seed: `${estacionId}-OPEX`,
  });

  // EBITDA = combina fuel + tienda + servicios - opex
  const fuels = getVentasCombustibleEstacion(estacionId);
  const ingresosFuelMes = fuels
    .map((f) => f.serieIngresos)
    .reduce((acc, s) => (acc.length ? sumSeries(acc, s) : s), [] as TimeSeriesPoint[]);
  // Aplicar margen bruto fuel (~9%)
  const margenFuelMes = scaleSeries(ingresosFuelMes, 0.085);

  const tienda = getVentasTiendaEstacion(estacionId);
  const ingresosTiendaMes = tienda
    .map((c) => c.serieIngresos)
    .reduce((acc, s) => (acc.length ? sumSeries(acc, s) : s), [] as TimeSeriesPoint[]);
  // Margen bruto tienda (~25%)
  const margenTiendaMes = scaleSeries(ingresosTiendaMes, 0.25);

  const servicios = getVentasServiciosEstacion(estacionId);
  const ingresosSvcMes = servicios
    .map((s) => s.serieIngresos)
    .reduce((acc, s) => (acc.length ? sumSeries(acc, s) : s), [] as TimeSeriesPoint[]);
  // Margen bruto servicios (~50%)
  const margenSvcMes = scaleSeries(ingresosSvcMes, 0.50);

  const margenBrutoMes = sumSeries(sumSeries(margenFuelMes, margenTiendaMes), margenSvcMes);

  // Calibrar para que el último mes se acerque a EBITDA/12 anual
  const targetEbitdaMes = ebitda / 12;
  const ebitdaSinAjuste = margenBrutoMes.map((p, i) => ({
    date: p.date,
    value: p.value - serieOpex[i].value,
  }));
  const factorAjuste = targetEbitdaMes / (lastValue(ebitdaSinAjuste) || 1);
  // Limitar el ajuste a un rango razonable
  const factor = Math.max(0.5, Math.min(1.5, Math.abs(factorAjuste)));
  const serieEbitda = ebitdaSinAjuste.map((p) => ({
    date: p.date,
    value: p.value * (factorAjuste < 0 ? -factor : factor),
  }));

  const serieMargen = serieEbitda.map((p, i) => {
    const ingresos = ingresosFuelMes[i].value + ingresosTiendaMes[i].value + ingresosSvcMes[i].value;
    return { date: p.date, value: ingresos ? (p.value / ingresos) * 100 : 0 };
  });

  return {
    ebitdaMes: lastValue(serieEbitda),
    opexMes: lastValue(serieOpex),
    margenMes: lastValue(serieMargen),
    serieEbitda,
    serieOpex,
    serieMargen,
  };
}

/* -------------------------------------------------------------------------- */
/*                  MÉTRICAS GRANULARES PARA OAI / CTI / RPC / FCC            */
/* -------------------------------------------------------------------------- */

/**
 * Para los sub-índices que no son de ventas, definimos métricas KPI con
 * series temporales. El valor "actual" tiende a converger al score real
 * de la estación en ese sub-índice.
 */

interface MetricSpec {
  codigo: string;
  nombre: string;
  unidad: string;
  /** Base media (último mes), aproximadamente el score real del sub-índice */
  baseFn: (e: EstacionCompleta) => number;
  trendAnnualPct: number;
  noisePct: number;
}

const METRICAS_OAI: MetricSpec[] = [
  {
    codigo: "OAI-A1", nombre: "Score auditoría estado físico", unidad: "score",
    baseFn: (e) => e.subIndices.OAI.subdimensiones.find((s) => s.codigo === "A")?.score ?? 50,
    trendAnnualPct: -0.025, noisePct: 0.02,
  },
  {
    codigo: "OAI-B1", nombre: "Uptime surtidores", unidad: "%",
    baseFn: (e) => 90 + (e.subIndices.OAI.subdimensiones.find((s) => s.codigo === "B")?.score ?? 50) * 0.09,
    trendAnnualPct: 0.005, noisePct: 0.01,
  },
  {
    codigo: "OAI-C1", nombre: "Nº incidencias mensuales", unidad: "uds",
    baseFn: (e) => Math.max(1, 18 - (e.subIndices.OAI.subdimensiones.find((s) => s.codigo === "C")?.score ?? 50) * 0.15),
    trendAnnualPct: -0.02, noisePct: 0.18,
  },
  {
    codigo: "OAI-D1", nombre: "NPS empleado", unidad: "score",
    baseFn: (e) => e.subIndices.OAI.subdimensiones.find((s) => s.codigo === "D")?.score ?? 50,
    trendAnnualPct: 0.01, noisePct: 0.03,
  },
];

const METRICAS_CTI: MetricSpec[] = [
  {
    codigo: "CTI-A1", nombre: "IMD (vehículos/día medio)", unidad: "veh/día",
    baseFn: (e) => 1500 + (e.subIndices.CTI.subdimensiones.find((s) => s.codigo === "A")?.score ?? 50) * 35,
    trendAnnualPct: -0.015, noisePct: 0.05,
  },
  {
    codigo: "CTI-B1", nombre: "Renta media zona", unidad: "€/año",
    baseFn: (e) => 18000 + (e.subIndices.CTI.subdimensiones.find((s) => s.codigo === "B")?.score ?? 50) * 250,
    trendAnnualPct: 0.025, noisePct: 0.005,
  },
  {
    codigo: "CTI-C1", nombre: "Cuota local estimada", unidad: "%",
    baseFn: (e) => 5 + (e.subIndices.CTI.subdimensiones.find((s) => s.codigo === "C")?.score ?? 50) * 0.35,
    trendAnnualPct: -0.045, noisePct: 0.04,
  },
  {
    codigo: "CTI-D1", nombre: "Ratio EV en parque local", unidad: "%",
    baseFn: (e) => 2 + (e.subIndices.CTI.subdimensiones.find((s) => s.codigo === "D")?.score ?? 50) * 0.08,
    trendAnnualPct: 0.30, noisePct: 0.05,
  },
];

const METRICAS_RPC: MetricSpec[] = [
  {
    codigo: "RPC-A1", nombre: "Rating Google", unidad: "★",
    baseFn: (e) => 3.0 + (e.subIndices.RPC.subdimensiones.find((s) => s.codigo === "A")?.score ?? 50) * 0.022,
    trendAnnualPct: 0.01, noisePct: 0.015,
  },
  {
    codigo: "RPC-A2", nombre: "Nº reviews acumuladas", unidad: "uds",
    baseFn: (e) => 80 + (e.subIndices.RPC.subdimensiones.find((s) => s.codigo === "A")?.score ?? 50) * 4,
    trendAnnualPct: 0.18, noisePct: 0.03,
  },
  {
    codigo: "RPC-B1", nombre: "Score sentimiento (NLP)", unidad: "score",
    baseFn: (e) => e.subIndices.RPC.subdimensiones.find((s) => s.codigo === "B")?.score ?? 50,
    trendAnnualPct: 0.015, noisePct: 0.04,
  },
  {
    codigo: "RPC-C1", nombre: "Menciones redes sociales", unidad: "uds",
    baseFn: (e) => 8 + (e.subIndices.RPC.subdimensiones.find((s) => s.codigo === "C")?.score ?? 50) * 0.3,
    trendAnnualPct: 0.12, noisePct: 0.15,
  },
  {
    codigo: "RPC-D1", nombre: "Mystery shopper score", unidad: "score",
    baseFn: (e) => e.subIndices.RPC.subdimensiones.find((s) => s.codigo === "D")?.score ?? 50,
    trendAnnualPct: 0.01, noisePct: 0.03,
  },
];

const METRICAS_FCC: MetricSpec[] = [
  {
    codigo: "FCC-A1", nombre: "Clientes Waylet activos", unidad: "uds",
    baseFn: (e) => 200 + (e.subIndices.FCC.subdimensiones.find((s) => s.codigo === "A")?.score ?? 50) * 12,
    trendAnnualPct: 0.08, noisePct: 0.03,
  },
  {
    codigo: "FCC-A2", nombre: "Nuevas altas Waylet (mes)", unidad: "uds",
    baseFn: (e) => 12 + (e.subIndices.FCC.subdimensiones.find((s) => s.codigo === "A")?.score ?? 50) * 0.5,
    trendAnnualPct: 0.05, noisePct: 0.12,
  },
  {
    codigo: "FCC-B1", nombre: "Frecuencia media de visita", unidad: "visitas/mes",
    baseFn: (e) => 1.2 + (e.subIndices.FCC.subdimensiones.find((s) => s.codigo === "B")?.score ?? 50) * 0.035,
    trendAnnualPct: 0.02, noisePct: 0.05,
  },
  {
    codigo: "FCC-C1", nombre: "Ticket medio", unidad: "€",
    baseFn: (e) => 22 + (e.subIndices.FCC.subdimensiones.find((s) => s.codigo === "C")?.score ?? 50) * 0.35,
    trendAnnualPct: 0.03, noisePct: 0.04,
  },
  {
    codigo: "FCC-D1", nombre: "% churn cliente recurrente", unidad: "%",
    baseFn: (e) => 35 - (e.subIndices.FCC.subdimensiones.find((s) => s.codigo === "D")?.score ?? 50) * 0.30,
    trendAnnualPct: -0.05, noisePct: 0.08,
  },
];

function buildMetricas(specs: MetricSpec[], estacion: EstacionCompleta): GranularMetric[] {
  return specs.map((spec) => {
    const base = spec.baseFn(estacion);
    const serie = generateSeries({
      monthlyBase: base,
      trendAnnualPct: spec.trendAnnualPct,
      noisePct: spec.noisePct,
      seed: `${estacion.id}-${spec.codigo}`,
    });
    return {
      codigo: spec.codigo,
      nombre: spec.nombre,
      unidad: spec.unidad,
      valorActual: lastValue(serie),
      valorMesAnterior: prevValue(serie),
      valorYoY: yoyValue(serie),
      serie,
    };
  });
}

export function getMetricasOAI(estacionId: string): GranularMetric[] {
  const e = getEstacion(estacionId);
  return e ? buildMetricas(METRICAS_OAI, e) : [];
}
export function getMetricasCTI(estacionId: string): GranularMetric[] {
  const e = getEstacion(estacionId);
  return e ? buildMetricas(METRICAS_CTI, e) : [];
}
export function getMetricasRPC(estacionId: string): GranularMetric[] {
  const e = getEstacion(estacionId);
  return e ? buildMetricas(METRICAS_RPC, e) : [];
}
export function getMetricasFCC(estacionId: string): GranularMetric[] {
  const e = getEstacion(estacionId);
  return e ? buildMetricas(METRICAS_FCC, e) : [];
}

/* -------------------------------------------------------------------------- */
/*                Serie del sub-índice global (para gráfico header)           */
/* -------------------------------------------------------------------------- */

export function getSerieSubIndice(
  estacionId: string,
  subIndice: SubIndice
): TimeSeriesPoint[] {
  const e = getEstacion(estacionId);
  if (!e) return [];
  const score = e.subIndices[subIndice].score;
  return generateSeries({
    monthlyBase: score,
    trendAnnualPct: subIndice === "CTI" ? -0.025 : 0.01,
    noisePct: 0.025,
    seed: `${estacionId}-${subIndice}-SCORE`,
  });
}

/* -------------------------------------------------------------------------- */
/*                Datos para el comparador (helpers de agregados)             */
/* -------------------------------------------------------------------------- */

export function getNombreSubIndice(codigo: SubIndice): string {
  return {
    SEI: "Salud Económica",
    OAI: "Operación y Activo",
    CTI: "Contexto y Transición",
    RPC: "Reputación y Percepción",
    FCC: "Fidelización",
  }[codigo];
}

export function getDescripcionSubIndice(codigo: SubIndice): string {
  return {
    SEI: "Rendimiento económico y resiliencia operativa.",
    OAI: "Estado físico, capacidad, eficiencia y personal.",
    CTI: "Tráfico, competencia, transición energética y regulación.",
    RPC: "Valoración digital, sentimiento y mystery shopper.",
    FCC: "Waylet, recurrencia, valor cliente, atracción/fuga.",
  }[codigo];
}

/** Exportar utilidad usada por las páginas */
export { ESTACIONES };
