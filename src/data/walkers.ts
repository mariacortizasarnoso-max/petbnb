export type Review = { autor: string; texto: string };
export type Walker = {
  id: string;
  nombre: string;
  foto: string;
  barrio: string;
  bio: string;
  especialidades: string[];
  tags: string[];
  distancia_km: number;
  disponible_ahora: boolean;
  tiempo_respuesta: string;
  rating: number;
  num_resenas: number;
  paseos_completados: number;
  verificado: boolean;
  anios_experiencia: number;
  galeria: string[];
  resenas: Review[];
  nota_recogida: string;
  tiene_perros?: boolean;
  texto_perros?: string;
  dias_no_disponibles?: number[];
  ofrece_estancia?: boolean;
  precio_estancia_noche?: number;
  chat_inicial?: { de: "ellos" | "yo"; texto: string }[];
};

const u = (q: string, sig: number) =>
  `https://images.unsplash.com/photo-${q}?auto=format&fit=crop&w=900&q=70&sig=${sig}`;

// Unsplash photo IDs de paseos de perros / personas con perros
const photos = {
  goldenPark: u("1583337130417-3346a1be7dee", 1), // golden parque
  walkPair: u("1601758228041-f3b2795255f1", 2),  // mujer paseando perro
  smallDog: u("1601758174039-8c34e0f5b3a4", 3),
  bigDog: u("1543466835-00a7907e9de1", 4),
  puppy: u("1591946614720-90a587da4a36", 5),
  beagle: u("1558788353-f76d92427f16", 6),
  husky: u("1605568427561-40dd23c2acea", 7),
  border: u("1591768793355-74d04bb6608f", 8),
  twoDogs: u("1548199973-03cce0bbc87b", 9),
  street: u("1530281700549-e82e7bf110d6", 10),
  cityWalk: u("1494947665470-20322015e3a8", 11),
  labrador: u("1517423440428-a5a00ad493e8", 12),
  poodle: u("1561037404-61cd46aa615b", 13),
  oldDog: u("1518717758536-85ae29035b6d", 14),
  bulldog: u("1583511655857-d19b40a7a54e", 15),
  happyDog: u("1450778869180-41d0601e046e", 16),
  forestWalk: u("1548767797-d8c844163c4c", 17),
  parkDogs: u("1587300003388-59208cc962cb", 18),
};

