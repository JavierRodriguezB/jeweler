import type { NextRequest } from "next/server";
import { updateSession } from "./app/lib/supabase/proxy-session";

/**
 * En Next 16 el antiguo `middleware` se llama `proxy`. Aquí refrescamos la
 * sesión de Supabase en cada request.
 */
export async function proxy(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: [
    // Todas las rutas excepto estáticos, imágenes y favicon.
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
