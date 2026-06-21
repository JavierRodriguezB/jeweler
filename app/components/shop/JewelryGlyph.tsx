/**
 * Iconos de línea de joyería usados como marcador de posición de imagen
 * (mientras no haya fotos reales). Cuando existan assets, las tarjetas pueden
 * cambiar a `next/image`; estos glifos mantienen la estética premium entretanto.
 */

export type GlyphName = "ring" | "necklace" | "earring" | "bracelet" | "gem";

/** Elige un glifo a partir del slug de categoría. */
export function glyphForCategory(slug: string): GlyphName {
  switch (slug) {
    case "novias":
    case "anillos":
      return "ring";
    case "collares":
      return "necklace";
    case "aretes":
      return "earring";
    case "ofertas":
      return "bracelet";
    default:
      return "gem";
  }
}

export default function JewelryGlyph({
  name,
  className = "",
}: {
  name: GlyphName;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.25}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      {glyphs[name]}
    </svg>
  );
}

const glyphs: Record<GlyphName, React.ReactNode> = {
  ring: (
    <>
      <circle cx="32" cy="40" r="15" />
      <path d="M24 27l8-9 8 9" />
      <path d="M32 18l-4 5 4 4 4-4z" />
    </>
  ),
  necklace: (
    <>
      <path d="M14 16c0 14 8 22 18 22s18-8 18-22" />
      <path d="M32 38v6" />
      <path d="M32 44l-4 5 4 5 4-5z" />
    </>
  ),
  earring: (
    <>
      <path d="M32 14c-5 0-9 4-9 9" />
      <circle cx="32" cy="30" r="3" />
      <path d="M32 33l-5 7 5 11 5-11z" />
    </>
  ),
  bracelet: (
    <>
      <ellipse cx="32" cy="34" rx="20" ry="13" />
      <ellipse cx="32" cy="34" rx="13" ry="8" />
      <path d="M32 21l-3 4 3 3 3-3z" />
    </>
  ),
  gem: (
    <>
      <path d="M20 26h24l-12 16z" />
      <path d="M20 26l4-7h16l4 7" />
      <path d="M26 19l-2 7 8 16M38 19l2 7-8 16M20 26h24" />
    </>
  ),
};
