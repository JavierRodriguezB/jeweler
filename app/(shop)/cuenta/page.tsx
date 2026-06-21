"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "../../components/auth/AuthContext";
import { getOrdersForUser } from "../../components/account/ordersStore";
import { formatPrice } from "../../lib/format";
import type { Order, OrderStatus } from "../../lib/types";

const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: "Pendiente",
  paid: "Pagado",
  shipped: "Enviado",
  delivered: "Entregado",
  cancelled: "Cancelado",
};

export default function CuentaPage() {
  const router = useRouter();
  const { user, hydrated, logout, isAdmin } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    if (!hydrated) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    setOrders(getOrdersForUser(user.id));
  }, [hydrated, user, router]);

  if (!hydrated || !user) {
    return (
      <div className="mx-auto max-w-7xl px-6 py-32 text-center text-sm text-ink/40 sm:px-10 lg:px-16">
        Cargando…
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-6 pb-16 pt-16 sm:px-10 sm:pt-20 lg:px-16">
      <div className="flex flex-wrap items-start justify-between gap-6">
        <div>
          <span className="text-xs uppercase tracking-[0.3em] text-rose-deep">
            Mi cuenta
          </span>
          <h1 className="mt-3 font-display text-4xl text-ink sm:text-5xl">
            Hola, {user.name.split(" ")[0]}
          </h1>
          <p className="mt-3 flex items-center gap-2 text-sm text-ink/55">
            {user.email}
            <span className="rounded-full bg-ink/5 px-2.5 py-0.5 text-xs text-ink/60">
              {isAdmin ? "Administrador" : "Cliente"}
            </span>
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            logout();
            router.push("/");
          }}
          className="rounded-full border border-ink/12 px-5 py-2.5 text-sm tracking-wide text-ink/70 transition-colors hover:border-rose/50 hover:text-rose-deep"
        >
          Cerrar sesión
        </button>
      </div>

      {/* Acceso de administrador */}
      {isAdmin && (
        <div className="mt-10 flex flex-wrap items-center justify-between gap-4 rounded-[22px] border border-gold/40 bg-gold-soft/15 p-6">
          <div>
            <h2 className="font-display text-xl text-ink">Panel de administración</h2>
            <p className="mt-2 text-sm text-ink/60">
              Gestiona categorías y carga productos del catálogo.
            </p>
          </div>
          <Link
            href="/admin"
            className="rounded-full bg-ink px-6 py-3 text-sm tracking-wide text-white transition-colors hover:bg-ink/85"
          >
            Abrir panel
          </Link>
        </div>
      )}

      {/* Historial de pedidos */}
      <section className="mt-14">
        <h2 className="font-display text-2xl text-ink">Mis pedidos</h2>

        {orders.length === 0 ? (
          <div className="mt-6 rounded-[22px] border border-ink/8 bg-white/60 p-10 text-center">
            <p className="text-sm text-ink/55">Aún no tienes pedidos.</p>
            <Link
              href="/tienda"
              className="mt-4 inline-block rounded-full bg-rose px-6 py-3 text-sm tracking-wide text-white transition-colors hover:bg-rose-deep"
            >
              Explorar la tienda
            </Link>
          </div>
        ) : (
          <ul className="mt-6 space-y-4">
            {orders.map((order) => (
              <li
                key={order.id}
                className="rounded-[22px] border border-ink/8 bg-white/60 p-6"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <span className="font-display text-lg text-ink">
                      Pedido #{order.id.replace("ord_", "")}
                    </span>
                    <p className="mt-0.5 text-xs text-ink/45">
                      {new Date(order.createdAt).toLocaleDateString("es", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                  <span className="rounded-full bg-ink/5 px-3 py-1 text-xs text-ink/65">
                    {STATUS_LABELS[order.status]}
                  </span>
                </div>

                <ul className="mt-4 space-y-1.5 border-t border-ink/8 pt-4 text-sm text-ink/65">
                  {order.lines.map((line, i) => (
                    <li key={i} className="flex justify-between gap-3">
                      <span>
                        {line.quantity}× {line.name}
                        {line.variantLabel && (
                          <span className="text-ink/40"> · {line.variantLabel}</span>
                        )}
                      </span>
                      <span>{formatPrice(line.unitPrice * line.quantity)}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-4 flex justify-between border-t border-ink/8 pt-4 text-sm">
                  <span className="text-ink/60">Total</span>
                  <span className="font-display text-lg text-ink">
                    {formatPrice(order.total)}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
