'use client'

import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import type { GeoBlockerProps } from '@/types'

export default function GeoBlocker({ countryCode, regionCode }: GeoBlockerProps) {
  const modalRef = useRef<HTMLDivElement>(null)

  // Focus the modal on mount
  useEffect(() => {
    modalRef.current?.focus()
  }, [])

  // Focus trap: keep focus inside the modal
  useEffect(() => {
    const modal = modalRef.current
    if (!modal) return

    const focusableSelectors =
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return

      const focusable = Array.from(
        modal.querySelectorAll<HTMLElement>(focusableSelectors)
      ).filter((el) => !el.hasAttribute('disabled'))

      if (focusable.length === 0) {
        e.preventDefault()
        return
      }

      const first = focusable[0]
      const last = focusable[focusable.length - 1]

      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault()
          last.focus()
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  const regionLabel =
    regionCode === 'IN-TG'
      ? 'Telangana'
      : regionCode === 'IN-AP'
        ? 'Andhra Pradesh'
        : regionCode ?? countryCode ?? 'your region'

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/95 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="geo-blocker-title"
      aria-describedby="geo-blocker-desc"
    >
      <motion.div
        ref={modalRef}
        tabIndex={-1}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className="bg-black border border-white/20 rounded-2xl p-8 max-w-md w-full mx-4 text-center shadow-2xl outline-none"
      >
        {/* Logo */}
        <div className="mb-6">
          <span className="text-white font-bold text-2xl tracking-tight">
            Reddy<span className="text-red">Exch</span>
          </span>
        </div>

        {/* Block icon */}
        <div className="w-16 h-16 bg-error/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#EF4444"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
          </svg>
        </div>

        <h2
          id="geo-blocker-title"
          className="text-white text-2xl font-bold mb-3"
        >
          Service Not Available
        </h2>

        <p
          id="geo-blocker-desc"
          className="text-white/70 text-sm mb-4"
        >
          ReddyExch is not available in <strong className="text-white">{regionLabel}</strong>.
        </p>

        <p className="text-white/50 text-xs">
          This service is not available in your region in compliance with local regulations.
          If you believe this is an error, please contact your network administrator.
        </p>
      </motion.div>
    </motion.div>
  )
}
