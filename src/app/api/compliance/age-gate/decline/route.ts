import { NextResponse } from 'next/server'
import { writeAuditLog } from '@/lib/audit-log'
import { getPlatformConfig } from '@/lib/config'

export async function POST() {
  // Write compliance log
  await writeAuditLog({
    action: 'age_gate_declined',
    resourceType: 'session',
    resourceId: 'age_gate',
  })

  // Get exit URL from platform config
  let exitUrl = 'https://www.google.com'
  try {
    const config = await getPlatformConfig()
    exitUrl = config.exitUrl
  } catch {
    // Use default exit URL
  }

  return NextResponse.json({ success: true, exitUrl }, { status: 200 })
}
