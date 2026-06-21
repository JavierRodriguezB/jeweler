"use client";

import { useState } from "react";
import type {
  Category,
  Product,
  ProductStatus,
  Season,
  VariantType,
} from "../../lib/types";
import { SEASON_LABELS } from "../../lib/types";
import { slugify } from "../../lib/slug";
import FormField from "../auth/FormField";
import {
  SelectField,
  NumberField,
  TextareaField,
  CheckboxField,
} from "./fields";

const SEASON_OPTIONS = (Object.keys(SEASON_LABELS) as Season[]).map((s) => ({
  value: s,
  label: SEASON_LABELS[s],
}));

const STATUS_OPTIONS: { value: ProductStatus; label: string }[] = [
  { value: "active", label: "Activo (visible)" },
  { value: "draft", label: "Borrador" },
  { value: "archived", label: "Archivado" },
];

const VARIANT_TYPE_OPTIONS: { value: VariantType; label: string }[] = [
  { value: "color", label: "Color" },
  { value: "material", label: "Material" },
  { value: "talla", label: "Talla" },
];

type ImageRow = { id: string; url: string; alt: string };
type VariantRow = {
  id: string;
  type: VariantType;
  label: string;
  value: string;
  stock: number | "";
  available: boolean;
};
type DetailRow = { title: string; itemsText: string };

const DEFAULT_DETAILS: DetailRow[] = [
  { title: "Características", itemsText: "" },
  { title: "Cuidado", itemsText: "" },
  { title: "Envío", itemsText: "" },
  { title: "Devoluciones", itemsText: "" },
];

