import { WALKERS, type Walker } from "@/data/walkers";

export type Match = {
  walker: Walker;
  score: number;
  matchedTags: string[];
  explicacion: string;
};

const norm = (s: string) =>
  s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

// Diccionario keyword (normalizada) -> tag canónico
const KEYWORDS: Record<string, string> = {
  // temperamento
  ansioso: "ansioso", ansiosa: "ansioso", nervioso: "nervioso", nerviosa: "nervioso",
  reactivo: "reactivo", reactiva: "reactivo", miedoso: "miedoso", miedosa: "miedoso",
  timido: "timido", timida: "timido", asustadizo: "miedoso", asustadiza: "miedoso",
  tranquilo: "tranquilo", tranquila: "tranquilo", calmado: "tranquilo", calmada: "tranquilo",
  // edad
  cachorro: "cachorro", cachorra: "cachorro", puppy: "cachorro", joven: "joven",
  mayor: "mayor", senior: "mayor", anciano: "mayor", anciana: "mayor", viejo: "mayor", vieja: "mayor",
  // tamaño
  grande: "grande", grandote: "grande", gigante: "grande",
  pequeno: "pequeño", pequena: "pequeño", peque: "pequeño", mini: "pequeño",
  mediano: "mediano", mediana: "mediano",
  // razas
  golden: "golden", labrador: "labrador", border: "border", collie: "border",
  husky: "husky", pastor: "pastor", aleman: "pastor",
  galgo: "galgo", beagle: "beagle", bulldog: "bulldog", boxer: "boxer",
  rottweiler: "rottweiler", rottie: "rottweiler", staff: "staff",
  yorkie: "pequeño", yorkshire: "pequeño", caniche: "pequeño",
  // necesidades
  medicacion: "medicacion", medicada: "medicacion", medicado: "medicacion",
  enfermo: "medicacion", enferma: "medicacion", artrosis: "mayor", diabetes: "medicacion",
  adoptado: "adoptado", adoptada: "adoptado", protectora: "adoptado",
  // estilo
  energico: "energico", energica: "energico", energia: "energico",
  deportista: "energico", correr: "energico", corredor: "energico",
  socializar: "socializar", sociable: "socializar", juego: "socializar", juguetón: "socializar",
  educacion: "educacion", educar: "educacion", aprende: "educacion",
  tira: "reactivo", tirones: "reactivo",
  "sin correa": "sin correa",
};

function extractTags(text: string): string[] {
  const n = norm(text);
  const found = new Set<string>();
  // multi-word
  for (const k of Object.keys(KEYWORDS)) {
    if (k.includes(" ") && n.includes(k)) found.add(KEYWORDS[k]);
  }
  // single-word
  for (const w of n.split(/[^a-z]+/).filter(Boolean)) {
    if (KEYWORDS[w]) found.add(KEYWORDS[w]);
  }
  return Array.from(found);
}

function extractBreed(text: string): string | null {
  const n = norm(text);
  const razas = ["golden", "labrador", "border collie", "border", "husky", "pastor aleman", "pastor",
    "galgo", "beagle", "bulldog", "boxer", "rottweiler", "yorkshire", "caniche", "mestizo"];
  for (const r of razas) if (n.includes(r)) return r;
  return null;
}

function extractTraits(text: string): string[] {
  const n = norm(text);
  const traits: string[] = [];
  if (/(ansios|nervios|miedos|asustad|timid|reactiv)/.test(n)) traits.push("nervioso");
  if (/(energi|hiperactiv|inquiet|tira)/.test(n)) traits.push("muy enérgico");
  if (/(mayor|senior|anciano|viej|artrosis)/.test(n)) traits.push("mayor");
  if (/(cachorr|puppy)/.test(n)) traits.push("cachorro");
  if (/(medicacion|enferm|diabet)/.test(n)) traits.push("con medicación");
  if (/(adoptad|protectora)/.test(n)) traits.push("adoptado");
  if (/(grande|grandote|gigante)/.test(n)) traits.push("grande");
  if (/(peque|mini)/.test(n)) traits.push("pequeño");
  return traits;
}

function buildExplanation(walker: Walker, breed: string | null, traits: string[], matched: string[]): string {
  const first = walker.nombre.split(" ")[0];
  const dog = breed
    ? `tu ${breed}${traits.length ? " " + traits.slice(0, 2).join(" y ") : ""}`
    : traits.length
      ? `un perro ${traits.slice(0, 2).join(" y ")}`
      : "tu peludo";

  const razones: string[] = [];
  if (matched.includes("ansioso") || matched.includes("nervioso") || matched.includes("reactivo") || matched.includes("miedoso") || matched.includes("timido")) {
    razones.push(`${first} pasea siempre en solitario y por zonas tranquilas, justo lo que ${dog} necesita`);
  }
  if (matched.includes("medicacion")) {
    razones.push(`${first} es veterinaria y está acostumbrada a perros con medicación, así que va con la calma que toca`);
  }
  if (matched.includes("mayor")) {
    razones.push(`${first} respeta el paso de los perros sénior y nunca fuerza el ritmo`);
  }
  if (matched.includes("cachorro") || matched.includes("educacion")) {
    razones.push(`${first} trabaja con refuerzo positivo y mucha paciencia con los peques que aún están aprendiendo`);
  }
  if (matched.includes("grande") || matched.includes("energico")) {
    razones.push(`${first} tiene experiencia con razas grandes que necesitan quemar energía de verdad`);
  }
  if (matched.includes("galgo") || matched.includes("adoptado")) {
    razones.push(`${first} convive con un galgo adoptado y entiende muy bien a los perros tímidos`);
  }
  if (matched.includes("bulldog") || matched.includes("boxer")) {
    razones.push(`${first} conoce muy bien a los braquicéfalos y adapta el paseo cuando aprieta el calor`);
  }

  const principal = razones[0] ?? `${first} encaja con ${dog}: ${walker.especialidades.slice(0, 2).join(" y ").toLowerCase()}`;
  const min = Math.max(3, Math.round(walker.distancia_km * 12));
  return `${principal}. Además vive a ${min} minutos a pie, en ${walker.barrio}.`;
}

export function matchWalkers(text: string, mode: "planificado" | "sos" = "planificado"): Match[] {
  const tags = extractTags(text);
  const breed = extractBreed(text);
  const traits = extractTraits(text);

  let pool = WALKERS;
  if (mode === "sos") {
    pool = pool.filter((w) => w.disponible_ahora && w.distancia_km < 2);
  }

  const scored = pool.map((w) => {
    const matched = tags.filter((t) => w.tags.includes(t));
    let score = matched.length * 18;
    score += (w.rating - 4.5) * 30;
    score += Math.max(0, (3 - w.distancia_km)) * 6;
    if (w.verificado) score += 6;
    if (w.disponible_ahora) score += 4;
    // base mínima
    score = Math.min(100, Math.max(55, Math.round(score + 55)));
    return {
      walker: w,
      score,
      matchedTags: matched,
      explicacion: buildExplanation(w, breed, traits, matched),
    };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, mode === "sos" ? 3 : 5);
}
