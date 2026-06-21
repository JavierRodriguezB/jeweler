# Arquitectura y modelo de negocio — COCOLU

Maqueta de e-commerce reutilizable sobre **Next.js 16 (App Router) + React 19 +
Tailwind v4**, con **GSAP + Lenis** para la experiencia premium. El contexto de
negocio está en [`CONTEXTO-NEGOCIO.md`](./CONTEXTO-NEGOCIO.md).

## 1. Principio rector

> **El dato se desacopla de la UI.** Hoy todo sale de `app/lib/mock-data.ts`
> mediante *selectores* (`getAllProducts`, `getProductBySlug`, …). El día que
> haya backend, solo cambian esos selectores (a `fetch`/DB). Las páginas y
> componentes no se tocan.

```
UI (páginas/componentes)  →  Selectores (app/lib)  →  Mock | API | DB
        estable                  capa de contrato         intercambiable
```

## 2. Roles y permisos

| Acción                              | guest | customer | admin |
| ----------------------------------- | :---: | :------: | :---: |
| Ver landing, categorías y productos |  ✅   |    ✅    |  ✅   |
| Agregar al carrito                  |  ✅   |    ✅    |  ✅   |
| Pagar como invitado                 |  ✅   |    —     |  —    |
| Pagar con cuenta / ver historial    |  —    |    ✅    |  ✅   |
| Gestionar categorías y secciones    |  —    |    —     |  ✅   |
| Cargar / editar productos           |  —    |    —     |  ✅   |

La autorización se valida **en el servidor** (Server Actions / Route Handlers),
nunca solo en la UI. Una Server Action es accesible por POST directo, así que
**cada mutación verifica sesión y rol** antes de ejecutar.

## 3. Modelo de datos

Definido en [`app/lib/types.ts`](../app/lib/types.ts).

```
User ──< Order ──< OrderLine >── Product
                                    │
Category ──< Product ──< ProductImage      (1 producto → N imágenes)
                   └──< ProductVariant      (material / talla / color)
Cart ──< CartItem >── Product (+ variant)
```

- **Category**: portada para la grilla "comprar por categoría".
- **Product**: galería de **varias imágenes**, variantes, precio (+ precio
  anterior), valoración, stock, SKU, temporada e insignias.
- **Season**: temporada de la pieza (`primavera`…`invierno`) o `atemporal`.
- **Cart / CartItem**: carrito por `productId` + `variantId`.
- **Order / OrderLine**: pedido de usuario (`userId`) o invitado (`guestEmail`).

## 4. Mapa de rutas (App Router + route groups)

Los **route groups** `(grupo)` organizan sin afectar la URL y permiten layouts
distintos (escaparate premium vs. panel admin sobrio).

```
app/
├─ layout.tsx                 # raíz: fuentes, SmoothScroll
├─ page.tsx                   # / (landing actual)
│
├─ (shop)/                    # escaparate — layout premium con nav + carrito
│  ├─ tienda/page.tsx         # /tienda          catálogo completo + filtros
│  ├─ coleccion/[slug]/page.tsx   # /coleccion/anillos   productos de categoría
│  ├─ producto/[slug]/page.tsx    # /producto/anillo-aurora  ficha (galería)
│  └─ carrito/page.tsx        # /carrito
│
├─ (checkout)/
│  └─ checkout/page.tsx       # /checkout  → valida registrado vs invitado
│
├─ (auth)/
│  ├─ login/page.tsx          # /login
│  └─ registro/page.tsx       # /registro
│
├─ (account)/                 # requiere sesión (customer/admin)
│  └─ cuenta/page.tsx         # /cuenta  perfil + historial de pedidos
│
├─ (admin)/                   # requiere rol admin — layout propio
│  └─ admin/
│     ├─ page.tsx             # /admin  dashboard
│     ├─ categorias/page.tsx  # CRUD de categorías y secciones
│     └─ productos/page.tsx   # alta/edición de productos (imágenes, variantes)
│
├─ components/                # UI compartida (ya existe)
└─ lib/                       # types, mock-data, selectores, (futuro) actions
```

