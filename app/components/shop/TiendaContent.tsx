"use client";

import { useCatalog } from "../catalog/CatalogContext";
import CategoryGrid from "./CategoryGrid";
import CatalogBrowser from "./CatalogBrowser";
import Reveal from "./Reveal";

/** Escaparate completo, leyendo del catálogo en vivo. */
export default function TiendaContent() {
  const { categories, activeProducts, countActiveByCategory } = useCatalog();

  // Recalcula el contador de cada categoría según los productos activos.
  const categoriesWithCounts = categories.map((c) => ({
    ...c,
    productCount: countActiveByCategory(c.id),
  }));

  return (
    <div className="pb-8 pt-16 sm:pt-20">
      <section className="mx-auto w-full max-w-7xl px-6 sm:px-10 lg:px-16">
        <Reveal>
          <span className="text-xs uppercase tracking-[0.3em] text-rose-deep">
            Catálogo
          </span>
          <h1 className="mt-4 max-w-2xl font-display text-4xl leading-[1.05] text-ink sm:text-6xl">
            Nuestra <span className="italic text-rose-deep">colección</span>{" "}
            completa
          </h1>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-ink/60">
            Piezas que rotan por temporada y clásicos atemporales. Empieza por
            una categoría o explora todo el catálogo.
          </p>
        </Reveal>
      </section>

      <div className="mt-16">
        <CategoryGrid categories={categoriesWithCounts} showViewAll={false} />
      </div>

      <section className="mx-auto mt-20 w-full max-w-7xl px-6 sm:px-10 lg:px-16">
        <Reveal>
          <h2 className="font-display text-3xl text-ink sm:text-4xl">
            Todas las piezas
          </h2>
        </Reveal>
        <div className="mt-8">
          <CatalogBrowser products={activeProducts} categories={categories} />
        </div>
      </section>
    </div>
  );
}
