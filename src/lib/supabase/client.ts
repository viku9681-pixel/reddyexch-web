import { createBrowserClient } from '@supabase/ssr'

/**
 * Browser-side Supabase client — uses anon key with RLS enforced.
 * Safe to use in Client Components.
 * NEVER use service role key here.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
