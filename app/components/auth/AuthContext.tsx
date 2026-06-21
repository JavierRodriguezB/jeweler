"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { createClient } from "../../lib/supabase/client";
import type { UserRole } from "../../lib/types";

/** Datos de sesión que usa la UI. */
export type SessionUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
};

export type AuthResult =
  | { ok: true; needsConfirmation?: boolean }
  | { ok: false; error: string };

type AuthContextValue = {
  user: SessionUser | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  /** true cuando ya se resolvió el estado de sesión inicial. */
  hydrated: boolean;
  login: (email: string, password: string) => Promise<AuthResult>;
  register: (data: {
    name: string;
    email: string;
    password: string;
  }) => Promise<AuthResult>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

/** Traduce los mensajes de error de Supabase a español. */
function translateError(message: string): string {
  const m = message.toLowerCase();
  if (m.includes("invalid login")) return "Correo o contraseña incorrectos.";
  if (m.includes("email not confirmed"))
    return "Confirma tu correo antes de entrar.";
  if (m.includes("already registered") || m.includes("already been registered"))
    return "Ese correo ya está registrado.";
  if (m.includes("password")) return "La contraseña no cumple los requisitos.";
  return message;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [supabase] = useState(() => createClient());
  const [user, setUser] = useState<SessionUser | null>(null);
  const [hydrated, setHydrated] = useState(false);

  // Carga nombre + rol desde la tabla `profiles`.
  const loadProfile = useCallback(
    async (authUser: { id: string; email?: string; user_metadata?: Record<string, unknown> }) => {
      const { data: profile } = await supabase
        .from("profiles")
        .select("name, role")
        .eq("id", authUser.id)
        .single();

      setUser({
        id: authUser.id,
        email: authUser.email ?? "",
        name:
          profile?.name ??
          (authUser.user_metadata?.name as string | undefined) ??
          authUser.email?.split("@")[0] ??
          "",
        role: (profile?.role as UserRole) ?? "customer",
      });
    },
    [supabase]
  );

  useEffect(() => {
    // onAuthStateChange emite INITIAL_SESSION al suscribirse, así que cubre la
    // hidratación inicial y los cambios posteriores (login/logout/refresh).
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      // Diferir consultas a Supabase fuera del callback (evita bloqueos).
      if (session?.user) {
        const authUser = session.user;
        setTimeout(() => loadProfile(authUser), 0);
      } else {
        setUser(null);
      }
      setHydrated(true);
    });

    return () => subscription.unsubscribe();
  }, [supabase, loadProfile]);

  const login = useCallback(
    async (email: string, password: string): Promise<AuthResult> => {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });
      if (error) return { ok: false, error: translateError(error.message) };
      return { ok: true };
    },
    [supabase]
  );

  const register = useCallback(
    async (data: {
      name: string;
      email: string;
      password: string;
    }): Promise<AuthResult> => {
      const name = data.name.trim();
      const email = data.email.trim().toLowerCase();
      if (!name) return { ok: false, error: "Ingresa tu nombre." };
      if (!/.+@.+\..+/.test(email))
        return { ok: false, error: "Ingresa un correo válido." };
      if (data.password.length < 6)
        return {
          ok: false,
          error: "La contraseña debe tener al menos 6 caracteres.",
        };

      const { data: result, error } = await supabase.auth.signUp({
        email,
        password: data.password,
        options: {
          data: { name },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) return { ok: false, error: translateError(error.message) };

      // Si hay confirmación por correo activada, no hay sesión todavía.
      return { ok: true, needsConfirmation: !result.session };
    },
    [supabase]
  );

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
  }, [supabase]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      isAdmin: user?.role === "admin",
      hydrated,
      login,
      register,
      logout,
    }),
    [user, hydrated, login, register, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de <AuthProvider>");
  return ctx;
}
