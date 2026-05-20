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
