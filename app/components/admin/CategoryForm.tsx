"use client";

import { useState } from "react";
import type { Category } from "../../lib/types";
import { slugify } from "../../lib/slug";
import FormField from "../auth/FormField";
import { SelectField, NumberField, TextareaField, CheckboxField } from "./fields";

const ACCENT_PRESETS = [
  { value: "from-ivory via-blush to-gold-soft/60", label: "Marfil → Oro" },
  { value: "from-gold-soft/80 via-rose/45 to-rose-deep/30", label: "Oro → Rosa" },
  { value: "from-blush via-rose/55 to-rose-deep/25", label: "Rosa" },
  { value: "from-ivory via-ivory-soft to-blush/60", label: "Marfil suave" },
  { value: "from-rose/30 via-blush to-gold-soft/50", label: "Rosa → Oro" },
];

export default function CategoryForm({
  initial,
  onSave,
  onCancel,
}: {
  initial?: Category;
  onSave: (category: Category) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(initial));
  const [description, setDescription] = useState(initial?.description ?? "");
  const [accent, setAccent] = useState(initial?.accent ?? ACCENT_PRESETS[0].value);
  const [order, setOrder] = useState<number | "">(initial?.order ?? "");
  const [featured, setFeatured] = useState(initial?.featured ?? false);

  function handleName(v: string) {
    setName(v);
    if (!slugTouched) setSlug(slugify(v));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const finalSlug = slug.trim() || slugify(name);
    onSave({
      id: initial?.id ?? `cat_${Date.now()}`,
      slug: finalSlug,
      name: name.trim(),
      description: description.trim(),
      image: initial?.image ?? "",
      productCount: initial?.productCount ?? 0,
      featured,
      order: order === "" ? 99 : order,
      accent,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <FormField label="Nombre" value={name} onChange={handleName} placeholder="Anillos" />
      <FormField
        label="Slug (URL)"
        value={slug}
        onChange={(v) => {
          setSlug(v);
          setSlugTouched(true);
        }}
        placeholder="anillos"
      />
      <TextareaField
        label="Descripción"
        value={description}
        onChange={setDescription}
        placeholder="Del compromiso al día a día: aros que acompañan."
      />
      <div className="grid gap-5 sm:grid-cols-2">
        <SelectField
          label="Acento (gradiente)"
          value={accent}
          onChange={setAccent}
          options={ACCENT_PRESETS}
        />
        <NumberField label="Orden" value={order} onChange={setOrder} optional placeholder="1" />
      </div>

      {/* Vista previa del acento */}
      <div className={`h-16 rounded-2xl bg-gradient-to-br ${accent} ring-1 ring-ink/5`} />

      <CheckboxField label="Destacada en la home" checked={featured} onChange={setFeatured} />

      <div className="flex justify-end gap-3 pt-2">
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
          Guardar
        </button>
      </div>
    </form>
  );
}
