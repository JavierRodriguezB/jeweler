/**
 * Datos de prueba (mock) de COCOLU.
 *
 * Esta es la única fuente de datos mientras no haya backend. Cuando exista una
 * API/DB real, basta con reemplazar los selectores del final del archivo por
 * llamadas reales; los componentes que los consumen no cambian.
 *
 * Nota sobre imágenes: las rutas apuntan a `/public/images/...`. Son
 * marcadores de posición; al cargar assets reales, respeta esas rutas o
 * actualízalas aquí.
 */

import type { Category, Order, Product, User } from "./types";

// ──────────────────────────────── Usuarios ──────────────────────────────────
// Correos y roles para probar los flujos (login, checkout, panel admin).

export const mockUsers: User[] = [
  {
    id: "usr_admin",
    name: "Camila Rivas",
    email: "admin@cocolu.com",
    role: "admin",
    avatarUrl: "/images/users/admin.jpg",
    createdAt: "2025-01-10T09:00:00.000Z",
  },
  {
    id: "usr_cliente",
    name: "Valentina Soto",
    email: "cliente@cocolu.com",
    role: "customer",
    avatarUrl: "/images/users/valentina.jpg",
    createdAt: "2025-03-22T14:30:00.000Z",
  },
  {
    id: "usr_cliente_2",
    name: "Mateo Herrera",
    email: "mateo@example.com",
    role: "customer",
    createdAt: "2025-05-02T11:15:00.000Z",
  },
];

/**
 * Credenciales de demostración para la maqueta. La contraseña es la misma para
 * todos en este entorno de prueba. NO usar en producción.
 */
export const demoCredentials = [
  { email: "admin@cocolu.com", password: "cocolu-admin", role: "admin" },
  { email: "cliente@cocolu.com", password: "cocolu-cliente", role: "customer" },
] as const;

// ─────────────────────────────── Categorías ─────────────────────────────────

export const mockCategories: Category[] = [
  {
    id: "cat_novias",
    slug: "novias",
    name: "Novias",
    description: "Piezas diseñadas para el día que lo cambia todo.",
    image: "/images/categories/novias.jpg",
    productCount: 2,
    featured: true,
    order: 1,
    accent: "from-ivory via-blush to-gold-soft/60",
  },
  {
    id: "cat_anillos",
    slug: "anillos",
    name: "Anillos",
    description: "Del compromiso al día a día: aros que acompañan.",
    image: "/images/categories/anillos.jpg",
    productCount: 2,
    featured: true,
    order: 2,
    accent: "from-gold-soft/80 via-rose/45 to-rose-deep/30",
  },
  {
    id: "cat_collares",
    slug: "collares",
    name: "Collares",
    description: "Detalles cerca del corazón, en oro y plata.",
    image: "/images/categories/collares.jpg",
    productCount: 2,
    featured: true,
    order: 3,
    accent: "from-blush via-rose/55 to-rose-deep/25",
  },
  {
    id: "cat_aretes",
    slug: "aretes",
    name: "Aretes",
    description: "Desde lo minimalista hasta lo que ilumina la mirada.",
    image: "/images/categories/aretes.jpg",
    productCount: 1,
    featured: false,
    order: 4,
    accent: "from-ivory via-ivory-soft to-blush/60",
  },
  {
    id: "cat_ofertas",
    slug: "ofertas",
    name: "Ofertas",
    description: "Piezas seleccionadas de temporadas anteriores.",
    image: "/images/categories/ofertas.jpg",
    productCount: 1,
    featured: false,
    order: 5,
    accent: "from-rose/30 via-blush to-gold-soft/50",
  },
];

// ──────────────────────────────── Productos ─────────────────────────────────

