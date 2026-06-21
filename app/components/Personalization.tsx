"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

type Feature = {
  id: string;
  title: string;
  caption: string;
  icon: React.ReactNode;
};

const features: Feature[] = [
  {
    id: "grabados",
    title: "Grabados",
    caption:
      "Una fecha, una inicial o una frase, grabadas a mano para que la pieza cuente tu historia.",
    icon: (
      <path
        data-icon-path
        d="M10 30c3-9 7-13 10-13s3 8 6 8 5-10 9-7"
      />
    ),
  },
  {
    id: "diseños-a-medida",
    title: "Diseños a medida",
    caption:
      "De tu boceto a una pieza real: creamos diseños exclusivos pensados solo para ti.",
    icon: (
      <>
        <circle data-icon-path cx="24" cy="11" r="2.2" />
        <path data-icon-path d="M24 13 13 35M24 13l11 22M17 29h14" />
      </>
    ),
  },
  {
    id: "anillos-de-compromiso",
    title: "Anillos de compromiso personalizados",
    caption:
      "El sí más importante merece un anillo diseñado a la medida de tu historia de amor.",
    icon: (
      <>
        <ellipse data-icon-path cx="24" cy="29" rx="9" ry="10.5" />
        <path data-icon-path d="M24 9l-5 8 5 4 5-4z" />
      </>
    ),
  },
  {
    id: "proceso-de-fabricacion",
    title: "Proceso de fabricación",
    caption:
      "Del boceto al pulido final: cada pieza se trabaja a mano en nuestro taller, paso a paso.",
    icon: (
      <>
        <rect data-icon-path x="12" y="29" width="18" height="6" rx="1.5" />
        <path data-icon-path d="M19 29 31 11" />
        <circle data-icon-path cx="33" cy="9" r="4" />
      </>
    ),
  },
];

export default function Personalization() {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    // Ámbito de GSAP: revert() restaura los estilos en línea originales en la
    // limpieza, para que los `gsap.set` que ocultan el contenido no queden
    // congelados al re-montar en navegaciones del lado del cliente (y mata su
    // ScrollTrigger).
    const ctx = gsap.context(() => {
      const iconPaths = Array.from(
        section.querySelectorAll<SVGGeometryElement>("[data-icon-path]")
      );

      iconPaths.forEach((path) => {
        const length = path.getTotalLength();
        gsap.set(path, { strokeDasharray: length, strokeDashoffset: length });
      });

      const revealEls = section.querySelectorAll("[data-reveal]");
      const cardEls = section.querySelectorAll("[data-card]");

      gsap.set(revealEls, { y: 24, opacity: 0 });
      gsap.set(cardEls, { y: 32, opacity: 0 });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top 75%",
        },
        defaults: { ease: "power3.out" },
      });

      tl.to(revealEls, {
        y: 0,
        opacity: 1,
        duration: 0.7,
        stagger: 0.08,
      })
        .to(
          cardEls,
          { y: 0, opacity: 1, duration: 0.7, stagger: 0.1 },
          "-=0.4"
        )
        .to(
          iconPaths,
          {
            strokeDashoffset: 0,
            duration: 1,
            ease: "power2.inOut",
            stagger: 0.1,
          },
          "-=0.5"
        );
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="personalizacion"
      className="relative bg-ivory-soft px-6 py-24 sm:px-10 lg:px-16"
    >
      <div className="mx-auto max-w-7xl">
        <div className="max-w-2xl" data-reveal>
          <span className="text-xs uppercase tracking-[0.3em] text-rose-deep">
            Personalización
          </span>
          <h2 className="mt-4 font-display text-4xl text-ink sm:text-5xl">
            Hecho para ti,{" "}
            <span className="italic text-rose-deep">en cada detalle.</span>
          </h2>
          <p className="mt-6 text-base leading-relaxed text-ink/60 sm:text-lg">
            Creamos piezas personalizadas que cuentan tu historia: grabados,
            diseños exclusivos y anillos de compromiso hechos especialmente
            para ti.
          </p>
        </div>

        <div className="mt-16 grid gap-6 sm:grid-cols-2 sm:gap-8">
          {features.map((feature) => (
            <div
              key={feature.id}
              data-card
              className="group rounded-[28px] border border-ink/8 bg-white/70 p-8 transition-[transform,border-color,box-shadow] duration-300 hover:-translate-y-1 hover:border-rose/40 hover:shadow-[0_24px_48px_-24px_rgba(168,100,95,0.25)] sm:p-10"
            >
              <span className="flex h-14 w-14 items-center justify-center rounded-full border border-gold/50">
                <svg
                  viewBox="0 0 48 48"
                  fill="none"
                  stroke="#a8645f"
                  strokeWidth={1.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-7 w-7"
                >
                  {feature.icon}
                </svg>
              </span>
              <h3 className="mt-6 font-display text-2xl text-ink">
                {feature.title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-ink/65">
                {feature.caption}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