export const WALKERS: Walker[] = [
  {
    id: "ana",
    nombre: "Ana Méndez",
    foto: "https://i.pravatar.cc/300?img=47",
    barrio: "Chamberí",
    bio: "Crecí con tres border collies y llevo cuatro años paseando perros en Chamberí. Me especializo en peludos nerviosos: paseos tranquilos, sin cruzarme con otros perros y a un ritmo que les baja las pulsaciones.",
    especialidades: ["Perros ansiosos", "Reactivos", "Paseos en solitario"],
    tags: ["ansioso", "nervioso", "reactivo", "miedoso", "tranquilo", "golden", "border", "labrador"],
    distancia_km: 0.6,
    disponible_ahora: true,
    tiempo_respuesta: "responde en ~5 min",
    rating: 4.9,
    num_resenas: 142,
    paseos_completados: 612,
    verificado: true,
    anios_experiencia: 4,
    galeria: [photos.goldenPark, photos.walkPair, photos.forestWalk],
    resenas: [
      { autor: "Marta R.", texto: "Mi Nala es muy reactiva y con Ana por fin vuelve a casa relajada. Puntual y me manda foto a mitad del paseo." },
      { autor: "Diego P.", texto: "Se nota que entiende a los perros nerviosos. A mi border le costaba salir y ahora va contento a buscarla." },
    ],
    nota_recogida: "¡Genial! Recojo a tu perro en el portal y te aviso en cuanto salgamos. 🐾",
  },
  {
    id: "lucia",
    nombre: "Lucía Fernández",
    foto: "https://i.pravatar.cc/300?img=44",
    barrio: "Malasaña",
    bio: "Veterinaria de profesión, paseadora por vocación los fines de semana. Si tu perro toma medicación o necesita cuidados especiales, estoy acostumbrada y no me pongo nerviosa.",
    especialidades: ["Medicación", "Perros mayores", "Cuidados especiales"],
    tags: ["medicacion", "mayor", "senior", "anciano", "enfermo", "diabetes", "artrosis", "tranquilo"],
    distancia_km: 1.2,
    disponible_ahora: true,
    tiempo_respuesta: "responde en ~10 min",
    rating: 5.0,
    num_resenas: 89,
    paseos_completados: 312,
    verificado: true,
    anios_experiencia: 6,
    galeria: [photos.oldDog, photos.beagle, photos.street],
    resenas: [
      { autor: "Carmen L.", texto: "Mi Toby tiene 13 años y artrosis. Lucía le adapta el paseo, le da su pastilla y vuelve siempre feliz." },
      { autor: "Javier S.", texto: "Saber que es veterinaria me da una tranquilidad enorme. Profesional y muy cariñosa." },
    ],
    nota_recogida: "Encantada. Recojo a tu peludo con calma y respeto su ritmo en todo momento. 🩺",
  },
  {
    id: "marcos",
    nombre: "Marcos Iglesias",
    foto: "https://i.pravatar.cc/300?img=12",
    barrio: "Chamberí",
    bio: "Corredor de montaña los findes y paseador entre semana. Si tu perro necesita quemar energía de verdad, conmigo no se va a aburrir: rutas largas, parque del Oeste y mucho mordedor.",
    especialidades: ["Razas grandes", "Energía alta", "Paseos largos"],
    tags: ["grande", "energico", "energia", "husky", "pastor", "labrador", "joven", "fuerte", "deportista"],
    distancia_km: 0.9,
    disponible_ahora: true,
    tiempo_respuesta: "responde en ~15 min",
    rating: 4.8,
    num_resenas: 121,
    paseos_completados: 540,
    verificado: true,
    anios_experiencia: 3,
    galeria: [photos.husky, photos.bigDog, photos.cityWalk],
    resenas: [
      { autor: "Elena G.", texto: "Mi husky vuelve agotado y feliz. Marcos le da la caña justa que necesita." },
      { autor: "Pablo M.", texto: "Llevo a mi pastor con él desde hace meses. Súper fiable y muy buen rollo." },
    ],
    nota_recogida: "¡Vamos allá! Hoy toca paseo del bueno, ruta larga por el parque. 💪",
  },
  {
    id: "sofia",
    nombre: "Sofía Navarro",
    foto: "https://i.pravatar.cc/300?img=32",
    barrio: "Lavapiés",
    bio: "Educadora canina en formación, vivo con dos cachorros adoptados. Me chiflan los peques que aún están aprendiendo: refuerzo positivo, paciencia infinita y cero tirones de correa.",
    especialidades: ["Cachorros", "Educación básica", "Refuerzo positivo"],
    tags: ["cachorro", "puppy", "joven", "educacion", "adoptado", "pequeño", "aprendiz"],
    distancia_km: 2.3,
    disponible_ahora: false,
    tiempo_respuesta: "responde en ~20 min",
    rating: 4.9,
    num_resenas: 67,
    paseos_completados: 198,
    verificado: true,
    anios_experiencia: 2,
    galeria: [photos.puppy, photos.smallDog, photos.parkDogs],
    resenas: [
      { autor: "Inés C.", texto: "Mi cachorra ha aprendido a no tirar de la correa en dos semanas con Sofía. Una joya." },
      { autor: "Raúl B.", texto: "Muy dulce con los peques. Vuelve cansada y socializada." },
    ],
    nota_recogida: "¡Qué ganas! Vamos a hacer un paseo divertido y aprender un poquito. 🌱",
  },
  {
    id: "javier",
    nombre: "Javier Ortega",
    foto: "https://i.pravatar.cc/300?img=8",
    barrio: "Salamanca",
    bio: "Llevo siete años paseando perros del barrio, soy de los que se sabe el nombre de todos los porteros. Si tu perro tira mucho o necesita socializar, lo trabajamos sin prisa.",
    especialidades: ["Socialización", "Razas pequeñas", "Mayores"],
    tags: ["pequeño", "mini", "yorkie", "caniche", "socializar", "mayor", "tranquilo"],
    distancia_km: 1.8,
    disponible_ahora: false,
    tiempo_respuesta: "responde en ~25 min",
    rating: 4.7,
    num_resenas: 178,
    paseos_completados: 980,
    verificado: true,
    anios_experiencia: 7,
    galeria: [photos.poodle, photos.smallDog, photos.street],
    resenas: [
      { autor: "Cristina V.", texto: "Mi yorkie le adora. Javier es de toda la vida del barrio y eso se nota." },
      { autor: "Andrés F.", texto: "Muy serio y puntual. Lleva a mi caniche desde hace dos años." },
    ],
    nota_recogida: "Buenas, recojo al peque a la hora acordada y damos una buena vuelta. 🐕",
  },
  {
    id: "elena",
    nombre: "Elena Castro",
    foto: "https://i.pravatar.cc/300?img=49",
    barrio: "Chamberí",
    bio: "Tengo una galga adoptada y entiendo bien a los perros tímidos o con miedo a la calle. Paseo sin prisa, evitando estímulos, y siempre cargo premios y bolsitas de sobra.",
    especialidades: ["Perros miedosos", "Galgos", "Adoptados"],
    tags: ["miedoso", "tímido", "timido", "galgo", "adoptado", "tranquilo", "ansioso", "reactivo"],
    distancia_km: 1.1,
    disponible_ahora: true,
    tiempo_respuesta: "responde en ~10 min",
    rating: 4.9,
    num_resenas: 54,
    paseos_completados: 220,
    verificado: true,
    anios_experiencia: 3,
    galeria: [photos.beagle, photos.forestWalk, photos.happyDog],
    resenas: [
      { autor: "Nuria T.", texto: "Mi galgo es muy asustadizo y Elena tiene una paciencia que no me cabe en el pecho." },
      { autor: "Sergio A.", texto: "La recomiendo a todo el mundo del barrio. Tranquila, dulce y muy responsable." },
    ],
    nota_recogida: "Salimos despacito y a su ritmo, sin agobios. ✨",
  },
  {
    id: "diego",
    nombre: "Diego Romero",
    foto: "https://i.pravatar.cc/300?img=15",
    barrio: "Retiro",
    bio: "Bombero de profesión, paseador en mis días libres. Me gustan los retos: si tu perro es grande, fuerte o tiene mala fama con otros perros, dame una oportunidad.",
    especialidades: ["Razas grandes", "Perros difíciles", "Reactivos"],
    tags: ["grande", "fuerte", "rottweiler", "pastor", "reactivo", "dificil", "energico"],
    distancia_km: 3.1,
    disponible_ahora: false,
    tiempo_respuesta: "responde en ~30 min",
    rating: 4.8,
    num_resenas: 96,
    paseos_completados: 412,
    verificado: true,
    anios_experiencia: 5,
    galeria: [photos.bigDog, photos.bulldog, photos.cityWalk],
    resenas: [
      { autor: "Mónica D.", texto: "Mi rottie no se deja pasear por cualquiera y con Diego va como un cordero." },
      { autor: "Iván R.", texto: "Tipazo. Mi pastor alemán le adora y vuelve agotado." },
    ],
    nota_recogida: "Confía, le saco con calma y firmeza. Lo vamos a pasar bien. 🔥",
  },
  {
    id: "paula",
    nombre: "Paula Herrera",
    foto: "https://i.pravatar.cc/300?img=20",
    barrio: "Malasaña",
    bio: "Diseñadora freelance, trabajo desde casa y aprovecho para sacar perros del barrio entre reunión y reunión. Soy de las que llega siempre cinco minutos antes con golosinas en el bolsillo.",
    especialidades: ["Puntualidad", "Razas medianas", "Paseos urbanos"],
    tags: ["mediano", "labrador", "beagle", "urbano", "puntual"],
    distancia_km: 1.5,
    disponible_ahora: true,
    tiempo_respuesta: "responde en ~8 min",
    rating: 4.8,
    num_resenas: 73,
    paseos_completados: 286,
    verificado: true,
    anios_experiencia: 3,
    galeria: [photos.labrador, photos.walkPair, photos.street],
    resenas: [
      { autor: "Laura M.", texto: "Súper puntual y atenta. Manda foto y resumen del paseo cada vez." },
      { autor: "Tomás G.", texto: "Mi beagle la espera en la puerta. Buena gente y muy responsable." },
    ],
    nota_recogida: "¡Lista! Bajo a por él y te aviso en cuanto salgamos. 🐾",
  },
  {
    id: "carlos",
    nombre: "Carlos Vidal",
    foto: "https://i.pravatar.cc/300?img=33",
    barrio: "Arganzuela",
    bio: "Profesor de yoga y dueño de un labrador color chocolate. Si buscas alguien calmado para tu perro mayor o para uno que necesite paz, esa es justo mi onda.",
    especialidades: ["Perros mayores", "Paseos lentos", "Perros tranquilos"],
    tags: ["mayor", "senior", "tranquilo", "lento", "labrador", "calma"],
    distancia_km: 2.7,
    disponible_ahora: false,
    tiempo_respuesta: "responde en ~20 min",
    rating: 4.9,
    num_resenas: 41,
    paseos_completados: 150,
    verificado: true,
    anios_experiencia: 2,
    galeria: [photos.oldDog, photos.labrador, photos.forestWalk],
    resenas: [
      { autor: "Beatriz O.", texto: "Mi labradora de 12 años está encantada. Carlos respeta su paso, no la fuerza." },
      { autor: "Luis V.", texto: "Persona tranquila y de fiar. Recomendado para perros sénior." },
    ],
    nota_recogida: "Vamos a hacer un paseo calmadito, a su aire. 🌿",
  },
  {
    id: "irene",
    nombre: "Irene Soler",
    foto: "https://i.pravatar.cc/300?img=23",
    barrio: "Chueca",
    bio: "Mi piso es pequeño así que paseo perros ajenos casi a diario. Tengo manejo con razas potentes y soy fan de los bullys: si tu bulldog, bóxer o staff necesita compi, aquí estoy.",
    especialidades: ["Bulldogs", "Razas potentes", "Braquicéfalos"],
    tags: ["bulldog", "boxer", "staff", "potente", "braquicefalo", "grande", "mediano"],
    distancia_km: 2.0,
    disponible_ahora: false,
    tiempo_respuesta: "responde en ~15 min",
    rating: 4.7,
    num_resenas: 58,
    paseos_completados: 240,
    verificado: true,
    anios_experiencia: 4,
    galeria: [photos.bulldog, photos.twoDogs, photos.happyDog],
    resenas: [
      { autor: "Adrián P.", texto: "Mi bulldog inglés la adora. Conoce muy bien a la raza y sus limitaciones con el calor." },
      { autor: "Sara C.", texto: "Atenta y muy cariñosa. Mi bóxer vuelve siempre contento." },
    ],
    nota_recogida: "¡Perfecto! Hago paseo cortito y sombras si hace calor. 🐶",
  },
  {
    id: "mateo",
    nombre: "Mateo Ruiz",
    foto: "https://i.pravatar.cc/300?img=53",
    barrio: "Tetuán",
    bio: "Estudiante de biología, llevo año y medio paseando a los perros del bloque. Disponibilidad amplia entre semana y muchas ganas de conocer a tu peludo.",
    especialidades: ["Disponibilidad amplia", "Razas medianas", "Paseos diarios"],
    tags: ["mediano", "diario", "joven", "labrador", "mestizo"],
    distancia_km: 4.2,
    disponible_ahora: false,
    tiempo_respuesta: "responde en ~30 min",
    rating: 4.6,
    num_resenas: 22,
    paseos_completados: 88,
    verificado: false,
    anios_experiencia: 1,
    galeria: [photos.parkDogs, photos.street, photos.happyDog],
    resenas: [
      { autor: "Helena R.", texto: "Mateo es muy maja, mi perro siempre vuelve contento y cansadito." },
      { autor: "Víctor L.", texto: "Buen chaval, atento y puntual." },
    ],
    nota_recogida: "¡Hola! Bajo a por él en un momentito. 😊",
  },
  {
    id: "natalia",
    nombre: "Natalia Prieto",
    foto: "https://i.pravatar.cc/300?img=25",
    barrio: "La Latina",
    bio: "Trabajo en una protectora los sábados y entre semana saco perros del barrio. Sin correa en zonas seguras, mucho juego y siempre con la sesión de fotos incluida.",
    especialidades: ["Sin correa controlada", "Sociables", "Foto-reportaje"],
    tags: ["sociable", "sin correa", "juego", "joven", "mediano", "energico"],
    distancia_km: 3.5,
    disponible_ahora: false,
    tiempo_respuesta: "responde en ~20 min",
    rating: 4.8,
    num_resenas: 64,
    paseos_completados: 270,
    verificado: true,
    anios_experiencia: 3,
    galeria: [photos.happyDog, photos.parkDogs, photos.forestWalk],
    resenas: [
      { autor: "Clara N.", texto: "Las fotos que manda me alegran el día. Mi perra vuelve agotada y feliz." },
      { autor: "Rubén H.", texto: "Súper buen rollo. Se nota que ama a los perros." },
    ],
    nota_recogida: "¡Allá voy! Hoy haremos buenas fotos. 📸",
  },
];

