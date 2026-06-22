import type { Metadata } from "next";
import { getAllProducts, getProductBySlug } from "@/app/lib/mock-data";
import ProductoContent from "@/app/components/shop/ProductoContent";
import { config } from "@/app/lib/config";

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
  if (!product) return { title: `Producto — ${config.site.name}` };
  return {
    title: `${product.name} — ${config.site.name}`,
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
