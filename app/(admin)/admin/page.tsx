"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useCatalog } from "../../components/catalog/CatalogContext";
import { getStoredOrders } from "../../components/account/ordersStore";
import { mockOrders } from "../../lib/mock-data";

export default function AdminDashboard() {
  const { categories, products, activeProducts } = useCatalog();
  const [orderCount, setOrderCount] = useState(0);

  useEffect(() => {
    setOrderCount(getStoredOrders().length + mockOrders.length);
  }, []);

  const stats = [
    { label: "Categorías", value: categories.length },
    {
      label: "Productos activos",
      value: `${activeProducts.length}`,
      sub: `${products.length} en total`,
    },
    { label: "Pedidos", value: orderCount },
  ];

  return (
    <div>
      <h1 className="font-display text-3xl text-ink sm:text-4xl">Resumen</h1>
      <p className="mt-2 text-sm text-ink/55">
        Gestiona el catálogo de COCOLU. Los cambios se reflejan en la tienda al
        instante.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-[22px] border border-ink/8 bg-white/60 p-6"
          >
            <p className="text-xs uppercase tracking-[0.2em] text-ink/45">
              {stat.label}
            </p>
            <p className="mt-3 font-display text-4xl text-ink">{stat.value}</p>
            {stat.sub && <p className="mt-1 text-xs text-ink/45">{stat.sub}</p>}
          </div>
        ))}
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <QuickAction
          href="/admin/categorias"
          title="Categorías y secciones"
          desc="Crea, edita y ordena las categorías de la tienda."
        />
        <QuickAction
          href="/admin/productos"
          title="Productos"
          desc="Carga piezas con varias imágenes y variantes."
        />
      </div>
    </div>
  );
}

function QuickAction({
  href,
  title,
  desc,
}: {
  href: string;
  title: string;
  desc: string;
}) {
  return (
    <Link
      href={href}
      className="group rounded-[22px] border border-ink/8 bg-white/60 p-6 transition-colors hover:border-rose/40"
    >
      <h2 className="font-display text-xl text-ink group-hover:text-rose-deep">
        {title}
      </h2>
      <p className="mt-2 text-sm text-ink/55">{desc}</p>
      <span className="mt-4 inline-flex items-center gap-2 text-sm text-rose-deep">
        Gestionar
        <span className="transition-transform group-hover:translate-x-1">→</span>
      </span>
    </Link>
  );
}
