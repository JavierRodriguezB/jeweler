"use client";

import { useMemo, useState } from "react";
import type { Product, ProductVariant, VariantType } from "../../lib/types";
import { useCart } from "../cart/CartContext";

const TYPE_LABELS: Record<VariantType, string> = {
  color: "Color",
  material: "Material",
  talla: "Talla",
};

const TYPE_ORDER: VariantType[] = ["color", "material", "talla"];

/**
 * Selección de variantes + cantidad + añadir a la bolsa. El carrito real llega
 * en una fase posterior; aquí se muestra una confirmación local.
 */
export default function ProductPurchasePanel({ product }: { product: Product }) {
  const { addItem } = useCart();
  const groups = useMemo(() => groupVariants(product.variants), [product.variants]);

  const [selected, setSelected] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    for (const [type, variants] of groups) {
      const first = variants.find((v) => v.available) ?? variants[0];
      if (first) initial[type] = first.id;
    }
    return initial;
  });
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  const inStock = product.stock > 0;

  function handleAdd() {
    // Clave de variante: ids elegidos (en orden de tipo) unidos por "|".
    const variantKey =
      groups
        .map(([type]) => selected[type])
        .filter(Boolean)
        .join("|") || undefined;

    addItem(product.id, variantKey, qty);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 2200);
  }

  return (
    <div>
      {/* Variantes */}
      <div className="space-y-6">
        {groups.map(([type, variants]) => (
          <div key={type}>
            <span className="text-sm tracking-wide text-ink/70">
              {TYPE_LABELS[type]}
            </span>
            <div className="mt-3 flex flex-wrap gap-2.5">
              {variants.map((variant) => {
                const isSelected = selected[type] === variant.id;
                const disabled = !variant.available;

                if (type === "color") {
                  return (
                    <button
                      key={variant.id}
                      type="button"
                      disabled={disabled}
                      onClick={() =>
                        setSelected((s) => ({ ...s, [type]: variant.id }))
                      }
                      title={variant.label}
                      aria-label={variant.label}
                      aria-pressed={isSelected}
                      className={`h-9 w-9 rounded-full ring-offset-2 transition disabled:cursor-not-allowed disabled:opacity-40 ${
                        isSelected
                          ? "ring-2 ring-rose-deep ring-offset-ivory"
                          : "ring-1 ring-ink/15"
                      }`}
                      style={{ backgroundColor: variant.value }}
                    />
                  );
                }

                return (
                  <button
                    key={variant.id}
                    type="button"
                    disabled={disabled}
                    onClick={() =>
                      setSelected((s) => ({ ...s, [type]: variant.id }))
                    }
                    aria-pressed={isSelected}
                    className={`rounded-full px-4 py-2 text-sm tracking-wide transition disabled:cursor-not-allowed disabled:text-ink/30 disabled:line-through ${
                      isSelected
                        ? "bg-ink text-white"
                        : "bg-white text-ink/75 ring-1 ring-ink/12 hover:ring-rose/50"
                    }`}
                  >
                    {variant.label}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Cantidad + añadir */}
      <div className="mt-8 flex items-center gap-4">
        <div className="flex items-center rounded-full ring-1 ring-ink/12">
          <button
            type="button"
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            aria-label="Quitar uno"
            className="flex h-11 w-11 items-center justify-center text-lg text-ink/60 transition-colors hover:text-rose-deep"
          >
            −
          </button>
          <span className="w-8 text-center text-sm tabular-nums">{qty}</span>
          <button
            type="button"
            onClick={() => setQty((q) => Math.min(product.stock, q + 1))}
            aria-label="Añadir uno"
            className="flex h-11 w-11 items-center justify-center text-lg text-ink/60 transition-colors hover:text-rose-deep"
          >
            +
          </button>
        </div>

        <button
          type="button"
          onClick={handleAdd}
          disabled={!inStock}
          className="group flex flex-1 items-center justify-center gap-2 rounded-full bg-rose px-7 py-3.5 text-sm tracking-wide text-white transition-colors hover:bg-rose-deep disabled:cursor-not-allowed disabled:bg-ink/20"
        >
          {!inStock
            ? "Agotado"
            : added
            ? "Añadido a la bolsa ✓"
            : "Agregar a la bolsa"}
        </button>
      </div>

      {inStock && product.stock <= 5 && (
        <p className="mt-3 text-xs text-rose-deep">
          Solo quedan {product.stock} unidades.
        </p>
      )}
    </div>
  );
}

function groupVariants(
  variants: ProductVariant[]
): [VariantType, ProductVariant[]][] {
  const map = new Map<VariantType, ProductVariant[]>();
  for (const v of variants) {
    const list = map.get(v.type) ?? [];
    list.push(v);
    map.set(v.type, list);
  }
  return TYPE_ORDER.filter((t) => map.has(t)).map((t) => [t, map.get(t)!]);
}
