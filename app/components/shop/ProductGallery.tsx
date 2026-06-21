"use client";

import { useState } from "react";
import type { ProductImage } from "../../lib/types";
import JewelryGlyph, { type GlyphName } from "./JewelryGlyph";

/**
 * Galería de producto: imagen principal + miniaturas (como en la maqueta de
 * referencia). Mientras no haya fotos reales, cada imagen se representa con un
 * placeholder de gradiente + glifo; al haber assets, cambia `frame` por
 * `next/image` usando `image.url`.
 */
const frames = [
  "from-ivory via-white to-ivory-soft",
  "from-blush/40 via-ivory to-gold-soft/30",
  "from-ivory-soft via-white to-blush/30",
  "from-gold-soft/30 via-ivory to-rose/15",
];

export default function ProductGallery({
  images,
  glyph,
}: {
  images: ProductImage[];
  glyph: GlyphName;
}) {
  const primaryIndex = Math.max(
    0,
    images.findIndex((img) => img.isPrimary)
  );
  const [active, setActive] = useState(primaryIndex);
  const current = images[active] ?? images[0];

  return (
    <div className="flex flex-col gap-4">
      {/* Imagen principal */}
      <div
        className={`relative flex aspect-square items-center justify-center overflow-hidden rounded-[28px] bg-gradient-to-br ${
          frames[active % frames.length]
        } ring-1 ring-ink/5`}
      >
        <JewelryGlyph
          name={glyph}
          className="h-40 w-40 text-rose/40 transition-transform duration-500"
        />
        <span className="sr-only">{current?.alt}</span>
      </div>

      {/* Miniaturas */}
      {images.length > 1 && (
        <div className="grid grid-cols-4 gap-3">
          {images.map((image, i) => {
            const isActive = i === active;
            return (
              <button
                key={image.id}
                type="button"
                onClick={() => setActive(i)}
                aria-label={image.alt}
                aria-pressed={isActive}
                className={`relative flex aspect-square items-center justify-center overflow-hidden rounded-[16px] bg-gradient-to-br ${
                  frames[i % frames.length]
                } transition-all duration-200 ${
                  isActive
                    ? "ring-2 ring-rose-deep"
                    : "ring-1 ring-ink/5 hover:ring-rose/50"
                }`}
              >
                <JewelryGlyph name={glyph} className="h-10 w-10 text-rose/35" />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
