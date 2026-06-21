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
| `lib/supabase/orders.ts` | Tablas `orders`, `order_items` |
| Rutas de imagen placeholder | Supabase Storage (`product-images`) |
| Guard de rol solo en cliente | RLS en BD + verificación en Server Actions |

**Principio:** el catálogo pasa a **lectura en el servidor** (Server Components
que consultan Supabase) en lugar del contexto de cliente actual; las escrituras
del admin van por **Server Actions** con verificación de rol y `revalidatePath`.

## 2. Variables de entorno

`.env` (no se commitea; ver [`.env.example`](../.env.example)). Supabase usa las
**llaves nuevas**: `publishable` (pública) y `secret` (privada):

```
NEXT_PUBLIC_SUPABASE_URL=https://<ref>.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...   # pública (navegador)
SUPABASE_SECRET_KEY=sb_secret_...                         # SOLO servidor
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

### Redirect URLs y URLs cambiantes (túneles / `trycloudflare`, ngrok, previews)

El botón construye el destino con `${window.location.origin}/auth/callback`, así
que **el dominio desde el que abres la app forma parte del flujo OAuth**. Supabase
solo redirige de vuelta a URLs que estén en su lista blanca; si no coinciden, usa
el *Site URL* como fallback y te quedas **sin sesión** en el dominio actual.

**Dónde se configura** — Supabase Dashboard → Authentication → **URL Configuration**:

- **Site URL**: destino por defecto cuando ninguna redirect coincide. No admite
  comodines. En desarrollo: `http://localhost:3000`.
- **Redirect URLs** (lista blanca, **sí** admite comodines): añade una entrada por
  cada origen desde el que pruebes, terminada en `/auth/callback`.

Los túneles tipo `trycloudflare.com` (modo *quick*) generan una **URL nueva en
cada reinicio**, lo que rompe el login una y otra vez. Para no editar la lista
cada vez, usa un **comodín**:

```
https://*.trycloudflare.com/auth/callback
```

Notas y trampas frecuentes:

- El `*` casa cualquier cadena **sin separadores** (`.` y `/`), así que
  `https://*.trycloudflare.com/...` casa `https://lo-que-sea.trycloudflare.com/...`
  pero **no** un sub-subdominio con otro punto.
- En **Google Cloud Console no se toca nada**: ahí la *Authorized redirect URI*
  es `https://<ref>.supabase.co/auth/v1/callback`, que **no cambia** con el túnel.
- El comodín de un dominio compartido (`*.trycloudflare.com`) es cómodo en
  desarrollo pero **quítalo en producción**; deja solo el dominio real.
- Los errores `WebSocket … _next/webpack-hmr … failed` en consola son el
  hot-reload de Next que no atraviesa el túnel: **no afectan al login**, son ruido.
- Para evitar el baile de URLs del todo: usa un *named tunnel* con dominio fijo,
  o prueba OAuth en `http://localhost:3000` (añádelo también a la lista).

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
- [x] **B.2 — Auth**: `AuthContext` reescrito sobre Supabase (email/password +
  Google), callback `/auth/callback`, confirmación por email, DAL servidor y
  protección de `/cuenta` y `/admin` en `proxy.ts`.
- [x] **B.3 — Catálogo (lectura)**: `CatalogContext` ahora lee de Supabase
  (categorías + productos con imágenes/variantes embebidas). Moneda en **ARS**.
  Nota: se mantuvo client-side (no server-first) para no romper carrito/admin;
  optimizar a SSR/SEO queda como mejora futura.
- [x] **B.4 — Admin (escritura)**: las mutaciones del `CatalogContext` escriben
  en Supabase (insert/update/delete de categorías, productos, imágenes y
  variantes), protegidas por **RLS** (`is_admin()`). _Alternativa futura: mover
  a Server Actions con `requireAdmin()` + `revalidatePath`._
- [x] **B.5 — Storage**: subida de imágenes desde el form del admin
  (`lib/supabase/storage.ts`) y render con `next/image` (`ProductImageFrame`,
  fallback a glifo). Requiere migración `0002_storage.sql` aplicada.
- [~] **B.6 — Pedidos + pago**:
  - [x] Pedidos reales en Supabase (`lib/supabase/orders.ts`); checkout, cuenta
    y dashboard conectados. Invitado vía RLS (`0003_orders.sql`).
  - [~] **Mercado Pago**: scaffolding listo y *gated* por env
    (`/api/checkout` crea la preference, `/api/payments/webhook` marca pagado).
    **Pendiente de activar y probar** con `MP_ACCESS_TOKEN` + `SUPABASE_SECRET_KEY`.

### Activar Mercado Pago (cuando tengas credenciales)
1. En `.env`: `NEXT_PUBLIC_MP_ENABLED=true`, `MP_ACCESS_TOKEN=...`,
   `SUPABASE_SECRET_KEY=sb_secret_...`.
2. En Mercado Pago: configurar la URL de notificaciones (webhook) apuntando a
   `https://TU-DOMINIO/api/payments/webhook`.
3. Flujo: el checkout crea el pedido `pending` → `/api/checkout` genera la
   preference → redirige a MP → al aprobarse, el webhook marca el pedido `paid`.
   (En dev sin dominio público, el webhook no llega; probar con la CLI/ngrok.)
4. Antes de producción: validar la firma del webhook de MP.

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
