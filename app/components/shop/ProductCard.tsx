import Link from "next/link";
import type { Category, Product } from "../../lib/types";
import { formatPrice } from "../../lib/format";
import JewelryGlyph, { glyphForCategory } from "./JewelryGlyph";
import Stars from "./Stars";

/** Tarjeta de producto para grillas de catálogo. Enlaza a /producto/[slug]. */
export default function ProductCard({
  product,
  category,
}: {
  product: Product;
  category?: Category;
}) {
  const glyph = glyphForCategory(category?.slug ?? "");

  return (
    <Link
      href={`/producto/${product.slug}`}
      className="group flex flex-col focus-visible:outline-none"
    >
      <div className="relative aspect-square overflow-hidden rounded-[22px] bg-gradient-to-br from-ivory via-white to-ivory-soft ring-1 ring-ink/5 transition-shadow duration-300 group-hover:shadow-[0_28px_56px_-30px_rgba(168,100,95,0.45)] group-focus-visible:ring-2 group-focus-visible:ring-rose-deep">
        {/* Imagen (placeholder con glifo mientras no haya foto real) */}
        <span className="absolute inset-0 flex items-center justify-center text-rose/35 transition-transform duration-500 group-hover:scale-110">
          <JewelryGlyph name={glyph} className="h-24 w-24" />
        </span>

        {/* Insignias */}
        <div className="absolute left-4 top-4 flex flex-col gap-2">
          {product.isNew && (
            <span className="rounded-full bg-ink px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-white">
              Novedad
            </span>
          )}
          {product.isOnSale && (
            <span className="rounded-full bg-rose-deep px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-white">
              Oferta
            </span>
          )}
        </div>

        {/* Afecto decorativo de favoritos (funcional en una fase posterior) */}
        <span
          aria-hidden
          className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-white/70 text-ink/50 opacity-0 backdrop-blur-sm transition-opacity duration-300 group-hover:opacity-100"
        >
          <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" stroke="currentColor" strokeWidth={1.5}>
            <path d="M12 20s-7-4.5-7-9.5A3.5 3.5 0 0112 7a3.5 3.5 0 017 3.5C19 15.5 12 20 12 20z" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>

        {/* Llamada a ver la pieza */}
        <span className="absolute inset-x-4 bottom-4 translate-y-2 rounded-full bg-ink/85 py-2.5 text-center text-xs uppercase tracking-[0.2em] text-white opacity-0 backdrop-blur-sm transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
          Ver pieza
        </span>
      </div>

      <div className="mt-4 px-1">
        {category && (
          <span className="text-[11px] uppercase tracking-[0.2em] text-ink/40">
            {category.name}
          </span>
        )}
        <h3 className="mt-1 font-display text-lg text-ink transition-colors group-hover:text-rose-deep">
          {product.name}
        </h3>
        <div className="mt-1.5">
          <Stars rating={product.rating} reviewCount={product.reviewCount} />
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-base text-ink">{formatPrice(product.price)}</span>
          {product.compareAtPrice && (
            <span className="text-sm text-ink/40 line-through">
              {formatPrice(product.compareAtPrice)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