Notas de Next.js 16:
- En páginas dinámicas, `params` es **asíncrono**: `const { slug } = await params`.
- Mutaciones con **Server Actions** (`'use server'`) + `revalidatePath`/`redirect`.
- Rutas privadas (`_carpeta`) para colocar utilidades no enrutables.

## 5. Flujos clave

### 5.1 Comprar por categoría → ficha → carrito
1. `/tienda` o home: grilla de categorías (tarjeta con foto de portada).
2. `/coleccion/[slug]`: grilla de productos de esa categoría.
3. `/producto/[slug]`: **galería con miniaturas** (varias imágenes), selección
   de variante (material/talla), valoración, bloques colapsables (características,
   cuidado, envío, devoluciones) y "Agregar a la bolsa".
4. Carrito persistente (mientras no haya backend: `localStorage` + contexto).

### 5.2 Checkout con validación de cuenta
```
Pagar
 ├─ ¿hay sesión?
 │   ├─ Sí → continuar al pago (datos precargados)
 │   └─ No → elegir:
 │           ├─ Iniciar sesión / registrarse
 │           └─ Continuar como invitado (pide email → guestEmail)
 └─ Crear Order (userId | guestEmail) → confirmación
```

### 5.3 Gestión (admin)
- CRUD de **categorías** y creación de **secciones/colecciones**.
- Alta/edición de **productos**: subir **varias imágenes**, definir variantes,
  precio, temporada, stock y estado (`draft`/`active`/`archived`).

## 6. Experiencia premium (no negociable)

- Galería de producto con transición suave entre imágenes y zoom sutil.
- Animaciones de entrada por scroll (GSAP + ScrollTrigger, ya en uso).
- Microinteracciones en botones, swatches de variante y añadir al carrito.
- Respetar `prefers-reduced-motion`. Imágenes con `next/image`.
- Coherencia con la paleta (marfil/rosa/oro) y tipografías ya definidas.

## 7. Hoja de ruta por fases

- [x] **Fase 0 — Fundación**: modelo de datos (`types.ts`), datos de prueba
  (`mock-data.ts`), documentación (este archivo + contexto).
- [x] **Fase 1 — Catálogo**: `/tienda`, `/coleccion/[slug]`, tarjetas de
  categoría y producto, filtros por temporada.
- [x] **Fase 2 — Ficha de producto**: galería multi-imagen + variantes +
  bloques de detalle (según maqueta de referencia).
- [x] **Fase 3 — Carrito**: contexto (`CartProvider`) + persistencia en
  `localStorage` + drawer lateral + contador en el header.
- [x] **Fase 4 — Auth y checkout**: `AuthProvider` (sesión en `localStorage`),
  `/login` y `/registro`, `/cuenta` protegida con historial, `/checkout` con
  validación invitado vs registrado y creación de pedido (`Order` persistido).
- [x] **Fase 5 — Panel admin**: `CatalogProvider` como fuente de datos del
  cliente (seed del mock + `localStorage`); `/admin` protegido por rol con CRUD
  de categorías y productos (imágenes múltiples + variantes). Los cambios se
  reflejan en la tienda y el carrito en vivo.
- [ ] **Fase 6 — Backend real**: sustituir selectores/contextos por API/DB y
  persistencia de sesión (cookies + middleware).

## 8. Cómo conectar un backend después

1. Mantener las **firmas** de los selectores en `app/lib`.
2. Reemplazar su cuerpo por `fetch`/consulta a DB (los componentes no cambian).
3. Mover las mutaciones a **Server Actions** con verificación de rol.
4. Sustituir las credenciales demo por un proveedor de auth real
   (sesión por cookie + middleware/`proxy.ts` para proteger `(admin)`/`(account)`).
