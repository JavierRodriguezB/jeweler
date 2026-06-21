import Link from "next/link";
import type { Category } from "../../lib/types";
import Reveal from "./Reveal";
import JewelryGlyph, { glyphForCategory } from "./JewelryGlyph";

/**
 * Vista "Comprar por categoría": encabezado + grilla de tarjetas con portada y
 * nombre superpuesto abajo. Cada tarjeta enlaza a /coleccion/[slug].
 */
export default function CategoryGrid({
  categories,
  title = "Comprar por categoría",
  showViewAll = true,
}: {
  categories: Category[];
  title?: string;
  showViewAll?: boolean;
}) {
  return (
    <section className="mx-auto w-full max-w-7xl px-6 sm:px-10 lg:px-16">
      <Reveal className="flex items-end justify-between gap-4">
        <div>
          <span className="text-xs uppercase tracking-[0.3em] text-rose-deep">
            Catálogo
          </span>
          <h2 className="mt-3 font-display text-3xl text-ink sm:text-4xl">
            {title}
          </h2>
        </div>
        {showViewAll && (
          <Link
            href="/tienda"
            className="group hidden shrink-0 items-center gap-2 text-sm tracking-wide text-rose-deep transition-colors hover:text-ink sm:inline-flex"
          >
            Ver todo
            <span className="transition-transform group-hover:translate-x-1">
              →
            </span>
          </Link>
        )}
      </Reveal>

      <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {categories.map((category, i) => (
          <Reveal key={category.id} delay={i * 70}>
            <CategoryCard category={category} />
          </Reveal>
        ))}
      </div>

      {showViewAll && (
        <Link
          href="/tienda"
          className="mt-8 inline-flex items-center gap-2 text-sm tracking-wide text-rose-deep transition-colors hover:text-ink sm:hidden"
        >
          Ver todo el catálogo
          <span aria-hidden>→</span>
        </Link>
      )}
    </section>
  );
}

function CategoryCard({ category }: { category: Category }) {
  return (
    <Link
      href={`/coleccion/${category.slug}`}
      className="group relative flex aspect-[4/5] flex-col justify-end overflow-hidden rounded-[22px] ring-1 ring-ink/5 transition-shadow duration-300 hover:shadow-[0_28px_56px_-28px_rgba(168,100,95,0.4)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-deep"
    >
      {/* Portada (placeholder con gradiente + glifo de joyería) */}
      <span
        aria-hidden
        className={`absolute inset-0 bg-gradient-to-br ${
          category.accent ?? "from-ivory via-ivory-soft to-blush/60"
        }`}
      />
      <span
        aria-hidden
        className="absolute inset-0 flex items-center justify-center text-ink/25 transition-transform duration-500 group-hover:scale-110"
      >
        <JewelryGlyph
          name={glyphForCategory(category.slug)}
          className="h-20 w-20"
        />
      </span>

      {/* Velo inferior para legibilidad del nombre */}
      <span
        aria-hidden
        className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-ink/55 via-ink/15 to-transparent"
      />

      <span className="relative z-10 p-5">
        <span className="block font-display text-lg text-white drop-shadow-sm sm:text-xl">
          {category.name}
        </span>
        <span className="mt-1 inline-flex items-center gap-1.5 text-xs text-white/80">
          {category.productCount}{" "}
          {category.productCount === 1 ? "pieza" : "piezas"}
          <span className="transition-transform duration-300 group-hover:translate-x-1">
            →
          </span>
        </span>
      </span>
    </Link>
  );
}
