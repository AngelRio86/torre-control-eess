"use client";

import { CATEGORIAS_IMP, ESTACIONES, categoriaPorIMP } from "@/lib/constants";
import { score } from "@/lib/format";

export function IMPDistribution() {
  const total = ESTACIONES.length;
  const buckets = CATEGORIAS_IMP.map((cat) => {
    const estaciones = ESTACIONES.filter(
      (e) => categoriaPorIMP(e.ranking.imp).nombre === cat.nombre
    );
    return { cat, estaciones, count: estaciones.length };
  });

  return (
    <div>
      {/* stacked bar */}
      <div
        style={{
          display: "flex",
          height: 14,
          borderRadius: 999,
          overflow: "hidden",
          border: "1px solid var(--border)",
        }}
        role="img"
        aria-label="Distribución del portfolio por categoría IMP"
      >
        {buckets.map((b) =>
          b.count > 0 ? (
            <div
              key={b.cat.nombre}
              style={{
                width: `${(b.count / total) * 100}%`,
                background: b.cat.colorMapa,
              }}
              title={`${b.cat.nombre}: ${b.count}`}
            />
          ) : null
        )}
      </div>

      {/* per-category breakdown */}
      <div style={{ marginTop: 18, display: "flex", flexDirection: "column", gap: 12 }}>
        {buckets.map((b) => (
          <div
            key={b.cat.nombre}
            style={{
              display: "grid",
              gridTemplateColumns: "10px 1fr auto",
              gap: 12,
              alignItems: "center",
              padding: "8px 0",
              borderBottom: "1px solid var(--divider)",
            }}
          >
            <span
              style={{
                width: 10,
                height: 10,
                borderRadius: 3,
                background: b.cat.colorMapa,
              }}
              aria-hidden="true"
            />
            <div>
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 500,
                  color: "var(--ink)",
                  marginBottom: 2,
                }}
              >
                {b.cat.nombre}
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 10.5,
                    color: "var(--ink-3)",
                    marginLeft: 8,
                  }}
                >
                  {b.cat.rango[0]}–{b.cat.rango[1]}
                </span>
              </div>
              <div style={{ fontSize: 11.5, color: "var(--ink-3)", lineHeight: 1.4 }}>
                {b.estaciones.length > 0
                  ? b.estaciones
                      .map((e) => `${e.nombre} (${score(e.ranking.imp)})`)
                      .join(" · ")
                  : "Sin estaciones en esta categoría"}
              </div>
            </div>
            <div
              style={{
                fontFamily: "var(--font-display)",
                fontSize: 22,
                fontWeight: 500,
                letterSpacing: "-0.02em",
                color: b.cat.colorMapa,
                fontFeatureSettings: '"tnum"',
              }}
            >
              {b.count}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
