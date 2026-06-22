/**
 * Modelo de datos de COCOLU (maqueta de e-commerce reutilizable).
 *
 * Convención: nombres de tipos/campos en inglés, contenido y comentarios en
 * español, igual que el resto del proyecto. Los precios se expresan en la
 * unidad principal de la moneda (ver `CURRENCY`) para simplificar la maqueta;
 * al conectar un backend real conviene migrar a enteros (céntimos).
 */

import { config } from "./config";

// ───────────────────────────── Roles y usuarios ─────────────────────────────

/** Roles del sistema. `guest` = visitante sin sesión (no se persiste). */
export type UserRole = "admin" | "customer" | "guest";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  /** Imagen de avatar opcional. */
  avatarUrl?: string;
  /** Fecha de alta en formato ISO 8601. */
  createdAt: string;
}

// ──────────────────────────── Temporadas / estaciones ───────────────────────

/**
 * Una joyería trabaja por temporadas, igual que la moda. `atemporal` agrupa las
 * piezas de catálogo permanente (clásicos que no rotan por estación).
 */
export type Season = "primavera" | "verano" | "otono" | "invierno" | "atemporal";

// ──────────────────────────────── Categorías ────────────────────────────────

/**
 * Categoría visible en la grilla "Comprar por categoría". Pensada para
 * renderizar tarjetas con imagen de portada (ver maqueta de referencia).
 */
export interface Category {
  id: string;
  /** Identificador para la URL: /coleccion/[slug]. */
  slug: string;
  name: string;
  description: string;
  /** Imagen de portada de la tarjeta de categoría. */
  image: string;
  /** Nº de productos. Derivado del catálogo; se usa solo para mostrar. */
  productCount: number;
  /** Si aparece destacada en la home. */
  featured: boolean;
  /** Orden de aparición en la grilla (menor = primero). */
  order: number;
  /** Clases de gradiente Tailwind para el acento premium (opcional). */
  accent?: string;
}

// ──────────────────────── Producto: imágenes y variantes ────────────────────

/** Un producto puede tener varias imágenes (galería + miniaturas). */
export interface ProductImage {
  id: string;
  url: string;
  /** Texto alternativo accesible. */
  alt: string;
  /** Imagen principal mostrada por defecto en la galería. */
  isPrimary: boolean;
}

/** Ejes de variación típicos en joyería. */
export type VariantType = "color" | "talla" | "material";

export interface ProductVariant {
  id: string;
  type: VariantType;
  /** Etiqueta legible: "Oro rosa", "Talla 7", "Plata 925". */
  label: string;
  /** Valor crudo: hex para `color`, valor textual para el resto. */
  value: string;
  available: boolean;
  stock: number;
}

export type ProductStatus = "active" | "draft" | "archived";

/**
 * Bloque colapsable de la ficha de producto (Características, Cuidado, Envío,
 * Devoluciones), como en la maqueta de referencia.
 */
export interface ProductDetailBlock {
  title: string;
  items: string[];
}

export interface Product {
  id: string;
  /** Identificador para la URL: /producto/[slug]. */
  slug: string;
  name: string;
  description: string;
  /** Precio en la unidad de `CURRENCY`. */
  price: number;
  /** Precio anterior tachado (para piezas en oferta). */
  compareAtPrice?: number;
  categoryId: string;
  season: Season;
  /** Galería: siempre al menos una imagen, con una `isPrimary`. */
  images: ProductImage[];
  variants: ProductVariant[];
  /** Bloques de detalle colapsables de la ficha. */
  details: ProductDetailBlock[];
  /** Valoración media 0–5. */
  rating: number;
  reviewCount: number;
  stock: number;
  sku: string;
  status: ProductStatus;
  /** Insignia "Novedad". */
  isNew: boolean;
  /** Insignia "Oferta" (suele acompañar a `compareAtPrice`). */
  isOnSale: boolean;
  tags: string[];
  createdAt: string;
}

// ───────────────────────────────── Carrito ──────────────────────────────────

export interface CartItem {
  productId: string;
  /** Variante elegida (color/talla/material) si aplica. */
  variantId?: string;
  quantity: number;
}

export interface Cart {
  items: CartItem[];
  updatedAt: string;
}

// ───────────────────────────────── Pedidos ──────────────────────────────────

export type OrderStatus =
  | "pending"
  | "paid"
  | "shipped"
  | "delivered"
  | "cancelled";

export interface OrderLine {
  productId: string;
  name: string;
  variantLabel?: string;
  unitPrice: number;
  quantity: number;
}

export interface Order {
  id: string;
  /** Pedido de usuario registrado. Ausente si fue checkout como invitado. */
  userId?: string;
  /** Email del invitado cuando no hay `userId`. */
  guestEmail?: string;
  status: OrderStatus;
  lines: OrderLine[];
  subtotal: number;
  total: number;
  createdAt: string;
}

// ──────────────────────────────── Constantes ────────────────────────────────

/** Moneda del catálogo. Fuente única: `config.currency.code` (ver `lib/config`). */
export const CURRENCY = config.currency.code;

/** Etiquetas legibles de cada temporada para la UI. */
export const SEASON_LABELS: Record<Season, string> = {
  primavera: "Primavera",
  verano: "Verano",
  otono: "Otoño",
  invierno: "Invierno",
  atemporal: "Atemporal",
};
