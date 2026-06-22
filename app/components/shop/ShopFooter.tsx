import Link from "next/link";
import { config } from "../../lib/config";

/** Pie del escaparate. */
export default function ShopFooter() {
  return (
    <footer
      id="contacto"
      className="mt-24 border-t border-ink/8 bg-ivory-soft"
    >
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-16 sm:px-10 sm:grid-cols-3 lg:px-16">
        <div>
          <span className="font-display text-xl tracking-[0.18em] text-ink">
            {config.site.name}
          </span>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-ink/55">
            Joyería de alta manufactura. Piezas talladas a mano para acompañar
            tus momentos más importantes.
          </p>
        </div>

        <div>
          <span className="text-xs uppercase tracking-[0.25em] text-ink/40">
            Catálogo
          </span>
          <ul className="mt-4 space-y-2.5 text-sm text-ink/65">
            <li>
              <Link href="/tienda" className="transition-colors hover:text-rose-deep">
                Toda la tienda
              </Link>
            </li>
            <li>
              <Link href="/coleccion/novias" className="transition-colors hover:text-rose-deep">
                Novias
              </Link>
            </li>
            <li>
              <Link href="/coleccion/anillos" className="transition-colors hover:text-rose-deep">
                Anillos
              </Link>
            </li>
            <li>
              <Link href="/coleccion/ofertas" className="transition-colors hover:text-rose-deep">
                Ofertas
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <span className="text-xs uppercase tracking-[0.25em] text-ink/40">
            Visítanos
          </span>
          <p className="mt-4 text-sm leading-relaxed text-ink/65">
            CC Regional, Av. Las Delicias
            <br />
            Lun a Sáb · 10:00 – 20:00
          </p>
        </div>
      </div>

      <div className="border-t border-ink/8">
        <p className="mx-auto max-w-7xl px-6 py-6 text-xs text-ink/40 sm:px-10 lg:px-16">
          © {new Date().getFullYear()} {config.site.name}. Todos los derechos reservados.
        </p>
      </div>
    </footer>
  );
}
