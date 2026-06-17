"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

export default function Hero() {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const ringPath = root.querySelector<SVGPathElement>("[data-ring-path]");
    const ringLength = ringPath?.getTotalLength() ?? 0;

    const tl = gsap.timeline({
      defaults: { ease: "power3.out" },
    });

    if (ringPath) {
      gsap.set(ringPath, {
        strokeDasharray: ringLength,
        strokeDashoffset: ringLength,
      });
    }

    tl.from(root.querySelectorAll("[data-nav-item]"), {
      y: -16,
      opacity: 0,
      duration: 0.7,
      stagger: 0.08,
    })
      .from(
        root.querySelectorAll("[data-headline-word]"),
        {
          y: "100%",
          opacity: 0,
          duration: 0.9,
          stagger: 0.12,
        },
        0.2
      )
      .from(
        "[data-subtitle]",
        { y: 16, opacity: 0, duration: 0.8 },
        "-=0.5"
      )
      .from(
        "[data-cta]",
        { y: 16, opacity: 0, duration: 0.7 },
        "-=0.55"
      )
      .to(
        ringPath ?? [],
        { strokeDashoffset: 0, duration: 1.6, ease: "power2.inOut" },
        0.4
      )
      .from(
        "[data-scroll-cue]",
        { opacity: 0, duration: 0.8 },
        "-=0.3"
      );

    return () => {
      tl.kill();
    };
  }, []);

  return (
    <div
      ref={rootRef}
      className="relative isolate flex min-h-screen flex-col overflow-hidden bg-ivory"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_75%_15%,rgba(196,130,126,0.16),transparent_70%),radial-gradient(ellipse_50%_40%_at_10%_90%,rgba(201,164,99,0.12),transparent_70%)]"
      />

      <header className="relative z-10 flex items-center justify-between px-6 py-6 sm:px-10 sm:py-8 lg:px-16">
        <span
          data-nav-item
          className="font-display text-xl tracking-[0.18em] text-ink"
        >
          COCOLU
        </span>
        <nav className="hidden gap-10 text-sm tracking-wide text-ink/70 sm:flex">
          <a data-nav-item href="#colecciones" className="transition-colors hover:text-rose-deep">
            Colecciones
          </a>
          <a data-nav-item href="#personalizacion" className="transition-colors hover:text-rose-deep">
            Personalización
          </a>
          <a data-nav-item href="#nosotros" className="transition-colors hover:text-rose-deep">
            Nosotros
          </a>
          <a data-nav-item href="#contacto" className="transition-colors hover:text-rose-deep">
            Contacto
          </a>
        </nav>
        <a
          data-nav-item
          href="#colecciones"
          className="hidden text-sm tracking-wide text-ink/70 transition-colors hover:text-rose-deep sm:block"
        >
          Mi cuenta
        </a>
      </header>

      <main className="relative z-10 flex flex-1 items-center px-6 sm:px-10 lg:px-16">
        <div className="grid w-full max-w-7xl items-center gap-16 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <h1 className="font-display text-[clamp(3rem,8vw,6.5rem)] leading-[0.95] text-ink">
              <span className="block overflow-hidden">
                <span data-headline-word className="block">
                  Joyas que
                </span>
              </span>
              <span className="block overflow-hidden">
                <span
                  data-headline-word
                  className="block italic text-rose-deep"
                >
                  perduran.
                </span>
              </span>
            </h1>

            <p
              data-subtitle
              className="mt-8 max-w-md text-base leading-relaxed text-ink/60 sm:text-lg"
            >
              Piezas talladas a mano con materiales nobles. Cada detalle de
              COCOLU está pensado para acompañar tus momentos más
              importantes, hoy y siempre.
            </p>

            <div data-cta className="mt-10 flex flex-wrap items-center gap-6">
              <a
                href="#colecciones"
                className="group inline-flex items-center gap-3 rounded-full border border-rose/60 bg-rose px-7 py-3.5 text-sm tracking-wide text-white transition-colors hover:border-rose-deep hover:bg-rose-deep"
              >
                Ver colección
                <span className="transition-transform group-hover:translate-x-1">
                  →
                </span>
              </a>
              <a
                href="#nosotros"
                className="text-sm tracking-wide text-ink/60 underline-offset-4 transition-colors hover:text-rose-deep hover:underline"
              >
                Nuestra historia
              </a>
            </div>
          </div>

          <div className="relative hidden lg:block">
            <svg
              viewBox="0 0 360 360"
              fill="none"
              className="mx-auto w-full max-w-md"
            >
              <ellipse
                data-ring-path
                cx="180"
                cy="180"
                rx="120"
                ry="150"
                stroke="#c9a463"
                strokeWidth="1.5"
                transform="rotate(-12 180 180)"
              />
            </svg>
          </div>
        </div>
      </main>

      <div
        data-scroll-cue
        className="relative z-10 flex items-center justify-center gap-3 pb-10 text-xs uppercase tracking-[0.3em] text-ink/40"
      >
        <span className="h-px w-10 bg-ink/20" />
        Desliza
        <span className="h-px w-10 bg-ink/20" />
      </div>
    </div>
  );
}
