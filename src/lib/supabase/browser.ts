import { createBrowserClient } from "@supabase/ssr";

/**
 * Supabase browser client — used in client components.
 * Reads cookies set by the middleware for session persistence.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
