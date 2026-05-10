'use client'

import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import { buildEvent } from '@/lib/analytics'
import { AnalyticsQueue } from '@/lib/analytics-queue'

const GA4_ID = process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID ?? ''
const RETRY_INTERVAL_MS = 30_000
const SCROLL_DEPTHS = [25, 50, 75, 100] as const

function generateSessionId(): string {
  try {
    const stored = sessionStorage.getItem('reddyexch_session_id')
    if (stored) return stored
    const id = crypto.randomUUID()
    sessionStorage.setItem('reddyexch_session_id', id)
    return id
  } catch {
    return 'anon-' + Math.random().toString(36).slice(2)
  }
}

async function sendEvent(event: ReturnType<typeof buildEvent>): Promise<boolean> {
  try {
    const res = await fetch('/api/analytics/event', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(event),
    })
    return res.ok
  } catch {
    return false
  }
}

async function flushQueue(queue: AnalyticsQueue): Promise<void> {
  const events = queue.dequeue()
  if (events.length === 0) return

  try {
    const res = await fetch('/api/analytics/batch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(events),
    })
    if (!res.ok) {
      // Re-enqueue failed events
      events.forEach((e) => queue.enqueue(e))
    }
  } catch {
    // Re-enqueue on network failure
    events.forEach((e) => queue.enqueue(e))
  }
}

/**
 * Client-side analytics tracker.
 * - Fires page_view on mount
 * - Tracks scroll depth (25/50/75/100%)
 * - Loads GA4 gtag.js async (non-render-blocking)
 * - Retries offline queue every 30 seconds
 */
export default function AnalyticsTracker() {
  const pathname = usePathname()
  const queueRef = useRef<AnalyticsQueue | null>(null)
  const sessionIdRef = useRef<string>('')
  const firedDepthsRef = useRef<Set<number>>(new Set())
  const retryTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Initialize on mount
  useEffect(() => {
    const init = () => {
      queueRef.current = new AnalyticsQueue()
      sessionIdRef.current = generateSessionId()

      // Load GA4 script async
      if (GA4_ID && !document.getElementById('ga4-script')) {
        const script = document.createElement('script')
        script.id = 'ga4-script'
        script.src = `https://www.googletagmanager.com/gtag/js?id=${GA4_ID}`
        script.async = true
        document.head.appendChild(script)

        // Initialize gtag
        const inlineScript = document.createElement('script')
        inlineScript.textContent = `
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA4_ID}', { send_page_view: false });
        `
        document.head.appendChild(inlineScript)
      }

      // Start offline queue retry loop
      retryTimerRef.current = setInterval(() => {
        if (queueRef.current && navigator.onLine) {
          flushQueue(queueRef.current)
        }
      }, RETRY_INTERVAL_MS)
    }

    // Use requestIdleCallback if available, otherwise setTimeout
    if ('requestIdleCallback' in window) {
      requestIdleCallback(init, { timeout: 2000 })
    } else {
      setTimeout(init, 100)
    }

    return () => {
      if (retryTimerRef.current) clearInterval(retryTimerRef.current)
    }
  }, [])

  // Fire page_view on route change
  useEffect(() => {
    if (!sessionIdRef.current) return

    firedDepthsRef.current = new Set()

    const event = buildEvent('page_view', {
      page_url: window.location.href,
      session_id: sessionIdRef.current,
      timestamp: new Date().toISOString(),
    })

    sendEvent(event).then((ok) => {
      if (!ok && queueRef.current) {
        queueRef.current.enqueue(event)
      }
    })

    // GA4 page view
    if (GA4_ID && typeof window !== 'undefined' && 'gtag' in window) {
      ;(window as unknown as { gtag: (...args: unknown[]) => void }).gtag(
        'event',
        'page_view',
        { page_path: pathname }
      )
    }
  }, [pathname])

  // Scroll depth tracking
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY
      const docHeight = document.documentElement.scrollHeight - window.innerHeight
      if (docHeight <= 0) return

      const scrollPercent = Math.round((scrollTop / docHeight) * 100)

      for (const depth of SCROLL_DEPTHS) {
        if (scrollPercent >= depth && !firedDepthsRef.current.has(depth)) {
          firedDepthsRef.current.add(depth)

          const event = buildEvent('content_page_scroll_depth', {
            page_url: window.location.href,
            session_id: sessionIdRef.current,
            scroll_depth: depth,
            timestamp: new Date().toISOString(),
          })

          sendEvent(event).then((ok) => {
            if (!ok && queueRef.current) {
              queueRef.current.enqueue(event)
            }
          })
        }
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [pathname])

  // No DOM output
  return null
}
