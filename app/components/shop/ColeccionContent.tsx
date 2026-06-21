"use client";

import Link from "next/link";
import { useCatalog } from "../catalog/CatalogContext";
import CatalogBrowser from "./CatalogBrowser";
import Reveal from "./Reveal";

/** Productos de una categoría, leyendo del catálogo en vivo. */
export default function ColeccionContent({ slug }: { slug: string }) {
  const {
    hydrated,
    categories,
    getCategoryBySlug,
    getActiveProductsByCategory,
  } = useCatalog();

  const category = getCategoryBySlug(slug);

  if (!category) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center px-6 py-32 text-center">
        <p className="text-sm text-ink/55">
          {hydrated ? "No encontramos esta colección." : "Cargando…"}
        </p>
        {hydrated && (
          <Link
            href="/tienda"
            className="mt-4 inline-block rounded-full bg-rose px-6 py-3 text-sm tracking-wide text-white transition-colors hover:bg-rose-deep"
          >
            Volver a la tienda
          </Link>
        )}
      </div>
    );
  }

  const products = getActiveProductsByCategory(category.id);

  return (
    <div className="pb-8 pt-16 sm:pt-20">
      <section className="mx-auto w-full max-w-7xl px-6 sm:px-10 lg:px-16">
        <Reveal>
          <Link
            href="/tienda"
            className="group inline-flex items-center gap-2 text-sm tracking-wide text-ink/50 transition-colors hover:text-rose-deep"
          >
            <span className="transition-transform group-hover:-translate-x-1">←</span>
            Tienda
          </Link>

          <h1 className="mt-6 font-display text-4xl leading-[1.05] text-ink sm:text-6xl">
            {category.name}
          </h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-ink/60">
            {category.description}
          </p>
        </Reveal>

        <div className="mt-12">
          <CatalogBrowser products={products} categories={categories} />
        </div>
      </section>
    </div>
  );
}
