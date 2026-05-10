import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

import { createClient } from '@supabase/supabase-js'

/**
 * Server-side Supabase client — uses service role key for privileged operations.
 * NEVER expose SUPABASE_SERVICE_ROLE_KEY to the client.
 * Use only in Server Components, API Routes, and Server Actions.
 */
export function createServiceClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Missing Supabase service role environment variables')
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  })
}

/**
 * Server-side Supabase client — uses anon key with RLS enforced.
 * Use for Server Components that should respect row-level security.
 */
export async function createServerSupabaseClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // setAll called from Server Component — cookies can't be set
            // This is fine for read-only server components
          }
        },
      },
    }
  )
}
