"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight, TrendingUp, TrendingDown, Minus } from "lucide-react";
import type {
  CategoriaVentas,
  SkuVentas,
  TimeFilterKey,
  TimeSeriesPoint,
} from "@/lib/types";
import { aplicarFiltro, deltaPct } from "@/lib/filters";
import { TimeSeriesChart } from "./TimeSeriesChart";

const CHART_COLORS = { primary: "#1c3d5a", secondary: "#b88a4a" };

const fmtEur = (v: number) =>
  v >= 10000
    ? `${(v / 1000).toFixed(1)}k €`
    : `${v.toFixed(0)} €`;
const fmtUds = (v: number) => `${Math.round(v)} uds`;

function DeltaBadge({ delta }: { delta: number }) {
  if (Math.abs(delta) < 0.3) return <span className="delta-flat"><Minus size={11} /> 0,0%</span>;
  if (delta > 0) return <span className="delta-up"><TrendingUp size={11} /> +{delta.toFixed(1)}%</span>;
  return <span className="delta-down"><TrendingDown size={11} /> {delta.toFixed(1)}%</span>;
}

/* ========================================================================== */
/* GranularTableTienda: tabla de categorías con acordeón a SKUs               */
/* ========================================================================== */

export function GranularTableTienda({
  categorias,
  filter,
}: {
  categorias: CategoriaVentas[];
  filter: TimeFilterKey;
}) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [selectedSku, setSelectedSku] = useState<SkuVentas | null>(null);

  const toggle = (codigo: string) =>
    setExpanded((s) => ({ ...s, [codigo]: !s[codigo] }));

  // Serie del gráfico contextual
  const skuOrAggregate = selectedSku ?? null;
  const chartSeries = skuOrAggregate
    ? aplicarFiltro(skuOrAggregate.serieIngresos, filter, skuOrAggregate.sku.nombre, CHART_COLORS)
    : (() => {
        // Total tienda agregado
        if (!categorias.length) return [];
        const totalSerie: TimeSeriesPoint[] = categorias[0].serieIngresos.map((p, i) => ({
          date: p.date,
          value: categorias.reduce((acc, c) => acc + (c.serieIngresos[i]?.value ?? 0), 0),
        }));
        return aplicarFiltro(totalSerie, filter, "Ingresos tienda totales", CHART_COLORS);
      })();

  return (
    <div className="granular-block">
      <div className="granular-table-wrap">
        <table className="tabla tabla-accordion">
          <thead>
            <tr>
              <th style={{ width: 24 }}></th>
              <th>Categoría / SKU</th>
              <th className="num">Unidades mes</th>
              <th className="num">Ingresos mes</th>
              <th className="num">vs mes ant.</th>
              <th className="num">vs YoY</th>
            </tr>
          </thead>
          <tbody>
            {categorias.map((cat) => {
              const isOpen = expanded[cat.categoria.codigo] ?? false;
              const dMoM = deltaPct(cat.ingresosMes, cat.ingresosMesAnterior);
              const dYoY = deltaPct(cat.ingresosMes, cat.ingresosYoY);

              return (
                <>
                  <tr
                    key={cat.categoria.codigo}
                    className="row-categoria"
                    onClick={() => toggle(cat.categoria.codigo)}
                  >
                    <td style={{ width: 24 }}>
                      {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                    </td>
                    <td>
                      <strong>{cat.categoria.nombre}</strong>
                      <span className="row-meta"> · {cat.skus.length} SKUs</span>
                    </td>
                    <td className="num">{fmtUds(cat.unidadesMes)}</td>
                    <td className="num"><strong>{fmtEur(cat.ingresosMes)}</strong></td>
                    <td className="num"><DeltaBadge delta={dMoM} /></td>
                    <td className="num"><DeltaBadge delta={dYoY} /></td>
                  </tr>

                  {isOpen &&
                    cat.skus.map((skuV) => {
                      const dM = deltaPct(skuV.unidadesMes, skuV.unidadesMesAnterior);
                      const dY = deltaPct(skuV.unidadesMes, skuV.unidadesYoY);
                      const isSel = selectedSku?.sku.codigo === skuV.sku.codigo;
                      return (
                        <tr
                          key={skuV.sku.codigo}
                          className={`row-sku ${isSel ? "selected" : ""}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedSku(isSel ? null : skuV);
                          }}
                        >
                          <td></td>
                          <td>
                            <span className="sku-name">{skuV.sku.nombre}</span>
                            <span className="sku-meta">
                              {skuV.sku.marca} · {skuV.sku.formato} · {skuV.sku.precioVenta.toFixed(2)} €
                            </span>
                          </td>
                          <td className="num">{fmtUds(skuV.unidadesMes)}</td>
                          <td className="num">{fmtEur(skuV.ingresosMes)}</td>
                          <td className="num"><DeltaBadge delta={dM} /></td>
                          <td className="num"><DeltaBadge delta={dY} /></td>
                        </tr>
                      );
                    })}
                </>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="granular-chart-wrap">
        <div className="granular-chart-head">
          <h4>
            {selectedSku
              ? `Evolución · ${selectedSku.sku.nombre}`
              : "Evolución · Ingresos tienda total"}
          </h4>
          {selectedSku && (
            <button
              type="button"
              className="btn-link"
              onClick={() => setSelectedSku(null)}
            >
              Ver total tienda
            </button>
          )}
        </div>
        <TimeSeriesChart
          series={chartSeries}
          unit="€"
          height={240}
          formatValue={(v) => fmtEur(v)}
        />
      </div>
    </div>
  );
}

/* ========================================================================== */
/* GranularTableCombustible                                                   */
/* ========================================================================== */

export interface CombustibleRow {
  codigo: string;
  nombre: string;
  litrosMes: number;
  litrosMesAnterior: number;
  litrosYoY: number;
  precio: number;
  serieLitros: TimeSeriesPoint[];
}

export function GranularTableCombustible({
  filas,
  filter,
}: {
  filas: CombustibleRow[];
  filter: TimeFilterKey;
}) {
  const [selected, setSelected] = useState<string | null>(null);

  const totalSerie: TimeSeriesPoint[] = filas.length
    ? filas[0].serieLitros.map((p, i) => ({
        date: p.date,
        value: filas.reduce((acc, f) => acc + (f.serieLitros[i]?.value ?? 0), 0),
      }))
    : [];

  const selectedRow = selected ? filas.find((f) => f.codigo === selected) : null;
  const chartSeries = selectedRow
    ? aplicarFiltro(selectedRow.serieLitros, filter, selectedRow.nombre, CHART_COLORS)
    : aplicarFiltro(totalSerie, filter, "Volumen total", CHART_COLORS);

  const fmtL = (v: number) =>
    v >= 10000 ? `${(v / 1000).toFixed(1)}k L` : `${v.toFixed(0)} L`;

  return (
    <div className="granular-block">
      <div className="granular-table-wrap">
        <table className="tabla">
          <thead>
            <tr>
              <th>Combustible</th>
              <th className="num">Litros mes</th>
              <th className="num">€ mes</th>
              <th className="num">vs mes ant.</th>
              <th className="num">vs YoY</th>
            </tr>
          </thead>
          <tbody>
            {filas.map((f) => {
              const isSel = selected === f.codigo;
              const dM = deltaPct(f.litrosMes, f.litrosMesAnterior);
              const dY = deltaPct(f.litrosMes, f.litrosYoY);
              return (
                <tr
                  key={f.codigo}
                  className={`row-clickable ${isSel ? "selected" : ""}`}
                  onClick={() => setSelected(isSel ? null : f.codigo)}
                >
                  <td>
                    <strong>{f.nombre}</strong>
                    <span className="row-meta"> · {f.precio.toFixed(2)} €/L</span>
                  </td>
                  <td className="num">{fmtL(f.litrosMes)}</td>
                  <td className="num">{fmtEur(f.litrosMes * f.precio)}</td>
                  <td className="num"><DeltaBadge delta={dM} /></td>
                  <td className="num"><DeltaBadge delta={dY} /></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="granular-chart-wrap">
        <div className="granular-chart-head">
          <h4>
            {selectedRow
              ? `Evolución · ${selectedRow.nombre}`
              : "Evolución · Volumen total combustible"}
          </h4>
          {selectedRow && (
            <button className="btn-link" onClick={() => setSelected(null)}>
              Ver total
            </button>
          )}
        </div>
        <TimeSeriesChart
          series={chartSeries}
          unit="L"
          height={240}
          formatValue={(v) => fmtL(v)}
        />
      </div>
    </div>
  );
}

/* ========================================================================== */
/* GranularTableMetricas — uso genérico para OAI / CTI / RPC / FCC / Servicios*/
/* ========================================================================== */

export interface MetricaRow {
  codigo: string;
  nombre: string;
  unidad: string;
  valorActual: number;
  valorMesAnterior: number;
  valorYoY: number;
  serie: TimeSeriesPoint[];
}

export function GranularTableMetricas({
  filas,
  filter,
  titleSingular = "Métrica",
}: {
  filas: MetricaRow[];
  filter: TimeFilterKey;
  titleSingular?: string;
}) {
  const [selected, setSelected] = useState<string | null>(filas[0]?.codigo ?? null);

  const selectedRow = selected ? filas.find((f) => f.codigo === selected) : filas[0];

  const fmt = (v: number, unidad: string) => {
    if (unidad === "€" || unidad === "€/año") return fmtEur(v);
    if (unidad === "%") return `${v.toFixed(1)}%`;
    if (unidad === "★") return v.toFixed(2);
    if (unidad === "uds") return `${Math.round(v)}`;
    if (unidad === "litros") return `${Math.round(v)} L`;
    if (unidad === "veh/día") return `${Math.round(v)}`;
    return v.toFixed(1);
  };

  const chartSeries = selectedRow
    ? aplicarFiltro(selectedRow.serie, filter, selectedRow.nombre, CHART_COLORS)
    : [];

  return (
    <div className="granular-block">
      <div className="granular-table-wrap">
        <table className="tabla">
          <thead>
            <tr>
              <th>{titleSingular}</th>
              <th className="num">Actual</th>
              <th className="num">Mes anterior</th>
              <th className="num">YoY</th>
              <th className="num">vs YoY</th>
            </tr>
          </thead>
          <tbody>
            {filas.map((f) => {
              const isSel = selected === f.codigo;
              const dY = deltaPct(f.valorActual, f.valorYoY);
              return (
                <tr
                  key={f.codigo}
                  className={`row-clickable ${isSel ? "selected" : ""}`}
                  onClick={() => setSelected(f.codigo)}
                >
                  <td>
                    <strong>{f.nombre}</strong>
                    <span className="row-meta"> · {f.unidad}</span>
                  </td>
                  <td className="num"><strong>{fmt(f.valorActual, f.unidad)}</strong></td>
                  <td className="num">{fmt(f.valorMesAnterior, f.unidad)}</td>
                  <td className="num">{fmt(f.valorYoY, f.unidad)}</td>
                  <td className="num"><DeltaBadge delta={dY} /></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="granular-chart-wrap">
        <div className="granular-chart-head">
          <h4>
            {selectedRow ? `Evolución · ${selectedRow.nombre}` : "Selecciona una métrica"}
          </h4>
        </div>
        <TimeSeriesChart
          series={chartSeries}
          unit={selectedRow?.unidad ?? ""}
          height={240}
          formatValue={(v) => fmt(v, selectedRow?.unidad ?? "")}
        />
      </div>
    </div>
  );
}