type Extra = {
  tiene_perros: boolean;
  texto_perros: string;
  dias_no_disponibles: number[];
  ofrece_estancia: boolean;
  precio_estancia_noche?: number;
  chat_inicial: { de: "ellos" | "yo"; texto: string }[];
};

const EXTRAS: Record<string, Extra> = {
  ana: {
    tiene_perros: false,
    texto_perros: "No tiene perros propios, así tu perro recibe toda su atención durante el paseo.",
    dias_no_disponibles: [2, 9, 16, 23, 30],
    ofrece_estancia: true, precio_estancia_noche: 22,
    chat_inicial: [
      { de: "yo", texto: "¡Hola Ana! Tengo una golden de 4 años, Nala. Es un poco reactiva con otros perros. ¿Te vendría bien pasearla entre semana por las tardes?" },
      { de: "ellos", texto: "¡Hola! Claro. Con perros reactivos prefiero pasear siempre en solitario y por zonas tranquilas, así va relajada. ¿Sobre qué hora te encaja?" },
      { de: "yo", texto: "Sobre las 18:30 estaría genial." },
      { de: "ellos", texto: "Perfecto, las tardes las tengo libres. ¿Te parece si el primer día hacemos un paseo corto para que Nala me coja confianza? 🐾" },
    ],
  },
  lucia: {
    tiene_perros: true,
    texto_perros: "Convive con Mara, una galga adoptada de 7 años — está acostumbrada a la convivencia entre perros tranquilos.",
    dias_no_disponibles: [1, 5, 12, 19, 26],
    ofrece_estancia: true, precio_estancia_noche: 28,
    chat_inicial: [
      { de: "ellos", texto: "¡Hola! Soy Lucía, veterinaria. Cuéntame si tu peludo toma alguna medicación o tiene algún cuidado especial." },
    ],
  },
  marcos: {
    tiene_perros: true,
    texto_perros: "Vive con Toro, un labrador chocolate de 5 años — acostumbrado a salir en grupo y muy paciente.",
    dias_no_disponibles: [4, 11, 18, 25],
    ofrece_estancia: false,
    chat_inicial: [
      { de: "ellos", texto: "¡Buenas! Si tu perro necesita quemar energía, lo nuestro va a funcionar. ¿Qué raza y edad tiene?" },
    ],
  },
  sofia: {
    tiene_perros: true,
    texto_perros: "Convive con Lúa y Roco, dos cachorros adoptados — sabe gestionar la mezcla y los tiempos de cada uno.",
    dias_no_disponibles: [3, 6, 13, 20, 27],
    ofrece_estancia: true, precio_estancia_noche: 24,
    chat_inicial: [
      { de: "ellos", texto: "¡Hola! Encantada. ¿Es vuestro primer paseador o ya ha salido antes con alguien?" },
    ],
  },
  javier: {
    tiene_perros: false,
    texto_perros: "No tiene perros propios; tu perro es el protagonista durante todo el paseo.",
    dias_no_disponibles: [7, 8, 14, 21, 28, 29],
    ofrece_estancia: true, precio_estancia_noche: 26,
    chat_inicial: [
      { de: "ellos", texto: "Hola, soy Javier. ¿Qué tal anda tu peludo con otros perros del barrio?" },
    ],
  },
  elena: {
    tiene_perros: true,
    texto_perros: "Vive con Toña, su galga adoptada — entiende muy bien la dinámica entre perros tímidos.",
    dias_no_disponibles: [2, 10, 17, 24, 31],
    ofrece_estancia: true, precio_estancia_noche: 25,
    chat_inicial: [
      { de: "ellos", texto: "¡Hola! Si tu peludo es asustadizo, ven con calma y vamos paso a paso. ¿Cómo se llama?" },
    ],
  },
  diego: {
    tiene_perros: false,
    texto_perros: "No tiene perros propios; toda su atención y energía es para el tuyo.",
    dias_no_disponibles: [1, 4, 11, 18, 25],
    ofrece_estancia: false,
    chat_inicial: [
      { de: "ellos", texto: "Buenas. Cuéntame qué raza y cuánto pesa, así me hago una idea." },
    ],
  },
  paula: {
    tiene_perros: false,
    texto_perros: "Sin perros propios: tu peludo no comparte cariño con nadie más durante el paseo.",
    dias_no_disponibles: [6, 13, 20, 27],
    ofrece_estancia: false,
    chat_inicial: [
      { de: "ellos", texto: "¡Hola! Llego siempre cinco minutos antes y os mando foto a mitad del paseo. ¿Qué horario te encaja?" },
    ],
  },
  carlos: {
    tiene_perros: true,
    texto_perros: "Convive con Coco, un labrador chocolate de 9 años, tranquilo y muy bien socializado.",
    dias_no_disponibles: [3, 5, 12, 19, 26],
    ofrece_estancia: true, precio_estancia_noche: 23,
    chat_inicial: [
      { de: "ellos", texto: "Hola, soy Carlos. Si buscas calma para tu peludo, esa es justo mi onda 🌿" },
    ],
  },
  irene: {
    tiene_perros: false,
    texto_perros: "No tiene perros propios — perfecto si prefieres atención exclusiva, sobre todo con razas potentes.",
    dias_no_disponibles: [2, 9, 16, 23, 30],
    ofrece_estancia: false,
    chat_inicial: [
      { de: "ellos", texto: "¡Hola! Cuéntame raza y peso, y si tiene alguna manía con la correa o el bozal." },
    ],
  },
  mateo: {
    tiene_perros: false,
    texto_perros: "Sin perros propios; ideal si tu peludo necesita un paseo en solitario y sin distracciones.",
    dias_no_disponibles: [7, 14, 21, 28],
    ofrece_estancia: false,
    chat_inicial: [
      { de: "ellos", texto: "¡Buenas! Tengo bastante disponibilidad entre semana. ¿Qué horario te va mejor?" },
    ],
  },
  natalia: {
    tiene_perros: true,
    texto_perros: "Vive con Luna y Bruno, dos mestizos adoptados de protectora — totalmente acostumbrada a la convivencia.",
    dias_no_disponibles: [4, 11, 18, 25],
    ofrece_estancia: true, precio_estancia_noche: 27,
    chat_inicial: [
      { de: "ellos", texto: "¡Hola! Si tu perro es sociable, lo paso genial con él. ¿Le gusta jugar con otros? 🐶" },
    ],
  },
};

for (const w of WALKERS) {
  Object.assign(w, EXTRAS[w.id]);
}

// Respuestas de chat por defecto (cuando el usuario escribe algo nuevo)
export const CHAT_RESPUESTAS = [
  "¡Claro! Cuéntame un poco más, así me organizo.",
  "Genial, lo tengo en agenda. ¿Alguna preferencia de zona del barrio?",
  "Perfecto. Para el primer día hacemos algo cortito y vamos viendo, ¿te parece?",
  "Sin problema. Si me das la hora exacta, te confirmo el hueco.",
  "Apuntado. Cualquier duda última hora me escribes y listo 🐾",
];

export const RESPUESTAS_RAPIDAS = [
  "¿Tienes hueco esta semana?",
  "¿Paseas en grupo o en solitario?",
  "¿Cómo es el primer día?",
  "¿Ofreces también estancia?",
];

export function getWalker(id: string): Walker | undefined {
  return WALKERS.find((w) => w.id === id);
}
