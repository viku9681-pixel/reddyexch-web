import { createServiceClient } from '@/lib/supabase/server'

/**
 * Fetches the live WhatsApp number from platform_config.
 * Falls back to the env var, then to a safe placeholder.
 * Used in Server Components so the number is baked into the HTML at render time —
 * no client-side fetch, no hydration race condition.
 */
export async function getWhatsAppNumber(): Promise<string> {
  try {
    const service = createServiceClient()
    const { data } = await service
      .from('platform_config')
      .select('value')
      .eq('key', 'whatsapp_number')
      .single()

    if (data?.value) return data.value
  } catch { /* fall through */ }

  return process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '+919999999999'
}
