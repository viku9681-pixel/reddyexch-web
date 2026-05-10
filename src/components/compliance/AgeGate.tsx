'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import type { AgeGateProps } from '@/types'

export default function AgeGate({ onConfirm, onDecline, exitUrl }: AgeGateProps) {
  const [visible, setVisible] = useState(true)
  const [loading, setLoading] = useState(false)
  const confirmRef = useRef<HTMLButtonElement>(null)
  const modalRef = useRef<HTMLDivElement>(null)

  // Focus the confirm button on mount
  useEffect(() => {
    confirmRef.current?.focus()
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

      if (focusable.length === 0) return

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

  const handleConfirm = async () => {
    setLoading(true)
    try {
      await fetch('/api/compliance/age-gate/confirm', { method: 'POST' })
      setVisible(false)
      onConfirm()
    } catch {
      // Fail open — allow user through
      setVisible(false)
      onConfirm()
    } finally {
      setLoading(false)
    }
  }

  const handleDecline = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/compliance/age-gate/decline', { method: 'POST' })
      const data = await res.json().catch(() => ({}))
      onDecline()
      window.location.href = data.exitUrl ?? exitUrl
    } catch {
      window.location.href = exitUrl
    } finally {
      setLoading(false)
    }
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="age-gate-title"
          aria-describedby="age-gate-desc"
        >
          <motion.div
            ref={modalRef}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="bg-black border border-white/20 rounded-2xl p-8 max-w-md w-full mx-4 text-center shadow-2xl"
          >
            {/* Logo */}
            <div className="mb-6">
              <span className="text-white font-bold text-2xl tracking-tight">
                Reddy<span className="text-red">Exch</span>
              </span>
            </div>

            {/* Age gate icon */}
            <div className="w-16 h-16 bg-red/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-red text-2xl font-bold">18+</span>
            </div>

            <h2
              id="age-gate-title"
              className="text-white text-2xl font-bold mb-3"
            >
              Age Verification Required
            </h2>

            <p
              id="age-gate-desc"
              className="text-white/70 text-sm mb-2"
            >
              This platform provides gaming IDs for online sports prediction and fantasy
              participation. You must be 18 years or older to continue.
            </p>

            <p className="text-white/50 text-xs mb-8">
              By continuing, you confirm you are 18+ and agree to our{' '}
              <Link href="/terms" className="text-red hover:underline">
                Terms &amp; Conditions
              </Link>{' '}
              and{' '}
              <Link href="/privacy-policy" className="text-red hover:underline">
                Privacy Policy
              </Link>
              .
            </p>

            <div className="flex flex-col gap-3">
              <button
                ref={confirmRef}
                onClick={handleConfirm}
                disabled={loading}
                className="w-full bg-red text-white font-semibold py-3 px-6 rounded-xl interactive disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Confirm I am 18 or older"
              >
                {loading ? 'Please wait…' : 'I am 18 or older — Continue'}
              </button>

              <button
                onClick={handleDecline}
                disabled={loading}
                className="w-full bg-white/10 text-white/70 font-medium py-3 px-6 rounded-xl hover:bg-white/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Exit — I am under 18"
              >
                Exit — I am under 18
              </button>
            </div>

            <p className="text-white/30 text-xs mt-6">
              ReddyExch provides gaming IDs for sports prediction platforms.
              This is not a gaming or gambling service.
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
