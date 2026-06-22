/**
 * Configuración central de la tienda (plantilla reutilizable).
 *
 * Este es el ÚNICO lugar que toca un comprador de la plantilla para
 * personalizarla. Cada valor sale de una variable `NEXT_PUBLIC_*` del `.env`
 * (recomendado, distinto por despliegue) y, si no está definida, usa el valor
 * por defecto de aquí. Así se cambia la marca, la moneda o el destino tras el
 * pago sin navegar entre componentes.
 *
 * IMPORTANTE: para que el navegador reciba estos valores, las variables deben
 * referenciarse de forma estática (`process.env.NEXT_PUBLIC_X`). Next.js las
 * incrusta en el bundle en compilación; NO uses acceso dinámico `process.env[x]`.
 */
export const config = {
  /** Identidad del sitio (marca visible en header, footer, metadata). */
  site: {
    name: process.env.NEXT_PUBLIC_SITE_NAME || "COCOLU",
    tagline: process.env.NEXT_PUBLIC_SITE_TAGLINE || "Joyería de Alta Manufactura",
    description:
      process.env.NEXT_PUBLIC_SITE_DESCRIPTION ||
      "Piezas únicas, talladas a mano. Una experiencia de joyería premium.",
  },

  /** Moneda y formato de precios. Locale tipo `es-AR`, código ISO tipo `ARS`. */
  currency: {
    code: process.env.NEXT_PUBLIC_CURRENCY || "ARS",
    locale: process.env.NEXT_PUBLIC_LOCALE || "es-AR",
  },

  /** Pagos (Mercado Pago). */
  payments: {
    /** `true` activa el cobro real; si no, el checkout es simulado. */
    mpEnabled: process.env.NEXT_PUBLIC_MP_ENABLED === "true",
    /**
     * Rutas a las que Mercado Pago devuelve tras el pago (relativas: se
     * combinan con el origen real de la request, que funciona en local y túnel).
     */
    returnPaths: {
      success: "/tienda",
      pending: "/tienda",
      failure: "/checkout",
    },
  },
};
