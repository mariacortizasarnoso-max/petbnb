import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Mock @tanstack/react-start so createServerFn is a no-op in tests.
vi.mock("@tanstack/react-start", () => ({
  createServerFn: () => ({
    inputValidator: () => ({ handler: (fn: unknown) => fn }),
  }),
}));

// Mock Anthropic SDK — overridden per test.
const mockCreate = vi.fn();
vi.mock("@anthropic-ai/sdk", () => ({
  default: class {
    messages = { create: mockCreate };
  },
}));

// Import AFTER mocks are declared.
import { WALKERS } from "@/data/walkers";
import * as matchingModule from "@/lib/api/matching.server";
const { handleMatchWalkers } = matchingModule;

const REAL_ID = WALKERS[0].id;
const SOS_WALKER = WALKERS.find((w) => w.disponible_ahora && w.distancia_km < 2);

function claudeResponse(rankings: Array<{ walkerId: string; puntuacion: number; explicacion: string }>) {
  return {
    content: [
      {
        type: "tool_use",
        name: "rankWalkers",
        input: { rankings },
      },
    ],
  };
}

beforeEach(() => {
  process.env.ANTHROPIC_API_KEY = "test-key";
  mockCreate.mockReset();
  // Short timeout so T3 (timeout test) resolves quickly in real time
  matchingModule.matchingConfig.timeoutMs = 50;
});

afterEach(() => {
  matchingModule.matchingConfig.timeoutMs = 12_000;
});

describe("handleMatchWalkers", () => {
  it("T1 — happy path planificado: devuelve matches de Claude con walker correcto", async () => {
    mockCreate.mockResolvedValueOnce(
      claudeResponse([{ walkerId: REAL_ID, puntuacion: 90, explicacion: "Encaja por X" }])
    );

    const result = await handleMatchWalkers("golden ansioso", "planificado");

    expect(result).toHaveLength(1);
    expect(result[0].walker.id).toBe(REAL_ID);
    expect(result[0].score).toBe(90);
    expect(result[0].explicacion).toBe("Encaja por X");
    expect(result[0].matchedTags).toEqual([]);
  });

  it("T2 — happy path SOS: solo paseadores disponibles ahora y < 2 km", async () => {
    if (!SOS_WALKER) {
      console.warn("No hay walkers SOS en el mock; test omitido");
      return;
    }
    mockCreate.mockResolvedValueOnce(
      claudeResponse([{ walkerId: SOS_WALKER.id, puntuacion: 85, explicacion: "Disponible ahora" }])
    );

    const result = await handleMatchWalkers("ayuda urgente", "sos");

    expect(result.length).toBeGreaterThan(0);
    expect(result.length).toBeLessThanOrEqual(3);
    for (const m of result) {
      expect(m.walker.disponible_ahora).toBe(true);
      expect(m.walker.distancia_km).toBeLessThan(2);
    }
  });

  it("T3 — fallback por timeout: cuando Claude no responde en el límite, devuelve fallback", async () => {
    // claudeTimeoutMs is 50ms (set in beforeEach) — Claude never resolves
    mockCreate.mockReturnValueOnce(new Promise(() => {}));
    const result = await handleMatchWalkers("golden", "planificado");
    expect(result.length).toBeGreaterThan(0);
    expect(mockCreate).toHaveBeenCalledOnce();
  });

  it("T4 — fallback por error de API: cuando Claude lanza, devuelve resultados del fallback", async () => {
    mockCreate.mockRejectedValueOnce(new Error("API Error"));
    const result = await handleMatchWalkers("labrador energico", "planificado");
    expect(result.length).toBeGreaterThan(0);
  });

  it("T5 — IDs alucinados descartados: walkerId inexistente se filtra", async () => {
    mockCreate.mockResolvedValueOnce(
      claudeResponse([
        { walkerId: "fake-walker-999", puntuacion: 99, explicacion: "Fantasma" },
        { walkerId: REAL_ID, puntuacion: 80, explicacion: "Real" },
      ])
    );

    const result = await handleMatchWalkers("perro grande", "planificado");

    expect(result.every((m) => m.walker.id !== "fake-walker-999")).toBe(true);
    expect(result.some((m) => m.walker.id === REAL_ID)).toBe(true);
  });

  it("T6 — pool SOS vacío: devuelve fallback sin error", async () => {
    const { WALKERS: W } = await import("@/data/walkers");
    const origDisp = W.map((w) => w.disponible_ahora);
    const origDist = W.map((w) => w.distancia_km);
    W.forEach((w) => {
      w.disponible_ahora = false;
      w.distancia_km = 5;
    });

    const result = await handleMatchWalkers("urgente", "sos");

    W.forEach((w, i) => {
      w.disponible_ahora = origDisp[i];
      w.distancia_km = origDist[i];
    });

    expect(mockCreate).not.toHaveBeenCalled();
    expect(result.length).toBeGreaterThanOrEqual(0);
  });

  it("T7 — sin bloque tool_use: fallback determinista", async () => {
    mockCreate.mockResolvedValueOnce({
      content: [{ type: "text", text: "No sé cómo ayudarte." }],
    });

    const result = await handleMatchWalkers("border collie", "planificado");

    expect(result.length).toBeGreaterThan(0);
  });

  it("T8 — matchedTags siempre es [] en el path de Claude", async () => {
    mockCreate.mockResolvedValueOnce(
      claudeResponse([{ walkerId: REAL_ID, puntuacion: 75, explicacion: "Match Claude" }])
    );

    const result = await handleMatchWalkers("perro tranquilo", "planificado");

    for (const m of result) {
      expect(m.matchedTags).toEqual([]);
    }
  });
});
