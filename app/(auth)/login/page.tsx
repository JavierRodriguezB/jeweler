"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "../../components/auth/AuthContext";
import FormField from "../../components/auth/FormField";

export default function LoginPage() {
  const router = useRouter();
  const { login, isAuthenticated, hydrated } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Si ya hay sesión, no tiene sentido quedarse aquí.
  useEffect(() => {
    if (hydrated && isAuthenticated) router.replace("/cuenta");
  }, [hydrated, isAuthenticated, router]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const result = login(email, password);
    if (result.ok) router.push("/cuenta");
    else setError(result.error);
  }

  return (
    <div>
      <h1 className="font-display text-4xl text-ink">Iniciar sesión</h1>
      <p className="mt-3 text-sm text-ink/55">
        ¿Aún no tienes cuenta?{" "}
        <Link href="/registro" className="text-rose-deep underline-offset-4 hover:underline">
          Crear una
        </Link>
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
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
          autoComplete="current-password"
          placeholder="••••••••"
        />

        {error && <p className="text-sm text-rose-deep">{error}</p>}

        <button
          type="submit"
          className="w-full rounded-full bg-rose px-7 py-3.5 text-sm tracking-wide text-white transition-colors hover:bg-rose-deep"
        >
          Entrar
        </button>
      </form>

      <div className="mt-8 rounded-2xl border border-ink/8 bg-white/60 p-4 text-xs leading-relaxed text-ink/55">
        <p className="font-medium text-ink/70">Cuentas de demostración</p>
        <p className="mt-1.5">
          Admin · <span className="text-ink/75">admin@cocolu.com</span> /{" "}
          <span className="text-ink/75">cocolu-admin</span>
        </p>
        <p>
          Cliente · <span className="text-ink/75">cliente@cocolu.com</span> /{" "}
          <span className="text-ink/75">cocolu-cliente</span>
        </p>
      </div>
    </div>
  );
}
