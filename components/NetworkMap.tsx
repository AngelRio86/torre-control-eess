"use client";

import Link from "next/link";
import { CircleMarker, MapContainer, Popup, TileLayer } from "react-leaflet";
import { categoriaPorIMP } from "@/lib/constants";
import { score } from "@/lib/format";
import type { EstacionCompleta } from "@/lib/types";

export function NetworkMap({ estaciones }: { estaciones: EstacionCompleta[] }) {
  // Bizkaia-centric view
  const center: [number, number] = [43.295, -2.98];

  return (
    <div className="map-wrap">
      <MapContainer
        center={center}
        zoom={11}
        scrollWheelZoom={false}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; OpenStreetMap · &copy; CARTO'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        />
        {estaciones.map((e) => {
          const cat = categoriaPorIMP(e.ranking.imp);
          const radius = e.protagonista ? 12 : 9;
          return (
            <CircleMarker
              key={e.id}
              center={[e.latitud, e.longitud]}
              radius={radius}
              pathOptions={{
                color: "#ffffff",
                weight: 2,
                fillColor: cat.colorMapa,
                fillOpacity: 0.92,
              }}
            >
              <Popup>
                <div style={{ minWidth: 220 }}>
                  <div
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: 10.5,
                      color: "var(--ink-3)",
                      letterSpacing: "0.06em",
                      marginBottom: 2,
                    }}
                  >
                    {e.id}
                  </div>
                  <div
                    style={{
                      fontFamily: "var(--font-display)",
                      fontSize: 15,
                      fontWeight: 500,
                      letterSpacing: "-0.01em",
                      marginBottom: 6,
                    }}
                  >
                    {e.nombre}
                  </div>
                  <div
                    style={{
                      fontSize: 12,
                      color: "var(--ink-2)",
                      marginBottom: 8,
                    }}
                  >
                    {e.tipologia} · {e.marca}
                  </div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: 8,
                    }}
                  >
                    <span
                      className={`pill ${cat.color}`}
                      style={{ fontSize: 11 }}
                    >
                      {cat.nombre}
                    </span>
                    <span
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontWeight: 600,
                        fontSize: 14,
                        color: cat.colorMapa,
                      }}
                    >
                      IMP {score(e.ranking.imp)}
                    </span>
                  </div>
                  <Link
                    href={`/estacion/${e.id}`}
                    style={{
                      color: "var(--brand-2)",
                      fontSize: 12.5,
                      fontWeight: 500,
                    }}
                  >
                    Abrir cockpit →
                  </Link>
                </div>
              </Popup>
            </CircleMarker>
          );
        })}
      </MapContainer>
    </div>
  );
}
