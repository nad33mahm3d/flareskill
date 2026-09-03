import { ImageResponse } from "next/og";

export const alt = "FlareSkill — AI agent skills registry";
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
          background: "#f4f0e8",
          color: "#1a1814",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 20,
          }}
        >
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: 18,
              background: "#c15f3c",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#f4f0e8",
              fontSize: 36,
              fontWeight: 700,
            }}
          >
            FS
          </div>
          <div style={{ fontSize: 40, fontWeight: 650, letterSpacing: -1 }}>
            FlareSkill
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div
            style={{
              fontSize: 64,
              fontWeight: 650,
              letterSpacing: -2,
              lineHeight: 1.1,
              maxWidth: 900,
            }}
          >
            Reusable AI agent skills
          </div>
          <div style={{ fontSize: 28, color: "#6b6258", maxWidth: 800 }}>
            Discover and install agent skills for Cursor, Claude Code, and Codex.
          </div>
        </div>
        <div style={{ fontSize: 22, color: "#c15f3c", fontWeight: 600 }}>
          flareskill.vercel.app
        </div>
      </div>
    ),
    { ...size },
  );
}
