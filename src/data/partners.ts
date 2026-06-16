export type Producto = {
  id: string;
  marcaId: string;
  nombre: string;
  descripcion: string;
  emoji: string;
  costoTreats: number;
};

export type Marca = {
  id: string;
  nombre: string;
  tagline: string;
  color: string; // bg color
  textColor: string;
};

export const MARCAS: Marca[] = [
  { id: "kiwoko", nombre: "Kiwoko", tagline: "Todo lo que tu peludo necesita", color: "#FF7A59", textColor: "#fff" },
  { id: "drbimix", nombre: "Dr Bimix", tagline: "Nutrición y bienestar canino", color: "#2E7D5B", textColor: "#fff" },
  { id: "maikai", nombre: "Maikai", tagline: "Premios artesanales con mimo", color: "#1F2421", textColor: "#fff" },
];

export const PRODUCTOS: Producto[] = [
  // Kiwoko
  { id: "kw-snacks", marcaId: "kiwoko", nombre: "Pack de snacks naturales", descripcion: "Selección de premios sin cereales, ideal entrenamiento.", emoji: "🍪", costoTreats: 80 },
  { id: "kw-juguete", marcaId: "kiwoko", nombre: "Juguete mordedor resistente", descripcion: "Caucho natural reforzado, aguanta los mordiscos más duros.", emoji: "🧸", costoTreats: 150 },
  { id: "kw-cama", marcaId: "kiwoko", nombre: "Cama acolchada talla M", descripcion: "Tejido lavable y memoria de forma, para descansos largos.", emoji: "🛏️", costoTreats: 600 },
  { id: "kw-bono", marcaId: "kiwoko", nombre: "Bono descuento 10% en tienda", descripcion: "Canjeable en cualquier tienda Kiwoko o en su web.", emoji: "🎟️", costoTreats: 200 },
  // Dr Bimix
  { id: "db-articular", marcaId: "drbimix", nombre: "Suplemento articular (30 días)", descripcion: "Condroprotector con colágeno y omega-3 para perros activos.", emoji: "💊", costoTreats: 220 },
  { id: "db-dentales", marcaId: "drbimix", nombre: "Snacks dentales", descripcion: "Limpian dientes y refrescan el aliento entre cepillados.", emoji: "🦷", costoTreats: 90 },
  { id: "db-vitaminas", marcaId: "drbimix", nombre: "Pack vitaminas pelo y piel", descripcion: "Biotina, zinc y aceite de salmón para un pelo brillante.", emoji: "✨", costoTreats: 180 },
  // Maikai
  { id: "mk-boniato", marcaId: "maikai", nombre: "Galletas artesanas de boniato", descripcion: "Horneadas a mano con boniato ecológico y canela.", emoji: "🥮", costoTreats: 60 },
  { id: "mk-hueso", marcaId: "maikai", nombre: "Hueso natural premium", descripcion: "100% carne deshidratada, sin conservantes ni colorantes.", emoji: "🦴", costoTreats: 110 },
  { id: "mk-caja", marcaId: "maikai", nombre: "Caja sorpresa mensual", descripcion: "Una caja con premios y un juguete sorpresa cada mes.", emoji: "📦", costoTreats: 320 },
];

export function getProducto(id: string): Producto | undefined {
  return PRODUCTOS.find((p) => p.id === id);
}
export function getMarca(id: string): Marca | undefined {
  return MARCAS.find((m) => m.id === id);
}
export function productosPorMarca(id: string): Producto[] {
  return PRODUCTOS.filter((p) => p.marcaId === id);
}
