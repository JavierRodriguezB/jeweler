import { cache } from "react";
import { createClient } from "./server";
import type { UserRole } from "../types";

/**
 * Data Access Layer: centraliza la verificación de sesión en el servidor
 * (Server Components, Server Actions, Route Handlers). `cache` evita consultas
 * duplicadas dentro del mismo render.
 */
export type ServerSessionUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
};

export const getSessionUser = cache(
  async (): Promise<ServerSessionUser | null> => {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;

    const { data: profile } = await supabase
      .from("profiles")
      .select("name, role")
      .eq("id", user.id)
      .single();

    return {
      id: user.id,
      email: user.email ?? "",
      name: profile?.name ?? "",
      role: (profile?.role as UserRole) ?? "customer",
    };
  }
);

/** Devuelve el usuario si es admin; si no, `null`. Para usar en mutaciones. */
export async function requireAdmin(): Promise<ServerSessionUser | null> {
  const user = await getSessionUser();
  return user && user.role === "admin" ? user : null;
}
