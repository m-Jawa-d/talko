import { createClient, SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | null = null;

export function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

export function getSupabase(): SupabaseClient {
  if (!isSupabaseConfigured()) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY"
    );
  }

  if (!client) {
    // Project root only — never include /rest/v1 or trailing paths
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!.replace(/\/+$/, "").replace(
      /\/rest\/v1$/i,
      ""
    );

    client = createClient(url, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
      realtime: {
        params: {
          eventsPerSecond: 20,
        },
      },
    });
  }

  return client;
}
