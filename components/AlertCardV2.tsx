import { AlertTriangle, AlertCircle, Info, Activity, Target, User, Clock } from "lucide-react";
import type { Alerta } from "@/lib/types";
import { fecha } from "@/lib/format";

const ICON_BY_SEV = {
  ALTA: AlertTriangle,
  MEDIA: AlertCircle,
  INFO: Info,
} as const;

export function AlertCardV2({ alerta }: { alerta: Alerta }) {
  const Icon = ICON_BY_SEV[alerta.severidad];
  const sev = alerta.severidad.toLowerCase();

  return (
    <article className={`alertv2 ${sev}`}>
      <header className="alertv2-header">
        <div className="alertv2-head-left">
          <span className="alertv2-icon" aria-hidden="true">
            <Icon size={16} strokeWidth={2} />
          </span>
          <div>
            <span className={`pill ${sev}`}>{alerta.severidad}</span>
            <span className="alertv2-type">{alerta.tipo}</span>
          </div>
        </div>
        <div className="alertv2-head-right">
          <span className="alertv2-meta">
            <Clock size={11} aria-hidden="true" /> {fecha(alerta.fecha)}
          </span>
          <span className="alertv2-subindex">{alerta.subIndice}</span>
        </div>
      </header>

      <div className="alertv2-body">
        <section className="alertv2-section">
          <div className="alertv2-section-head">
            <Activity size={12} aria-hidden="true" />
            <span>Qué pasa</span>
          </div>
          <p className="alertv2-section-text">{alerta.disparador}</p>
        </section>

        <section className="alertv2-section">
          <div className="alertv2-section-head">
            <AlertCircle size={12} aria-hidden="true" />
            <span>Por qué importa</span>
          </div>
          <p className="alertv2-section-text">{alerta.descripcion}</p>
        </section>

        <section className="alertv2-section accent">
          <div className="alertv2-section-head">
            <Target size={12} aria-hidden="true" />
            <span>Qué hacer</span>
          </div>
          <p className="alertv2-section-text">
            {alerta.accion ?? "Acción a definir por el responsable."}
          </p>
          <div className="alertv2-responsable">
            <User size={11} aria-hidden="true" /> {alerta.responsable}
          </div>
        </section>
      </div>
    </article>
  );
}
