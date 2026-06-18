import { loadEnv } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

// Carga .env (incluidas las vars sin prefijo VITE_, como SUPABASE_SERVICE_ROLE_KEY)
// y las inyecta en process.env para los tests de integración.
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  for (const k of [
    "VITE_SUPABASE_URL",
    "VITE_SUPABASE_ANON_KEY",
    "SUPABASE_SERVICE_ROLE_KEY",
    "ANTHROPIC_API_KEY",
  ]) {
    if (env[k] && !process.env[k]) process.env[k] = env[k];
  }

  return {
    plugins: [tsconfigPaths()],
    test: {
      environment: "node",
      include: ["src/**/*.test.ts"],
    },
  };
});
