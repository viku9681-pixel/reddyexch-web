'use client'

import { useEffect, useState } from 'react'
import AgeGate from './AgeGate'
import GeoBlocker from './GeoBlocker'

type ComplianceState = 'loading' | 'geo_blocked' | 'needs_age_gate' | 'clear'

/**
 * Reads compliance cookies on mount and renders the appropriate modal.
 * Cookies are set by middleware:
 *   geo_blocked=1    → render GeoBlocker (no dismiss)
 *   needs_age_gate=1 → render AgeGate
 */
export default function ComplianceOrchestrator() {
  const [state, setState] = useState<ComplianceState>('loading')
  const [exitUrl] = useState('https://www.google.com')

  useEffect(() => {
    // Read cookies from document.cookie (needs_age_gate is not HttpOnly)
    const cookies = Object.fromEntries(
      document.cookie.split('; ').map((c) => {
        const [key, ...rest] = c.split('=')
        return [key.trim(), rest.join('=')]
      })
    )

    if (cookies['geo_blocked'] === '1') {
      setState('geo_blocked')
    } else if (cookies['needs_age_gate'] === '1') {
      // Fetch exit URL from platform config
      fetch('/api/geo-check')
        .catch(() => null)
        .finally(() => {
          setState('needs_age_gate')
        })
    } else {
      setState('clear')
    }
  }, [])

  if (state === 'loading' || state === 'clear') return null

  if (state === 'geo_blocked') {
    return (
      <GeoBlocker
        blockedJurisdictions={[
          { countryCode: 'IN', regionCode: 'IN-TG' },
          { countryCode: 'IN', regionCode: 'IN-AP' },
        ]}
      />
    )
  }

  if (state === 'needs_age_gate') {
    return (
      <AgeGate
        exitUrl={exitUrl}
        onConfirm={() => setState('clear')}
        onDecline={() => {
          // Redirect handled inside AgeGate
        }}
      />
    )
  }

  return null
}
