import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/server'
import { writeAuditLog } from '@/lib/audit-log'
import { invalidatePlatformConfig } from '@/lib/kv'

export async function GET() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const service = createServiceClient()
  const { data, error } = await service.from('platform_config').select('key, value')
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const config: Record<string, string> = {}
  for (const row of data ?? []) config[row.key] = row.value

  return NextResponse.json({ config })
}

export async function PUT(request: NextRequest) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let body: Record<string, string>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  // Validate WhatsApp number format if provided
  if (body.whatsapp_number) {
    const cleaned = body.whatsapp_number.replace(/\D/g, '')
    if (cleaned.length < 10 || cleaned.length > 15) {
      return NextResponse.json({ error: 'WhatsApp number must be 10–15 digits (E.164 format, e.g. +919876543210)' }, { status: 400 })
    }
    // Normalise to E.164
    body.whatsapp_number = `+${cleaned}`
  }

  const service = createServiceClient()

  // Get before state for audit log
  const { data: before } = await service.from('platform_config').select('key, value')
  const beforeMap: Record<string, string> = {}
  for (const row of before ?? []) beforeMap[row.key] = row.value

  const updates = Object.entries(body)
    .filter(([, value]) => value !== undefined && value !== null)
    .map(([key, value]) => ({
      key,
      value: String(value),
      updated_at: new Date().toISOString(),
    }))

  if (updates.length === 0) {
    return NextResponse.json({ error: 'No fields to update' }, { status: 400 })
  }

  const { error } = await service
    .from('platform_config')
    .upsert(updates, { onConflict: 'key' })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Invalidate KV cache so public /api/config picks up the new values immediately
  await invalidatePlatformConfig().catch(() => null)

  // Audit log
  await writeAuditLog({
    userId: user.id,
    action: 'config_change',
    resourceType: 'platform_config',
    resourceId: 'platform_config',
    beforeState: beforeMap,
    afterState: body,
  })

  return NextResponse.json({ success: true })
}
