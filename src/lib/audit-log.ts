import { createServiceClient } from '@/lib/supabase/server'
import type { ComplianceAction, ComplianceResourceType } from '@/types'

interface AuditLogParams {
  userId?: string
  action: ComplianceAction
  resourceType: ComplianceResourceType
  resourceId: string
  beforeState?: Record<string, unknown>
  afterState?: Record<string, unknown>
}

/**
 * Writes an audit log entry to the compliance_logs table.
 * Uses the service role key (bypasses RLS).
 * Never throws — catches and logs all errors.
 */
export async function writeAuditLog(params: AuditLogParams): Promise<void> {
  try {
    const supabase = createServiceClient()

    const { error } = await supabase.from('compliance_logs').insert({
      user_id: params.userId ?? null,
      action: params.action,
      resource_type: params.resourceType,
      resource_id: params.resourceId,
      before_state: params.beforeState ?? null,
      after_state: params.afterState ?? null,
    })

    if (error) {
      console.error('[audit-log] Failed to write audit log:', error.message)
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('[audit-log] Unexpected error writing audit log:', message)
  }
}
