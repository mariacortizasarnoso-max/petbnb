import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Dog, Mail, LogOut, Check } from "lucide-react";
import { toast } from "sonner";

import { Header } from "@/components/Header";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase/client";

export const Route = createFileRoute("/perfil")({ component: Perfil });

type FormValues = { nombre: string; perro: string; notas: string };

function Perfil() {
  const { user, isAnonymous, loading: authLoading } = useAuth();
  const userId = user?.id;

  if (authLoading) return <PerfilSkeleton />;
  if (!userId) return <SinSesion />;

  return <PerfilCargado userId={userId} isAnonymous={isAnonymous} />;
}

function PerfilCargado({ userId, isAnonymous }: { userId: string; isAnonymous: boolean }) {
  const qc = useQueryClient();

  const { data, isPending } = useQuery({
    queryKey: ["perfil", userId],
    queryFn: async () => {
      const [profileRes, dogsRes] = await Promise.all([
        supabase.from("profiles").select("nombre").eq("id", userId).maybeSingle(),
        supabase
          .from("dogs")
          .select("*")
          .eq("owner_id", userId)
          .order("created_at", { ascending: true })
          .limit(1),
      ]);
      if (profileRes.error) throw profileRes.error;
      if (dogsRes.error) throw dogsRes.error;
      return { profile: profileRes.data, dog: dogsRes.data?.[0] ?? null };
    },
  });

  const { register, handleSubmit, formState } = useForm<FormValues>({
    values: {
      nombre: data?.profile?.nombre ?? "",
      perro: data?.dog?.nombre ?? "",
      notas: data?.dog?.notas ?? "",
    },
  });

  async function onSubmit(v: FormValues) {
    const { error: pErr } = await supabase
      .from("profiles")
      .upsert({ id: userId, nombre: v.nombre.trim() || null });

    let dErr = null;
    const perro = v.perro.trim();
    const notas = v.notas.trim() || null;
    if (data?.dog) {
      ({ error: dErr } = await supabase
        .from("dogs")
        .update({ nombre: perro || data.dog.nombre, notas })
        .eq("id", data.dog.id));
    } else if (perro) {
      ({ error: dErr } = await supabase
        .from("dogs")
        .insert({ owner_id: userId, nombre: perro, notas }));
    }

    if (pErr || dErr) {
      toast.error("No se pudo guardar. Inténtalo de nuevo.");
      return;
    }
    toast.success("Perfil guardado 🐾");
    qc.invalidateQueries({ queryKey: ["perfil", userId] });
  }

  return (
    <div className="min-h-screen bg-cream pb-24">
      <Header back title="Tu perfil" />
      <main className="mx-auto max-w-md px-5 pt-2">
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <form onSubmit={handleSubmit(onSubmit)} className="card-soft space-y-4 p-5">
            <div>
              <label htmlFor="nombre" className="text-sm font-bold text-ink">
                Tu nombre
              </label>
              <input
                id="nombre"
                {...register("nombre")}
                placeholder="¿Cómo te llamas?"
                disabled={isPending}
                className="mt-1.5 w-full rounded-2xl border border-border bg-cream/60 p-3 text-[15px] text-ink focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
              />
            </div>

            <div className="border-t border-border pt-4">
              <div className="flex items-center gap-1.5 text-sm font-bold text-ink">
                <Dog className="h-4 w-4 text-brand" /> Tu perro
              </div>
              <input
                id="perro"
                {...register("perro")}
                placeholder="Nombre de tu perro"
                disabled={isPending}
                className="mt-2 w-full rounded-2xl border border-border bg-cream/60 p-3 text-[15px] text-ink focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
              />
              <textarea
                id="notas"
                {...register("notas")}
                placeholder="Algo que debamos saber (carácter, manías, medicación…)"
                rows={3}
                disabled={isPending}
                className="mt-2 w-full resize-none rounded-2xl border border-border bg-cream/60 p-3 text-[15px] text-ink focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
              />
            </div>

            <button
              type="submit"
              disabled={isPending || formState.isSubmitting}
              className="flex w-full items-center justify-center gap-1.5 rounded-full bg-brand py-3.5 text-base font-extrabold text-white transition active:scale-[0.98] disabled:bg-brand/30"
            >
              <Check className="h-4 w-4" /> Guardar
            </button>
          </form>
        </motion.div>

        {isAnonymous ? (
          <GuardarCuenta />
        ) : (
          <p className="mt-4 px-1 text-center text-xs text-ink-soft">
            Tu cuenta está guardada con tu email. ✓
          </p>
        )}

        <CerrarSesion />
      </main>
    </div>
  );
}

function GuardarCuenta() {
  const { linkEmail } = useAuth();
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const valid = /\S+@\S+\.\S+/.test(email);

  async function onLink() {
    setSending(true);
    const { error } = await linkEmail(email.trim());
    setSending(false);
    if (error) {
      toast.error("No se pudo enviar el enlace. Revisa el email.");
      return;
    }
    toast.success("Te hemos enviado un enlace para guardar tu cuenta 📧");
  }

  return (
    <div className="mt-4 rounded-2xl border border-brand/20 bg-brand-soft/40 p-4">
      <div className="flex items-start gap-2.5">
        <Mail className="mt-0.5 h-5 w-5 shrink-0 text-brand" />
        <div className="flex-1">
          <p className="text-sm font-extrabold text-ink">Guarda tu cuenta</p>
          <p className="mt-0.5 text-[13px] leading-snug text-ink-soft">
            Estás usando petbnb sin registrarte. Añade tu email y conservarás tus reservas y treats
            en cualquier dispositivo. Es opcional.
          </p>
          <div className="mt-3 flex gap-2">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              className="min-w-0 flex-1 rounded-full border border-border bg-white p-2.5 px-4 text-sm text-ink focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
            />
            <button
              onClick={onLink}
              disabled={!valid || sending}
              className="shrink-0 rounded-full bg-brand px-4 py-2.5 text-sm font-bold text-white transition active:scale-[0.98] disabled:bg-brand/30"
            >
              {sending ? "Enviando…" : "Guardar"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function CerrarSesion() {
  const { signOut } = useAuth();
  return (
    <button
      onClick={async () => {
        await signOut();
        toast("Sesión cerrada. Se abrirá una nueva al recargar.");
      }}
      className="mt-6 flex w-full items-center justify-center gap-1.5 py-2 text-sm font-bold text-ink-soft"
    >
      <LogOut className="h-4 w-4" /> Cerrar sesión
    </button>
  );
}

function PerfilSkeleton() {
  return (
    <div className="min-h-screen bg-cream">
      <Header back title="Tu perfil" />
      <main className="mx-auto max-w-md px-5 pt-2">
        <div className="card-soft space-y-4 p-5">
          <div className="shimmer h-4 w-24 rounded" />
          <div className="shimmer h-12 w-full rounded-2xl" />
          <div className="shimmer h-12 w-full rounded-2xl" />
          <div className="shimmer h-20 w-full rounded-2xl" />
        </div>
      </main>
    </div>
  );
}

function SinSesion() {
  return (
    <div className="min-h-screen bg-cream">
      <Header back title="Tu perfil" />
      <div className="mx-auto max-w-md px-5 pt-20 text-center">
        <div className="text-5xl">🐾</div>
        <h1 className="mt-4 text-xl font-black text-ink">Aún no hay sesión</h1>
        <p className="mt-2 text-sm text-ink-soft">
          No hemos podido iniciar tu sesión. Recarga la página; mientras, puedes seguir buscando
          paseadores con normalidad.
        </p>
      </div>
    </div>
  );
}
