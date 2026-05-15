"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, RotateCcw } from "lucide-react";
import { RankingSidebar } from "@/components/RankingSidebar";
import { StationPicker } from "@/components/StationPicker";
import { ComparisonTable } from "@/components/ComparisonTable";
import { ESTACIONES, getEstacion } from "@/lib/constants";

export default function CompararPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Inicializar selección desde URL si la hay
  const idsFromURL = useMemo(() => {
    const raw = searchParams.get("ids");
    if (!raw) return [] as string[];
    return raw.split(",").filter((id) => getEstacion(id)).slice(0, 3);
  }, [searchParams]);

  const [selected, setSelected] = useState<string[]>(idsFromURL);
  const [mode, setMode] = useState<"pick" | "compare">(
    idsFromURL.length >= 2 ? "compare" : "pick"
  );

  // Sincronizar URL con selección cuando estamos en modo compare
  useEffect(() => {
    if (mode === "compare" && selected.length >= 2) {
      const url = `/comparar?ids=${selected.join(",")}`;
      window.history.replaceState({}, "", url);
    }
  }, [mode, selected]);

  const toggle = (id: string) => {
    setSelected((cur) =>
      cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]
    );
  };

  const startCompare = () => {
    if (selected.length >= 2) setMode("compare");
  };

  const backToPick = () => {
    setMode("pick");
  };

  const reset = () => {
    setSelected([]);
    setMode("pick");
    router.replace("/comparar");
  };

  const estacionesSeleccionadas = selected
    .map((id) => getEstacion(id))
    .filter((e): e is NonNullable<typeof e> => Boolean(e));

  return (
    <div className="app-shell">
      <RankingSidebar />
      <main className="main">
        <Link href="/" className="back-link">
          <ArrowLeft size={14} /> Volver al portfolio
        </Link>

        <header className="page-header" style={{ marginBottom: 22 }}>
          <div className="page-eyebrow">Comparador</div>
          <h1 className="page-title">
            Comparar <em>estaciones</em>
          </h1>
          <p className="page-lede">
            Selecciona entre 2 y 3 estaciones para ver sus sub-índices en paralelo,
            filtrar qué dimensiones mostrar y entrar al detalle granular de cada una.
          </p>
        </header>

        {mode === "pick" && (
          <>
            <section className="card" style={{ marginBottom: 20 }}>
              <div className="card-header">
                <div>
                  <h2 className="card-title">Paso 1 · Selecciona estaciones</h2>
                  <p className="card-subtitle">
                    Marca hasta 3 estaciones. La cuarta queda deshabilitada hasta que liberes hueco.
                  </p>
                </div>
                {selected.length > 0 && (
                  <button type="button" className="btn-secondary" onClick={reset}>
                    <RotateCcw size={13} /> Limpiar selección
                  </button>
                )}
              </div>
              <StationPicker
                estaciones={ESTACIONES}
                selected={selected}
                onToggle={toggle}
                max={3}
              />
            </section>

            <div className="cmp-actions">
              <button
                type="button"
                className="btn-primary"
                disabled={selected.length < 2}
                onClick={startCompare}
                aria-disabled={selected.length < 2}
              >
                Comparar {selected.length >= 2 ? `(${selected.length})` : ""}
              </button>
              <span className="cmp-actions-hint">
                {selected.length < 2
                  ? "Selecciona al menos 2 estaciones para activar la comparación"
                  : `Listo para comparar ${selected.length} estaciones`}
              </span>
            </div>
          </>
        )}

        {mode === "compare" && estacionesSeleccionadas.length >= 2 && (
          <>
            <div className="cmp-back-row" style={{ marginBottom: 16 }}>
              <button type="button" className="btn-secondary" onClick={backToPick}>
                <ArrowLeft size={13} /> Volver a seleccionar
              </button>
              <button type="button" className="btn-secondary" onClick={reset}>
                <RotateCcw size={13} /> Nueva comparación
              </button>
            </div>

            <ComparisonTable estaciones={estacionesSeleccionadas} />

            <div className="footer-note">
              <strong>Sobre los datos.</strong> Los scores y las series temporales son
              sintéticos pero coherentes: respetan el peso ponderado del IMP y la
              estacionalidad típica del sector. Al entrar al detalle por estación tendrás
              acceso al desglose granular (combustibles, SKUs de tienda, métricas individuales).
            </div>
          </>
        )}
      </main>
    </div>
  );
}
