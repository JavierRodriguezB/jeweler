"use client";

import { useState } from "react";
import { useCatalog } from "../../../components/catalog/CatalogContext";
import AdminModal from "../../../components/admin/AdminModal";
import ProductForm from "../../../components/admin/ProductForm";
import { formatPrice } from "../../../lib/format";
import type { Product, ProductStatus } from "../../../lib/types";

const STATUS_BADGE: Record<ProductStatus, string> = {
  active: "bg-rose/15 text-rose-deep",
  draft: "bg-ink/8 text-ink/55",
  archived: "bg-ink/8 text-ink/40",
};

const STATUS_LABEL: Record<ProductStatus, string> = {
  active: "Activo",
  draft: "Borrador",
  archived: "Archivado",
};

export default function AdminProductos() {
  const { products, categories, getCategoryById, upsertProduct, deleteProduct } =
    useCatalog();
  const [modal, setModal] = useState<
    { mode: "create" } | { mode: "edit"; product: Product } | null
  >(null);
  const [confirmDelete, setConfirmDelete] = useState<Product | null>(null);

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl text-ink sm:text-4xl">Productos</h1>
          <p className="mt-2 text-sm text-ink/55">
            Carga piezas con varias imágenes, variantes y detalles.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setModal({ mode: "create" })}
          disabled={categories.length === 0}
          className="rounded-full bg-rose px-5 py-2.5 text-sm tracking-wide text-white transition-colors hover:bg-rose-deep disabled:cursor-not-allowed disabled:bg-ink/20"
        >
          + Nuevo producto
        </button>
      </div>

      {categories.length === 0 && (
        <p className="mt-5 rounded-xl bg-gold-soft/20 px-4 py-3 text-sm text-ink/60">
          Crea una categoría antes de cargar productos.
        </p>
      )}

      <div className="mt-8 overflow-x-auto rounded-[22px] border border-ink/8 bg-white/60">
        <table className="w-full min-w-[640px] text-sm">
          <thead>
            <tr className="border-b border-ink/8 text-left text-xs uppercase tracking-[0.15em] text-ink/45">
              <th className="px-5 py-4 font-medium">Producto</th>
              <th className="px-5 py-4 font-medium">Categoría</th>
              <th className="px-5 py-4 font-medium">Precio</th>
              <th className="px-5 py-4 font-medium">Stock</th>
              <th className="px-5 py-4 font-medium">Estado</th>
              <th className="px-5 py-4" />
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-b border-ink/5 last:border-0">
                <td className="px-5 py-4">
                  <span className="font-medium text-ink">{p.name}</span>
                  <span className="block text-xs text-ink/40">
                    {p.images.length} imagen{p.images.length === 1 ? "" : "es"} ·{" "}
                    {p.variants.length} variante{p.variants.length === 1 ? "" : "s"}
                  </span>
                </td>
                <td className="px-5 py-4 text-ink/65">
                  {getCategoryById(p.categoryId)?.name ?? "—"}
                </td>
                <td className="px-5 py-4 text-ink/80">{formatPrice(p.price)}</td>
                <td className="px-5 py-4 text-ink/70">{p.stock}</td>
                <td className="px-5 py-4">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs ${STATUS_BADGE[p.status]}`}
                  >
                    {STATUS_LABEL[p.status]}
                  </span>
                </td>
                <td className="px-5 py-4">
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setModal({ mode: "edit", product: p })}
                      className="rounded-full px-3 py-1.5 text-xs text-ink/60 transition-colors hover:bg-ink/5 hover:text-ink"
                    >
                      Editar
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmDelete(p)}
                      className="rounded-full px-3 py-1.5 text-xs text-rose-deep transition-colors hover:bg-rose/10"
                    >
                      Eliminar
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr>
                <td colSpan={6} className="px-5 py-10 text-center text-ink/45">
                  Aún no hay productos.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {modal && (
        <AdminModal
          title={modal.mode === "create" ? "Nuevo producto" : "Editar producto"}
          onClose={() => setModal(null)}
        >
          <ProductForm
            initial={modal.mode === "edit" ? modal.product : undefined}
            categories={categories}
            onSave={(product) => {
              upsertProduct(product);
              setModal(null);
            }}
            onCancel={() => setModal(null)}
          />
        </AdminModal>
      )}

      {confirmDelete && (
        <AdminModal title="Eliminar producto" onClose={() => setConfirmDelete(null)}>
          <p className="text-sm text-ink/65">
            ¿Seguro que quieres eliminar{" "}
            <span className="font-medium text-ink">{confirmDelete.name}</span>?
            Esta acción no se puede deshacer.
          </p>
          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setConfirmDelete(null)}
              className="rounded-full border border-ink/12 px-6 py-2.5 text-sm tracking-wide text-ink/70 transition-colors hover:border-rose/50"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={() => {
                deleteProduct(confirmDelete.id);
                setConfirmDelete(null);
              }}
              className="rounded-full bg-rose-deep px-6 py-2.5 text-sm tracking-wide text-white transition-colors hover:bg-rose"
            >
              Eliminar
            </button>
          </div>
        </AdminModal>
      )}
    </div>
  );
}
