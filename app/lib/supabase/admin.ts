import { createClient } from "@supabase/supabase-js";

/**
 * Cliente con la *service role* (secret key) para operaciones del servidor que
 * deben omitir RLS (p. ej. el webhook de pagos marcando un pedido como pagado).
 * Devuelve `null` si no está configurada la secret key.
 *
 * ⚠️ Usar SOLO en el servidor (Route Handlers / Server Actions). Nunca en el cliente.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const secret = process.env.SUPABASE_SECRET_KEY;
  if (!url || !secret) return null;

  return createClient(url, secret, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
