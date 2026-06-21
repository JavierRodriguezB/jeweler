"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// Consulta de Google Maps para el `iframe` embebido (no requiere API key).
// Ajusta este texto a la dirección real para reposicionar el mapa.
const MAP_QUERY = "CC Regional, Av. Las Delicias";
const MAP_SRC = `https://maps.google.com/maps?q=${encodeURIComponent(
  MAP_QUERY
)}&z=15&output=embed`;

const details = [
  {
    id: "direccion",
    label: "Dónde estamos",
    value: "CC Regional, Av. Las Delicias",
    href: `https://maps.google.com/maps?q=${encodeURIComponent(MAP_QUERY)}`,
  },
  {
    id: "horario",
    label: "Horario",
    value: "Lun a Sáb · 10:00 – 20:00",
  },
  {
    id: "correo",
    label: "Escríbenos",
    value: "hola@cocolu.com",
    href: "mailto:hola@cocolu.com",
  },
  {
    id: "telefono",
    label: "Llámanos",
    value: "+58 412 000 0000",
    href: "tel:+584120000000",
  },
];

type Field = "nombre" | "correo" | "telefono" | "mensaje";

const initialForm: Record<Field, string> = {
  nombre: "",
  correo: "",
  telefono: "",
  mensaje: "",
};

