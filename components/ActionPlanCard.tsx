import {
  Target,
  ShieldCheck,
  Wrench,
  AlertTriangle,
  XOctagon,
} from "lucide-react";
import type { CategoriaIMP } from "@/lib/types";

const ICON_BY_CAT = {
  "★ Estrella": Target,
  "Sólida": ShieldCheck,
  "Estable con riesgos": Wrench,
  "Vulnerable": AlertTriangle,
  "Crítica": XOctagon,
} as const;

export function ActionPlanCard({
  categoria,
  recomendacion,
  imp,
}: {
  categoria: CategoriaIMP;
  recomendacion: string;
  imp: number;
}) {
  const Icon = ICON_BY_CAT[categoria.nombre];
  return (
    <div className={`action-plan ${categoria.color}`} role="region" aria-label="Plan de acción">
      <div className="action-plan-icon">
        <Icon size={22} strokeWidth={1.75} aria-hidden="true" />
      </div>
      <div>
        <div className="action-plan-eyebrow">Plan de acción · {categoria.nombre}</div>
        <h3 className="action-plan-title">{recomendacion}</h3>
        <p className="action-plan-text">
          Recomendación del modelo IMP basada en la combinación ponderada de los
          5 sub-índices. El plan es orientativo: la decisión final integra
          factores estratégicos no capturables en un índice (acuerdos
          contractuales, valor inmobiliario, encaje en la red, compromisos
          regulatorios).
        </p>
      </div>
      <div style={{ textAlign: "right" }}>
        <div
          style={{
            fontSize: 10.5,
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "0.14em",
            color: "var(--ink-3)",
            marginBottom: 4,
          }}
        >
          IMP
        </div>
        <div
          style={{
            fontFamily: "var(--font-display)",
            fontSize: 42,
            lineHeight: 1,
            letterSpacing: "-0.03em",
            color: "currentColor",
            fontFeatureSettings: '"tnum"',
          }}
        >
          {imp.toFixed(1)}
        </div>
        <div style={{ fontSize: 11, color: "var(--ink-3)", marginTop: 4 }}>
          {categoria.rango[0]} – {categoria.rango[1]}
        </div>
      </div>
    </div>
  );
}
