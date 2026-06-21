# Backend con Supabase — Plan de migración (Fase 6)

Cómo pasar la maqueta (datos en `localStorage`) a un backend real con
**Supabase**: Postgres + Auth (email/password + Google) + Storage + RLS.
Contexto en [CONTEXTO-NEGOCIO.md](./CONTEXTO-NEGOCIO.md) y arquitectura general
en [ARQUITECTURA.md](./ARQUITECTURA.md).

> Stack confirmado: Next.js 16 (App Router), donde el antiguo `middleware` se
> llama ahora **`proxy.ts`** y `cookies()` es **asíncrono**. Usamos
> **`@supabase/ssr`** (el paquete actual; `auth-helpers` está deprecado).

## 1. Estado y objetivo

| Hoy (maqueta) | Con Supabase |
| --- | --- |
| `CatalogContext` (localStorage) | Tablas `categories`, `products`, `product_images`, `product_variants` |
| `AuthContext` (localStorage) | Supabase Auth (sesión por cookies) |
| `ordersStore` (localStorage) | Tablas `orders`, `order_items` |
| Rutas de imagen placeholder | Supabase Storage (`product-images`) |
| Guard de rol solo en cliente | RLS en BD + verificación en Server Actions |

**Principio:** el catálogo pasa a **lectura en el servidor** (Server Components
que consultan Supabase) en lugar del contexto de cliente actual; las escrituras
del admin van por **Server Actions** con verificación de rol y `revalidatePath`.

## 2. Variables de entorno

`.env.local` (no se commitea; ver [`.env.example`](../.env.example)):

```
NEXT_PUBLIC_SUPABASE_URL=https://<ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>   # SOLO servidor, nunca al cliente
```

## 3. Esquema de datos

SQL canónico en [`supabase/migrations/`](../supabase/migrations/). Resumen:

```
profiles(id→auth.users, name, role['customer'|'admin'], created_at)
categories(id, slug∗, name, description, accent, sort_order, featured)
products(id, slug∗, name, description, price, compare_at_price,
         category_id→categories, season, status['active'|'draft'|'archived'],
         stock, sku, rating, review_count, is_new, is_on_sale, details(jsonb),
         tags(text[]), created_at)
product_images(id, product_id→products, url, alt, is_primary, position)
product_variants(id, product_id→products, type['color'|'material'|'talla'],
                 label, value, available, stock)
orders(id, user_id→profiles?, guest_email?, status, subtotal, total, created_at)
order_items(id, order_id→orders, product_id, name, variant_label, unit_price, quantity)
```

- Los **bloques de detalle** (Características/Cuidado/…) van como `jsonb` en
  `products.details` (no aportan relaciones).
- `order_items` guarda **nombre y precio al momento de compra** (snapshot), para
  que el historial no cambie si luego se edita el producto.
- El **carrito** sigue en `localStorage` (suficiente); solo se materializa como
  `order` al pagar.

## 4. Seguridad: roles + RLS

El rol vive en `profiles.role`, sembrado por un trigger al crear el usuario
(default `customer`). Función auxiliar:

```sql
create function public.is_admin() returns boolean
language sql security definer stable set search_path = public as $$
  select exists (select 1 from public.profiles
                 where id = auth.uid() and role = 'admin');
$$;
```

Políticas clave (RLS activado en todas las tablas):

- **categories / products**: lectura pública (productos solo `status='active'`,
  el admin ve todo); escritura solo `is_admin()`.
- **profiles**: cada quien ve/edita el suyo; el admin ve todos.
- **orders / order_items**: el dueño (`user_id = auth.uid()`) o el admin.
- Defensa en profundidad: **además** de RLS, cada Server Action verifica rol
  (los Server Actions son endpoints POST públicos — lo advierte el propio Next).

## 5. Autenticación (email/password + Google)

### Cuentas personales (email + contraseña)
`supabase.auth.signUp()` / `signInWithPassword()`. Reemplaza el `AuthContext`
mock. El trigger crea el `profile` con rol `customer`.

