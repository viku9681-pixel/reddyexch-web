import { NextResponse } from 'next/server'
import { writeAuditLog } from '@/lib/audit-log'
import { cookies } from 'next/headers'

export async function POST() {
  const cookieStore = await cookies()

  // Set age_verified cookie — HttpOnly, Secure, SameSite=Strict
  cookieStore.set('age_verified', '1', {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    path: '/',
    maxAge: 60 * 60 * 24 * 365, // 1 year
  })

  // Clear the age gate prompt cookie
  cookieStore.delete('needs_age_gate')

  // Write compliance log
  await writeAuditLog({
    action: 'age_gate_confirmed',
    resourceType: 'session',
    resourceId: 'age_gate',
  })

  return NextResponse.json({ success: true }, { status: 200 })
}