export default function ProductForm({
  initial,
  categories,
  onSave,
  onCancel,
}: {
  initial?: Product;
  categories: Category[];
  onSave: (product: Product) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(initial));
  const [description, setDescription] = useState(initial?.description ?? "");
  const [price, setPrice] = useState<number | "">(initial?.price ?? "");
  const [compareAt, setCompareAt] = useState<number | "">(
    initial?.compareAtPrice ?? ""
  );
  const [categoryId, setCategoryId] = useState(
    initial?.categoryId ?? categories[0]?.id ?? ""
  );
  const [season, setSeason] = useState<Season>(initial?.season ?? "atemporal");
  const [status, setStatus] = useState<ProductStatus>(
    initial?.status ?? "active"
  );
  const [stock, setStock] = useState<number | "">(initial?.stock ?? "");
  const [sku, setSku] = useState(initial?.sku ?? "");
  const [rating, setRating] = useState<number | "">(initial?.rating ?? 5);
  const [reviewCount, setReviewCount] = useState<number | "">(
    initial?.reviewCount ?? 0
  );
  const [isNew, setIsNew] = useState(initial?.isNew ?? false);
  const [isOnSale, setIsOnSale] = useState(initial?.isOnSale ?? false);

  const [images, setImages] = useState<ImageRow[]>(
    initial?.images.map((im) => ({ id: im.id, url: im.url, alt: im.alt })) ?? [
      { id: `img_${Date.now()}`, url: "", alt: "" },
    ]
  );
  const [primaryIndex, setPrimaryIndex] = useState(
    Math.max(0, initial?.images.findIndex((im) => im.isPrimary) ?? 0)
  );
  const [variants, setVariants] = useState<VariantRow[]>(
    initial?.variants.map((v) => ({
      id: v.id,
      type: v.type,
      label: v.label,
      value: v.value,
      stock: v.stock,
      available: v.available,
    })) ?? []
  );
  const [details, setDetails] = useState<DetailRow[]>(
    initial?.details.map((d) => ({
      title: d.title,
      itemsText: d.items.join("\n"),
    })) ?? DEFAULT_DETAILS
  );

  function handleName(v: string) {
    setName(v);
    if (!slugTouched) setSlug(slugify(v));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const safePrimary = Math.min(primaryIndex, Math.max(0, images.length - 1));

    const product: Product = {
      id: initial?.id ?? `prod_${Date.now()}`,
      slug: slug.trim() || slugify(name),
      name: name.trim(),
      description: description.trim(),
      price: price === "" ? 0 : price,
      compareAtPrice: compareAt === "" ? undefined : compareAt,
      categoryId,
      season,
      images: images
        .filter((im) => im.url.trim() || im.alt.trim())
        .map((im, i) => ({
          id: im.id,
          url: im.url.trim(),
          alt: im.alt.trim() || name.trim(),
          isPrimary: i === safePrimary,
        })),
      variants: variants.map((v, i) => ({
        id: v.id || `var_${Date.now()}_${i}`,
        type: v.type,
        label: v.label.trim(),
        value: v.value.trim(),
        available: v.available,
        stock: v.stock === "" ? 0 : v.stock,
      })),
      details: details
        .map((d) => ({
          title: d.title.trim(),
          items: d.itemsText
            .split("\n")
            .map((s) => s.trim())
            .filter(Boolean),
        }))
        .filter((d) => d.title && d.items.length > 0),
      rating: rating === "" ? 0 : rating,
      reviewCount: reviewCount === "" ? 0 : reviewCount,
      stock: stock === "" ? 0 : stock,
      sku: sku.trim(),
      status,
      isNew,
      isOnSale,
      tags: initial?.tags ?? [],
      createdAt: initial?.createdAt ?? new Date().toISOString(),
    };
    onSave(product);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Básicos */}
      <FormField label="Nombre" value={name} onChange={handleName} placeholder="Anillo Aurora" />
      <FormField
        label="Slug (URL)"
        value={slug}
        onChange={(v) => {
          setSlug(v);
          setSlugTouched(true);
        }}
        placeholder="anillo-aurora"
      />
      <TextareaField label="Descripción" value={description} onChange={setDescription} />

      <div className="grid gap-5 sm:grid-cols-2">
        <NumberField label="Precio (USD)" value={price} onChange={setPrice} placeholder="890" />
        <NumberField
          label="Precio anterior (opcional)"
          value={compareAt}
          onChange={setCompareAt}
          optional
          placeholder="—"
        />
        <SelectField
          label="Categoría"
          value={categoryId}
          onChange={setCategoryId}
          options={categories.map((c) => ({ value: c.id, label: c.name }))}
        />
        <SelectField label="Temporada" value={season} onChange={setSeason} options={SEASON_OPTIONS} />
        <SelectField label="Estado" value={status} onChange={setStatus} options={STATUS_OPTIONS} />
        <NumberField label="Stock" value={stock} onChange={setStock} placeholder="6" />
        <FormField label="SKU" value={sku} onChange={setSku} placeholder="COC-ANI-AUR" required={false} />
        <NumberField
          label="Valoración (0–5)"
          value={rating}
          onChange={setRating}
          min={0}
          step={0.5}
        />
        <NumberField label="N.º de reseñas" value={reviewCount} onChange={setReviewCount} />
      </div>

      <div className="flex gap-6">
        <CheckboxField label="Novedad" checked={isNew} onChange={setIsNew} />
        <CheckboxField label="En oferta" checked={isOnSale} onChange={setIsOnSale} />
      </div>

      {/* Imágenes */}
      <Section
        title="Imágenes"
        hint="Marca cuál es la principal. Usa rutas tipo /images/products/aurora-1.jpg"
        onAdd={() =>
          setImages((prev) => [
            ...prev,
            { id: `img_${Date.now()}`, url: "", alt: "" },
          ])
        }
        addLabel="Agregar imagen"
      >
        {images.map((im, i) => (
          <div key={im.id} className="flex items-end gap-3">
            <label className="flex items-center gap-1.5 pb-3 text-xs text-ink/60">
              <input
                type="radio"
                name="primary-image"
                checked={i === primaryIndex}
                onChange={() => setPrimaryIndex(i)}
                className="accent-rose"
              />
              Principal
            </label>
            <div className="flex-1">
              <FormField label="URL" value={im.url} onChange={(v) => updateRow(setImages, i, { url: v })} required={false} placeholder="/images/products/..." />
            </div>
            <div className="flex-1">
              <FormField label="Texto alt" value={im.alt} onChange={(v) => updateRow(setImages, i, { alt: v })} required={false} placeholder="Anillo de frente" />
            </div>
            <RemoveButton onClick={() => removeRow(setImages, i, setPrimaryIndex)} />
          </div>
        ))}
      </Section>

      {/* Variantes */}
      <Section
        title="Variantes"
        hint="Material, talla o color. En color, usa un hex como #c9a463."
        onAdd={() =>
          setVariants((prev) => [
            ...prev,
            {
              id: `var_${Date.now()}`,
              type: "material",
              label: "",
              value: "",
              stock: "",
              available: true,
            },
          ])
        }
        addLabel="Agregar variante"
      >
        {variants.length === 0 && (
          <p className="text-sm text-ink/40">Sin variantes (opcional).</p>
        )}
        {variants.map((v, i) => (
          <div key={v.id} className="grid items-end gap-3 sm:grid-cols-[7rem_1fr_1fr_6rem_auto]">
            <SelectField
              label="Tipo"
              value={v.type}
              onChange={(val) => updateRow(setVariants, i, { type: val })}
              options={VARIANT_TYPE_OPTIONS}
            />
            <FormField label="Etiqueta" value={v.label} onChange={(val) => updateRow(setVariants, i, { label: val })} placeholder="Oro rosa 18k" />
            <FormField label="Valor" value={v.value} onChange={(val) => updateRow(setVariants, i, { value: val })} placeholder="oro-rosa / #c9817c" />
            <NumberField label="Stock" value={v.stock} onChange={(val) => updateRow(setVariants, i, { stock: val })} />
            <div className="flex items-center gap-2 pb-3">
              <input
                type="checkbox"
                checked={v.available}
                onChange={(e) => updateRow(setVariants, i, { available: e.target.checked })}
                className="h-4 w-4 accent-rose"
                aria-label="Disponible"
              />
              <RemoveButton onClick={() => removeRow(setVariants, i)} />
            </div>
          </div>
        ))}
      </Section>

      {/* Detalles */}
      <Section
        title="Detalles"
        hint="Bloques colapsables de la ficha. Un ítem por línea."
        onAdd={() =>
          setDetails((prev) => [...prev, { title: "", itemsText: "" }])
        }
        addLabel="Agregar bloque"
      >
        {details.map((d, i) => (
          <div key={i} className="rounded-xl border border-ink/8 bg-white/60 p-4">
            <div className="flex items-end gap-3">
              <div className="flex-1">
                <FormField label="Título" value={d.title} onChange={(v) => updateRow(setDetails, i, { title: v })} required={false} placeholder="Características" />
              </div>
              <RemoveButton onClick={() => removeRow(setDetails, i)} />
            </div>
            <div className="mt-3">
              <TextareaField
                label="Ítems (uno por línea)"
                value={d.itemsText}
                onChange={(v) => updateRow(setDetails, i, { itemsText: v })}
                placeholder={"Moissanita 1.0 ct\nEngaste de 4 garras"}
              />
            </div>
          </div>
        ))}
      </Section>

      <div className="flex justify-end gap-3 border-t border-ink/8 pt-5">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-full border border-ink/12 px-6 py-2.5 text-sm tracking-wide text-ink/70 transition-colors hover:border-rose/50"
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="rounded-full bg-rose px-6 py-2.5 text-sm tracking-wide text-white transition-colors hover:bg-rose-deep"
        >
          Guardar producto
        </button>
      </div>
    </form>
  );
}

