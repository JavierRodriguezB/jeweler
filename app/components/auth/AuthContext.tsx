"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { User } from "../../lib/types";
import { demoCredentials, getUserByEmail } from "../../lib/mock-data";

const SESSION_KEY = "cocolu-session";
const USERS_KEY = "cocolu-users";

/** Datos de sesión (sin contraseña). */
export type SessionUser = Pick<User, "id" | "name" | "email" | "role">;

/** Usuario registrado en la maqueta (contraseña en claro: SOLO demo). */
type StoredUser = SessionUser & { password: string };

export type AuthResult = { ok: true } | { ok: false; error: string };

type AuthContextValue = {
  user: SessionUser | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  /** true cuando ya se leyó la sesión de localStorage (evita parpadeos). */
  hydrated: boolean;
  login: (email: string, password: string) => AuthResult;
  register: (data: {
    name: string;
    email: string;
    password: string;
  }) => AuthResult;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function readStoredUsers(): StoredUser[] {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    return raw ? (JSON.parse(raw) as StoredUser[]) : [];
  } catch {
    return [];
  }
}

function writeStoredUsers(users: StoredUser[]): void {
  try {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  } catch {
    /* almacenamiento no disponible */
  }
}

function toSession(u: SessionUser): SessionUser {
  return { id: u.id, name: u.name, email: u.email, role: u.role };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(SESSION_KEY);
      if (raw) setUser(JSON.parse(raw) as SessionUser);
    } catch {
      /* almacenamiento no disponible */
    }
    setHydrated(true);
  }, []);

  const persist = useCallback((session: SessionUser | null) => {
    setUser(session);
    try {
      if (session) localStorage.setItem(SESSION_KEY, JSON.stringify(session));
      else localStorage.removeItem(SESSION_KEY);
    } catch {
      /* almacenamiento no disponible */
    }
  }, []);

  const login = useCallback(
    (email: string, password: string): AuthResult => {
      const e = email.trim().toLowerCase();

      // 1) Credenciales de demo (usuarios sembrados en el mock).
      const demo = demoCredentials.find(
        (d) => d.email === e && d.password === password
      );
      if (demo) {
        const u = getUserByEmail(e);
        if (u) {
          persist(toSession(u));
          return { ok: true };
        }
      }

      // 2) Usuarios registrados en esta sesión del navegador.
      const stored = readStoredUsers().find(
        (u) => u.email.toLowerCase() === e && u.password === password
      );
      if (stored) {
        persist(toSession(stored));
        return { ok: true };
      }

      return { ok: false, error: "Correo o contraseña incorrectos." };
    },
    [persist]
  );

  const register = useCallback(
    (data: { name: string; email: string; password: string }): AuthResult => {
      const name = data.name.trim();
      const e = data.email.trim().toLowerCase();

      if (!name) return { ok: false, error: "Ingresa tu nombre." };
      if (!/.+@.+\..+/.test(e))
        return { ok: false, error: "Ingresa un correo válido." };
      if (data.password.length < 6)
        return {
          ok: false,
          error: "La contraseña debe tener al menos 6 caracteres.",
        };

      const exists =
        Boolean(getUserByEmail(e)) ||
        readStoredUsers().some((u) => u.email.toLowerCase() === e);
      if (exists)
        return { ok: false, error: "Ese correo ya está registrado." };

      const newUser: StoredUser = {
        id: `usr_${Date.now()}`,
        name,
        email: e,
        role: "customer",
        password: data.password,
      };
      const users = readStoredUsers();
      users.push(newUser);
      writeStoredUsers(users);

      persist(toSession(newUser));
      return { ok: true };
    },
    [persist]
  );

  const logout = useCallback(() => persist(null), [persist]);

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
