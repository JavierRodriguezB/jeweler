"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type {
  Category,
  Product,
  ProductDetailBlock,
  ProductImage,
  ProductVariant,
} from "../../lib/types";
import { createClient } from "../../lib/supabase/client";

type MutationResult = { ok: true } | { ok: false; error: string };

type CatalogContextValue = {
  /** true cuando ya se cargó el catálogo desde Supabase. */
  hydrated: boolean;
  categories: Category[];
  products: Product[];
  activeProducts: Product[];
  getCategoryBySlug: (slug: string) => Category | undefined;
  getCategoryById: (id: string) => Category | undefined;
  getProductBySlug: (slug: string) => Product | undefined;
  getProductById: (id: string) => Product | undefined;
  getActiveProductsByCategory: (categoryId: string) => Product[];
  countActiveByCategory: (categoryId: string) => number;
  upsertCategory: (category: Category) => Promise<MutationResult>;
  deleteCategory: (id: string) => Promise<MutationResult>;
  upsertProduct: (product: Product) => Promise<MutationResult>;
  deleteProduct: (id: string) => Promise<MutationResult>;
  refresh: () => Promise<void>;
};

const CatalogContext = createContext<CatalogContextValue | null>(null);

// ──────────────────────── Filas de la BD (sin tipos generados) ──────────────

type DbCategory = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  accent: string | null;
  sort_order: number;
  featured: boolean;
};

type DbImage = {
  id: string;
  url: string;
  alt: string | null;
  is_primary: boolean;
  position: number;
};

type DbVariant = {
  id: string;
  type: ProductVariant["type"];
  label: string;
  value: string;
  available: boolean;
  stock: number;
};

type DbProduct = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  price: number | string;
  compare_at_price: number | string | null;
  category_id: string;
  season: Product["season"];
  status: Product["status"];
  stock: number;
  sku: string | null;
  rating: number | string;
  review_count: number;
  is_new: boolean;
  is_on_sale: boolean;
  details: ProductDetailBlock[] | null;
  tags: string[] | null;
  created_at: string;
  product_images: DbImage[] | null;
  product_variants: DbVariant[] | null;
};

// ───────────────────────────────── Mappers ─────────────────────────────────

function mapCategory(row: DbCategory): Category {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    description: row.description ?? "",
    image: "",
    productCount: 0,
    featured: row.featured,
    order: row.sort_order,
    accent: row.accent ?? undefined,
  };
}

function mapProduct(row: DbProduct): Product {
  const images: ProductImage[] = (row.product_images ?? [])
    .slice()
    .sort((a, b) => a.position - b.position)
    .map((im) => ({
      id: im.id,
      url: im.url,
      alt: im.alt ?? "",
      isPrimary: im.is_primary,
    }));

  const variants: ProductVariant[] = (row.product_variants ?? []).map((v) => ({
    id: v.id,
    type: v.type,
    label: v.label,
    value: v.value,
    available: v.available,
    stock: v.stock,
  }));

  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    description: row.description ?? "",
    price: Number(row.price),
    compareAtPrice:
      row.compare_at_price == null ? undefined : Number(row.compare_at_price),
    categoryId: row.category_id,
    season: row.season,
    images,
    variants,
    details: row.details ?? [],
    rating: Number(row.rating),
    reviewCount: row.review_count,
    stock: row.stock,
    sku: row.sku ?? "",
    status: row.status,
    isNew: row.is_new,
    isOnSale: row.is_on_sale,
    tags: row.tags ?? [],
    createdAt: row.created_at,
  };
}

/** Payload de producto para la BD (sin id; lo asigna Postgres en insert). */
function productRow(p: Product) {
  return {
    slug: p.slug,
    name: p.name,
    description: p.description,
    price: p.price,
    compare_at_price: p.compareAtPrice ?? null,
    category_id: p.categoryId,
    season: p.season,
    status: p.status,
    stock: p.stock,
    sku: p.sku || null,
    rating: p.rating,
    review_count: p.reviewCount,
    is_new: p.isNew,
    is_on_sale: p.isOnSale,
    details: p.details,
    tags: p.tags,
  };
}

