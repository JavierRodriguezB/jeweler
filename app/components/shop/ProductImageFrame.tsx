import Image from "next/image";
import JewelryGlyph, { type GlyphName } from "./JewelryGlyph";

/**
 * Muestra la imagen real (Supabase Storage) con `next/image` cuando hay una URL
 * http(s); si no, cae al glifo de joyería (placeholder). El contenedor padre
 * debe ser `relative` y tener tamaño.
 */
export default function ProductImageFrame({
  url,
  alt = "",
  glyph,
  sizes = "(max-width: 768px) 50vw, 25vw",
  glyphClassName = "h-24 w-24",
}: {
  url?: string;
  alt?: string;
  glyph: GlyphName;
  sizes?: string;
  glyphClassName?: string;
}) {
  if (url && /^https?:\/\//.test(url)) {
    return (
      <Image src={url} alt={alt} fill sizes={sizes} className="object-cover" />
    );
  }
  return (
    <span className="absolute inset-0 flex items-center justify-center text-rose/35">
      <JewelryGlyph name={glyph} className={glyphClassName} />
    </span>
  );
}
