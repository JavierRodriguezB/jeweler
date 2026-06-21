"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { Category, Product } from "../../lib/types";
import { mockCategories, mockProducts } from "../../lib/mock-data";

const STORAGE_KEY = "cocolu-catalog";

type CatalogData = { categories: Category[]; products: Product[] };

type DeleteResult = { ok: true } | { ok: false; error: string };

type CatalogContextValue = {
  /** true cuando ya se leyó el catálogo de localStorage. */
  hydrated: boolean;
  /** Categorías ordenadas por `order`. */
  categories: Category[];
  /** Todos los productos (para administración). */
  products: Product[];
  /** Solo productos activos (para el escaparate). */
  activeProducts: Product[];
  getCategoryBySlug: (slug: string) => Category | undefined;
  getCategoryById: (id: string) => Category | undefined;
  getProductBySlug: (slug: string) => Product | undefined;
  getProductById: (id: string) => Product | undefined;
  getActiveProductsByCategory: (categoryId: string) => Product[];
  countActiveByCategory: (categoryId: string) => number;
  upsertCategory: (category: Category) => void;
  deleteCategory: (id: string) => DeleteResult;
  upsertProduct: (product: Product) => void;
  deleteProduct: (id: string) => void;
  resetCatalog: () => void;
};

const CatalogContext = createContext<CatalogContextValue | null>(null);

/** Clona el mock para no mutar los imports al editar. */
function seed(): CatalogData {
  return {
    categories: JSON.parse(JSON.stringify(mockCategories)) as Category[],
    products: JSON.parse(JSON.stringify(mockProducts)) as Product[],
  };
}

export function CatalogProvider({ children }: { children: React.ReactNode }) {
  // El estado inicial es el seed → el render del servidor y el primer render
  // del cliente coinciden (sin desajuste de hidratación).
  const [data, setData] = useState<CatalogData>(seed);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setData(JSON.parse(raw) as CatalogData);
    } catch {
      /* almacenamiento no disponible */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      /* almacenamiento no disponible */
    }
  }, [data, hydrated]);

  const categories = useMemo(
    () => [...data.categories].sort((a, b) => a.order - b.order),
    [data.categories]
  );
  const activeProducts = useMemo(
    () => data.products.filter((p) => p.status === "active"),
    [data.products]
  );

  const getCategoryBySlug = useCallback(
    (slug: string) => data.categories.find((c) => c.slug === slug),
    [data.categories]
  );
  const getCategoryById = useCallback(
    (id: string) => data.categories.find((c) => c.id === id),
    [data.categories]
  );
  const getProductBySlug = useCallback(
    (slug: string) => data.products.find((p) => p.slug === slug),
    [data.products]
  );
  const getProductById = useCallback(
    (id: string) => data.products.find((p) => p.id === id),
    [data.products]
  );
  const getActiveProductsByCategory = useCallback(
    (categoryId: string) =>
      data.products.filter(
        (p) => p.categoryId === categoryId && p.status === "active"
      ),
    [data.products]
  );
  const countActiveByCategory = useCallback(
    (categoryId: string) =>
      data.products.filter(
        (p) => p.categoryId === categoryId && p.status === "active"
      ).length,
    [data.products]
  );

  const upsertCategory = useCallback((category: Category) => {
    setData((prev) => {
      const exists = prev.categories.some((c) => c.id === category.id);
      return {
        ...prev,
        categories: exists
          ? prev.categories.map((c) => (c.id === category.id ? category : c))
          : [...prev.categories, category],
      };
    });
  }, []);

  const deleteCategory = useCallback(
    (id: string): DeleteResult => {
      const hasProducts = data.products.some((p) => p.categoryId === id);
      if (hasProducts) {
        return {
          ok: false,
          error: "No se puede eliminar: la categoría tiene productos.",
        };
      }
      setData((prev) => ({
        ...prev,
        categories: prev.categories.filter((c) => c.id !== id),
      }));
      return { ok: true };
    },
    [data.products]
  );

  const upsertProduct = useCallback((product: Product) => {
    setData((prev) => {
      const exists = prev.products.some((p) => p.id === product.id);
      return {
        ...prev,
        products: exists
          ? prev.products.map((p) => (p.id === product.id ? product : p))
          : [...prev.products, product],
      };
    });
  }, []);

  const deleteProduct = useCallback((id: string) => {
    setData((prev) => ({
      ...prev,
      products: prev.products.filter((p) => p.id !== id),
    }));
  }, []);

  const resetCatalog = useCallback(() => setData(seed()), []);

  const value = useMemo<CatalogContextValue>(
    () => ({
      hydrated,
      categories,
      products: data.products,
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
      resetCatalog,
    }),
    [
      hydrated,
      categories,
      data.products,
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
      resetCatalog,
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
