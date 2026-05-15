import Link from "next/link";
import { ArrowLeft, TrendingUp, TrendingDown, Minus } from "lucide-react";
import type { EstacionCompleta, SubIndice } from "@/lib/types";
import { score } from "@/lib/format";
import { categoriaPorIMP } from "@/lib/constants";
import { getNombreSubIndice, getDescripcionSubIndice } from "@/lib/granularData";

interface Props {
  estacion: EstacionCompleta;
  subIndice: SubIndice;
}

export function SubIndexDetailHeader({ estacion, subIndice }: Props) {
  const sub = estacion.subIndices[subIndice];
  const cat = categoriaPorIMP(estacion.ranking.imp);
  const peso = `${Math.round(sub.peso * 100)}% IMP`;

  const COLOR = (s: number) => {
    if (s >= 80) return "var(--estrella)";
    if (s >= 65) return "var(--solida)";
    if (s >= 50) return "var(--estable)";
    if (s >= 35) return "var(--vulnerable)";
    return "var(--critica)";
  };

  return (
    <header className="subindex-header">
      <Link href={`/estacion/${estacion.id}`} className="back-link">
        <ArrowLeft size={14} /> Volver al cockpit de {estacion.nombre}
      </Link>

      <div className="subindex-head-grid">
        <div>
          <div className="subindex-eyebrow">
            <span className="mono">{estacion.id}</span>
            <span className="sep">·</span>
            <span>{estacion.nombre}</span>
            <span className="sep">·</span>
            <span className={`pill ${cat.color}`}>{cat.nombre}</span>
          </div>
          <h1 className="subindex-title">
            <span className="subindex-code">{subIndice}</span>
            <span className="subindex-name">{getNombreSubIndice(subIndice)}</span>
          </h1>
          <p className="subindex-desc">{getDescripcionSubIndice(subIndice)}</p>
        </div>

        <div className="subindex-score">
          <div className="subindex-score-label">Score actual</div>
          <div
            className="subindex-score-value"
            style={{ color: COLOR(sub.score) }}
          >
            {score(sub.score)}
          </div>
          <div className="subindex-score-foot">
            <span>de 100</span>
            <span className="sep">·</span>
            <span>{peso}</span>
          </div>
        </div>
      </div>

      {/* Sub-dimensiones como mini-strip */}
      <div className="subdim-strip">
        {sub.subdimensiones.map((sd) => (
          <a
            key={sd.codigo}
            href={`#dim-${sd.codigo}`}
            className="subdim-chip"
            style={{ borderLeftColor: COLOR(sd.score) }}
          >
            <span className="subdim-chip-code">{sd.codigo}</span>
            <span className="subdim-chip-name">{sd.nombre}</span>
            <span className="subdim-chip-score" style={{ color: COLOR(sd.score) }}>
              {score(sd.score)}
            </span>
          </a>
        ))}
      </div>
    </header>
  );
}

/** KPI mini-strip que muestra valor actual, vs mes anterior y vs YoY */
export function GranularKpiStrip({
  label,
  unit,
  actual,
  mesAnterior,
  yoy,
  formatter,
}: {
  label: string;
  unit: string;
  actual: number;
  mesAnterior: number;
  yoy: number;
  formatter?: (v: number) => string;
}) {
  const fmt = formatter ?? ((v: number) => v.toFixed(1));
  const deltaMoM = mesAnterior ? ((actual - mesAnterior) / Math.abs(mesAnterior)) * 100 : 0;
  const deltaYoY = yoy ? ((actual - yoy) / Math.abs(yoy)) * 100 : 0;

  return (
    <div className="kpi-mini-strip">
      <div className="kpi-mini">
        <div className="kpi-mini-label">{label}</div>
        <div className="kpi-mini-value">
          {fmt(actual)} <span className="kpi-mini-unit">{unit}</span>
        </div>
      </div>
      <DeltaCell label="vs mes anterior" deltaPct={deltaMoM} />
      <DeltaCell label="vs YoY" deltaPct={deltaYoY} />
    </div>
  );
}

function DeltaCell({ label, deltaPct }: { label: string; deltaPct: number }) {
  const Icon = deltaPct > 0.5 ? TrendingUp : deltaPct < -0.5 ? TrendingDown : Minus;
  const color =
    deltaPct > 0.5 ? "var(--solida)" : deltaPct < -0.5 ? "var(--critica)" : "var(--ink-3)";
  const sign = deltaPct > 0 ? "+" : "";

  return (
    <div className="kpi-mini">
      <div className="kpi-mini-label">{label}</div>
      <div className="kpi-mini-value" style={{ color, display: "flex", alignItems: "baseline", gap: 6 }}>
        <Icon size={14} style={{ alignSelf: "center" }} />
        <span>{sign}{deltaPct.toFixed(1)}%</span>
      </div>
    </div>
  );
}
