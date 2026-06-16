export type TreatEnviado = {
  id: string;
  treatId: string;
  treatNombre: string;
  emoji: string;
  precio: number;
  walkerId: string;
  walkerNombre: string;
  fechaISO: string;
  fechaLabel: string;
  estado: "entregado" | "recibido";
  fotoConfirmacion?: string;
  mensajeCuidador?: string;
  perro?: string;
};

export type TreatRecibido = {
  id: string;
  emoji: string;
  nombre: string;
  descripcion: string;
  deNombre: string;
  fechaLabel: string;
};

const ENVIADOS: TreatEnviado[] = [
  {
    id: "te-001",
    treatId: "pack",
    treatNombre: "Pack de premios",
    emoji: "🍖",
    precio: 3,
    walkerId: "ana",
    walkerNombre: "Ana Méndez",
    fechaISO: new Date(Date.now() - 86_400_000 * 4).toISOString(),
    fechaLabel: "Hace 4 días",
    estado: "recibido",
    fotoConfirmacion:
      "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&w=900&q=70",
    mensajeCuidador: "¡Gracias! A Nala le han encantado, los he guardado para mañana 🦴",
    perro: "Nala",
  },
  {
    id: "te-002",
    treatId: "hueso",
    treatNombre: "Hueso gigante",
    emoji: "🦴",
    precio: 12,
    walkerId: "carlos",
    walkerNombre: "Carlos Vidal",
    fechaISO: new Date(Date.now() - 86_400_000 * 12).toISOString(),
    fechaLabel: "Hace 12 días",
    estado: "recibido",
    fotoConfirmacion:
      "https://images.unsplash.com/photo-1450778869180-41d0601e046e?auto=format&fit=crop&w=900&q=70",
    mensajeCuidador: "¡Mil gracias! Toby ha estado entretenido toda la tarde 📸",
    perro: "Toby",
  },
];

const RECIBIDOS: TreatRecibido[] = [
  {
    id: "tr-001",
    emoji: "🎁",
    nombre: "Bienvenida a petbnb",
    descripcion: "Un detalle del equipo para empezar con buena pata.",
    deNombre: "Equipo petbnb",
    fechaLabel: "Al darte de alta",
  },
];

type Listener = () => void;
const listeners = new Set<Listener>();
function emit() { listeners.forEach((l) => l()); }
export function subscribeTreats(l: Listener) { listeners.add(l); return () => listeners.delete(l); }

export function getEnviados(): TreatEnviado[] {
  return [...ENVIADOS].sort((a, b) => b.fechaISO.localeCompare(a.fechaISO));
}
export function getRecibidos(): TreatRecibido[] {
  return [...RECIBIDOS];
}

export function totales() {
  return {
    enviados: ENVIADOS.length,
    recibidos: RECIBIDOS.length,
    importeEnviado: ENVIADOS.reduce((s, t) => s + t.precio, 0),
  };
}

export function addTreatEnviado(t: Omit<TreatEnviado, "id" | "fechaISO" | "fechaLabel" | "estado">): TreatEnviado {
  const id = "te-" + Math.random().toString(36).slice(2, 8);
  const nuevo: TreatEnviado = {
    ...t,
    id,
    fechaISO: new Date().toISOString(),
    fechaLabel: "Justo ahora",
    estado: "entregado",
  };
  ENVIADOS.unshift(nuevo);
  emit();
  return nuevo;
}

export function marcarRecibido(id: string, foto: string, mensaje: string) {
  const idx = ENVIADOS.findIndex((t) => t.id === id);
  if (idx >= 0) {
    ENVIADOS[idx] = { ...ENVIADOS[idx], estado: "recibido", fotoConfirmacion: foto, mensajeCuidador: mensaje };
    emit();
  }
}

// Fotos para confirmaciones de cuidadores
export const FOTOS_CONFIRMACION = [
  "https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&w=900&q=70",
  "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&w=900&q=70",
  "https://images.unsplash.com/photo-1450778869180-41d0601e046e?auto=format&fit=crop&w=900&q=70",
  "https://images.unsplash.com/photo-1517423440428-a5a00ad493e8?auto=format&fit=crop&w=900&q=70",
  "https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=900&q=70",
];

export function fotoAleatoria(): string {
  return FOTOS_CONFIRMACION[Math.floor(Math.random() * FOTOS_CONFIRMACION.length)];
}

export function mensajeAgradecimiento(walkerFirst: string, treatNombre: string, perro?: string): string {
  const p = perro && perro !== "tu peludo" ? perro : "tu peludo";
  const variantes = [
    `¡Mil gracias por ${treatNombre.toLowerCase()}! 🦴 ${p} lo ha disfrutado un montón, te dejo foto 📸`,
    `¡Qué detallazo! ${p} ha alucinado con ${treatNombre.toLowerCase()}. Mira qué cara 😍`,
    `Gracias de corazón. ${p} y yo te mandamos un besito 💚 Aquí la prueba del delito 📸`,
  ];
  return variantes[Math.floor(Math.random() * variantes.length)];
}
