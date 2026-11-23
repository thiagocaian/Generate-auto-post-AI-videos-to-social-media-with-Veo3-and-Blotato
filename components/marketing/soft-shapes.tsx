/**
 * Flat abstract petal shapes (pure CSS gradients, no 3D, no blur).
 * Decorative only: sits behind content (z-index -1) inside an `isolate` parent.
 */
export default function SoftShapes({ className = "" }: { className?: string }) {
  return (
    <div aria-hidden="true" className={`cy-shapes ${className}`}>
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <span key={i} className="cy-petal" style={{ transform: `rotate(${i * 60}deg)` }} />
      ))}
      <span className="cy-petal-core" />
    </div>
  );
}
