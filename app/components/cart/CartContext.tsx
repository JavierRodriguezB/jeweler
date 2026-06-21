"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { Product } from "../../lib/types";
import { glyphForCategory, type GlyphName } from "../shop/JewelryGlyph";
import { useCatalog } from "../catalog/CatalogContext";

const STORAGE_KEY = "cocolu-cart";

/** Lo que se persiste: mínimo e independiente del catálogo. */
type StoredItem = {
  productId: string;
  /** Combinación de variantes elegidas (ids unidos por "|"). */
  variantId?: string;
  quantity: number;
};

/** Línea resuelta para la UI (producto + variantes + totales). */
export type CartLine = {
  key: string;
  productId: string;
  variantId?: string;
  product: Product;
  variantLabels: string[];
  glyph: GlyphName;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
};

type CartContextValue = {
  lines: CartLine[];
  count: number;
  subtotal: number;
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addItem: (
    productId: string,
    variantId: string | undefined,
    quantity?: number
  ) => void;
  updateQuantity: (key: string, quantity: number) => void;
  removeItem: (key: string) => void;
  clear: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

function lineKey(productId: string, variantId?: string): string {
  return `${productId}::${variantId ?? ""}`;
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { getProductById, getCategoryById } = useCatalog();
  const [items, setItems] = useState<StoredItem[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  // Cargar desde localStorage una sola vez (tras el primer render → sin
  // desajuste de hidratación, porque el render inicial coincide con el del
  // servidor: carrito vacío).
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw) as StoredItem[]);
    } catch {
      /* almacenamiento no disponible */
    }
    setHydrated(true);
  }, []);

  // Persistir solo después de hidratar (para no pisar lo guardado con []).
  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      /* almacenamiento no disponible */
    }
  }, [items, hydrated]);

  const addItem = useCallback(
    (productId: string, variantId: string | undefined, quantity = 1) => {
      setItems((prev) => {
        const key = lineKey(productId, variantId);
        const idx = prev.findIndex(
          (it) => lineKey(it.productId, it.variantId) === key
        );
        if (idx >= 0) {
          const next = [...prev];
          next[idx] = { ...next[idx], quantity: next[idx].quantity + quantity };
          return next;
        }
        return [...prev, { productId, variantId, quantity }];
      });
      setIsOpen(true);
    },
    []
  );

  const updateQuantity = useCallback((key: string, quantity: number) => {
    setItems((prev) =>
      prev
        .map((it) =>
          lineKey(it.productId, it.variantId) === key
            ? { ...it, quantity }
            : it
        )
        .filter((it) => it.quantity > 0)
    );
  }, []);

  const removeItem = useCallback((key: string) => {
    setItems((prev) =>
      prev.filter((it) => lineKey(it.productId, it.variantId) !== key)
    );
  }, []);

  const clear = useCallback(() => setItems([]), []);
  const openCart = useCallback(() => setIsOpen(true), []);
  const closeCart = useCallback(() => setIsOpen(false), []);

  // Resolver cada item contra el catálogo (los productos eliminados se omiten).
  const lines = useMemo<CartLine[]>(() => {
    return items.flatMap((it) => {
      const product = getProductById(it.productId);
      if (!product) return [];

      const ids = it.variantId ? it.variantId.split("|") : [];
      const variantLabels = ids
        .map((id) => product.variants.find((v) => v.id === id)?.label)
        .filter((label): label is string => Boolean(label));

      const category = getCategoryById(product.categoryId);

      return [
        {
          key: lineKey(it.productId, it.variantId),
          productId: it.productId,
          variantId: it.variantId,
          product,
          variantLabels,
          glyph: glyphForCategory(category?.slug ?? ""),
          unitPrice: product.price,
          quantity: it.quantity,
          lineTotal: product.price * it.quantity,
        },
      ];
    });
  }, [items, getProductById, getCategoryById]);

  const count = useMemo(
    () => lines.reduce((n, l) => n + l.quantity, 0),
    [lines]
  );
  const subtotal = useMemo(
    () => lines.reduce((s, l) => s + l.lineTotal, 0),
    [lines]
  );

  const value = useMemo<CartContextValue>(
    () => ({
      lines,
      count,
      subtotal,
      isOpen,
      openCart,
      closeCart,
      addItem,
      updateQuantity,
      removeItem,
      clear,
    }),
    [
      lines,
      count,
      subtotal,
      isOpen,
      openCart,
      closeCart,
      addItem,
      updateQuantity,
      removeItem,
      clear,
    ]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart debe usarse dentro de <CartProvider>");
  return ctx;
}
