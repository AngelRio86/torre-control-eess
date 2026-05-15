"use client";

import { useState } from "react";
import { ExternalLink } from "lucide-react";
import Link from "next/link";
import { categoriaPorIMP } from "@/lib/constants";
import { score } from "@/lib/format";
import { TimeSeriesChart } from "./TimeSeriesChart";
import { FilterBar } from "./FilterBar";
import { aplicarFiltro } from "@/lib/filters";
import { getSerieSubIndice } from "@/lib/granularData";
import type { EstacionCompleta, SubIndice, TimeFilterKey } from "@/lib/types";

const TODOS_INDICES: SubIndice[] = ["SEI", "OAI", "CTI", "RPC", "FCC"];

const COLOR_PER_STATION = ["#1c3d5a", "#b88a4a", "#2faa66"];

interface Props {
  estaciones: EstacionCompleta[];
}

const COLOR_BY_SCORE = (s: number) => {
  if (s >= 80) return "var(--estrella)";
  if (s >= 65) return "var(--solida)";
  if (s >= 50) return "var(--estable)";
  if (s >= 35) return "var(--vulnerable)";
  return "var(--critica)";
};

export function ComparisonTable({ estaciones }: Props) {
  const [shownIndices, setShownIndices] = useState<SubIndice[]>(TODOS_INDICES);
  const [drillIndex, setDrillIndex] = useState<SubIndice | null>(null);
  const [filter, setFilter] = useState<TimeFilterKey>("12m");

  const toggleIndex = (i: SubIndice) => {
    setShownIndices((cur) =>
      cur.includes(i) ? cur.filter((x) => x !== i) : [...cur, i]
    );
  };

  // Series del gráfico drill-down (una por estación)
  const chartSeries = drillIndex
    ? estaciones.flatMap((e, idx) => {
        const serie = getSerieSubIndice(e.id, drillIndex);
        const subSeries = aplicarFiltro(
          serie,
          filter,
          e.nombre,
          { primary: COLOR_PER_STATION[idx], secondary: COLOR_PER_STATION[idx] }
        );
        // En modo "yoy" o "vs-prev-year" aplicarFiltro devuelve 2 series:
        // las renombramos como "Estación · Actual" / "Estación · Anterior"
        return subSeries.map((s) => ({
          ...s,
          name: subSeries.length > 1 ? `${e.nombre} · ${s.name}` : e.nombre,
          color: COLOR_PER_STATION[idx],
        }));
      })
    : [];

  return (
    <div>
      {/* Header con las estaciones comparadas */}
      <div className="cmp-header-grid" style={{ marginBottom: 20 }}>
        {estaciones.map((e, idx) => {
          const cat = categoriaPorIMP(e.ranking.imp);
          return (
            <div key={e.id} className="cmp-station-head">
              <span
                className="cmp-station-dot"
                style={{ background: COLOR_PER_STATION[idx] }}
                aria-hidden="true"
              />
              <div>
                <div className="cmp-station-eyebrow">{e.id} · #{e.ranking.posicion}</div>
                <h3 className="cmp-station-name">{e.nombre}</h3>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 6 }}>
                  <span
                    style={{
                      fontFamily: "var(--font-display)",
                      fontSize: 28,
                      fontWeight: 500,
                      letterSpacing: "-0.02em",
                      color: cat.colorMapa,
                      lineHeight: 1,
                    }}
                  >
                    {score(e.ranking.imp)}
                  </span>
                  <span className={`pill ${cat.color}`}>{cat.nombre}</span>
                </div>
              </div>
              <Link
                href={`/estacion/${e.id}`}
                className="cmp-station-link"
                aria-label={`Abrir cockpit de ${e.nombre}`}
              >
                <ExternalLink size={14} />
              </Link>
            </div>
          );
        })}
      </div>

      {/* Toggle de sub-índices */}
      <div className="cmp-toggles">
        <span className="cmp-toggles-label">Mostrar sub-índices:</span>
        {TODOS_INDICES.map((i) => (
          <label key={i} className="cmp-toggle">
            <input
              type="checkbox"
              checked={shownIndices.includes(i)}
              onChange={() => toggleIndex(i)}
            />
            <span>{i}</span>
          </label>
        ))}
      </div>

      {/* Tabla de comparación */}
      <div className="card" style={{ marginBottom: 20 }}>
        <table className="tabla cmp-table">
          <thead>
            <tr>
              <th>Sub-índice</th>
              {estaciones.map((e) => (
                <th key={e.id} className="num">{e.id}</th>
              ))}
              <th className="num" style={{ width: 100 }}>Spread</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {/* IMP — siempre visible */}
            <tr className="cmp-row-highlight">
              <td>
                <strong>IMP</strong>
                <div className="row-meta">Índice Maestro de Priorización</div>
              </td>
              {estaciones.map((e) => (
                <td key={e.id} className="num">
                  <strong style={{ color: COLOR_BY_SCORE(e.ranking.imp), fontSize: 16 }}>
                    {score(e.ranking.imp)}
                  </strong>
                </td>
              ))}
              <td className="num">
                {spreadScore(estaciones.map((e) => e.ranking.imp))}
              </td>
              <td></td>
            </tr>

            {TODOS_INDICES.filter((i) => shownIndices.includes(i)).map((i) => {
              const vals = estaciones.map((e) => e.subIndices[i].score);
              const nombreSub = estaciones[0].subIndices[i].nombre;
              const peso = `${Math.round(estaciones[0].subIndices[i].peso * 100)}%`;
              return (
                <tr key={i}>
                  <td>
                    <strong>{i}</strong>
                    <span className="row-meta"> · {nombreSub} · {peso} IMP</span>
                  </td>
                  {estaciones.map((e, idx) => (
                    <td key={e.id} className="num">
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                          justifyContent: "flex-end",
                        }}
                      >
                        <div
                          className="cmp-bar"
                          aria-hidden="true"
                        >
                          <span
                            style={{
                              width: `${Math.max(0, Math.min(100, vals[idx]))}%`,
                              background: COLOR_BY_SCORE(vals[idx]),
                            }}
                          />
                        </div>
                        <strong style={{ minWidth: 40 }}>{score(vals[idx])}</strong>
                      </div>
                    </td>
                  ))}
                  <td className="num">{spreadScore(vals)}</td>
                  <td>
                    <button
                      type="button"
                      className="btn-link"
                      onClick={() => setDrillIndex(drillIndex === i ? null : i)}
                    >
                      {drillIndex === i ? "Cerrar" : "Detalle"}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Drill-down: gráfico comparativo */}
      {drillIndex && (
        <div className="card" style={{ marginBottom: 20 }}>
          <div className="card-header">
            <div>
              <h3 className="card-title">
                Detalle comparativo · {drillIndex} · {estaciones[0].subIndices[drillIndex].nombre}
              </h3>
              <p className="card-subtitle">
                Evolución del score del sub-índice {drillIndex} para las {estaciones.length} estaciones seleccionadas.
              </p>
            </div>
            <button
              type="button"
              className="btn-link"
              onClick={() => setDrillIndex(null)}
            >
              Cerrar detalle
            </button>
          </div>

          <FilterBar value={filter} onChange={setFilter} />

          <div style={{ marginTop: 12 }}>
            <TimeSeriesChart
              series={chartSeries}
              unit=""
              height={300}
              formatValue={(v) => v.toFixed(1)}
              showLegend
            />
          </div>

          <div className="cmp-drilldown-actions">
            <p className="cmp-drilldown-hint">
              Para ver el desglose granular del sub-índice (combustible por tipo, SKUs de tienda,
              métricas individuales), entra al detalle por estación:
            </p>
            <div className="cmp-drilldown-buttons">
              {estaciones.map((e) => (
                <Link
                  key={e.id}
                  href={`/estacion/${e.id}/${drillIndex.toLowerCase()}`}
                  className="btn-secondary"
                >
                  Ver {drillIndex} de {e.nombre} →
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function spreadScore(values: number[]): string {
  if (!values.length) return "—";
  const max = Math.max(...values);
  const min = Math.min(...values);
  return `${(max - min).toFixed(1)}`;
}
