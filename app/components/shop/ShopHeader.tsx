import Link from "next/link";
import CartButton from "../cart/CartButton";
import AccountButton from "../auth/AccountButton";
import { config } from "../../lib/config";

const links = [
  { label: "Tienda", href: "/tienda" },
  { label: "Personalización", href: "/#personalizacion" },
  { label: "Nosotros", href: "/#nosotros" },
  { label: "Contacto", href: "/#contacto" },
];

/** Cabecera del escaparate (sticky). El carrito se conecta en una fase posterior. */
export default function ShopHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-ink/5 bg-ivory/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 sm:px-10 lg:px-16">
        <Link
          href="/"
          className="font-display text-xl tracking-[0.18em] text-ink transition-colors hover:text-rose-deep"
        >
          {config.site.name}
        </Link>

        <nav className="hidden gap-9 text-sm tracking-wide text-ink/70 sm:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="transition-colors hover:text-rose-deep"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-4 sm:gap-5">
          <AccountButton />
          <CartButton />
        </div>
      </div>
    </header>
  );
}