### Google OAuth — pasos
1. Google Cloud Console → crear credenciales OAuth (Client ID + Secret).
2. Supabase → Authentication → Providers → Google → pegar Client ID/Secret.
3. Redirect URI autorizada: `https://<ref>.supabase.co/auth/v1/callback`.
4. En la app: botón que llama
   `supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: <site>/auth/callback } })`.
5. Route Handler `app/auth/callback/route.ts` que canjea el código:
   `supabase.auth.exchangeCodeForSession(code)` y redirige.

Email/password y Google **conviven**: si el correo de Google coincide con uno ya
registrado y verificado, Supabase puede **vincular** ambas identidades (es
configurable; conviene probar el flujo y fijar la política).

## 6. Integración con Next.js 16

- **Clientes** (ya creados como fundación):
  - `app/lib/supabase/client.ts` → navegador (`createBrowserClient`).
  - `app/lib/supabase/server.ts` → servidor (`createServerClient` + `cookies()` async).
  - `app/lib/supabase/proxy-session.ts` → refresco de sesión.
- **`proxy.ts`** (raíz): refresca el token en cada request (sustituye al viejo
  `middleware`). Si no hay variables de entorno, no hace nada (la maqueta sigue
  funcionando hasta conectar Supabase).
- **DAL** (`verifySession`/`requireAdmin`) para centralizar autorización y
  proteger `(admin)` y `(account)`.
- `next.config.ts`: `images.remotePatterns` permite `*.supabase.co` (Storage).

## 7. Pasos de migración (orden sugerido)

- [x] **B.1 — Fundación** (sin credenciales): migraciones SQL, deps
  (`@supabase/ssr`), clientes, `proxy.ts`, `next.config`, `.env.example`.
- [ ] **B.2 — Auth**: callback de Google, Server Actions de login/registro/
  logout con **confirmación por email**, reemplazar `AuthContext` por la sesión
  de Supabase, proteger rutas en `proxy.ts` + DAL.
- [ ] **B.3 — Catálogo (lectura)**: tienda/colección/producto leen de Supabase
  en el servidor (revertir el `CatalogContext` de cliente a server-first).
  Ajustar `CURRENCY`/`formatPrice` a la **moneda local**.
- [ ] **B.4 — Admin (escritura)**: CRUD de categorías/productos por Server
  Actions con `requireAdmin()` + `revalidatePath`.
- [ ] **B.5 — Storage**: subir imágenes reales al bucket; usar `next/image`.
- [ ] **B.6 — Pedidos + pago**: crear `order` + `order_items` al pagar;
  integrar **Mercado Pago** (preference + webhook); historial real.

## 8. Cómo arrancar (cuando tengas el proyecto)

1. Crear proyecto en Supabase y copiar URL + anon key + service role key a
   `.env.local`.
2. Ejecutar las migraciones (SQL Editor del dashboard o `supabase db push` con
   la CLI) — primero `0001_init.sql`, luego `0002_storage.sql`, opcional `seed.sql`.
3. Activar el provider Google (sección 5).
4. Continuar con B.2.

## 9. Decisiones de producto (Plan C)

Decididas:

- **Pagos: Mercado Pago.** Implica en B.6: crear *payment preference* desde el
  servidor, un Route Handler de **webhook** (`app/api/mercadopago/webhook/route.ts`)
  para confirmar el pago, y campos `payment_status` / `payment_id` en `orders`.
  Requiere cuenta de Mercado Pago (Access Token) en `.env.local`.
- **Envío: gratis.** Sin cambios de esquema; `total = subtotal`.
- **Verificación de correo: sí.** Activar "Confirm email" en Supabase Auth. El
  registro mostrará "revisa tu correo" y el alta se completa al confirmar
  (el callback ya gestiona la sesión).
- **Moneda: local** (no USD). Cambia `CURRENCY` y el locale de `formatPrice`.
  Sin impacto relevante en el esquema (`price` sigue `numeric`).

Pendiente de confirmar:

- **¿Qué moneda local exactamente?** (p. ej. ARS, COP, PEN, MXN, CLP…). Define
  el código ISO y el locale para formatear precios.

Notas técnicas abiertas:

- **Inventario**: hoy el stock vive en producto y en variante; decidir cuál
  manda al vender (sugerencia: descontar por variante si existe, si no por
  producto).
