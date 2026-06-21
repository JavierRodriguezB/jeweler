"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "../../components/auth/AuthContext";
import FormField from "../../components/auth/FormField";
import GoogleButton from "../../components/auth/GoogleButton";

export default function LoginPage() {
  const router = useRouter();
  const { login, isAuthenticated, hydrated } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (hydrated && isAuthenticated) router.replace("/cuenta");
  }, [hydrated, isAuthenticated, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);
    const result = await login(email, password);
    setPending(false);
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

      <div className="mt-8">
        <GoogleButton />
      </div>

      <div className="my-6 flex items-center gap-4 text-xs text-ink/40">
        <span className="h-px flex-1 bg-ink/10" />o<span className="h-px flex-1 bg-ink/10" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
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
          disabled={pending}
          className="w-full rounded-full bg-rose px-7 py-3.5 text-sm tracking-wide text-white transition-colors hover:bg-rose-deep disabled:opacity-60"
        >
          {pending ? "Entrando…" : "Entrar"}
        </button>
      </form>
    </div>
  );
}