// ── Helpers de filas ─────────────────────────────────────────────────────────

function updateRow<T>(
  setter: React.Dispatch<React.SetStateAction<T[]>>,
  index: number,
  patch: Partial<T>
) {
  setter((prev) => prev.map((row, i) => (i === index ? { ...row, ...patch } : row)));
}

function removeRow<T>(
  setter: React.Dispatch<React.SetStateAction<T[]>>,
  index: number,
  primarySetter?: React.Dispatch<React.SetStateAction<number>>
) {
  setter((prev) => prev.filter((_, i) => i !== index));
  if (primarySetter) primarySetter((p) => (index < p ? p - 1 : p === index ? 0 : p));
}

function Section({
  title,
  hint,
  onAdd,
  addLabel,
  children,
}: {
  title: string;
  hint?: string;
  onAdd: () => void;
  addLabel: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-ink/8 bg-ivory-soft/40 p-5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-display text-lg text-ink">{title}</h3>
          {hint && <p className="mt-0.5 text-xs text-ink/45">{hint}</p>}
        </div>
        <button
          type="button"
          onClick={onAdd}
          className="rounded-full border border-ink/12 px-4 py-2 text-xs tracking-wide text-ink/70 transition-colors hover:border-rose/50 hover:text-rose-deep"
        >
          + {addLabel}
        </button>
      </div>
      <div className="mt-4 space-y-4">{children}</div>
    </div>
  );
}

function RemoveButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Eliminar"
      className="mb-2 flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-ink/40 transition-colors hover:bg-rose/10 hover:text-rose-deep"
    >
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.5}>
        <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
      </svg>
    </button>
  );
}
