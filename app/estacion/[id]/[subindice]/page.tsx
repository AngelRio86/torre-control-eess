"use client";

import { useState, useMemo } from "react";
import { notFound } from "next/navigation";
import { RankingSidebar } from "@/components/RankingSidebar";
import { SubIndexDetailHeader, GranularKpiStrip } from "@/components/SubIndexDetailHeader";
import { FilterBar } from "@/components/FilterBar";
import {
  GranularTableTienda,
  GranularTableCombustible,
  GranularTableMetricas,
  type MetricaRow,
  type CombustibleRow,
} from "@/components/GranularTable";
import { TimeSeriesChart } from "@/components/TimeSeriesChart";
import { getEstacion } from "@/lib/constants";
import {
  getVentasTiendaEstacion,
  getVentasCombustibleEstacion,
  getVentasServiciosEstacion,
  getRentabilidadMensualEstacion,
  getMetricasOAI,
  getMetricasCTI,
  getMetricasRPC,
  getMetricasFCC,
  getSerieSubIndice,
} from "@/lib/granularData";
import { aplicarFiltro } from "@/lib/filters";
import { lastValue, prevValue, yoyValue } from "@/lib/timeSeries";
import type { SubIndiceCode, TimeFilterKey } from "@/lib/types";

const SUB_INDICES_VALID: SubIndiceCode[] = ["SEI", "OAI", "CTI", "RPC", "FCC"];

const CHART_COLORS = { primary: "#1c3d5a", secondary: "#b88a4a" };

