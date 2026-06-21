/** Valoración en estrellas (0–5, admite medias). Solo presentacional. */
export default function Stars({
  rating,
  reviewCount,
  className = "",
}: {
  rating: number;
  reviewCount?: number;
  className?: string;
}) {
  const rounded = Math.round(rating * 2) / 2;

  return (
    <span className={`inline-flex items-center gap-1.5 ${className}`}>
      <span className="inline-flex gap-0.5" aria-hidden>
        {Array.from({ length: 5 }).map((_, i) => {
          const pct = Math.max(0, Math.min(1, rounded - i)) * 100;
          return <Star key={i} pct={pct} />;
        })}
      </span>
      <span className="sr-only">{rating} de 5</span>
      {reviewCount !== undefined && (
        <span className="text-xs text-ink/50">({reviewCount})</span>
      )}
    </span>
  );
}

/** Estrella con relleno parcial mediante recorte por ancho (sin ids → SSR-safe). */
function Star({ pct }: { pct: number }) {
  return (
    <span className="relative inline-block h-3.5 w-3.5">
      <StarSvg filled={false} />
      {pct > 0 && (
        <span
          className="absolute inset-0 overflow-hidden"
          style={{ width: `${pct}%` }}
        >
          <StarSvg filled />
        </span>
      )}
    </span>
  );
}

function StarSvg({ filled }: { filled: boolean }) {
  return (
    <svg viewBox="0 0 20 20" className="h-3.5 w-3.5">
      <path
        d="M10 1.5l2.6 5.27 5.82.85-4.21 4.1.99 5.79L10 14.77l-5.2 2.73.99-5.79-4.21-4.1 5.82-.85z"
        fill={filled ? "var(--gold)" : "transparent"}
        stroke="var(--gold)"
        strokeWidth="1"
        strokeLinejoin="round"
      />
    </svg>
  );
}
