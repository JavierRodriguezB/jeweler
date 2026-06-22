# Cómo levantar el proyecto para probar el pago (Mercado Pago)

Guía paso a paso para arrancar el proyecto en local y probar el flujo de pago de
punta a punta (checkout → Mercado Pago → pedido marcado como **pagado**).

> **Idea clave:** para que el pago se complete de verdad, Mercado Pago tiene que
> poder **llamar a tu webhook** (`/api/payments/webhook`). Tu PC en `localhost` no
> es accesible desde internet, así que necesitas exponer el proyecto con un
> **túnel** (Cloudflare). Por eso el checkout debe hacerse **desde la URL del
> túnel**, no desde `localhost`.

---

## 1. Requisitos previos

- **Node.js** y **npm** instalados.
- **cloudflared** (para el túnel). Descarga: https://developers.cloudflare.com/cloudflare-tunnel/
- Una **cuenta de Mercado Pago** con una aplicación creada en
  [Tus integraciones](https://www.mercadopago.com.ar/developers/panel).

Instala dependencias la primera vez:

```powershell
npm install
```

---

## 2. Variables de entorno (`.env`)

Copia `.env.example` a `.env` (o `.env.local`) y rellena **todas** estas claves.
Las de Supabase y las de Mercado Pago son **obligatorias** para probar pagos:

```env
# Supabase (Dashboard → Project Settings → API Keys)
NEXT_PUBLIC_SUPABASE_URL=https://<ref>.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
SUPABASE_SECRET_KEY=sb_secret_...        # ← lo usa el webhook para marcar el pedido pagado

# Mercado Pago
NEXT_PUBLIC_MP_ENABLED=true              # ← activa el flujo real (sin esto, el pago es "simulado")
MP_ACCESS_TOKEN=TEST-...                 # ← Access Token del VENDEDOR de prueba (ver §5)
```

Notas:

- **`SUPABASE_SECRET_KEY` es imprescindible**: sin ella el webhook no puede
  saltarse RLS y el pedido se queda en `pending` para siempre.
- **`NEXT_PUBLIC_MP_ENABLED=true`**: si falta o es `false`, el checkout no va a
  Mercado Pago — crea el pedido como `paid` directamente (modo maqueta).
- Tras editar `.env`, **reinicia el `npm run dev`** (Next no recarga el `.env` en
  caliente).

---

## 3. Levantar el servidor de desarrollo

```powershell
npm run dev
```

Queda escuchando en `http://localhost:3000`.

---

## 4. Exponer el proyecto con el túnel

En **otra terminal** (deja el `npm run dev` corriendo en la primera):

```powershell
cloudflared tunnel --url http://localhost:3000
```

Te imprime una URL pública del tipo:

```
https://algo-aleatorio.trycloudflare.com
```

- **Usa SIEMPRE esa URL del túnel para probar** (login y pago), no `localhost`.
  Solo así `back_urls` y `notification_url` apuntan a una dirección pública y el
  webhook de MP puede llegar. La app deriva esas URLs del host con el que entras.
- El túnel *quick* genera una **URL nueva cada vez** que lo reinicias. No pasa
  nada para el pago (las URLs se calculan al vuelo), pero **sí** afecta al login
  con Google (ver §6).

---

## 5. Configurar Mercado Pago (cuentas y credenciales de prueba)

El error más común ("el botón **Pagar** no se habilita") es porque **intentas
pagarte a ti mismo**. MP bloquea el pago cuando el comprador es la misma cuenta
que el vendedor. Para evitarlo, usa **dos usuarios de prueba**:

1. En el panel de MP → tu aplicación → **Cuentas de prueba** → crea dos:
   - **Vendedor** → copia **su** Access Token (`TEST-...`) a `MP_ACCESS_TOKEN`.
   - **Comprador** → con este pagarás.
2. En el proveedor Google/Supabase no hay que tocar nada para el pago.

Las `back_urls` y la `notification_url` **no se configuran a mano**: el código las
arma a partir de la URL del túnel
([app/api/checkout/route.ts](../app/api/checkout/route.ts)):

- éxito / pendiente → `<túnel>/cuenta`
- fallo → `<túnel>/checkout`
- webhook → `<túnel>/api/payments/webhook`

---

## 6. (Opcional) Login con Google a través del túnel

Si vas a iniciar sesión con Google durante la prueba, en **Supabase → Auth → URL
Configuration → Redirect URLs** debe estar el comodín (una sola vez):

```
https://*.trycloudflare.com/auth/callback
```

Detalle completo en [BACKEND-SUPABASE.md](./BACKEND-SUPABASE.md) (§5). Para el
**pago** no es necesario: puedes comprar como **invitado**.

---

## 7. Probar el pago (paso a paso)

1. Abre **la URL del túnel** en el navegador (no `localhost`).
2. Añade un producto a la bolsa y ve a **Finalizar compra** (`/checkout`).
3. En **"Tus datos"**, elige **Continuar como invitado** y usa el **email del
   usuario COMPRADOR** de prueba (nunca el de tu cuenta de MP vendedora).
4. Completa envío y pulsa **Confirmar pedido** → te redirige a Mercado Pago.
5. En Mercado Pago:
   - Si aparece una sesión con tu cuenta real, **cierra sesión** y entra/paga como
     el **comprador de prueba** (o como invitado).
   - Elige **tarjeta de prueba** y escribe el **CVV**. Ejemplos (Argentina):

     | Tarjeta            | Número                | CVV  | Vto.  |
     |--------------------|-----------------------|------|-------|
     | Mastercard         | 5031 7557 3453 0604   | 123  | 11/30 |
     | Visa               | 4509 9535 6623 3704   | 123  | 11/30 |
     | Mastercard Débito  | 5287 3383 1025 3304   | 123  | 11/30 |

   - Para forzar el **resultado**, usa el nombre del titular: `APRO` = aprobado,
     `OTHE` = rechazado.
6. El botón **Pagar** se habilita al completar el CVV. Paga.
7. MP te devuelve a `<túnel>/cuenta` y, en paralelo, llama al webhook.

---

## 8. Verificar que el pedido quedó **pagado**

- El webhook ([app/api/payments/webhook/route.ts](../app/api/payments/webhook/route.ts))
  consulta el pago en MP y, si está `approved`, actualiza el pedido a
  `status = 'paid'` y guarda `payment_id`.
- Compruébalo en **Supabase → Table editor → `orders`**: la fila (por
  `external_reference` = id del pedido) debe pasar de `pending` a `paid`.
- En la terminal del túnel verás el `POST /api/payments/webhook` entrante.

---

## 9. Solución de problemas

| Síntoma | Causa probable | Arreglo |
|---|---|---|
| **"Pagar" sigue gris** con CVV correcto | Intentas **pagarte a ti mismo** (comprador = vendedor) | Usa el **email del comprador** de prueba y paga como comprador (§5, §7). |
| El checkout no va a MP, el pedido sale "paid" al instante | `NEXT_PUBLIC_MP_ENABLED` no es `true` | Ponlo en `.env` y reinicia `npm run dev`. |
| Pagas, pero el pedido se queda en **pending** | El webhook no llegó | Estás probando desde `localhost` (no público), o falta `SUPABASE_SECRET_KEY`, o reiniciaste el túnel a media compra. Prueba desde la **URL del túnel** con todo configurado. |
| Login con Google "no hace nada" | Falta el comodín de Redirect URLs | Añádelo en Supabase (§6). |
| Errores `web-socket … webpack-hmr … failed` en consola | El hot-reload de Next no cruza el túnel | **Ruido inofensivo**, ignóralo. Para ver cambios de código, recarga con `Ctrl+Shift+R`. |

---

### Resumen de arranque rápido

```powershell
# Terminal 1
npm run dev

# Terminal 2
cloudflared tunnel --url http://localhost:3000
# → abre la URL https://*.trycloudflare.com que imprime y prueba ahí
```

Requisitos en `.env`: `NEXT_PUBLIC_MP_ENABLED=true`, `MP_ACCESS_TOKEN` (vendedor
de prueba), `SUPABASE_SECRET_KEY`, y las dos claves públicas de Supabase.
Paga con un **comprador de prueba** distinto del vendedor.
