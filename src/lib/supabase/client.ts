import { createClient } from "@supabase/supabase-js";

import type { Database } from "@/lib/database.types";

// Browser Supabase client. Uses the PUBLIC url + anon/publishable key —
// safe to ship to the client because Row Level Security (RLS) governs what
// this key can read/write. Never import the service-role client here.
//
// For privileged writes (e.g. the treats ledger), use a server function
// with the server client in `@/lib/supabase/server` instead.

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  throw new Error(
    "Faltan VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY. Copia .env.example a .env.",
  );
}

export const supabase = createClient<Database>(url, anonKey);
