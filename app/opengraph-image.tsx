import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "CYTRON — Business automation for Gold Coast small businesses";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          background: "linear-gradient(135deg, #0b0b12 0%, #1a1740 50%, #5b5cf6 100%)",
          color: "white",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            marginBottom: 40,
          }}
        >
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 12,
              background: "linear-gradient(135deg, #5b5cf6 0%, #7778ff 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 28,
              fontWeight: 700,
            }}
          >
            C
          </div>
          <div style={{ fontSize: 28, fontWeight: 700, letterSpacing: 2 }}>CYTRON</div>
        </div>
        <div style={{ fontSize: 64, fontWeight: 650, lineHeight: 1.1, maxWidth: 900 }}>
          Automate the repetitive. Decide what matters.
        </div>
        <div style={{ marginTop: 28, fontSize: 26, color: "rgba(255,255,255,0.82)", maxWidth: 800 }}>
          Business automation for Gold Coast small businesses.
        </div>
      </div>
    ),
    { ...size }
  );
}
