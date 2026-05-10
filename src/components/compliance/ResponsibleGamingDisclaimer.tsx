/**
 * Static responsible gaming disclaimer.
 * No 'use client' — renders as static HTML in SSR output.
 * Compliant language: no "betting" or "gambling" terms.
 */
export default function ResponsibleGamingDisclaimer() {
  return (
    <p role="note" className="text-white/50 text-xs text-center mt-4">
      ReddyExch provides gaming IDs for online sports prediction and fantasy participation
      platforms. This is not a gaming or gambling service.
    </p>
  )
}
