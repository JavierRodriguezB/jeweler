"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useCart } from "./CartContext";
import { formatPrice } from "../../lib/format";
import JewelryGlyph from "../shop/JewelryGlyph";
import ProductImageFrame from "../shop/ProductImageFrame";

/** Panel lateral del carrito. Se monta una vez en el layout del escaparate. */
export default function CartDrawer() {
  const {
    lines,
    count,
    subtotal,
    isOpen,
    closeCart,
    updateQuantity,
    removeItem,
  } = useCart();

  // Cerrar con Escape y bloquear el scroll del fondo mientras está abierto.
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeCart();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [isOpen, closeCart]);

  return (
    <div
      className={`fixed inset-0 z-50 ${
        isOpen ? "" : "pointer-events-none"
      }`}
      aria-hidden={!isOpen}
    >
      {/* Velo */}
      <div
        onClick={closeCart}
        className={`absolute inset-0 bg-ink/40 backdrop-blur-sm transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0"
        }`}
      />

      {/* Panel */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Tu bolsa"
        className={`absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-ivory shadow-2xl transition-transform duration-300 ease-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <header className="flex items-center justify-between border-b border-ink/8 px-6 py-5">
          <h2 className="font-display text-xl text-ink">
            Tu bolsa{" "}
            <span className="text-ink/40">
              ({count} {count === 1 ? "pieza" : "piezas"})
            </span>
          </h2>
          <button
            type="button"
            onClick={closeCart}
            aria-label="Cerrar bolsa"
            className="flex h-9 w-9 items-center justify-center rounded-full text-ink/50 transition-colors hover:bg-ink/5 hover:text-ink"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.5}>
              <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
            </svg>
          </button>
        </header>

        {lines.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-5 px-6 text-center">
            <span className="text-ink/20">
              <JewelryGlyph name="gem" className="h-16 w-16" />
            </span>
            <p className="text-sm text-ink/55">Tu bolsa está vacía.</p>
            <Link
              href="/tienda"
              onClick={closeCart}
              className="rounded-full bg-rose px-6 py-3 text-sm tracking-wide text-white transition-colors hover:bg-rose-deep"
            >
              Explorar la tienda
            </Link>
          </div>
        ) : (
          <>
            <ul className="flex-1 divide-y divide-ink/8 overflow-y-auto px-6">
              {lines.map((line) => (
                <li key={line.key} className="flex gap-4 py-5">
                  <Link
                    href={`/producto/${line.product.slug}`}
                    onClick={closeCart}
                    className="relative h-20 w-20 shrink-0 overflow-hidden rounded-[16px] bg-gradient-to-br from-ivory via-white to-ivory-soft ring-1 ring-ink/5"
                  >
                    <ProductImageFrame
                      url={
                        line.product.images.find((i) => i.isPrimary)?.url ??
                        line.product.images[0]?.url
                      }
                      alt={line.product.name}
                      glyph={line.glyph}
                      sizes="80px"
                      glyphClassName="h-10 w-10"
                    />
                  </Link>

                  <div className="flex flex-1 flex-col">
                    <div className="flex justify-between gap-3">
                      <Link
                        href={`/producto/${line.product.slug}`}
                        onClick={closeCart}
                        className="font-display text-base text-ink transition-colors hover:text-rose-deep"
                      >
                        {line.product.name}
                      </Link>
                      <button
                        type="button"
                        onClick={() => removeItem(line.key)}
                        aria-label={`Quitar ${line.product.name}`}
                        className="text-ink/35 transition-colors hover:text-rose-deep"
                      >
                        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.5}>
                          <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
                        </svg>
                      </button>
                    </div>

                    {line.variantLabels.length > 0 && (
                      <p className="mt-0.5 text-xs text-ink/50">
                        {line.variantLabels.join(" · ")}
                      </p>
                    )}

                    <div className="mt-auto flex items-center justify-between pt-3">
                      <div className="flex items-center rounded-full ring-1 ring-ink/12">
                        <button
                          type="button"
                          onClick={() =>
                            updateQuantity(line.key, line.quantity - 1)
                          }
                          aria-label="Quitar uno"
                          className="flex h-8 w-8 items-center justify-center text-ink/60 transition-colors hover:text-rose-deep"
                        >
                          −
                        </button>
                        <span className="w-7 text-center text-sm tabular-nums">
                          {line.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            updateQuantity(
                              line.key,
                              Math.min(line.product.stock, line.quantity + 1)
                            )
                          }
                          aria-label="Añadir uno"
                          className="flex h-8 w-8 items-center justify-center text-ink/60 transition-colors hover:text-rose-deep"
                        >
                          +
                        </button>
                      </div>
                      <span className="text-sm text-ink">
                        {formatPrice(line.lineTotal)}
                      </span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <footer className="border-t border-ink/8 px-6 py-6">
              <div className="flex items-center justify-between">
                <span className="text-sm text-ink/60">Subtotal</span>
                <span className="font-display text-xl text-ink">
                  {formatPrice(subtotal)}
                </span>
              </div>
              <p className="mt-1 text-xs text-ink/40">
                Envío e impuestos se calculan en el pago.
              </p>

              <Link
                href="/checkout"
                onClick={closeCart}
                className="mt-5 block w-full rounded-full bg-rose px-7 py-3.5 text-center text-sm tracking-wide text-white transition-colors hover:bg-rose-deep"
              >
                Finalizar compra
              </Link>

              <button
                type="button"
                onClick={closeCart}
                className="mt-3 w-full text-center text-sm tracking-wide text-ink/55 underline-offset-4 transition-colors hover:text-rose-deep hover:underline"
              >
                Seguir comprando
              </button>
            </footer>
          </>
        )}
      </aside>
    </div>
  );
}