export function CatalogProvider({ children }: { children: React.ReactNode }) {
  const [supabase] = useState(() => createClient());
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [hydrated, setHydrated] = useState(false);

  const refresh = useCallback(async () => {
    const [catRes, prodRes] = await Promise.all([
      supabase.from("categories").select("*").order("sort_order"),
      supabase
        .from("products")
        .select("*, product_images(*), product_variants(*)")
        .order("created_at", { ascending: false }),
    ]);

    if (catRes.data)
      setCategories((catRes.data as DbCategory[]).map(mapCategory));
    if (prodRes.data)
      setProducts((prodRes.data as unknown as DbProduct[]).map(mapProduct));
  }, [supabase]);

  useEffect(() => {
    refresh().finally(() => setHydrated(true));
  }, [refresh]);

  const activeProducts = useMemo(
    () => products.filter((p) => p.status === "active"),
    [products]
  );

  const getCategoryBySlug = useCallback(
    (slug: string) => categories.find((c) => c.slug === slug),
    [categories]
  );
  const getCategoryById = useCallback(
    (id: string) => categories.find((c) => c.id === id),
    [categories]
  );
  const getProductBySlug = useCallback(
    (slug: string) => products.find((p) => p.slug === slug),
    [products]
  );
  const getProductById = useCallback(
    (id: string) => products.find((p) => p.id === id),
    [products]
  );
  const getActiveProductsByCategory = useCallback(
    (categoryId: string) =>
      products.filter((p) => p.categoryId === categoryId && p.status === "active"),
    [products]
  );
  const countActiveByCategory = useCallback(
    (categoryId: string) =>
      products.filter((p) => p.categoryId === categoryId && p.status === "active")
        .length,
    [products]
  );

  // ──────────────────────────── Mutaciones (admin) ─────────────────────────

  const exists = useCallback(
    (id: string, list: { id: string }[]) => list.some((x) => x.id === id),
    []
  );

  const upsertCategory = useCallback(
    async (category: Category): Promise<MutationResult> => {
      const payload = {
        slug: category.slug,
        name: category.name,
        description: category.description,
        accent: category.accent ?? null,
        sort_order: category.order,
        featured: category.featured,
      };

      const isUpdate = exists(category.id, categories);
      const { error } = isUpdate
        ? await supabase.from("categories").update(payload).eq("id", category.id)
        : await supabase.from("categories").insert(payload);

      if (error) return { ok: false, error: error.message };
      await refresh();
      return { ok: true };
    },
    [supabase, categories, exists, refresh]
  );

  const deleteCategory = useCallback(
    async (id: string): Promise<MutationResult> => {
      const { error } = await supabase.from("categories").delete().eq("id", id);
      if (error) {
        // FK on delete restrict → la categoría tiene productos.
        return {
          ok: false,
          error:
            "No se puede eliminar: la categoría tiene productos asociados.",
        };
      }
      await refresh();
      return { ok: true };
    },
    [supabase, refresh]
  );

  /** Reemplaza imágenes y variantes de un producto por las del formulario. */
  const syncChildren = useCallback(
    async (productId: string, product: Product) => {
      await supabase.from("product_images").delete().eq("product_id", productId);
      await supabase
        .from("product_variants")
        .delete()
        .eq("product_id", productId);

      if (product.images.length > 0) {
        await supabase.from("product_images").insert(
          product.images.map((im, i) => ({
            product_id: productId,
            url: im.url,
            alt: im.alt,
            is_primary: im.isPrimary,
            position: i,
          }))
        );
      }
      if (product.variants.length > 0) {
        await supabase.from("product_variants").insert(
          product.variants.map((v) => ({
            product_id: productId,
            type: v.type,
            label: v.label,
            value: v.value,
            available: v.available,
            stock: v.stock,
          }))
        );
      }
    },
    [supabase]
  );

  const upsertProduct = useCallback(
    async (product: Product): Promise<MutationResult> => {
      const isUpdate = exists(product.id, products);

      if (isUpdate) {
        const { error } = await supabase
          .from("products")
          .update(productRow(product))
          .eq("id", product.id);
        if (error) return { ok: false, error: error.message };
        await syncChildren(product.id, product);
      } else {
        const { data, error } = await supabase
          .from("products")
          .insert(productRow(product))
          .select("id")
          .single();
        if (error || !data) {
          return { ok: false, error: error?.message ?? "No se pudo crear." };
        }
        await syncChildren((data as { id: string }).id, product);
      }

      await refresh();
      return { ok: true };
    },
    [supabase, products, exists, syncChildren, refresh]
  );

  const deleteProduct = useCallback(
    async (id: string): Promise<MutationResult> => {
      const { error } = await supabase.from("products").delete().eq("id", id);
      if (error) return { ok: false, error: error.message };
      await refresh();
      return { ok: true };
    },
    [supabase, refresh]
  );

  const value = useMemo<CatalogContextValue>(
    () => ({
      hydrated,
      categories,
      products,
      activeProducts,
      getCategoryBySlug,
      getCategoryById,
      getProductBySlug,
      getProductById,
      getActiveProductsByCategory,
      countActiveByCategory,
      upsertCategory,
      deleteCategory,
      upsertProduct,
      deleteProduct,
      refresh,
    }),
    [
      hydrated,
      categories,
      products,
      activeProducts,
      getCategoryBySlug,
      getCategoryById,
      getProductBySlug,
      getProductById,
      getActiveProductsByCategory,
      countActiveByCategory,
      upsertCategory,
      deleteCategory,
      upsertProduct,
      deleteProduct,
      refresh,
    ]
  );

  return (
    <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>
  );
}

export function useCatalog(): CatalogContextValue {
  const ctx = useContext(CatalogContext);
  if (!ctx) throw new Error("useCatalog debe usarse dentro de <CatalogProvider>");
  return ctx;
}
