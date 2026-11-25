import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "CYTRON — Business automation for Australian businesses";

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
          <svg width="56" height="56" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
            <rect width="1024" height="1024" rx="224" fill="#0B1020" />
            <path d="M713.1 309.2A280 280 0 1 0 713.1 714.8L611 607.6A132 132 0 1 1 611 416.4Z" fill="#FFFFFF" />
            <circle cx="725.5" cy="511.5" r="60" fill="#8B8CFF" />
          </svg>
          <div style={{ fontSize: 28, fontWeight: 700, letterSpacing: 2 }}>CYTRON</div>
        </div>
        <div style={{ fontSize: 64, fontWeight: 650, lineHeight: 1.1, maxWidth: 900 }}>
          Automate the repetitive. Decide what matters.
        </div>
        <div style={{ marginTop: 28, fontSize: 26, color: "rgba(255,255,255,0.82)", maxWidth: 800 }}>
          Business automation for Australian businesses.
        </div>
      </div>
    ),
    { ...size }
  );
}
