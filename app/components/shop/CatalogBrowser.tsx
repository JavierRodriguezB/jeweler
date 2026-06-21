"use client";

import { useMemo, useState } from "react";
import type { Category, Product, Season } from "../../lib/types";
import { SEASON_LABELS } from "../../lib/types";
import ProductCard from "./ProductCard";
import Reveal from "./Reveal";

/**
 * Grilla de productos con filtro por temporada (cliente). Las páginas (servidor)
 * le pasan los datos ya resueltos por los selectores.
 */
export default function CatalogBrowser({
  products,
  categories,
}: {
  products: Product[];
  categories: Category[];
}) {
  const [season, setSeason] = useState<Season | "todas">("todas");

  const categoriesById = useMemo(
    () => new Map(categories.map((c) => [c.id, c])),
    [categories]
  );

  // Temporadas presentes en este conjunto de productos (en orden fijo).
  const seasons = useMemo(() => {
    const order: Season[] = ["primavera", "verano", "otono", "invierno", "atemporal"];
    const present = new Set(products.map((p) => p.season));
    return order.filter((s) => present.has(s));
  }, [products]);

  const visible = useMemo(
    () =>
      season === "todas"
        ? products
        : products.filter((p) => p.season === season),
    [products, season]
  );

  return (
    <div>
      {seasons.length > 1 && (
        <div className="flex flex-wrap items-center gap-2.5">
          <FilterChip
            active={season === "todas"}
            onClick={() => setSeason("todas")}
          >
            Todas
          </FilterChip>
          {seasons.map((s) => (
            <FilterChip
              key={s}
              active={season === s}
              onClick={() => setSeason(s)}
            >
              {SEASON_LABELS[s]}
            </FilterChip>
          ))}
        </div>
      )}

      <p className="mt-6 text-sm text-ink/50">
        {visible.length} {visible.length === 1 ? "pieza" : "piezas"}
      </p>

      {visible.length > 0 ? (
        <div className="mt-6 grid grid-cols-2 gap-x-5 gap-y-10 sm:grid-cols-3 lg:grid-cols-4">
          {visible.map((product, i) => (
            <Reveal key={product.id} delay={(i % 4) * 70}>
              <ProductCard
                product={product}
                category={categoriesById.get(product.categoryId)}
              />
            </Reveal>
          ))}
        </div>
      ) : (
        <p className="mt-12 text-center text-sm text-ink/50">
          No hay piezas en esta temporada por ahora.
        </p>
      )}
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-full px-4 py-2 text-sm tracking-wide transition-colors ${
        active
          ? "bg-ink text-white"
          : "bg-white text-ink/70 ring-1 ring-ink/10 hover:ring-rose/50"
      }`}
    >
      {children}
    </button>
  );
}
