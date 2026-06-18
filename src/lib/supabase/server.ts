import { createClient } from "@supabase/supabase-js";

import { getServerConfig } from "@/lib/config.server";
import type { Database } from "@/lib/database.types";

// Server-only Supabase client using the SERVICE ROLE key, which bypasses RLS.
// MUST only be imported from server code (`*.server.ts` modules or
// `createServerFn` handlers) so it is tree-shaken out of the client bundle.
// Importing this from a component would leak the service-role key to the
// browser — never do that.
//
// Read env per-request (not at module scope): on serverless/edge runtimes
// env binds at request time. See config.server.ts for the rationale.

export function getSupabaseAdmin() {
  const url = process.env.VITE_SUPABASE_URL;
  const { supabaseServiceRoleKey } = getServerConfig();

  if (!url || !supabaseServiceRoleKey) {
    throw new Error(
      "Faltan VITE_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY (servidor).",
    );
  }

  return createClient<Database>(url, supabaseServiceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
