export type EstadoReserva = "confirmada" | "en_curso" | "completada" | "cancelada";
export type TipoReserva = "paseo" | "estancia";

export type Reserva = {
  id: string;
  walkerId: string;
  tipo: TipoReserva;
  perro: string;
  fechaLabel: string;
  fechaCorta: string;
  hora?: string;
  duracion?: number;
  noches?: number;
  estado: EstadoReserva;
  nota?: string;
  treatEnviado?: boolean;
  valoracion?: number;
  cancelTexto?: string;
  precioTreats?: number;
  recogida?: string;
  inicioISO?: string; // para "en curso"
};

export const RESERVAS: Reserva[] = [
  {
    id: "r-001",
    walkerId: "ana",
    tipo: "paseo",
    perro: "Nala",
    fechaLabel: "Hoy · 18:30",
    fechaCorta: "Hoy 18:30",
    hora: "18:30",
    duracion: 45,
    estado: "en_curso",
    nota: "Ana ha salido con Nala hace 10 min. Te avisará con foto a mitad del paseo.",
    recogida: "Tu portal · Chamberí",
    precioTreats: 1,
    inicioISO: new Date(Date.now() - 10 * 60_000).toISOString(),
  },
  {
    id: "r-002",
    walkerId: "lucia",
    tipo: "paseo",
    perro: "Nala",
    fechaLabel: "Mañana · 10:00",
    fechaCorta: "Mañana 10:00",
    hora: "10:00",
    duracion: 45,
    estado: "confirmada",
    nota: "Lucía recogerá a Nala en el portal. Si llueve mucho, te escribirá para reorganizar.",
    recogida: "Tu portal · Malasaña",
    precioTreats: 1,
  },
  {
    id: "r-003",
    walkerId: "carlos",
    tipo: "estancia",
    perro: "Toby",
    fechaLabel: "22 – 25 jun · 3 noches",
    fechaCorta: "22–25 jun",
    noches: 3,
    estado: "confirmada",
    nota: "Carlos tendrá la casa lista para Toby. Acuérdate de llevar su pienso y su mantita.",
    recogida: "Casa de Carlos · Arganzuela",
    precioTreats: 69,
  },
  {
    id: "r-101",
    walkerId: "ana",
    tipo: "paseo",
    perro: "Nala",
    fechaLabel: "12 jun · 18:30",
    fechaCorta: "12 jun",
    hora: "18:30",
    duracion: 45,
    estado: "completada",
    nota: "Nala volvió feliz y agotada. ¡Un encanto de perra!",
    valoracion: 5,
    treatEnviado: true,
    precioTreats: 1,
  },
  {
    id: "r-102",
    walkerId: "carlos",
    tipo: "estancia",
    perro: "Toby",
    fechaLabel: "1 – 3 jun · 2 noches",
    fechaCorta: "1–3 jun",
    noches: 2,
    estado: "completada",
    nota: "Toby se portó genial, durmió como un lirón y se hizo amigo de Coco enseguida.",
    precioTreats: 46,
  },
  {
    id: "r-103",
    walkerId: "diego",
    tipo: "paseo",
    perro: "Nala",
    fechaLabel: "5 jun · 17:00",
    fechaCorta: "5 jun",
    hora: "17:00",
    duracion: 60,
    estado: "cancelada",
    cancelTexto: "Cancelaste esta reserva la noche anterior.",
    precioTreats: 1,
  },
];

export function getReserva(id: string): Reserva | undefined {
  return RESERVAS.find((r) => r.id === id);
}

export function reservasProximas(): Reserva[] {
  return RESERVAS.filter((r) => r.estado === "en_curso" || r.estado === "confirmada");
}

export function reservasPasadas(): Reserva[] {
  return RESERVAS.filter((r) => r.estado === "completada" || r.estado === "cancelada");
}
