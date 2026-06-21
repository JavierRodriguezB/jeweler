"use client";

import Link from "next/link";
import { useAuth } from "./AuthContext";

/** Acceso a la cuenta en el header: "Ingresar" o el nombre del usuario. */
export default function AccountButton() {
  const { user, hydrated } = useAuth();

  // Antes de hidratar, render neutro que coincide con el SSR (evita parpadeo).
  if (!hydrated || !user) {
    return (
      <Link
        href="/login"
        className="hidden text-sm tracking-wide text-ink/70 transition-colors hover:text-rose-deep sm:inline"
      >
        Ingresar
      </Link>
    );
  }

  const firstName = user.name.split(" ")[0];
  const initial = firstName.charAt(0).toUpperCase();

  return (
    <Link
      href="/cuenta"
      className="group inline-flex items-center gap-2 text-sm tracking-wide text-ink/70 transition-colors hover:text-rose-deep"
      title="Mi cuenta"
    >
      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-rose/15 text-xs font-medium text-rose-deep">
        {initial}
      </span>
      <span className="hidden sm:inline">{firstName}</span>
    </Link>
  );
}
