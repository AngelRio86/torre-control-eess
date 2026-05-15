import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  MapPin,
  Calendar,
  Wrench,
  Building2,
  Clock,
} from "lucide-react";
import {
  ESTACIONES,
  categoriaPorIMP,
  getEstacion,
} from "@/lib/constants";
import { eur, pct, score } from "@/lib/format";
import { ScoreCard } from "@/components/ScoreCard";
import { ActionPlanCard } from "@/components/ActionPlanCard";
import { AlertsPanel } from "@/components/AlertsPanel";
import { RankingSidebar } from "@/components/RankingSidebar";

// Permitir parámetros dinámicos además de los pre-generados
export const dynamicParams = true;

export function generateStaticParams() {
  return ESTACIONES.map((e) => ({ id: e.id }));
}

export default function StationDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const estacion = getEstacion(params.id);
  if (!estacion) notFound();

  const cat = categoriaPorIMP(estacion.ranking.imp);
  const { pnl, subIndices, ranking, alertas } = estacion;

  return (
    <div className="app-shell">
      <RankingSidebar />
      <main className="main">
        <Link href="/" className="back-link">
          <ArrowLeft size={14} /> Volver al portfolio
        </Link>

        {/* ---- Station header ---- */}
        <header className="station-header">
          <div>
            <div className="station-eyebrow">
              {estacion.id} · {estacion.tipologia.toUpperCase()}
            </div>
            <h1 className="station-name">{estacion.nombre}</h1>
            <div className="station-meta">
              <span className="meta-item">
                <Building2 size={13} /> {estacion.marca} · {estacion.modeloOperacion}
              </span>
              <span className="meta-item">
                <MapPin size={13} /> {estacion.direccion}, {estacion.municipio}
              </span>
              <span className="meta-item">
                <Clock size={13} /> {estacion.horario}
              </span>
              <span className="meta-item">
                <Calendar size={13} /> Apertura {estacion.anyoApertura}
              </span>
              <span className="meta-item">
                <Wrench size={13} /> Última reforma {estacion.ultimaReforma}
              </span>
            </div>
          </div>

          <div className="station-imp">
            <div className="station-imp-label">Posición #{ranking.posicion} de {ESTACIONES.length}</div>
            <div
              className="station-imp-score"
              style={{ color: cat.colorMapa }}
            >
              {score(ranking.imp)}
            </div>
            <span className={`pill ${cat.color}`}>{cat.nombre}</span>
          </div>
        </header>

        {/* ---- Action plan callout ---- */}
        <section style={{ marginBottom: 28 }}>
          <ActionPlanCard
            categoria={cat}
            recomendacion={ranking.recomendacion}
            imp={ranking.imp}
          />
        </section>

        {/* ---- 5 scorecards ---- */}
        <section style={{ marginBottom: 28 }}>
          <div className="card-header" style={{ marginBottom: 14 }}>
            <div>
              <h2 className="card-title">Sub-índices del IMP</h2>
              <p className="card-subtitle">
                Cada bloque pondera de forma distinta sobre el Índice Maestro de Priorización.
              </p>
            </div>
          </div>
          <div className="grid grid-5">
            <ScoreCard data={subIndices.SEI} href={`/estacion/${estacion.id}/sei`} />
            <ScoreCard data={subIndices.OAI} href={`/estacion/${estacion.id}/oai`} />
            <ScoreCard data={subIndices.CTI} href={`/estacion/${estacion.id}/cti`} />
            <ScoreCard data={subIndices.RPC} href={`/estacion/${estacion.id}/rpc`} />
            <ScoreCard data={subIndices.FCC} href={`/estacion/${estacion.id}/fcc`} />
          </div>
        </section>

        {/* ---- P&L summary + alerts ---- */}
        <section className="grid grid-2-map" style={{ marginBottom: 28 }}>
          <div className="card">
            <div className="card-header">
              <div>
                <h2 className="card-title">Cuenta de resultados sintética</h2>
                <p className="card-subtitle">
                  Datos derivados del bloque SEI-D · Rentabilidad y eficiencia.
                </p>
              </div>
            </div>
            <div className="pnl-grid">
              <div className="pnl-cell">
                <div className="k">Beneficio bruto fuel</div>
                <div className="v">{eur(pnl.beneficioBrutoFuel)}</div>
                <div className="sub">
                  {(pnl.volumenFuelTotal / 1_000_000).toFixed(2)} M litros/año
                </div>
              </div>
              <div className="pnl-cell">
                <div className="k">Ventas tienda</div>
                <div className="v">{eur(pnl.ventasTotalTienda)}</div>
                <div className="sub">Conveniencia y categorías</div>
              </div>
              <div className="pnl-cell">
                <div className="k">Ingresos servicios</div>
                <div className="v">{eur(pnl.ingresosServicios)}</div>
                <div className="sub">Lavado, taller, recarga, food</div>
              </div>
              <div className="pnl-cell">
                <div className="k">Beneficio bruto total</div>
                <div className="v">{eur(pnl.beneficioBrutoTotal)}</div>
                <div className="sub">Suma de las 3 líneas anteriores</div>
              </div>
              <div className="pnl-cell">
                <div className="k">OPEX total</div>
                <div className="v">{eur(pnl.opexTotal)}</div>
                <div className="sub">Personal + energía + alquiler + otros</div>
              </div>
              <div className="pnl-cell">
                <div className="k">EBITDA</div>
                <div
                  className={`v ${pnl.ebitda < 0 ? "neg" : "pos"}`}
                >
                  {eur(pnl.ebitda)}
                </div>
                <div className="sub">Margen {pct(pnl.margenEbitda)}</div>
              </div>
              <div className="pnl-cell">
                <div className="k">Activo neto</div>
                <div className="v">{eur(pnl.activoNeto)}</div>
                <div className="sub">{pnl.superficieParcela} m² parcela</div>
              </div>
              <div className="pnl-cell">
                <div className="k">ROIC</div>
                <div className={`v ${pnl.roic < 0 ? "neg" : "pos"}`}>
                  {pct(pnl.roic)}
                </div>
                <div className="sub">EBITDA / activo neto</div>
              </div>
              <div className="pnl-cell">
                <div className="k">EBITDA / m²</div>
                <div className={`v ${pnl.ebitdaPorM2 < 0 ? "neg" : "pos"}`}>
                  {eur(pnl.ebitdaPorM2)}
                </div>
                <div className="sub">Productividad del suelo</div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <div>
                <h2 className="card-title">Alertas de la estación</h2>
                <p className="card-subtitle">
                  {alertas.length === 0
                    ? "Esta estación no tiene alertas activas en este momento."
                    : `${alertas.length} alerta(s) activa(s) en este momento.`}
                </p>
              </div>
            </div>
            <AlertsPanel
              alertas={alertas}
              emptyMessage="Esta estación no tiene alertas activas en este momento."
            />
          </div>
        </section>

        <div className="footer-note">
          <strong>Cómo leer este cockpit.</strong> El IMP {score(ranking.imp)}{" "}
          sitúa a esta estación en la categoría{" "}
          <strong style={{ color: cat.colorMapa }}>{cat.nombre}</strong>. El
          plan de acción es una guía del modelo: la decisión final integra
          factores estratégicos no capturables aquí (acuerdos contractuales,
          valor inmobiliario, encaje en la red, marco regulatorio).
        </div>
      </main>
    </div>
  );
}
