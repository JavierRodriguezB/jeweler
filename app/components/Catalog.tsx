"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

type Category = {
  id: string;
  number: string;
  title: string;
  caption: string;
  swatch: string;
};

const categories: Category[] = [
  {
    id: "novias",
    number: "01",
    title: "Novias",
    caption: "Piezas diseñadas para el día que lo cambia todo.",
    swatch: "from-ivory via-blush to-gold-soft/60",
  },
  {
    id: "premium",
    number: "02",
    title: "Premium",
    caption: "La excelencia en cada detalle, sin concesiones.",
    swatch: "from-gold-soft/80 via-rose/45 to-rose-deep/30",
  },
  {
    id: "clasica",
    number: "03",
    title: "Clásica",
    caption: "El diseño que nunca pasa de moda.",
    swatch: "from-blush via-rose/55 to-rose-deep/25",
  },
  {
    id: "minimalista",
    number: "04",
    title: "Minimalista",
    caption: "Menos es más: líneas puras, esencia pura.",
    swatch: "from-ivory via-ivory-soft to-blush/60",
  },
];

const EXPANDED = 4;
const COLLAPSED = 1;

export default function Catalog() {
  const [active, setActive] = useState(0);
  const sectionRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    cardRefs.current.forEach((card, i) => {
      if (!card) return;
      gsap.set(card, { flexGrow: i === active ? EXPANDED : COLLAPSED });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    // Ámbito de GSAP: revert() restaura los estilos en línea originales en la
    // limpieza, para que las animaciones `.from()` se re-inicialicen bien al
    // re-montar en navegaciones del lado del cliente (y mata su ScrollTrigger).
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top 75%",
        },
        defaults: { ease: "power3.out" },
      });

      tl.from(section.querySelectorAll("[data-reveal]"), {
        y: 24,
        opacity: 0,
        duration: 0.7,
        stagger: 0.08,
      }).from(
        cardRefs.current,
        { y: 32, opacity: 0, duration: 0.7, stagger: 0.06 },
        "-=0.4"
      );
    }, section);

    return () => ctx.revert();
  }, []);

  const handleSelect = (index: number) => {
    if (index === active) return;
    setActive(index);

    cardRefs.current.forEach((card, i) => {
      if (!card) return;
      gsap.to(card, {
        flexGrow: i === index ? EXPANDED : COLLAPSED,
        duration: 0.8,
        ease: "power3.inOut",
      });
    });
  };

  return (
    <section
      ref={sectionRef}
      id="colecciones"
      className="relative bg-ivory px-6 py-24 sm:px-10 lg:px-16"
    >
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div data-reveal>
            <span className="text-xs uppercase tracking-[0.3em] text-rose-deep">
              Colecciones
            </span>
            <h2 className="mt-4 font-display text-4xl text-ink sm:text-5xl">
              Líneas exclusivas,{" "}
              <span className="italic text-rose-deep">hechas para ti.</span>
            </h2>
          </div>
          <p data-reveal className="max-w-sm text-sm leading-relaxed text-ink/60">
            Cada colección tiene su propio carácter. Toca una para descubrir
            el detalle que la hace única.
          </p>
        </div>

        <div className="mt-14 flex h-[680px] flex-col gap-3 sm:h-[560px] sm:flex-row sm:gap-4">
          {categories.map((category, index) => {
            const isActive = index === active;
            return (
              <button
                key={category.id}
                ref={(el) => {
                  cardRefs.current[index] = el;
                }}
                type="button"
                onClick={() => handleSelect(index)}
                aria-expanded={isActive}
                className={`group relative flex min-h-[96px] flex-1 cursor-pointer overflow-hidden rounded-[28px] bg-gradient-to-br ${category.swatch} text-left ring-1 ring-ink/5 transition-shadow duration-300 hover:ring-rose/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-deep`}
              >
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-0 rounded-[28px] border border-white/50"
                />

                <span
                  className={`absolute inset-0 flex flex-col justify-between p-6 transition-opacity duration-300 ${
                    isActive ? "opacity-0" : "opacity-100"
                  }`}
                >
                  <span className="font-display text-xs text-ink/40">
                    {category.number}
                  </span>
                  <span className="font-display text-lg text-ink sm:text-xl sm:[writing-mode:vertical-rl]">
                    {category.title}
                  </span>
                </span>

                <span
                  className={`absolute inset-0 flex flex-col justify-end p-8 transition-opacity duration-500 sm:p-10 ${
                    isActive ? "opacity-100" : "opacity-0"
                  }`}
                >
                  <span className="font-display text-xs text-ink/40">
                    {category.number}
                  </span>
                  <span className="mt-2 font-display text-3xl text-ink sm:text-4xl">
                    {category.title}
                  </span>
                  <span className="mt-3 max-w-xs text-sm leading-relaxed text-ink/65">
                    {category.caption}
                  </span>
                  <span className="mt-6 inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-rose-deep">
                    Ver más
                    <span aria-hidden>→</span>
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
