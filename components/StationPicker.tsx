"use client";

import { Check } from "lucide-react";
import { categoriaPorIMP } from "@/lib/constants";
import { score } from "@/lib/format";
import type { EstacionCompleta } from "@/lib/types";

interface Props {
  estaciones: EstacionCompleta[];
  selected: string[];
  onToggle: (id: string) => void;
  max?: number;
}

export function StationPicker({ estaciones, selected, onToggle, max = 3 }: Props) {
  return (
    <div>
      <div className="picker-grid">
        {estaciones.map((e) => {
          const isSelected = selected.includes(e.id);
          const isDisabled = !isSelected && selected.length >= max;
          const cat = categoriaPorIMP(e.ranking.imp);

          return (
            <button
              key={e.id}
              type="button"
              className={`picker-card ${isSelected ? "selected" : ""} ${isDisabled ? "disabled" : ""}`}
              onClick={() => !isDisabled && onToggle(e.id)}
              disabled={isDisabled}
              aria-pressed={isSelected}
              aria-label={`${e.nombre}, ${cat.nombre}, IMP ${score(e.ranking.imp)}`}
            >
              <div className="picker-card-head">
                <span className="picker-check">
                  {isSelected && <Check size={12} strokeWidth={3} />}
                </span>
                <span
                  className="picker-imp"
                  style={{ color: cat.colorMapa }}
                >
                  {score(e.ranking.imp)}
                </span>
              </div>
              <div className="picker-card-body">
                <h4 className="picker-name">{e.nombre}</h4>
                <span className="picker-meta">{e.tipologia}</span>
              </div>
              <div className="picker-card-foot">
                <span className={`pill ${cat.color}`}>{cat.nombre}</span>
              </div>
            </button>
          );
        })}
      </div>
      <p className="picker-counter">
        {selected.length} de {max} estaciones seleccionadas
        {selected.length < 2 && (
          <span style={{ color: "var(--ink-3)" }}> · necesitas mínimo 2 para comparar</span>
        )}
      </p>
    </div>
  );
}
