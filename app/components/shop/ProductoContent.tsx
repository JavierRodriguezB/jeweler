"use client";

import Link from "next/link";
import { useCatalog } from "../catalog/CatalogContext";
import { formatPrice } from "../../lib/format";
import { SEASON_LABELS } from "../../lib/types";
import ProductGallery from "./ProductGallery";
import ProductPurchasePanel from "./ProductPurchasePanel";
import ProductCard from "./ProductCard";
import Stars from "./Stars";
import Reveal from "./Reveal";
import { glyphForCategory } from "./JewelryGlyph";

/** Ficha de producto que lee del catálogo en vivo (refleja ediciones del admin). */
export default function ProductoContent({ slug }: { slug: string }) {
  const {
    hydrated,
    getProductBySlug,
    getCategoryById,
    getActiveProductsByCategory,
  } = useCatalog();

  const product = getProductBySlug(slug);

  // Producto aún no encontrado: puede ser nuevo (en localStorage) → espera a
  // hidratar antes de declarar "no existe".
  if (!product) {
    return hydrated ? (
      <Message
        title="No encontramos esta pieza"
        cta={{ href: "/tienda", label: "Volver a la tienda" }}
      />
    ) : (
      <Message title="Cargando…" />
    );
  }

  const category = getCategoryById(product.categoryId);
  const glyph = glyphForCategory(category?.slug ?? "");
  const related = getActiveProductsByCategory(product.categoryId)
    .filter((p) => p.id !== product.id)
    .slice(0, 4);

  return (
    <div className="pb-8 pt-12 sm:pt-16">
      <div className="mx-auto w-full max-w-7xl px-6 sm:px-10 lg:px-16">
        <nav className="flex flex-wrap items-center gap-2 text-sm text-ink/45">
          <Link href="/tienda" className="transition-colors hover:text-rose-deep">
            Tienda
          </Link>
          {category && (
            <>
              <span aria-hidden>/</span>
              <Link
                href={`/coleccion/${category.slug}`}
                className="transition-colors hover:text-rose-deep"
              >
                {category.name}
              </Link>
            </>
          )}
          <span aria-hidden>/</span>
          <span className="text-ink/70">{product.name}</span>
        </nav>

        <div className="mt-8 grid gap-10 lg:grid-cols-2 lg:gap-16">
          <Reveal>
            <ProductGallery images={product.images} glyph={glyph} />
          </Reveal>

          <Reveal delay={80} className="lg:pt-4">
            {category && (
              <span className="text-[11px] uppercase tracking-[0.25em] text-rose-deep">
                {category.name} · {SEASON_LABELS[product.season]}
              </span>
            )}
            <h1 className="mt-3 font-display text-4xl leading-tight text-ink sm:text-5xl">
              {product.name}
            </h1>

            <div className="mt-4 flex items-center gap-4">
              <span className="text-2xl text-ink">
                {formatPrice(product.price)}
              </span>
              {product.compareAtPrice && (
                <span className="text-lg text-ink/40 line-through">
                  {formatPrice(product.compareAtPrice)}
                </span>
              )}
            </div>

            <div className="mt-3">
              <Stars rating={product.rating} reviewCount={product.reviewCount} />
            </div>

            <p className="mt-6 max-w-md text-base leading-relaxed text-ink/65">
              {product.description}
            </p>

            <div className="mt-8">
              <ProductPurchasePanel product={product} />
            </div>

            {product.details.length > 0 && (
              <div className="mt-10 border-t border-ink/10">
                {product.details.map((block) => (
                  <details key={block.title} className="group border-b border-ink/10">
                    <summary className="flex cursor-pointer list-none items-center justify-between py-4 text-sm tracking-wide text-ink transition-colors hover:text-rose-deep [&::-webkit-details-marker]:hidden">
                      {block.title}
                      <span className="text-lg text-ink/40 transition-transform duration-200 group-open:rotate-45">
                        +
                      </span>
                    </summary>
                    <ul className="space-y-2 pb-5 text-sm leading-relaxed text-ink/60">
                      {block.items.map((item) => (
                        <li key={item} className="flex gap-2.5">
                          <span aria-hidden className="text-rose/60">
                            ·
                          </span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </details>
                ))}
              </div>
            )}
          </Reveal>
        </div>

        {related.length > 0 && (
          <section className="mt-24">
            <Reveal>
              <h2 className="font-display text-3xl text-ink sm:text-4xl">
                También te puede gustar
              </h2>
            </Reveal>
            <div className="mt-10 grid grid-cols-2 gap-x-5 gap-y-10 sm:grid-cols-3 lg:grid-cols-4">
              {related.map((p, i) => (
                <Reveal key={p.id} delay={i * 70}>
                  <ProductCard product={p} category={category} />
                </Reveal>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

function Message({
  title,
  cta,
}: {
  title: string;
  cta?: { href: string; label: string };
}) {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-6 py-32 text-center">
      <p className="text-sm text-ink/55">{title}</p>
      {cta && (
        <Link
          href={cta.href}
          className="mt-4 inline-block rounded-full bg-rose px-6 py-3 text-sm tracking-wide text-white transition-colors hover:bg-rose-deep"
        >
          {cta.label}
        </Link>
      )}
    </div>
  );
}
