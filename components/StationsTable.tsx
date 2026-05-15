"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { categoriaPorIMP } from "@/lib/constants";
import { score } from "@/lib/format";
import type { EstacionCompleta } from "@/lib/types";

export function StationsTable({ estaciones }: { estaciones: EstacionCompleta[] }) {
  const [query, setQuery] = useState("");
  const [filtroCat, setFiltroCat] = useState<string>("Todas");

  const categorias = useMemo(
    () => [
      "Todas",
      ...Array.from(new Set(estaciones.map((e) => e.ranking.categoria))),
    ],
    [estaciones]
  );

  const filas = useMemo(() => {
    return estaciones
      .filter((e) => {
        const q = query.toLowerCase();
        const matchesQ =
          !q ||
          `${e.nombre} ${e.municipio} ${e.marca}`.toLowerCase().includes(q);
        const matchesCat =
          filtroCat === "Todas" || e.ranking.categoria === filtroCat;
        return matchesQ && matchesCat;
      })
      .sort((a, b) => b.ranking.imp - a.ranking.imp);
  }, [estaciones, query, filtroCat]);

  return (
    <>
      <div
        style={{
          display: "flex",
          gap: 10,
          marginBottom: 14,
          flexWrap: "wrap",
        }}
      >
        <div
          style={{
            position: "relative",
            flex: "1 1 260px",
            maxWidth: 360,
          }}
        >
          <Search
            size={14}
            style={{
              position: "absolute",
              left: 12,
              top: "50%",
              transform: "translateY(-50%)",
              color: "var(--ink-3)",
            }}
            aria-hidden="true"
          />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar estación, municipio o marca"
            aria-label="Buscar estación"
            style={{
              width: "100%",
              padding: "10px 12px 10px 34px",
              fontSize: 13,
              border: "1px solid var(--border)",
              borderRadius: 10,
              background: "var(--surface)",
              color: "var(--ink)",
            }}
          />
        </div>
        <select
          value={filtroCat}
          onChange={(e) => setFiltroCat(e.target.value)}
          aria-label="Filtrar por categoría IMP"
          style={{
            padding: "10px 12px",
            fontSize: 13,
            border: "1px solid var(--border)",
            borderRadius: 10,
            background: "var(--surface)",
            color: "var(--ink)",
            minWidth: 180,
          }}
        >
          {categorias.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
      </div>

      <div style={{ overflowX: "auto" }}>
        <table className="tabla">
          <thead>
            <tr>
              <th>Estación</th>
              <th>Tipología</th>
              <th className="num">IMP</th>
              <th className="num">SEI</th>
              <th className="num">OAI</th>
              <th className="num">CTI</th>
              <th className="num">RPC</th>
              <th className="num">FCC</th>
              <th>Categoría</th>
            </tr>
          </thead>
          <tbody>
            {filas.map((e) => {
              const cat = categoriaPorIMP(e.ranking.imp);
              return (
                <tr key={e.id}>
                  <td>
                    <Link href={`/estacion/${e.id}`}>
                      <div style={{ fontWeight: 600, color: "var(--ink)" }}>
                        {e.nombre}
                      </div>
                      <div style={{ fontSize: 11.5, color: "var(--ink-3)" }}>
                        {e.id} · {e.municipio} · {e.marca}
                      </div>
                    </Link>
                  </td>
                  <td style={{ color: "var(--ink-2)", fontSize: 12.5 }}>
                    {e.tipologia}
                  </td>
                  <td
                    className="num"
                    style={{
                      color: cat.colorMapa,
                      fontWeight: 600,
                    }}
                  >
                    {score(e.ranking.imp)}
                  </td>
                  <td className="num">{score(e.ranking.sei)}</td>
                  <td className="num">{score(e.ranking.oai)}</td>
                  <td className="num">{score(e.ranking.cti)}</td>
                  <td className="num">{score(e.ranking.rpc)}</td>
                  <td className="num">{score(e.ranking.fcc)}</td>
                  <td>
                    <span className={`pill ${cat.color}`}>{cat.nombre}</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
