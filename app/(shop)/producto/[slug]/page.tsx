import type { Metadata } from "next";
import { getAllProducts, getProductBySlug } from "@/app/lib/mock-data";
import ProductoContent from "@/app/components/shop/ProductoContent";

/** Pre-genera una ruta por producto sembrado (los nuevos se sirven en runtime). */
export function generateStaticParams() {
  return getAllProducts().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) return { title: "Producto — COCOLU" };
  return {
    title: `${product.name} — COCOLU`,
    description: product.description,
  };
}

export default async function ProductoPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <ProductoContent slug={slug} />;
}
