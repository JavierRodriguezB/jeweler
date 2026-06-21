"use client";

import { useState } from "react";
import { useCatalog } from "../../../components/catalog/CatalogContext";
import AdminModal from "../../../components/admin/AdminModal";
import CategoryForm from "../../../components/admin/CategoryForm";
import type { Category } from "../../../lib/types";

export default function AdminCategorias() {
  const { categories, countActiveByCategory, upsertCategory, deleteCategory } =
    useCatalog();
  const [modal, setModal] = useState<
    { mode: "create" } | { mode: "edit"; category: Category } | null
  >(null);
  const [error, setError] = useState<string | null>(null);

  function handleDelete(id: string) {
    const result = deleteCategory(id);
    setError(result.ok ? null : result.error);
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl text-ink sm:text-4xl">Categorías</h1>
          <p className="mt-2 text-sm text-ink/55">
            Crea secciones y ordénalas para la tienda.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setError(null);
            setModal({ mode: "create" });
          }}
          className="rounded-full bg-rose px-5 py-2.5 text-sm tracking-wide text-white transition-colors hover:bg-rose-deep"
        >
          + Nueva categoría
        </button>
      </div>

      {error && (
        <p className="mt-5 rounded-xl bg-rose/10 px-4 py-3 text-sm text-rose-deep">
          {error}
        </p>
      )}

      <div className="mt-8 overflow-hidden rounded-[22px] border border-ink/8 bg-white/60">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-ink/8 text-left text-xs uppercase tracking-[0.15em] text-ink/45">
              <th className="px-5 py-4 font-medium">Categoría</th>
              <th className="px-5 py-4 font-medium">Slug</th>
              <th className="px-5 py-4 font-medium">Piezas</th>
              <th className="px-5 py-4 font-medium">Orden</th>
              <th className="px-5 py-4" />
            </tr>
          </thead>
          <tbody>
            {categories.map((c) => (
              <tr key={c.id} className="border-b border-ink/5 last:border-0">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <span
                      className={`h-8 w-8 rounded-lg bg-gradient-to-br ${
                        c.accent ?? "from-ivory to-blush"
                      } ring-1 ring-ink/5`}
                    />
                    <span className="font-medium text-ink">{c.name}</span>
                    {c.featured && (
                      <span className="rounded-full bg-gold-soft/30 px-2 py-0.5 text-xs text-ink/60">
                        Destacada
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-5 py-4 text-ink/55">/{c.slug}</td>
                <td className="px-5 py-4 text-ink/70">
                  {countActiveByCategory(c.id)}
                </td>
                <td className="px-5 py-4 text-ink/70">{c.order}</td>
                <td className="px-5 py-4">
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setError(null);
                        setModal({ mode: "edit", category: c });
                      }}
                      className="rounded-full px-3 py-1.5 text-xs text-ink/60 transition-colors hover:bg-ink/5 hover:text-ink"
                    >
                      Editar
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(c.id)}
                      className="rounded-full px-3 py-1.5 text-xs text-rose-deep transition-colors hover:bg-rose/10"
                    >
                      Eliminar
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modal && (
        <AdminModal
          title={modal.mode === "create" ? "Nueva categoría" : "Editar categoría"}
          onClose={() => setModal(null)}
        >
          <CategoryForm
            initial={modal.mode === "edit" ? modal.category : undefined}
            onSave={(category) => {
              upsertCategory(category);
              setModal(null);
            }}
            onCancel={() => setModal(null)}
          />
        </AdminModal>
      )}
    </div>
  );
}