export const mockProducts: Product[] = [
  {
    id: "prod_aurora",
    slug: "anillo-aurora",
    name: "Anillo Aurora",
    description:
      "Solitario tallado a mano con moissanita de talla brillante. Una pieza que captura la luz desde cualquier ángulo, pensada para el sí más importante.",
    price: 890,
    categoryId: "cat_novias",
    season: "atemporal",
    images: [
      { id: "img_aurora_1", url: "/images/products/aurora-1.jpg", alt: "Anillo Aurora de frente", isPrimary: true },
      { id: "img_aurora_2", url: "/images/products/aurora-2.jpg", alt: "Anillo Aurora de perfil", isPrimary: false },
      { id: "img_aurora_3", url: "/images/products/aurora-3.jpg", alt: "Anillo Aurora en la mano", isPrimary: false },
      { id: "img_aurora_4", url: "/images/products/aurora-4.jpg", alt: "Detalle del engaste", isPrimary: false },
    ],
    variants: [
      { id: "var_aurora_oroblanco", type: "material", label: "Oro blanco 18k", value: "oro-blanco", available: true, stock: 4 },
      { id: "var_aurora_ororosa", type: "material", label: "Oro rosa 18k", value: "oro-rosa", available: true, stock: 2 },
      { id: "var_aurora_t6", type: "talla", label: "Talla 6", value: "6", available: true, stock: 3 },
      { id: "var_aurora_t7", type: "talla", label: "Talla 7", value: "7", available: true, stock: 3 },
    ],
    details: [
      { title: "Características", items: ["Moissanita 1.0 ct", "Engaste de 4 garras", "Oro de 18 quilates", "Tallado a mano"] },
      { title: "Cuidado", items: ["Guardar en estuche individual", "Limpiar con paño de microfibra", "Evitar contacto con perfumes"] },
      { title: "Envío", items: ["Envío asegurado en 3–5 días", "Empaque de regalo incluido"] },
      { title: "Devoluciones", items: ["30 días para cambios", "Ajuste de talla gratis el primer año"] },
    ],
    rating: 5,
    reviewCount: 38,
    stock: 6,
    sku: "COC-NOV-AUR",
    status: "active",
    isNew: true,
    isOnSale: false,
    tags: ["compromiso", "moissanita", "solitario"],
    createdAt: "2026-05-01T10:00:00.000Z",
  },
  {
    id: "prod_eternal",
    slug: "alianza-eternal",
    name: "Alianza Eternal",
    description:
      "Banda de eternidad con un hilo continuo de pequeñas piedras. Símbolo de un amor sin principio ni fin, cómoda para llevar todos los días.",
    price: 640,
    categoryId: "cat_novias",
    season: "atemporal",
    images: [
      { id: "img_eternal_1", url: "/images/products/eternal-1.jpg", alt: "Alianza Eternal de frente", isPrimary: true },
      { id: "img_eternal_2", url: "/images/products/eternal-2.jpg", alt: "Alianza Eternal de perfil", isPrimary: false },
      { id: "img_eternal_3", url: "/images/products/eternal-3.jpg", alt: "Alianza Eternal en par", isPrimary: false },
    ],
    variants: [
      { id: "var_eternal_t6", type: "talla", label: "Talla 6", value: "6", available: true, stock: 5 },
      { id: "var_eternal_t7", type: "talla", label: "Talla 7", value: "7", available: true, stock: 4 },
      { id: "var_eternal_t8", type: "talla", label: "Talla 8", value: "8", available: false, stock: 0 },
    ],
    details: [
      { title: "Características", items: ["Pavé de circonias", "Oro de 18 quilates", "Perfil confort"] },
      { title: "Cuidado", items: ["Limpiar con paño suave", "Revisar engastes una vez al año"] },
      { title: "Envío", items: ["Envío asegurado en 3–5 días"] },
      { title: "Devoluciones", items: ["30 días para cambios"] },
    ],
    rating: 4.5,
    reviewCount: 21,
    stock: 9,
    sku: "COC-NOV-ETE",
    status: "active",
    isNew: false,
    isOnSale: false,
    tags: ["alianza", "eternidad", "boda"],
    createdAt: "2026-02-14T10:00:00.000Z",
  },
  {
    id: "prod_solenne",
    slug: "anillo-solenne",
    name: "Anillo Solenne",
    description:
      "Aro minimalista de líneas puras con un destello discreto. La pieza perfecta para quien prefiere lo esencial sin renunciar a la elegancia.",
    price: 320,
    categoryId: "cat_anillos",
    season: "verano",
    images: [
      { id: "img_solenne_1", url: "/images/products/solenne-1.jpg", alt: "Anillo Solenne de frente", isPrimary: true },
      { id: "img_solenne_2", url: "/images/products/solenne-2.jpg", alt: "Anillo Solenne de perfil", isPrimary: false },
    ],
    variants: [
      { id: "var_solenne_plata", type: "material", label: "Plata 925", value: "plata", available: true, stock: 8 },
      { id: "var_solenne_oro", type: "material", label: "Oro amarillo 18k", value: "oro-amarillo", available: true, stock: 3 },
    ],
    details: [
      { title: "Características", items: ["Diseño minimalista", "Acabado pulido espejo", "Hipoalergénico"] },
      { title: "Cuidado", items: ["Evitar contacto con cloro", "Guardar seco"] },
      { title: "Envío", items: ["Envío estándar en 2–4 días"] },
      { title: "Devoluciones", items: ["30 días para cambios"] },
    ],
    rating: 4,
    reviewCount: 12,
    stock: 11,
    sku: "COC-ANI-SOL",
    status: "active",
    isNew: true,
    isOnSale: false,
    tags: ["minimalista", "diario"],
    createdAt: "2026-04-18T10:00:00.000Z",
  },
  {
    id: "prod_celeste",
    slug: "anillo-celeste",
    name: "Anillo Celeste",
    description:
      "Aro con piedra de topacio azul en talla esmeralda. Inspirado en los cielos de verano, aporta color sin perder sobriedad.",
    price: 410,
    compareAtPrice: 520,
    categoryId: "cat_anillos",
    season: "verano",
    images: [
      { id: "img_celeste_1", url: "/images/products/celeste-1.jpg", alt: "Anillo Celeste de frente", isPrimary: true },
      { id: "img_celeste_2", url: "/images/products/celeste-2.jpg", alt: "Anillo Celeste de perfil", isPrimary: false },
      { id: "img_celeste_3", url: "/images/products/celeste-3.jpg", alt: "Detalle de la piedra", isPrimary: false },
    ],
    variants: [
      { id: "var_celeste_t6", type: "talla", label: "Talla 6", value: "6", available: true, stock: 2 },
      { id: "var_celeste_t7", type: "talla", label: "Talla 7", value: "7", available: true, stock: 1 },
    ],
    details: [
      { title: "Características", items: ["Topacio azul natural", "Talla esmeralda", "Plata 925 con baño de oro"] },
      { title: "Cuidado", items: ["Limpiar con paño seco", "Evitar golpes en la piedra"] },
      { title: "Envío", items: ["Envío estándar en 2–4 días"] },
      { title: "Devoluciones", items: ["30 días para cambios"] },
    ],
    rating: 4.5,
    reviewCount: 9,
    stock: 3,
    sku: "COC-ANI-CEL",
    status: "active",
    isNew: false,
    isOnSale: true,
    tags: ["topacio", "verano", "color"],
    createdAt: "2025-11-30T10:00:00.000Z",
  },
  {
    id: "prod_lumiere",
    slug: "collar-lumiere",
    name: "Collar Lumière",
    description:
      "Gargantilla con colgante de gota en oro. Cae con delicadeza sobre la clavícula y combina con todo, de día y de noche.",
    price: 380,
    categoryId: "cat_collares",
    season: "primavera",
    images: [
      { id: "img_lumiere_1", url: "/images/products/lumiere-1.jpg", alt: "Collar Lumière completo", isPrimary: true },
      { id: "img_lumiere_2", url: "/images/products/lumiere-2.jpg", alt: "Detalle del colgante", isPrimary: false },
      { id: "img_lumiere_3", url: "/images/products/lumiere-3.jpg", alt: "Collar Lumière puesto", isPrimary: false },
    ],
    variants: [
      { id: "var_lumiere_oro", type: "material", label: "Oro amarillo 18k", value: "oro-amarillo", available: true, stock: 6 },
      { id: "var_lumiere_ororosa", type: "material", label: "Oro rosa 18k", value: "oro-rosa", available: true, stock: 4 },
    ],
    details: [
      { title: "Características", items: ["Cadena de 42 cm + 3 cm de extensión", "Colgante de gota", "Cierre de mosquetón"] },
      { title: "Cuidado", items: ["Quitar antes de dormir", "Evitar perfumes y cremas"] },
      { title: "Envío", items: ["Envío estándar en 2–4 días", "Empaque de regalo incluido"] },
      { title: "Devoluciones", items: ["30 días para cambios"] },
    ],
    rating: 5,
    reviewCount: 27,
    stock: 10,
    sku: "COC-COL-LUM",
    status: "active",
    isNew: true,
    isOnSale: false,
    tags: ["colgante", "diario", "regalo"],
    createdAt: "2026-03-09T10:00:00.000Z",
  },
  {
    id: "prod_nordic",
    slug: "collar-nordic",
    name: "Collar Nórdico",
    description:
      "Cadena de eslabones gruesos con caída fluida. Una pieza statement de invierno para usar sobre prendas de punto y abrigos.",
    price: 295,
    categoryId: "cat_collares",
    season: "invierno",
    images: [
      { id: "img_nordic_1", url: "/images/products/nordic-1.jpg", alt: "Collar Nórdico completo", isPrimary: true },
      { id: "img_nordic_2", url: "/images/products/nordic-2.jpg", alt: "Detalle de los eslabones", isPrimary: false },
    ],
    variants: [
      { id: "var_nordic_plata", type: "material", label: "Plata 925", value: "plata", available: true, stock: 7 },
      { id: "var_nordic_oro", type: "material", label: "Acero con baño de oro", value: "acero-oro", available: true, stock: 5 },
    ],
    details: [
      { title: "Características", items: ["Eslabones tipo cubano", "45 cm de largo", "Cierre reforzado"] },
      { title: "Cuidado", items: ["Limpiar con paño de microfibra"] },
      { title: "Envío", items: ["Envío estándar en 2–4 días"] },
      { title: "Devoluciones", items: ["30 días para cambios"] },
    ],
    rating: 4,
    reviewCount: 6,
    stock: 12,
    sku: "COC-COL-NOR",
    status: "active",
    isNew: false,
    isOnSale: false,
    tags: ["statement", "invierno", "cadena"],
    createdAt: "2025-12-05T10:00:00.000Z",
  },
  {
    id: "prod_gota",
    slug: "aretes-gota-de-rocio",
    name: "Aretes Gota de Rocío",
    description:
      "Aretes colgantes con una perla cultivada que se mece con el movimiento. Frescos y femeninos, ideales para primavera.",
    price: 230,
    categoryId: "cat_aretes",
    season: "primavera",
    images: [
      { id: "img_gota_1", url: "/images/products/gota-1.jpg", alt: "Aretes Gota de Rocío", isPrimary: true },
      { id: "img_gota_2", url: "/images/products/gota-2.jpg", alt: "Detalle de la perla", isPrimary: false },
      { id: "img_gota_3", url: "/images/products/gota-3.jpg", alt: "Aretes puestos", isPrimary: false },
    ],
    variants: [
      { id: "var_gota_oro", type: "material", label: "Oro amarillo 18k", value: "oro-amarillo", available: true, stock: 9 },
      { id: "var_gota_plata", type: "material", label: "Plata 925", value: "plata", available: true, stock: 6 },
    ],
    details: [
      { title: "Características", items: ["Perla cultivada de agua dulce", "Cierre de presión seguro", "Peso ligero"] },
      { title: "Cuidado", items: ["Guardar separados", "Evitar humedad prolongada"] },
      { title: "Envío", items: ["Envío estándar en 2–4 días"] },
      { title: "Devoluciones", items: ["30 días para cambios"] },
    ],
    rating: 4.5,
    reviewCount: 15,
    stock: 15,
    sku: "COC-ARE-GOT",
    status: "active",
    isNew: false,
    isOnSale: false,
    tags: ["perla", "primavera", "colgante"],
    createdAt: "2026-03-20T10:00:00.000Z",
  },
  {
    id: "prod_estio",
    slug: "pulsera-estio",
    name: "Pulsera Estío",
    description:
      "Pulsera tejida con hilo dorado y dije de sol. Una pieza de verano de temporada anterior, ahora a precio especial.",
    price: 95,
    compareAtPrice: 150,
    categoryId: "cat_ofertas",
    season: "verano",
    images: [
      { id: "img_estio_1", url: "/images/products/estio-1.jpg", alt: "Pulsera Estío", isPrimary: true },
      { id: "img_estio_2", url: "/images/products/estio-2.jpg", alt: "Detalle del dije", isPrimary: false },
    ],
    variants: [
      { id: "var_estio_ajustable", type: "talla", label: "Talla única ajustable", value: "unica", available: true, stock: 20 },
    ],
    details: [
      { title: "Características", items: ["Hilo encerado", "Dije de sol bañado en oro", "Ajustable"] },
      { title: "Cuidado", items: ["Quitar para nadar", "Secar tras el contacto con agua"] },
      { title: "Envío", items: ["Envío estándar en 2–4 días"] },
      { title: "Devoluciones", items: ["Producto de oferta: solo cambios por defecto"] },
    ],
    rating: 4,
    reviewCount: 41,
    stock: 20,
    sku: "COC-OFE-EST",
    status: "active",
    isNew: false,
    isOnSale: true,
    tags: ["oferta", "verano", "pulsera"],
    createdAt: "2025-06-15T10:00:00.000Z",
  },
];

