import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/server'
import { createHash } from 'crypto'

export async function GET() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const service = createServiceClient()
  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()

  const { data: logs } = await service
    .from('compliance_logs')
    .select('id, action, resource_type, resource_id, timestamp, user_id')
    .gte('timestamp', since)
    .order('timestamp', { ascending: false })

  // Build CSV — anonymise user_id as SHA-256 hash
  const rows = ['id,timestamp,action,resource_type,resource_id,user_id_hash']
  for (const log of logs ?? []) {
    const hash = log.user_id
      ? createHash('sha256').update(log.user_id).digest('hex').slice(0, 16)
      : 'anonymous'
    rows.push(`${log.id},"${log.timestamp}","${log.action}","${log.resource_type}","${log.resource_id}","${hash}"`)
  }

  const csv = rows.join('\n')
  const date = new Date().toISOString().slice(0, 10)

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="compliance-export-${date}.csv"`,
    },
  })
}
