import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const action = searchParams.get('action')
  const limit = parseInt(searchParams.get('limit') ?? '100')

  const service = createServiceClient()
  let query = service
    .from('compliance_logs')
    .select('id, action, resource_type, resource_id, timestamp, user_id')
    .order('timestamp', { ascending: false })
    .limit(limit)

  if (action) query = query.eq('action', action)

  const { data: logs, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ logs: logs ?? [] })
}
