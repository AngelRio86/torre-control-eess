"use client";

import dynamic from "next/dynamic";
import { RankingSidebar } from "@/components/RankingSidebar";
import { AlertsPanel } from "@/components/AlertsPanel";
import { StationsTable } from "@/components/StationsTable";
import { CompararButton } from "@/components/CompararButton";
import {
  ALERTAS_ORDENADAS,
  ARQUETIPOS_LIST,
  ESTACIONES,
  NOMBRES_SCORES,
  NOMBRES_SCORES_EN,
  SCORE_CODES,
  getResumenRed,
} from "@/lib/constants";
import { eurCompacto, score } from "@/lib/format";

// Leaflet necesita renderizarse solo en el cliente
const NetworkMap = dynamic(
  () => import("@/components/NetworkMap").then((m) => m.NetworkMap),
  { ssr: false, loading: () => <div className="map-wrap" /> }
);

export default function HomePage() {
  const resumen = getResumenRed();

  return (
    <div className="app-shell">
      <RankingSidebar />
      <main className="main">
        {/* Top bar con botón Comparar */}
        <div className="topbar">
          <CompararButton />
        </div>

        {/* ---- Header ------------------------------------------------ */}
        <header className="page-header">
          <div className="page-eyebrow">Portfolio · 8 estaciones · Bizkaia</div>
          <h1 className="page-title">
            Torre de Control <em>EESS</em>
          </h1>
          <p className="page-lede">
            Plataforma de decisión estratégica para la transformación del
            portfolio durante la transición energética. Cada estación se evalúa
            sobre <strong>6 scores independientes de oportunidad</strong> y se
            clasifica en un <strong>arquetipo de cartera</strong> con su
            recomendación de inversión.
          </p>
        </header>

        {/* ---- KPI strip --------------------------------------------- */}
        <section className="grid grid-4" style={{ marginBottom: 24 }}>
          <div className="kpi">
            <span className="kpi-label">Estaciones</span>
            <span className="kpi-value">{resumen.total}</span>
            <span className="kpi-foot">Activos en cartera</span>
          </div>
          <div className="kpi">
            <span className="kpi-label">Arquetipos</span>
            <span className="kpi-value">{resumen.arquetiposUnicos}</span>
            <span className="kpi-foot">Diversidad estratégica de la cartera</span>
          </div>
          <div className="kpi">
            <span className="kpi-label">EBITDA agregado</span>
            <span className="kpi-value">
              {eurCompacto(resumen.ebitdaTotal)}
            </span>
            <span className="kpi-foot">Suma anualizada (sintético)</span>
          </div>
          <div className="kpi">
            <span className="kpi-label">Alertas activas</span>
            <span className="kpi-value">{resumen.alertasTotal}</span>
            <span className="kpi-foot">
              <strong style={{ color: "var(--sev-alta)" }}>
                {resumen.alertasAltas} altas
              </strong>{" "}
              · {resumen.alertasMedias} medias · {resumen.alertasInfo} info
            </span>
          </div>
        </section>

        {/* ---- 6 Scores promedio de la red --------------------------- */}
        <section className="card" style={{ marginBottom: 24 }}>
          <div className="card-header">
            <div>
              <h2 className="card-title">Scores promedio de la red</h2>
              <p className="card-subtitle">
                Seis dimensiones de oportunidad evaluadas de forma independiente.
                Sin agregación en un índice maestro: cada score se lee por su cuenta.
              </p>
            </div>
          </div>
          <div
            className="grid"
            style={{
              gridTemplateColumns: "repeat(6, minmax(0, 1fr))",
              gap: 12,
            }}
          >
            {SCORE_CODES.map((code) => (
              <div
                key={code}
                className="kpi"
                style={{ alignItems: "flex-start" }}
                title={NOMBRES_SCORES_EN[code]}
              >
                <span
                  className="kpi-label"
                  style={{ fontWeight: 600, letterSpacing: "0.04em" }}
                >
                  {code} · {NOMBRES_SCORES[code]}
                </span>
                <span className="kpi-value">{score(resumen.scoresPromedio[code])}</span>
                <div
                  style={{
                    width: "100%",
                    height: 4,
                    background: "rgba(255,255,255,0.08)",
                    borderRadius: 4,
                    overflow: "hidden",
                    marginTop: 6,
                  }}
                >
                  <div
                    style={{
                      width: `${Math.max(0, Math.min(100, resumen.scoresPromedio[code]))}%`,
                      height: "100%",
                      background:
                        "linear-gradient(90deg, var(--accent, #4cc2ff), var(--accent-2, #7cd3ff))",
                    }}
                  />
                </div>
                <span className="kpi-foot" style={{ opacity: 0.7 }}>
                  {NOMBRES_SCORES_EN[code]}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* ---- Map + Distribution ------------------------------------ */}
        <section className="grid grid-2-map" style={{ marginBottom: 24 }}>
          <div className="card">
            <div className="card-header">
              <div>
                <h2 className="card-title">Mapa de la red</h2>
                <p className="card-subtitle">
                  Marcadores coloreados según el arquetipo de cartera. Clic para
                  abrir el cockpit de cada estación.
                </p>
              </div>
            </div>
            <NetworkMap estaciones={ESTACIONES} />
            <div className="map-legend">
              {ARQUETIPOS_LIST.map((arq) => (
                <span className="item" key={arq.codigo}>
                  <span className="dot" style={{ background: arq.colorMapa }} />
                  {arq.nombre}
                </span>
              ))}
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <div>
                <h2 className="card-title">Distribución por arquetipo</h2>
                <p className="card-subtitle">
                  Mix actual de la cartera por arquetipo de portfolio y nivel de
                  inversión recomendado.
                </p>
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {resumen.porArquetipo.map((row) => (
                <div
                  key={row.arquetipo.codigo}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "10px 1fr auto",
                    gap: 12,
                    alignItems: "flex-start",
                    padding: "10px 0",
                    borderBottom: "1px solid rgba(255,255,255,0.06)",
                  }}
                >
                  <span
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: "50%",
                      background: row.arquetipo.colorMapa,
                      marginTop: 6,
                    }}
                  />
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>
                      {row.arquetipo.nombre}
                    </div>
                    <div style={{ opacity: 0.7, fontSize: 12, marginTop: 2 }}>
                      {row.estaciones.map((e) => e.nombre).join(" · ")}
                    </div>
                    <div
                      style={{
                        opacity: 0.55,
                        fontSize: 11,
                        marginTop: 4,
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                      }}
                    >
                      Inversión: {row.arquetipo.inversion}
                    </div>
                  </div>
                  <div
                    style={{
                      fontSize: 20,
                      fontWeight: 700,
                      minWidth: 28,
                      textAlign: "right",
                    }}
                  >
                    {row.count}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ---- Stations table ---------------------------------------- */}
        <section className="card" style={{ marginBottom: 24 }}>
          <div className="card-header">
            <div>
              <h2 className="card-title">Ranking de estaciones</h2>
              <p className="card-subtitle">
                Cada estación se evalúa por su perfil sobre 6 scores
                independientes y su arquetipo asignado. No hay índice maestro:
                el orden visual usa el promedio de los 6 scores únicamente como
                criterio de presentación.
              </p>
            </div>
          </div>
          <StationsTable estaciones={ESTACIONES} />
        </section>

        {/* ---- All alerts ------------------------------------------- */}
        <section className="card" id="alertas">
          <div className="card-header">
            <div>
              <h2 className="card-title">Alertas activas — snapshot del sistema</h2>
              <p className="card-subtitle">
                Cada alerta enlaza tipo, severidad, estación, score afectado,
                disparador, impacto y responsable.
              </p>
            </div>
          </div>
          <AlertsPanel alertas={ALERTAS_ORDENADAS} />
        </section>

        <div className="footer-note">
          <strong>Nota.</strong> Los 6 scores son orientativos, no prescriptivos.
          Cada uno se lee de forma independiente: no se suman ni se ponderan en
          un índice maestro. La decisión final integra factores no capturables
          cuantitativamente: acuerdos contractuales, valor inmobiliario, encaje
          con la red y compromisos regulatorios.
        </div>
      </main>
    </div>
  );
}
