"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "../components/auth/AuthContext";

const tabs = [
  { href: "/admin", label: "Resumen" },
  { href: "/admin/categorias", label: "Categorías" },
  { href: "/admin/productos", label: "Productos" },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAdmin, hydrated, logout } = useAuth();

  // Guard de rol: solo administradores.
  useEffect(() => {
    if (!hydrated) return;
    if (!user) router.replace("/login");
    else if (!isAdmin) router.replace("/");
  }, [hydrated, user, isAdmin, router]);

  if (!hydrated || !user || !isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-ivory text-sm text-ink/40">
        {hydrated && user && !isAdmin
          ? "No tienes permisos de administrador."
          : "Cargando…"}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ivory">
      <header className="border-b border-ink/8 bg-ivory/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4 sm:px-10">
          <div className="flex items-center gap-3">
            <Link href="/" className="font-display text-xl tracking-[0.18em] text-ink">
              COCOLU
            </Link>
            <span className="rounded-full bg-ink/5 px-2.5 py-0.5 text-xs tracking-wide text-ink/55">
              Admin
            </span>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <Link
              href="/tienda"
              className="text-ink/60 transition-colors hover:text-rose-deep"
            >
              Ver tienda
            </Link>
            <button
              type="button"
              onClick={() => {
                logout();
                router.push("/");
              }}
              className="rounded-full border border-ink/12 px-4 py-2 tracking-wide text-ink/70 transition-colors hover:border-rose/50 hover:text-rose-deep"
            >
              Cerrar sesión
            </button>
          </div>
        </div>

        <nav className="mx-auto flex max-w-6xl gap-1 px-6 sm:px-10">
          {tabs.map((tab) => {
            const active =
              tab.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(tab.href);
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`-mb-px border-b-2 px-4 py-3 text-sm tracking-wide transition-colors ${
                  active
                    ? "border-rose-deep text-ink"
                    : "border-transparent text-ink/50 hover:text-ink"
                }`}
              >
                {tab.label}
              </Link>
            );
          })}
        </nav>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-10 sm:px-10">{children}</main>
    </div>
  );
}
