import type { Metadata } from "next";
import { getAllCategories, getCategoryBySlug } from "@/app/lib/mock-data";
import ColeccionContent from "@/app/components/shop/ColeccionContent";

/** Pre-genera una ruta por categoría sembrada (las nuevas se sirven en runtime). */
export function generateStaticParams() {
  return getAllCategories().map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const category = getCategoryBySlug(slug);
  if (!category) return { title: "Colección — COCOLU" };
  return {
    title: `${category.name} — COCOLU`,
    description: category.description,
  };
}

export default async function ColeccionPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <ColeccionContent slug={slug} />;
}
