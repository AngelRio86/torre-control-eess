import { AlertCardV2 } from "./AlertCardV2";
import type { Alerta } from "@/lib/types";

export function AlertsPanel({
  alertas,
  emptyMessage = "Sin alertas activas en esta selección.",
}: {
  alertas: Alerta[];
  emptyMessage?: string;
}) {
  if (!alertas.length) {
    return <div className="empty">{emptyMessage}</div>;
  }

  return (
    <div className="alertv2-list">
      {alertas.map((a) => (
        <AlertCardV2 key={a.id} alerta={a} />
      ))}
    </div>
  );
}
