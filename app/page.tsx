"use client";

import dynamic from "next/dynamic";
import { RankingSidebar } from "@/components/RankingSidebar";
import { AlertsPanel } from "@/components/AlertsPanel";
import { IMPDistribution } from "@/components/IMPDistribution";
import { StationsTable } from "@/components/StationsTable";
import { CompararButton } from "@/components/CompararButton";
import {
  ALERTAS_ORDENADAS,
  ESTACIONES,
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
            portfolio durante la transición energética. El{" "}
            <strong>Índice Maestro de Priorización (IMP)</strong> combina cinco
            sub-índices ponderados para clasificar cada estación y proponer un
            plan de acción.
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
            <span className="kpi-label">IMP medio</span>
            <span className="kpi-value">{score(resumen.impMedio)}</span>
            <span className="kpi-foot">Señal ponderada de portfolio</span>
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

        {/* ---- Map + Distribution ------------------------------------ */}
        <section className="grid grid-2-map" style={{ marginBottom: 24 }}>
          <div className="card">
            <div className="card-header">
              <div>
                <h2 className="card-title">Mapa de la red</h2>
                <p className="card-subtitle">
                  Marcadores coloreados según la categoría IMP. Clic para abrir
                  el cockpit de cada estación.
                </p>
              </div>
            </div>
            <NetworkMap estaciones={ESTACIONES} />
            <div className="map-legend">
              <span className="item">
                <span className="dot" style={{ background: "#1f7a4d" }} />
                ★ Estrella
              </span>
              <span className="item">
                <span className="dot" style={{ background: "#2faa66" }} />
                Sólida
              </span>
              <span className="item">
                <span className="dot" style={{ background: "#d9a23a" }} />
                Estable
              </span>
              <span className="item">
                <span className="dot" style={{ background: "#e07a3b" }} />
                Vulnerable
              </span>
              <span className="item">
                <span className="dot" style={{ background: "#c14454" }} />
                Crítica
              </span>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <div>
                <h2 className="card-title">Distribución del portfolio</h2>
                <p className="card-subtitle">
                  Mix actual de estaciones por categoría IMP.
                </p>
              </div>
            </div>
            <IMPDistribution />
          </div>
        </section>

        {/* ---- Stations table ---------------------------------------- */}
        <section className="card" style={{ marginBottom: 24 }}>
          <div className="card-header">
            <div>
              <h2 className="card-title">Ranking de estaciones</h2>
              <p className="card-subtitle">
                Ordenado de mayor a menor IMP. Pesos: SEI 30% · OAI 20% · CTI 25% · RPC 10% · FCC 15%.
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
                Salida actual del motor de alertas. Cada alerta enlaza tipo,
                severidad, estación, disparador, impacto y responsable.
              </p>
            </div>
          </div>
          <AlertsPanel alertas={ALERTAS_ORDENADAS} />
        </section>

        <div className="footer-note">
          <strong>Nota.</strong> El IMP es orientativo, no prescriptivo. La
          decisión final integra factores estratégicos no capturables en un
          índice: acuerdos contractuales, valor inmobiliario, encaje con la red
          y compromisos regulatorios. Pesos del IMP controlados desde la hoja
          Portada del modelo.
        </div>
      </main>
    </div>
  );
}
