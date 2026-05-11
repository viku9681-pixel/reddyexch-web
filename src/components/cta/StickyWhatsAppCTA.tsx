'use client'

import { usePathname } from 'next/navigation'
import { useEffect, useRef } from 'react'

interface Props {
  /** Phone number in E.164 format, e.g. "+919876543210". Passed from server layout. */
  phone: string
}

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://reddyexchgaming.com'

function getSessionId(): string {
  try {
    const stored = sessionStorage.getItem('reddyexch_session_id')
    if (stored) return stored
    const id = crypto.randomUUID()
    sessionStorage.setItem('reddyexch_session_id', id)
    return id
  } catch { return 'anon' }
}

export default function StickyWhatsAppCTA({ phone }: Props) {
  const pathname = usePathname()
  const linkRef = useRef<HTMLAnchorElement>(null)
  const digits = phone.replace(/\D/g, '')

  useEffect(() => {
    if (!linkRef.current) return
    const message = encodeURIComponent(`Hi, I want to get my Gaming ID — ${SITE_URL}${pathname}`)
    const isMobile = /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent)
    linkRef.current.href = isMobile
      ? `https://wa.me/${digits}?text=${message}`
      : `https://web.whatsapp.com/send?phone=${digits}&text=${message}`
  }, [pathname, digits])

  const handleClick = () => {
    try {
      fetch('/api/analytics/event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: 'whatsapp_cta_click',
          page_url: `${SITE_URL}${pathname}`,
          session_id: getSessionId(),
          device_type: /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent) ? 'mobile' : 'desktop',
          cta_position: 'sticky-footer',
          timestamp: new Date().toISOString(),
        }),
      }).catch(() => null)
    } catch { /* never block */ }
  }

  // Default href for SSR — mobile URL (most traffic is mobile)
  const defaultMessage = encodeURIComponent(`Hi, I want to get my Gaming ID — ${SITE_URL}`)
  const defaultHref = `https://wa.me/${digits}?text=${defaultMessage}`

  return (
    <a
      ref={linkRef}
      href={defaultHref}
      target="_blank"
      rel="noopener noreferrer"
      onClick={handleClick}
      className="wa-cta-sticky fixed bottom-6 right-4 z-40 flex flex-col items-center gap-1 bg-red-500 text-white rounded-full px-4 py-3 shadow-2xl interactive hover:bg-red-600 transition-colors"
      aria-label="Get Cricket ID on WhatsApp — Get your ID in 5 minutes"
    >
      <div className="flex items-center gap-2">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
        <span className="font-semibold text-sm">Get Cricket ID</span>
      </div>
      <span className="text-xs text-white/80">Get your ID in 5 minutes</span>
    </a>
  )
}