export default function Contact() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [form, setForm] = useState(initialForm);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    // Ámbito de GSAP: revert() restaura los estilos en línea originales en la
    // limpieza, para que los `gsap.set` que ocultan el contenido no queden
    // congelados al re-montar en navegaciones del lado del cliente (y mata su
    // ScrollTrigger).
    const ctx = gsap.context(() => {
      const revealEls = section.querySelectorAll("[data-reveal]");
      const panelEls = section.querySelectorAll("[data-panel]");

      gsap.set(revealEls, { y: 24, opacity: 0 });
      gsap.set(panelEls, { y: 32, opacity: 0 });

      const tl = gsap.timeline({
        scrollTrigger: { trigger: section, start: "top 75%" },
        defaults: { ease: "power3.out" },
      });

      tl.to(revealEls, { y: 0, opacity: 1, duration: 0.7, stagger: 0.1 }).to(
        panelEls,
        { y: 0, opacity: 1, duration: 0.7, stagger: 0.12 },
        "-=0.3"
      );
    }, section);

    return () => ctx.revert();
  }, []);

  const update = (field: Field) => (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => setForm((prev) => ({ ...prev, [field]: event.target.value }));

  // Aún sin backend: confirmamos el envío en el cliente. Cuando exista el
  // endpoint, este handler enviará `form` al servidor.
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSent(true);
  };

  return (
    <section
      ref={sectionRef}
      id="contacto"
      className="relative bg-ivory-soft px-6 py-24 sm:px-10 lg:px-16"
    >
      <div className="mx-auto max-w-7xl">
        <div className="max-w-2xl" data-reveal>
          <span className="text-xs uppercase tracking-[0.3em] text-rose-deep">
            Contacto
          </span>
          <h2 className="mt-4 font-display text-4xl text-ink sm:text-5xl">
            Hablemos de tu{" "}
            <span className="italic text-rose-deep">próxima joya.</span>
          </h2>
          <p className="mt-6 text-base leading-relaxed text-ink/60 sm:text-lg">
            Cuéntanos qué tienes en mente: un grabado, un diseño a medida o un
            anillo de compromiso. Te respondemos a la brevedad, o ven a
            visitarnos a nuestro taller.
          </p>
        </div>

        <div className="mt-16 grid gap-6 lg:grid-cols-2 lg:gap-8">
          {/* Formulario */}
          <div
            data-panel
            className="rounded-[28px] border border-ink/8 bg-white/70 p-8 sm:p-10"
          >
            {sent ? (
              <div className="flex h-full min-h-[420px] flex-col items-center justify-center text-center">
                <span className="flex h-16 w-16 items-center justify-center rounded-full border border-gold/50">
                  <svg
                    viewBox="0 0 48 48"
                    fill="none"
                    stroke="#a8645f"
                    strokeWidth={1.5}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-8 w-8"
                  >
                    <path d="M14 25l7 7 14-16" />
                  </svg>
                </span>
                <h3 className="mt-6 font-display text-2xl text-ink">
                  ¡Gracias, {form.nombre || "te escribiremos pronto"}!
                </h3>
                <p className="mt-3 max-w-sm text-sm leading-relaxed text-ink/60">
                  Hemos recibido tu mensaje. Nuestro equipo se pondrá en
                  contacto contigo muy pronto.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setForm(initialForm);
                    setSent(false);
                  }}
                  className="mt-8 text-sm tracking-wide text-rose-deep underline-offset-4 transition-colors hover:underline"
                >
                  Enviar otro mensaje
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                <div className="grid gap-5 sm:grid-cols-2">
                  <Input
                    id="nombre"
                    label="Nombre"
                    value={form.nombre}
                    onChange={update("nombre")}
                    required
                    autoComplete="name"
                  />
                  <Input
                    id="telefono"
                    label="Teléfono"
                    type="tel"
                    value={form.telefono}
                    onChange={update("telefono")}
                    autoComplete="tel"
                  />
                </div>
                <Input
                  id="correo"
                  label="Correo electrónico"
                  type="email"
                  value={form.correo}
                  onChange={update("correo")}
                  required
                  autoComplete="email"
                />
                <div className="flex flex-col gap-2">
                  <label
                    htmlFor="mensaje"
                    className="text-xs uppercase tracking-[0.2em] text-ink/50"
                  >
                    Mensaje
                  </label>
                  <textarea
                    id="mensaje"
                    rows={5}
                    value={form.mensaje}
                    onChange={update("mensaje")}
                    required
                    placeholder="Cuéntanos qué pieza imaginas…"
                    className="resize-none rounded-2xl border border-ink/10 bg-ivory/60 px-5 py-3.5 text-ink placeholder:text-ink/35 transition-colors focus:border-rose focus:outline-none focus:ring-2 focus:ring-rose/30"
                  />
                </div>
                <button
                  type="submit"
                  className="group mt-1 inline-flex items-center justify-center gap-3 self-start rounded-full border border-rose/60 bg-rose px-7 py-3.5 text-sm tracking-wide text-white transition-colors hover:border-rose-deep hover:bg-rose-deep"
                >
                  Enviar mensaje
                  <span className="transition-transform group-hover:translate-x-1">
                    →
                  </span>
                </button>
              </form>
            )}
          </div>

          {/* Mapa + datos */}
          <div data-panel className="flex flex-col gap-6">
            <div className="relative overflow-hidden rounded-[28px] border border-ink/8 bg-white/70">
              <iframe
                title="Ubicación de COCOLU en Google Maps"
                src={MAP_SRC}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="h-72 w-full grayscale-[0.15] sm:h-80 lg:h-full lg:min-h-[260px]"
              />
            </div>

            <div className="grid grid-cols-2 gap-px overflow-hidden rounded-[28px] border border-ink/8 bg-ink/8">
              {details.map((item) => (
                <div key={item.id} className="bg-blush/30 p-6">
                  <span className="text-xs uppercase tracking-[0.2em] text-ink/45">
                    {item.label}
                  </span>
                  {item.href ? (
                    <a
                      href={item.href}
                      target={item.href.startsWith("http") ? "_blank" : undefined}
                      rel={
                        item.href.startsWith("http")
                          ? "noopener noreferrer"
                          : undefined
                      }
                      className="mt-2 block font-display text-lg text-ink transition-colors hover:text-rose-deep"
                    >
                      {item.value}
                    </a>
                  ) : (
                    <p className="mt-2 font-display text-lg text-ink">
                      {item.value}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

type InputProps = {
  id: string;
  label: string;
  value: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  required?: boolean;
  autoComplete?: string;
};

function Input({
  id,
  label,
  value,
  onChange,
  type = "text",
  required,
  autoComplete,
}: InputProps) {
  return (
    <div className="flex flex-col gap-2">
      <label
        htmlFor={id}
        className="text-xs uppercase tracking-[0.2em] text-ink/50"
      >
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        required={required}
        autoComplete={autoComplete}
        className="rounded-2xl border border-ink/10 bg-ivory/60 px-5 py-3.5 text-ink placeholder:text-ink/35 transition-colors focus:border-rose focus:outline-none focus:ring-2 focus:ring-rose/30"
      />
    </div>
  );
}
