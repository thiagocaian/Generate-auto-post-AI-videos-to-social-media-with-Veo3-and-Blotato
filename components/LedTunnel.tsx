"use client";

// White LED light tunnel (like the reference ad): chamfered frames receding to a vanishing point,
// bright white light strips with a soft glow, on pale blue-grey walls. Pure SVG, no WebGL.

const FRAMES = 10;
const VP = { x: 500, y: 430 }; // vanishing point

// Chamfered frame (hexagon with cut top corners), scaled around the vanishing point
function frame(s: number) {
  const w = 620 * s, h = 520 * s, c = 120 * s;
  const x0 = VP.x - w, x1 = VP.x + w, yTop = VP.y - h, yBot = VP.y + h * 0.62;
  return [
    [x0, yBot], [x0, yTop + c], [x0 + c * 1.4, yTop], [x1 - c * 1.4, yTop], [x1, yTop + c], [x1, yBot],
  ].map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
}

export default function LedTunnel({ className = "" }: { className?: string }) {
  const scales = Array.from({ length: FRAMES }, (_, i) => Math.pow(0.78, i));
  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`} aria-hidden>
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 1000 700" preserveAspectRatio="xMidYMid slice">
        <defs>
          <radialGradient id="led-bg" cx="50%" cy="60%" r="75%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="35%" stopColor="#eef3f9" />
            <stop offset="100%" stopColor="#c9d6e4" />
          </radialGradient>
          <linearGradient id="led-floor" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0" />
            <stop offset="100%" stopColor="#dde6f0" stopOpacity="0.95" />
          </linearGradient>
          <filter id="led-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="7" result="b1" />
            <feGaussianBlur in="SourceGraphic" stdDeviation="2" result="b2" />
            <feMerge>
              <feMergeNode in="b1" />
              <feMergeNode in="b1" />
              <feMergeNode in="b2" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="led-blue" x="-50%" y="-200%" width="200%" height="500%">
            <feGaussianBlur stdDeviation="6" />
          </filter>
        </defs>

        <rect width="1000" height="700" fill="url(#led-bg)" />

        {/* wall shading between frames: darker bands that make the white strips pop */}
        {scales.map((s, i) => (
          <polygon key={`wall-${i}`} points={frame(s)} fill="none" stroke="#b9c8d8" strokeOpacity={0.35 - i * 0.025} strokeWidth={34 * s} />
        ))}

        {/* LED strips */}
        <g filter="url(#led-glow)">
          {scales.map((s, i) => (
            <polygon
              key={`led-${i}`}
              className="led-strip"
              points={frame(s)}
              fill="none"
              stroke="#ffffff"
              strokeWidth={Math.max(2, 9 * s)}
              strokeLinejoin="round"
              style={{ animationDelay: `${i * 0.3}s` }}
            />
          ))}
        </g>

        {/* glossy floor */}
        <rect x="0" y="470" width="1000" height="230" fill="url(#led-floor)" />

        {/* blue LED accents on the floor */}
        <g className="led-accent">
          <rect x="120" y="600" width="150" height="9" rx="4.5" fill="#5b5cf6" filter="url(#led-blue)" />
          <rect x="140" y="602" width="110" height="5" rx="2.5" fill="#7c7dff" />
          <rect x="730" y="600" width="150" height="9" rx="4.5" fill="#5b5cf6" filter="url(#led-blue)" />
          <rect x="750" y="602" width="110" height="5" rx="2.5" fill="#7c7dff" />
        </g>
      </svg>

      <style jsx>{`
        :global(.led-strip) { animation: led-breathe 4.5s ease-in-out infinite; }
        :global(.led-accent) { animation: led-breathe 3.4s ease-in-out infinite; }
        @keyframes led-breathe { 0%, 100% { opacity: 1; } 50% { opacity: 0.78; } }
        @media (prefers-reduced-motion: reduce) {
          :global(.led-strip), :global(.led-accent) { animation: none; }
        }
      `}</style>
    </div>
  );
}
