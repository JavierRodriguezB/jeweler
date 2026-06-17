"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const values = [
  {
    title: "Fabricación propia",
    caption:
      "Diseñamos y fabricamos cada pieza nosotros mismos, de principio a fin.",
  },
  {
    title: "Personalización real",
    caption:
      "Grabado láser y resina para convertir cada accesorio en algo irrepetible.",
  },
  {
    title: "Comunidad que crece",
    caption:
      "Miles de personas confían en COCOLU para contar su historia en una joya.",
  },
];

const stats = [
  { value: "+178K", label: "nos siguen y son parte de esta historia" },
  { value: "100%", label: "fabricación propia, sin intermediarios" },
  { value: "3", label: "técnicas: láser, resina y moissanita" },
];

const gallery = [
  { id: "taller", label: "Taller", swatch: "from-blush via-rose/40 to-rose-deep/20" },
  { id: "equipo", label: "Equipo", swatch: "from-gold-soft/70 via-blush to-rose/25" },
  { id: "tienda", label: "Tienda", swatch: "from-ivory via-ivory-soft to-blush/60" },
];

export default function About() {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const revealEls = section.querySelectorAll("[data-reveal]");
    const statEls = section.querySelectorAll("[data-stat]");
    const galleryEls = section.querySelectorAll("[data-gallery]");

    gsap.set(revealEls, { y: 24, opacity: 0 });
    gsap.set(statEls, { y: 24, opacity: 0 });
    gsap.set(galleryEls, { y: 32, opacity: 0 });

    const tl = gsap.timeline({
      scrollTrigger: { trigger: section, start: "top 75%" },
      defaults: { ease: "power3.out" },
    });

    tl.to(revealEls, { y: 0, opacity: 1, duration: 0.7, stagger: 0.1 })
      .to(statEls, { y: 0, opacity: 1, duration: 0.6, stagger: 0.1 }, "-=0.3")
      .to(
        galleryEls,
        { y: 0, opacity: 1, duration: 0.7, stagger: 0.1 },
        "-=0.3"
      );

    return () => {
      tl.scrollTrigger?.kill();
      tl.kill();
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      id="nosotros"
      className="relative bg-ivory px-6 py-24 sm:px-10 lg:px-16"
    >
      <div className="mx-auto max-w-7xl">
        <div className="max-w-2xl" data-reveal>
          <span className="text-xs uppercase tracking-[0.3em] text-rose-deep">
            Nosotros
          </span>
          <h2 className="mt-4 font-display text-4xl text-ink sm:text-5xl">
            Una historia <span className="italic text-rose-deep">hecha a mano.</span>
          </h2>
        </div>
        <p
          data-reveal
          className="mt-6 max-w-2xl text-base leading-relaxed text-ink/60 sm:text-lg"
        >
          COCOLU nació como un taller de fabricación de joyería: diseñamos y
          creamos cada pieza nosotros mismos, sin intermediarios. Con el
          tiempo, esa idea se convirtió en una comunidad que hoy elige
          nuestras piezas personalizadas en láser, resina y moissanita para
          celebrar lo que más importa.
        </p>

        <div className="mt-16 grid gap-10 sm:grid-cols-3 sm:gap-8">
          {values.map((value) => (
            <div key={value.title} data-reveal>
              <h3 className="font-display text-xl text-ink">{value.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-ink/60">
                {value.caption}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-16 grid gap-8 rounded-[28px] border border-ink/8 bg-blush/30 p-8 sm:grid-cols-3 sm:p-12">
          {stats.map((stat) => (
            <div key={stat.label} data-stat>
              <span className="font-display text-4xl text-rose-deep sm:text-5xl">
                {stat.value}
              </span>
              <p className="mt-2 text-sm leading-relaxed text-ink/60">
                {stat.label}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-16">
          <p
            data-reveal
            className="text-xs uppercase tracking-[0.25em] text-ink/40"
          >
            Conócenos
          </p>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            {gallery.map((item) => (
              <div
                key={item.id}
                data-gallery
                className={`relative flex h-64 items-end overflow-hidden rounded-[24px] bg-gradient-to-br ${item.swatch} p-6`}
              >
                <span className="font-display text-lg text-ink">
                  {item.label}
                </span>
              </div>
            ))}
          </div>
          <p className="mt-4 text-xs text-ink/40">
            Visítanos en CC Regional, Av. Las Delicias.
          </p>
        </div>
      </div>
    </section>
  );
}
