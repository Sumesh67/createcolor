import { ImageResponse } from "@vercel/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const headline = searchParams.get("headline") || "Rainy day? Print this.";
  const subheadline = searchParams.get("subheadline") || "Easy kid activity in seconds";
  const theme = searchParams.get("theme") || "rainyday";

  const themes: Record<string, { bg1: string; bg2: string; accent: string; badge: string }> = {
    dinosaurs: { bg1: "#dcfce7", bg2: "#bbf7d0", accent: "#166534", badge: "🦖 DINOSAURS" },
    unicorns: { bg1: "#fce7f3", bg2: "#ede9fe", accent: "#7c3aed", badge: "🦄 UNICORNS" },
    space: { bg1: "#dbeafe", bg2: "#e0f2fe", accent: "#1d4ed8", badge: "🚀 SPACE" },
    rainyday: { bg1: "#f0f9ff", bg2: "#e0f2fe", accent: "#0284c7", badge: "☁️ RAINY DAY" },
    magiclens: { bg1: "#fff7ed", bg2: "#ffedd5", accent: "#ea580c", badge: "📸 MAGIC LENS" },
    teachers: { bg1: "#fefce8", bg2: "#ecfccb", accent: "#65a30d", badge: "✏️ TEACHERS" },
    roadtrip: { bg1: "#fff7ed", bg2: "#fef3c7", accent: "#d97706", badge: "🚗 ROAD TRIP" },
    default: { bg1: "#ffffff", bg2: "#fef3c7", accent: "#7c3aed", badge: "✨ CREATECOLOR" },
  };

  const palette = themes[theme] || themes.default;

  return new ImageResponse(
    (
      <div
        style={{
          width: "1080px",
          height: "1350px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: `linear-gradient(180deg, ${palette.bg1}, ${palette.bg2})`,
          padding: "72px",
          fontFamily: "system-ui, sans-serif",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 40,
            right: 40,
            width: 180,
            height: 180,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.45)",
            display: "flex",
          }}
        />

        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <span style={{ fontSize: "42px" }}>🎨</span>
            <span style={{ fontSize: "34px", fontWeight: 900, color: "#111827" }}>CreateColor</span>
          </div>

          <div
            style={{
              display: "flex",
              background: "rgba(255,255,255,0.75)",
              borderRadius: "999px",
              padding: "10px 24px",
              alignSelf: "flex-start",
              border: `2px solid ${palette.accent}`,
            }}
          >
            <span style={{ fontSize: "22px", fontWeight: 700, color: palette.accent }}>{palette.badge}</span>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "24px", flex: 1, justifyContent: "center" }}>
          <div
            style={{
              fontSize: headline.length > 60 ? "56px" : "68px",
              fontWeight: 900,
              color: "#111827",
              lineHeight: 1.05,
              letterSpacing: "-1.5px",
              maxWidth: "880px",
            }}
          >
            {headline}
          </div>

          <div
            style={{
              fontSize: subheadline.length > 70 ? "30px" : "36px",
              color: "#374151",
              lineHeight: 1.35,
              maxWidth: "860px",
            }}
          >
            {subheadline}
          </div>

          <div
            style={{
              marginTop: "24px",
              display: "flex",
              width: "860px",
              height: "320px",
              background: "rgba(255,255,255,0.75)",
              borderRadius: "32px",
              border: "3px dashed rgba(17,24,39,0.15)",
              alignItems: "center",
              justifyContent: "center",
              color: palette.accent,
              fontSize: "44px",
              fontWeight: 800,
              textAlign: "center",
              padding: "32px",
            }}
          >
            Printable coloring page preview
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
            paddingTop: "28px",
            borderTop: "2px solid rgba(17,24,39,0.08)",
          }}
        >
          <span style={{ fontSize: "24px", fontWeight: 700, color: palette.accent }}>
            createandcolor.aivantageworks.com
          </span>
          <span style={{ fontSize: "22px", color: "#6b7280" }}>Free • Printable • Kid-friendly</span>
        </div>
      </div>
    ),
    {
      width: 1080,
      height: 1350,
    }
  );
}
