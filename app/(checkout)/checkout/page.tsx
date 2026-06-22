"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "../../components/cart/CartContext";
import { useAuth } from "../../components/auth/AuthContext";
import FormField from "../../components/auth/FormField";
import { createOrder } from "../../lib/supabase/orders";
import { formatPrice } from "../../lib/format";
import { config } from "../../lib/config";
import type { Order } from "../../lib/types";

const MP_ENABLED = config.payments.mpEnabled;

const EMAIL_RE = /.+@.+\..+/;

export default function CheckoutPage() {
  const router = useRouter();
  const { lines, subtotal, count, clear } = useCart();
  const { user, isAuthenticated, hydrated, login } = useAuth();

  // Identidad (cuando no hay sesión).
  const [mode, setMode] = useState<"login" | "guest">("login");
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);
  const [guestEmail, setGuestEmail] = useState("");

  // Envío.
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [phone, setPhone] = useState("");

  const [confirmed, setConfirmed] = useState<Order | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);

  // Precarga el nombre cuando hay sesión.
  useEffect(() => {
    if (user && !name) setName(user.name);
  }, [user, name]);

  async function handleInlineLogin(e: React.FormEvent) {
    e.preventDefault();
    const result = await login(loginEmail, loginPassword);
    if (result.ok) setLoginError(null);
    else setLoginError(result.error);
  }

  const guestEmailValid = EMAIL_RE.test(guestEmail.trim());
  const identityReady =
    isAuthenticated || (mode === "guest" && guestEmailValid);
  const shippingReady =
    name.trim() && address.trim() && city.trim() && phone.trim();
  const canConfirm = identityReady && shippingReady;

  async function handleConfirm() {
    if (!canConfirm || submitting) return;
    setSubmitting(true);
    setOrderError(null);

    const email = isAuthenticated
      ? user!.email
      : guestEmail.trim().toLowerCase();
    const items = lines.map((l) => ({
      productId: l.productId,
      name: l.product.name,
      variantLabel: l.variantLabels.join(" · ") || undefined,
      unitPrice: l.unitPrice,
      quantity: l.quantity,
    }));

    // Con Mercado Pago el pedido nace "pending" y lo confirma el webhook;
    // en modo simulado nace "paid".
    const result = await createOrder({
      userId: user?.id ?? null,
      guestEmail: user ? null : email,
      status: MP_ENABLED ? "pending" : "paid",
      subtotal,
      total: subtotal,
      items,
    });

    if (!result.ok) {
      setSubmitting(false);
      setOrderError(result.error);
      return;
    }

    if (MP_ENABLED) {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: result.id, items, payerEmail: email }),
      });
      const data = await res.json().catch(() => ({}));
      if (data.url) {
        window.location.href = data.url; // a Mercado Pago
        return;
      }
      // Si MP falla, mostramos el pedido como creado igualmente.
    }

    const order: Order = {
      id: result.id,
      userId: user?.id,
      guestEmail: user ? undefined : email,
      status: MP_ENABLED ? "pending" : "paid",
      lines: items,
      subtotal,
      total: subtotal,
      createdAt: new Date().toISOString(),
    };

    clear();
    setConfirmed(order);
    setSubmitting(false);
  }

  // ── Estados de pantalla ────────────────────────────────────────────────

  if (!hydrated) {
    return <Centered>Cargando…</Centered>;
  }

  if (confirmed) {
    return <Confirmation order={confirmed} isUser={Boolean(user)} router={router} />;
  }

  if (count === 0) {
    return (
      <Centered>
        <p className="text-sm text-ink/55">Tu bolsa está vacía.</p>
        <Link
          href="/tienda"
          className="mt-4 inline-block rounded-full bg-rose px-6 py-3 text-sm tracking-wide text-white transition-colors hover:bg-rose-deep"
        >
          Explorar la tienda
        </Link>
      </Centered>
    );
  }

  return (
    <div className="mx-auto grid max-w-6xl gap-12 px-6 py-12 sm:px-10 lg:grid-cols-[1.1fr_0.9fr] lg:px-16">
      {/* Columna de formulario */}
      <div>
        <h1 className="font-display text-4xl text-ink">Finalizar compra</h1>

        {/* Paso 1 — Identidad */}
        <section className="mt-10">
          <StepTitle n={1} title="Tus datos" />

          {isAuthenticated ? (
            <div className="mt-4 rounded-2xl border border-ink/8 bg-white/70 p-5">
              <p className="text-sm text-ink">
                Comprarás como{" "}
                <span className="font-medium">{user!.name}</span>
              </p>
              <p className="mt-0.5 text-sm text-ink/55">{user!.email}</p>
            </div>
          ) : (
            <div className="mt-4">
              {/* Selector cuenta / invitado */}
              <div className="flex gap-2.5">
                <Segment active={mode === "login"} onClick={() => setMode("login")}>
                  Ya tengo cuenta
                </Segment>
                <Segment active={mode === "guest"} onClick={() => setMode("guest")}>
                  Continuar como invitado
                </Segment>
              </div>

              {mode === "login" ? (
                <form
                  onSubmit={handleInlineLogin}
                  className="mt-5 space-y-4 rounded-2xl border border-ink/8 bg-white/70 p-5"
                >
                  <FormField
                    label="Correo"
                    type="email"
                    value={loginEmail}
                    onChange={setLoginEmail}
                    autoComplete="email"
                    placeholder="tucorreo@ejemplo.com"
                  />
                  <FormField
                    label="Contraseña"
                    type="password"
                    value={loginPassword}
                    onChange={setLoginPassword}
                    autoComplete="current-password"
                    placeholder="••••••••"
                  />
                  {loginError && (
                    <p className="text-sm text-rose-deep">{loginError}</p>
                  )}
                  <button
                    type="submit"
                    className="rounded-full bg-ink px-6 py-3 text-sm tracking-wide text-white transition-colors hover:bg-ink/85"
                  >
                    Iniciar sesión
                  </button>
                  <p className="text-xs text-ink/45">
                    ¿Sin cuenta?{" "}
                    <Link href="/registro" className="text-rose-deep hover:underline">
                      Créala aquí
                    </Link>
                  </p>
                </form>
              ) : (
                <div className="mt-5 rounded-2xl border border-ink/8 bg-white/70 p-5">
                  <FormField
                    label="Correo (para la confirmación)"
                    type="email"
                    value={guestEmail}
                    onChange={setGuestEmail}
                    autoComplete="email"
                    placeholder="tucorreo@ejemplo.com"
                  />
                  {guestEmail && !guestEmailValid && (
                    <p className="mt-2 text-sm text-rose-deep">
                      Ingresa un correo válido.
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
        </section>

        {/* Paso 2 — Envío */}
        <section className="mt-10">
          <StepTitle n={2} title="Envío" />
          <div className="mt-4 space-y-4">
            <FormField label="Nombre completo" value={name} onChange={setName} autoComplete="name" />
            <FormField label="Dirección" value={address} onChange={setAddress} autoComplete="street-address" />
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField label="Ciudad" value={city} onChange={setCity} autoComplete="address-level2" />
              <FormField label="Teléfono" type="tel" value={phone} onChange={setPhone} autoComplete="tel" />
            </div>
          </div>
        </section>

        {/* Paso 3 — Pago (simulado) */}
        <section className="mt-10">
          <StepTitle n={3} title="Pago" />
          <p className="mt-4 rounded-2xl border border-ink/8 bg-white/70 p-5 text-sm text-ink/55">
            Pago simulado para la maqueta. La integración con la pasarela de pago
            se conecta en una fase posterior.
          </p>
        </section>

        <button
          type="button"
          onClick={handleConfirm}
          disabled={!canConfirm || submitting}
          className="mt-10 w-full rounded-full bg-rose px-7 py-4 text-sm tracking-wide text-white transition-colors hover:bg-rose-deep disabled:cursor-not-allowed disabled:bg-ink/20"
        >
          {submitting
            ? "Procesando…"
            : `Confirmar pedido · ${formatPrice(subtotal)}`}
        </button>
        {orderError && (
          <p className="mt-3 text-center text-sm text-rose-deep">{orderError}</p>
        )}
        {!identityReady && (
          <p className="mt-3 text-center text-xs text-ink/45">
            Inicia sesión o ingresa tu correo de invitado para continuar.
          </p>
        )}
      </div>

      {/* Resumen */}
      <aside className="lg:sticky lg:top-8 lg:self-start">
        <div className="rounded-[24px] border border-ink/8 bg-white/70 p-6">
          <h2 className="font-display text-xl text-ink">Tu pedido</h2>
          <ul className="mt-5 space-y-4">
            {lines.map((line) => (
              <li key={line.key} className="flex justify-between gap-3 text-sm">
                <span className="text-ink/70">
                  {line.quantity}× {line.product.name}
                  {line.variantLabels.length > 0 && (
                    <span className="block text-xs text-ink/45">
                      {line.variantLabels.join(" · ")}
                    </span>
                  )}
                </span>
                <span className="text-ink">{formatPrice(line.lineTotal)}</span>
              </li>
            ))}
          </ul>

          <div className="mt-6 space-y-2 border-t border-ink/8 pt-5 text-sm">
            <div className="flex justify-between text-ink/60">
              <span>Subtotal</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between text-ink/60">
              <span>Envío</span>
              <span className="text-rose-deep">Gratis</span>
            </div>
            <div className="flex justify-between pt-2 text-base">
              <span className="text-ink">Total</span>
              <span className="font-display text-xl text-ink">
                {formatPrice(subtotal)}
              </span>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}

// ── Subcomponentes ─────────────────────────────────────────────────────────

function Centered({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-6 py-32 text-center">
      {children}
    </div>
  );
}

function StepTitle({ n, title }: { n: number; title: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-ink text-xs text-white">
        {n}
      </span>
      <h2 className="font-display text-2xl text-ink">{title}</h2>
    </div>
  );
}

function Segment({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`flex-1 rounded-full px-4 py-2.5 text-sm tracking-wide transition-colors ${
        active
          ? "bg-ink text-white"
          : "bg-white text-ink/70 ring-1 ring-ink/10 hover:ring-rose/50"
      }`}
    >
      {children}
    </button>
  );
}

function Confirmation({
  order,
  isUser,
  router,
}: {
  order: Order;
  isUser: boolean;
  router: ReturnType<typeof useRouter>;
}) {
  return (
    <div className="mx-auto max-w-lg px-6 py-20 text-center">
      <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-rose/15 text-rose-deep">
        <svg viewBox="0 0 24 24" className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth={1.5}>
          <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
      <h1 className="mt-6 font-display text-4xl text-ink">¡Gracias por tu compra!</h1>
      <p className="mt-3 text-sm text-ink/60">
        Tu pedido <span className="text-ink">#{order.id.slice(0, 8)}</span>{" "}
        fue confirmado. Enviamos la confirmación a{" "}
        <span className="text-ink">{isUser ? "tu correo" : order.guestEmail}</span>.
      </p>

      <div className="mt-8 rounded-[22px] border border-ink/8 bg-white/70 p-6 text-left">
        <ul className="space-y-1.5 text-sm text-ink/65">
          {order.lines.map((line, i) => (
            <li key={i} className="flex justify-between gap-3">
              <span>
                {line.quantity}× {line.name}
              </span>
              <span>{formatPrice(line.unitPrice * line.quantity)}</span>
            </li>
          ))}
        </ul>
        <div className="mt-4 flex justify-between border-t border-ink/8 pt-4">
          <span className="text-sm text-ink/60">Total</span>
          <span className="font-display text-lg text-ink">
            {formatPrice(order.total)}
          </span>
        </div>
      </div>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
        {isUser && (
          <button
            type="button"
            onClick={() => router.push("/cuenta")}
            className="rounded-full bg-rose px-7 py-3.5 text-sm tracking-wide text-white transition-colors hover:bg-rose-deep"
          >
            Ver mis pedidos
          </button>
        )}
        <Link
          href="/tienda"
          className="rounded-full border border-ink/12 px-7 py-3.5 text-sm tracking-wide text-ink/70 transition-colors hover:border-rose/50 hover:text-rose-deep"
        >
          Seguir comprando
        </Link>
      </div>
    </div>
  );
}
