import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";

import { supabase } from "@/lib/supabase/client";

// Auth ligera del dueño (EPIC 2 · U3). Regla de demo: el login NUNCA bloquea
// el flujo de búsqueda. Al cargar la app se abre una sesión ANÓNIMA silenciosa;
// las reservas/treats/chat se asocian a ese usuario. Al "guardar la cuenta" se
// vincula un email (magic link) conservando el mismo user_id y sus datos.

type AuthState = {
  session: Session | null;
  user: User | null;
  isAnonymous: boolean;
  loading: boolean;
  // Vincula un email a la sesión anónima (envía enlace de confirmación).
  linkEmail: (email: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    // Carga la sesión persistida; si no hay, abre una anónima (sin pantalla de login).
    supabase.auth.getSession().then(async ({ data }) => {
      if (!active) return;
      if (data.session) {
        // Valida la sesión contra el servidor: si el usuario ya no existe
        // (p. ej. fue borrado), getUser falla → la descartamos y abrimos una
        // nueva. Evita quedarse atascado con un token huérfano (no se puede
        // reservar ni chatear hasta que caduca).
        const { error: userErr } = await supabase.auth.getUser();
        if (!active) return;
        if (!userErr) {
          setSession(data.session);
          setLoading(false);
          return;
        }
        await supabase.auth.signOut();
      }
      const { data: anon, error } = await supabase.auth.signInAnonymously();
      if (!active) return;
      if (error) {
        // Si las sesiones anónimas no están habilitadas en Supabase, no rompemos:
        // la búsqueda sigue funcionando (los paseadores son lectura pública).
        console.warn("petbnb: no se pudo crear sesión anónima —", error.message);
      }
      setSession(anon?.session ?? null);
      setLoading(false);
    });

    // Mantiene el estado al día (vincular email, signOut, refresh de token…).
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
    });

    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const value: AuthState = {
    session,
    user: session?.user ?? null,
    isAnonymous: session?.user?.is_anonymous ?? false,
    loading,
    async linkEmail(email) {
      const { error } = await supabase.auth.updateUser({ email });
      return { error: error?.message ?? null };
    },
    async signOut() {
      await supabase.auth.signOut();
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de <AuthProvider>");
  return ctx;
}
