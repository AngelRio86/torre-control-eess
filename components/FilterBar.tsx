"use client";

import { FILTROS } from "@/lib/filters";
import type { TimeFilterKey } from "@/lib/types";

interface Props {
  value: TimeFilterKey;
  onChange: (key: TimeFilterKey) => void;
}

export function FilterBar({ value, onChange }: Props) {
  const active = FILTROS.find((f) => f.key === value);

  return (
    <div className="filter-bar">
      <div className="filter-bar-segments" role="tablist" aria-label="Filtros temporales">
        {FILTROS.map((f) => (
          <button
            key={f.key}
            type="button"
            role="tab"
            aria-selected={f.key === value}
            className={`filter-bar-segment ${f.key === value ? "active" : ""}`}
            onClick={() => onChange(f.key)}
          >
            {f.label}
          </button>
        ))}
      </div>
      {active && (
        <p className="filter-bar-hint">{active.description}</p>
      )}
    </div>
  );
}
