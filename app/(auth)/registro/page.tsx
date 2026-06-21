"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "../../components/auth/AuthContext";
import FormField from "../../components/auth/FormField";

export default function RegistroPage() {
  const router = useRouter();
  const { register, isAuthenticated, hydrated } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (hydrated && isAuthenticated) router.replace("/cuenta");
  }, [hydrated, isAuthenticated, router]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const result = register({ name, email, password });
    if (result.ok) router.push("/cuenta");
    else setError(result.error);
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

      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        <FormField
          label="Nombre"
          value={name}
          onChange={setName}
          autoComplete="name"
          placeholder="Tu nombre"
        />
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
          className="w-full rounded-full bg-rose px-7 py-3.5 text-sm tracking-wide text-white transition-colors hover:bg-rose-deep"
        >
          Crear cuenta
        </button>
      </form>

      <p className="mt-6 text-xs leading-relaxed text-ink/45">
        Al crear tu cuenta podrás ver tu historial de pedidos y completar la
        compra más rápido.
      </p>
    </div>
  );
}
