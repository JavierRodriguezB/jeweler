"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "../../components/auth/AuthContext";
import FormField from "../../components/auth/FormField";
import GoogleButton from "../../components/auth/GoogleButton";

export default function RegistroPage() {
  const router = useRouter();
  const { register, isAuthenticated, hydrated } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [confirmSent, setConfirmSent] = useState(false);

  useEffect(() => {
    if (hydrated && isAuthenticated) router.replace("/cuenta");
  }, [hydrated, isAuthenticated, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);
    const result = await register({ name, email, password });
    setPending(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    if (result.needsConfirmation) setConfirmSent(true);
    else router.push("/cuenta");
  }

  if (confirmSent) {
    return (
      <div className="text-center">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-rose/15 text-rose-deep">
          <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth={1.5}>
            <path d="M4 6h16v12H4z" strokeLinejoin="round" />
            <path d="M4 7l8 6 8-6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
        <h1 className="mt-6 font-display text-3xl text-ink">Revisa tu correo</h1>
        <p className="mt-3 text-sm text-ink/60">
          Enviamos un enlace de confirmación a{" "}
          <span className="text-ink">{email}</span>. Ábrelo para activar tu
          cuenta e iniciar sesión.
        </p>
        <Link
          href="/login"
          className="mt-6 inline-block rounded-full border border-ink/12 px-6 py-3 text-sm tracking-wide text-ink/70 transition-colors hover:border-rose/50"
        >
          Ir a iniciar sesión
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h1 className="font-display text-4xl text-ink">Crear cuenta</h1>
      <p className="mt-3 text-sm text-ink/55">
        ¿Ya tienes cuenta?{" "}
        <Link href="/login" className="text-rose-deep underline-offset-4 hover:underline">
          Inicia sesión
        </Link>
      </p>

      <div className="mt-8">
        <GoogleButton label="Registrarse con Google" />
      </div>

      <div className="my-6 flex items-center gap-4 text-xs text-ink/40">
        <span className="h-px flex-1 bg-ink/10" />o<span className="h-px flex-1 bg-ink/10" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <FormField label="Nombre" value={name} onChange={setName} autoComplete="name" placeholder="Tu nombre" />
        <FormField
          label="Correo"
          type="email"
          value={email}
          onChange={setEmail}
          autoComplete="email"
          placeholder="tucorreo@ejemplo.com"
        />
        <FormField
          label="Contraseña"
          type="password"
          value={password}
          onChange={setPassword}
          autoComplete="new-password"
          placeholder="Mínimo 6 caracteres"
        />

        {error && <p className="text-sm text-rose-deep">{error}</p>}

        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-full bg-rose px-7 py-3.5 text-sm tracking-wide text-white transition-colors hover:bg-rose-deep disabled:opacity-60"
        >
          {pending ? "Creando…" : "Crear cuenta"}
        </button>
      </form>
    </div>
  );
}
