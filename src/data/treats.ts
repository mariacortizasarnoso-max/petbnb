export type Treat = {
  id: string;
  emoji: string;
  nombre: string;
  descripcion: string;
  precio: number; // €
};

export const TREATS: Treat[] = [
  { id: "galleta", emoji: "🦴", nombre: "Galleta casera", descripcion: "Un detalle dulce", precio: 1 },
  { id: "pack", emoji: "🍖", nombre: "Pack de premios", descripcion: "Para los días de buen comportamiento", precio: 3 },
  { id: "juguete", emoji: "🧸", nombre: "Juguete mordedor", descripcion: "Para los más juguetones", precio: 5 },
  { id: "bolsa", emoji: "🎁", nombre: "Bolsa sorpresa", descripcion: "Una mezcla de premios y juego", precio: 8 },
  { id: "hueso", emoji: "🦴", nombre: "Hueso gigante", descripcion: "El rey de los premios", precio: 12 },
];

export function getTreat(id: string): Treat | undefined {
  return TREATS.find((t) => t.id === id);
}
