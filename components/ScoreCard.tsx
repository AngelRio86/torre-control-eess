import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { SubIndiceScore } from "@/lib/types";
import { score } from "@/lib/format";

const COLOR_BY_SCORE = (s: number) => {
  if (s >= 80) return "var(--estrella)";
  if (s >= 65) return "var(--solida)";
  if (s >= 50) return "var(--estable)";
  if (s >= 35) return "var(--vulnerable)";
  return "var(--critica)";
};

interface Props {
  data: SubIndiceScore;
  /** Si se pasa, la card es un Link a esa URL */
  href?: string;
}

export function ScoreCard({ data, href }: Props) {
  const color = COLOR_BY_SCORE(data.score);
  const weightPct = `${Math.round(data.peso * 100)}%`;

  const inner = (
    <>
      <div className="scorecard-top">
        <div>
          <div className="scorecard-code">{data.codigo}</div>
          <h3 className="scorecard-name">{data.nombre}</h3>
        </div>
        <span className="scorecard-weight">{weightPct} IMP</span>
      </div>

      <div className="scorecard-score-row">
        <span className="scorecard-score" style={{ color }}>
          {score(data.score)}
        </span>
        <span className="of">/100</span>
      </div>

      <div className="progress" aria-hidden="true">
        <span
          style={{
            width: `${Math.max(0, Math.min(100, data.score))}%`,
            background: color,
          }}
        />
      </div>

      <div className="subdims" role="list">
        {data.subdimensiones.map((s) => (
          <div className="subdim-row" key={s.codigo} role="listitem">
            <span className="subdim-code">{s.codigo}</span>
            <span className="subdim-name">{s.nombre}</span>
            <span
              className="subdim-score"
              style={{ color: COLOR_BY_SCORE(s.score) }}
            >
              {score(s.score)}
            </span>
          </div>
        ))}
      </div>

      {href && (
        <div className="scorecard-cta">
          Ver detalle <ChevronRight size={12} />
        </div>
      )}
    </>
  );

  if (href) {
    return (
      <Link
        href={href}
        className="scorecard scorecard-link"
        aria-label={`Ver detalle de ${data.nombre}`}
      >
        {inner}
      </Link>
    );
  }

  return <div className="scorecard">{inner}</div>;
}
