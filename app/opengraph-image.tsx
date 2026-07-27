import { ImageResponse } from "next/og";

export const alt = "Palworld Meta — Palworld 1.0 toolkit";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px 72px",
          background: "linear-gradient(135deg, #070b16 0%, #0e1424 45%, #151c30 100%)",
          color: "#f4f5f8",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 18,
            fontSize: 28,
            letterSpacing: 6,
            textTransform: "uppercase",
            color: "#ffb020",
            fontWeight: 700,
          }}
        >
          Unofficial toolkit
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div
            style={{
              display: "flex",
              alignItems: "flex-end",
              gap: 22,
              fontSize: 86,
              fontWeight: 800,
              letterSpacing: 4,
              lineHeight: 0.95,
              textTransform: "uppercase",
            }}
          >
            <span style={{ color: "#f4f5f8" }}>Palworld</span>
            <span style={{ color: "#ffb020", fontSize: 54, letterSpacing: 8 }}>Meta</span>
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 34,
              color: "#8a93a8",
              maxWidth: 900,
              lineHeight: 1.3,
            }}
          >
            Tier List · Breeding Calculator · Team Builder · Paldeck
          </div>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: 24,
            color: "#6ea0ff",
          }}
        >
          <span>palmeta.app</span>
          <span>Updated for Palworld 1.0</span>
        </div>
      </div>
    ),
    { ...size },
  );
}
