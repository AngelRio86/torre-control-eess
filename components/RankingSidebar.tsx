"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutGrid, AlertTriangle, ArrowRight } from "lucide-react";
import {
  ALERTAS_ORDENADAS,
  categoriaPorIMP,
  getRankingOrdenado,
} from "@/lib/constants";
import { fechaCorta, score } from "@/lib/format";

export function RankingSidebar() {
  const pathname = usePathname();
  const ranking = getRankingOrdenado();
  const topAlertas = ALERTAS_ORDENADAS.slice(0, 5);

  return (
    <aside className="sidebar" aria-label="Navegación de portfolio">
      <div className="brand">
        <Link href="/" className="brand-mark" aria-label="Inicio">
          <span className="brand-logo" aria-hidden="true">
            T
          </span>
          <span className="brand-text">
            Torre de Control
            <span className="light">Estaciones de Servicio</span>
          </span>
        </Link>
      </div>

      <div className="sidebar-scroll">
        <section className="sidebar-section" aria-labelledby="rk-title">
          <h2 className="sidebar-section-title" id="rk-title">
            <span>
              <LayoutGrid
                size={11}
                style={{ verticalAlign: "-1px", marginRight: 6 }}
              />
              Ranking IMP
            </span>
            <span className="pill">{ranking.length}</span>
          </h2>

          {ranking.map((e) => {
            const cat = categoriaPorIMP(e.ranking.imp);
            const active = pathname === `/estacion/${e.id}`;
            return (
              <Link
                key={e.id}
                href={`/estacion/${e.id}`}
                className={`ranking-row ${active ? "active" : ""}`}
                aria-current={active ? "page" : undefined}
              >
                <span className="ranking-pos">#{e.ranking.posicion}</span>
                <span>
                  <span className="ranking-name">{e.nombre}</span>
                  <span className="ranking-meta">
                    {e.tipologia.split(" / ")[0]}
                  </span>
                </span>
                <span
                  className="ranking-score"
                  style={{ color: cat.colorMapa }}
                  aria-label={`IMP ${score(e.ranking.imp)} de 100, categoría ${cat.nombre}`}
                >
                  {score(e.ranking.imp)}
                </span>
              </Link>
            );
          })}
        </section>

        <section className="sidebar-section" aria-labelledby="al-title">
          <h2 className="sidebar-section-title" id="al-title">
            <span>
              <AlertTriangle
                size={11}
                style={{ verticalAlign: "-1px", marginRight: 6 }}
              />
              Alertas activas
            </span>
            <span className="pill">{ALERTAS_ORDENADAS.length}</span>
          </h2>

          {topAlertas.map((a) => (
            <Link
              key={a.id}
              href={`/estacion/${a.estacionId}`}
              className="alert-mini"
            >
              <div className="alert-mini-top">
                <span className={`pill ${a.severidad.toLowerCase()}`}>
                  {a.severidad}
                </span>
                <span style={{ fontSize: 11, color: "var(--ink-3)" }}>
                  {fechaCorta(a.fecha)}
                </span>
              </div>
              <div style={{ fontSize: 12.5, fontWeight: 500, color: "var(--ink)" }}>
                {a.tipo}
              </div>
              <div style={{ fontSize: 11.5, color: "var(--ink-3)", marginTop: 2 }}>
                {a.estacionNombre}
              </div>
            </Link>
          ))}

          <div style={{ padding: "6px 10px", marginTop: 4 }}>
            <Link
              href="/#alertas"
              style={{
                fontSize: 12,
                color: "var(--brand-2)",
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
              }}
            >
              Ver todas las alertas <ArrowRight size={12} />
            </Link>
          </div>
        </section>
      </div>
    </aside>
  );
}
