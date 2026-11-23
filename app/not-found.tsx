import Link from "next/link";

export default function NotFound() {
  return (
    <div
      style={{
        backgroundColor: "#ffffff",
        color: "#1a1a1a",
        minHeight: "100vh",
        padding: "48px 24px 96px",
      }}
    >
      <div style={{ maxWidth: 800, margin: "0 auto" }}>
        <Link
          href="/"
          style={{
            display: "inline-block",
            marginBottom: 40,
            color: "#6b7280",
            textDecoration: "none",
            fontSize: 14,
          }}
        >
          &larr; Back to Home
        </Link>

        <h1
          style={{
            fontSize: 32,
            fontWeight: 700,
            marginBottom: 8,
            lineHeight: 1.2,
          }}
        >
          Page not found
        </h1>
        <p style={{ color: "#6b7280", fontSize: 14, marginBottom: 48 }}>404</p>
        <p style={{ fontSize: 15, lineHeight: 1.75, color: "#374151" }}>
          No page is published at this URL.
        </p>
      </div>
    </div>
  );
}
