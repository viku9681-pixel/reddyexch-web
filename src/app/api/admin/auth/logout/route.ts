import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function POST() {
  const cookieStore = await cookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        },
      },
    }
  )

  await supabase.auth.signOut()

  // Clear the session cookie explicitly
  const response = NextResponse.json({ success: true }, { status: 200 })

  // Supabase SSR handles cookie clearing via setAll above,
  // but we also clear the sb-* cookies manually as a safety measure
  const allCookies = cookieStore.getAll()
  for (const cookie of allCookies) {
    if (cookie.name.startsWith('sb-')) {
      response.cookies.delete(cookie.name)
    }
  }

  return response
}