// ───────────────────────── Pedidos de ejemplo (historial) ───────────────────

export const mockOrders: Order[] = [
  {
    id: "ord_1001",
    userId: "usr_cliente",
    status: "delivered",
    lines: [
      { productId: "prod_lumiere", name: "Collar Lumière", variantLabel: "Oro rosa 18k", unitPrice: 380, quantity: 1 },
    ],
    subtotal: 380,
    total: 380,
    createdAt: "2026-04-02T16:20:00.000Z",
  },
  {
    id: "ord_1002",
    guestEmail: "invitada@example.com",
    status: "paid",
    lines: [
      { productId: "prod_gota", name: "Aretes Gota de Rocío", variantLabel: "Plata 925", unitPrice: 230, quantity: 1 },
      { productId: "prod_estio", name: "Pulsera Estío", variantLabel: "Talla única ajustable", unitPrice: 95, quantity: 2 },
    ],
    subtotal: 420,
    total: 420,
    createdAt: "2026-06-10T12:05:00.000Z",
  },
];

// ──────────────────── Selectores (reemplazables por la API real) ─────────────

export function getAllCategories(): Category[] {
  return [...mockCategories].sort((a, b) => a.order - b.order);
}

export function getCategoryBySlug(slug: string): Category | undefined {
  return mockCategories.find((c) => c.slug === slug);
}

export function getAllProducts(): Product[] {
  return mockProducts.filter((p) => p.status === "active");
}

export function getProductBySlug(slug: string): Product | undefined {
  return mockProducts.find((p) => p.slug === slug);
}

export function getProductById(id: string): Product | undefined {
  return mockProducts.find((p) => p.id === id);
}

export function getProductsByCategory(categoryId: string): Product[] {
  return mockProducts.filter(
    (p) => p.categoryId === categoryId && p.status === "active"
  );
}

export function getNewArrivals(): Product[] {
  return getAllProducts().filter((p) => p.isNew);
}

export function getOnSale(): Product[] {
  return getAllProducts().filter((p) => p.isOnSale);
}

export function getUserByEmail(email: string): User | undefined {
  return mockUsers.find((u) => u.email.toLowerCase() === email.toLowerCase());
}

export function getOrdersByUser(userId: string): Order[] {
  return mockOrders.filter((o) => o.userId === userId);
}
