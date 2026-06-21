# Contexto de negocio — COCOLU

> Documento de contexto para retomar el proyecto en cualquier momento.
> Si lees esto como asistente: aquí está el "por qué" del negocio. La
> arquitectura técnica vive en [`ARQUITECTURA.md`](./ARQUITECTURA.md).

## Qué es

**COCOLU** es una marca de **joyería de alta manufactura**. Diseña y fabrica
sus propias piezas (fabricación propia, sin intermediarios) y ofrece
**personalización real**: grabado láser, resina y moissanita. La comunidad es
parte central de la marca (+178K seguidores).

Paleta y tono ya definidos en el código: marfil, rosa y oro; tipografías
Playfair Display (display) + Inter (texto); todo en **español**; estética
**premium**, elegante y artesanal.

## El proyecto

Es una **maqueta de e-commerce reutilizable** (una plantilla para empresas).
Aunque el caso base es una joyería, el modelo es genérico: una tienda con
**productos que rotan por temporada** (invierno/verano/etc.), igual que el
negocio de la ropa. La misma estructura debe servir para reusar en otros
rubros cambiando contenido y datos.

### Lo que debe poder hacer

1. **Landing / escaparate**
   - Información del local (historia, valores, ubicación, contacto).
   - Ver **categorías** (grilla "comprar por categoría", con foto de portada).
   - Ver **productos** por categoría y la **ficha individual** de cada producto
     (con **varias imágenes**, variantes, precio, valoración y bloques de
     detalle: características, cuidado, envío, devoluciones).

2. **Compra (cliente)**
   - Agregar productos al **carrito**.
   - Al **pagar**, validar si el usuario está **registrado o no** (permitir
     checkout como invitado o pedir registro/login).

3. **Cuentas y roles**
   - **Cliente** (`customer`): compra, ve su historial de pedidos, gestiona su
     cuenta.
   - **Administrador** (`admin`, encargado de la tienda): gestiona
     **categorías**, crea **secciones/colecciones nuevas** y **carga productos**
     (con sus imágenes y variantes).
   - **Invitado** (`guest`): visitante sin sesión; puede navegar y armar
     carrito.

## Conceptos del dominio (joyería)

- **Temporada / estación**: las piezas rotan por temporada (primavera, verano,
  otoño, invierno) y hay un catálogo **atemporal** (clásicos permanentes, p. ej.
  novias/alianzas).
- **Categorías** del caso base: Novias, Anillos, Collares, Aretes, Ofertas.
- **Variantes** típicas: material (oro blanco/rosa/amarillo, plata 925),
  talla (de anillo), color.
- **Producto**: tiene **múltiples imágenes**, precio (y precio anterior si está
  en oferta), valoración, stock, SKU, etiquetas e insignias ("Novedad",
  "Oferta").

## Prioridad de producto

**Experiencia premium** por encima de todo: microinteracciones cuidadas,
animaciones suaves (ya se usa GSAP + Lenis), tipografía y espaciado generosos,
y una galería de producto a la altura de una marca de lujo.

## Estado actual

Maqueta funcional de punta a punta (datos en `localStorage`, sin backend aún):

- Landing + escaparate: `/tienda`, `/coleccion/[slug]`, ficha `/producto/[slug]`
  con galería multi-imagen.
- Carrito (drawer + persistencia), auth (login/registro/cuenta), checkout con
  validación registrado/invitado, y **panel admin** (`/admin`) con CRUD de
  categorías y productos.
- **En curso**: backend con Supabase. Fundación lista (esquema, RLS, clientes,
  `proxy.ts`). Ver plan en `BACKEND-SUPABASE.md` y fases en `ARQUITECTURA.md`.

## Decisiones de backend / negocio

- **Base de datos + auth + storage**: Supabase.
- **Autenticación**: cuentas propias (email/contraseña) **y** Google.
- **Verificación de correo**: sí (confirmar email al registrarse).
- **Pagos**: Mercado Pago.
- **Moneda**: peso argentino (**ARS**); formato `es-AR` en `app/lib/format.ts`.
- **Envíos**: gratis (por ahora).

## Datos de prueba (mock)

Usuarios de demo definidos en `app/lib/mock-data.ts`:

| Rol      | Email                | Contraseña (demo) |
| -------- | -------------------- | ----------------- |
| admin    | `admin@cocolu.com`   | `cocolu-admin`    |
| customer | `cliente@cocolu.com` | `cocolu-cliente`  |

> Las credenciales son solo para la maqueta. No usar en producción.