export default function SubIndexDetailPage({
  params,
}: {
  params: { id: string; subindice: string };
}) {
  const [filter, setFilter] = useState<TimeFilterKey>("12M");

  const estacion = getEstacion(params.id);
  const subIndiceUpper = params.subindice.toUpperCase() as SubIndiceCode;
  if (!estacion || !SUB_INDICES_VALID.includes(subIndiceUpper)) {
    notFound();
  }

  // Datos según sub-índice
  const data = useMemo(() => {
    if (subIndiceUpper === "SEI") {
      const combustibles = getVentasCombustibleEstacion(estacion.id);
      const tienda = getVentasTiendaEstacion(estacion.id);
      const servicios = getVentasServiciosEstacion(estacion.id);
      const rentab = getRentabilidadMensualEstacion(estacion.id);
      return { combustibles, tienda, servicios, rentab };
    }
    if (subIndiceUpper === "OAI") return { metricas: getMetricasOAI(estacion.id) };
    if (subIndiceUpper === "CTI") return { metricas: getMetricasCTI(estacion.id) };
    if (subIndiceUpper === "RPC") return { metricas: getMetricasRPC(estacion.id) };
    if (subIndiceUpper === "FCC") return { metricas: getMetricasFCC(estacion.id) };
    return {};
  }, [estacion.id, subIndiceUpper]);

  // Serie del sub-índice global para gráfico header
  const serieGlobal = useMemo(
    () => getSerieSubIndice(estacion.id, subIndiceUpper as any),
    [estacion.id, subIndiceUpper]
  );
  const chartSerieGlobal = aplicarFiltro(
    serieGlobal,
    filter,
    `${subIndiceUpper} score`,
    CHART_COLORS
  );

  const scoreActual = lastValue(serieGlobal);
  const scoreMesAnterior = prevValue(serieGlobal);
  const scoreYoY = yoyValue(serieGlobal);

  return (
    <div className="app-shell">
      <RankingSidebar />
      <main className="main">
        <SubIndexDetailHeader estacion={estacion} subIndice={subIndiceUpper as any} />

        <FilterBar value={filter} onChange={setFilter} />

        <GranularKpiStrip
          label={`Score ${subIndiceUpper} actual`}
          unit="/100"
          actual={scoreActual}
          mesAnterior={scoreMesAnterior}
          yoy={scoreYoY}
          formatter={(v) => v.toFixed(1)}
        />

        <section className="card" style={{ marginTop: 16, marginBottom: 24 }}>
          <div className="card-header">
            <div>
              <h2 className="card-title">Evolución del score {subIndiceUpper}</h2>
              <p className="card-subtitle">
                Serie mensual del score sintético del sub-índice (24 meses).
              </p>
            </div>
          </div>
          <TimeSeriesChart
            series={chartSerieGlobal}
            unit=""
            height={220}
            formatValue={(v) => v.toFixed(1)}
          />
        </section>

        {/* ============= SEI: 4 secciones (Fuel, Tienda, Servicios, Rentab) ============= */}

        {subIndiceUpper === "SEI" && data.combustibles && (
          <section id="dim-A" className="card" style={{ marginBottom: 24 }}>
            <div className="card-header">
              <div>
                <h2 className="card-title">SEI-A · Combustibles</h2>
                <p className="card-subtitle">
                  Ventas mensuales por tipo de combustible. Clic en una fila para ver su evolución.
                </p>
              </div>
            </div>
            <GranularTableCombustible
              filas={data.combustibles.map<CombustibleRow>((c) => ({
                codigo: c.combustible.codigo,
                nombre: c.combustible.nombre,
                litrosMes: c.litrosMes,
                litrosMesAnterior: c.litrosMesAnterior,
                litrosYoY: c.litrosYoY,
                precio: c.combustible.precio,
                serieLitros: c.serieLitros,
              }))}
              filter={filter}
            />
          </section>
        )}

        {subIndiceUpper === "SEI" && data.tienda && (
          <section id="dim-B" className="card" style={{ marginBottom: 24 }}>
            <div className="card-header">
              <div>
                <h2 className="card-title">SEI-B · Tienda y conveniencia</h2>
                <p className="card-subtitle">
                  Categorías agregadas. Clic en una categoría para desplegar sus SKUs. Clic en un SKU para ver su evolución temporal.
                </p>
              </div>
            </div>
            <GranularTableTienda categorias={data.tienda} filter={filter} />
          </section>
        )}

        {subIndiceUpper === "SEI" && data.servicios && (
          <section id="dim-C" className="card" style={{ marginBottom: 24 }}>
            <div className="card-header">
              <div>
                <h2 className="card-title">SEI-C · Servicios complementarios</h2>
                <p className="card-subtitle">Lavado, mecánica, recarga EV, otros.</p>
              </div>
            </div>
            <GranularTableMetricas
              titleSingular="Servicio"
              filter={filter}
              filas={data.servicios.map<MetricaRow>((s) => ({
                codigo: s.servicio.codigo,
                nombre: s.servicio.nombre,
                unidad: "€",
                valorActual: s.ingresosMes,
                valorMesAnterior: s.ingresosMesAnterior,
                valorYoY: s.ingresosYoY,
                serie: s.serieIngresos,
              }))}
            />
          </section>
        )}

        {subIndiceUpper === "SEI" && data.rentab && (
          <section id="dim-D" className="card" style={{ marginBottom: 24 }}>
            <div className="card-header">
              <div>
                <h2 className="card-title">SEI-D · Rentabilidad y eficiencia</h2>
                <p className="card-subtitle">EBITDA, OPEX y margen mensual sintéticos.</p>
              </div>
            </div>
            <GranularTableMetricas
              titleSingular="Métrica"
              filter={filter}
              filas={[
                {
                  codigo: "EBITDA",
                  nombre: "EBITDA mensual",
                  unidad: "€",
                  valorActual: lastValue(data.rentab.serieEbitda),
                  valorMesAnterior: prevValue(data.rentab.serieEbitda),
                  valorYoY: yoyValue(data.rentab.serieEbitda),
                  serie: data.rentab.serieEbitda,
                },
                {
                  codigo: "OPEX",
                  nombre: "OPEX mensual",
                  unidad: "€",
                  valorActual: lastValue(data.rentab.serieOpex),
                  valorMesAnterior: prevValue(data.rentab.serieOpex),
                  valorYoY: yoyValue(data.rentab.serieOpex),
                  serie: data.rentab.serieOpex,
                },
                {
                  codigo: "MARGEN",
                  nombre: "Margen EBITDA",
                  unidad: "%",
                  valorActual: lastValue(data.rentab.serieMargen),
                  valorMesAnterior: prevValue(data.rentab.serieMargen),
                  valorYoY: yoyValue(data.rentab.serieMargen),
                  serie: data.rentab.serieMargen,
                },
              ]}
            />
          </section>
        )}

        {/* ============= OAI / CTI / RPC / FCC: tabla única de métricas ============= */}

        {subIndiceUpper !== "SEI" && data.metricas && (
          <section className="card" style={{ marginBottom: 24 }}>
            <div className="card-header">
              <div>
                <h2 className="card-title">Métricas del sub-índice {subIndiceUpper}</h2>
                <p className="card-subtitle">
                  Selecciona una métrica para ver su evolución temporal.
                </p>
              </div>
            </div>
            <GranularTableMetricas
              titleSingular="Métrica"
              filter={filter}
              filas={data.metricas.map<MetricaRow>((m) => ({
                codigo: m.codigo,
                nombre: m.nombre,
                unidad: m.unidad,
                valorActual: m.valorActual,
                valorMesAnterior: m.valorMesAnterior,
                valorYoY: m.valorYoY,
                serie: m.serie,
              }))}
            />
          </section>
        )}

        <div className="footer-note">
          <strong>Cómo leer este detalle.</strong> Los valores son sintéticos pero
          construidos con coherencia: el último mes converge al score real del sub-índice,
          y la serie aplica tendencia (declive fuel, crecimiento tienda) + estacionalidad
          + ruido. Cada métrica tiene una semilla determinista por estación → siempre
          devuelve los mismos números.
        </div>
      </main>
    </div>
  );
}
