'use client'

import Link from 'next/link'
import { useState } from 'react'
import NavWhatsAppCTA from './NavWhatsAppCTA'

interface StickyNavProps {
  phone: string
}

export default function StickyNav({ phone }: StickyNavProps) {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <nav
      className="sticky top-0 z-50 bg-black border-b border-white/10 backdrop-blur-sm"
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-16">
        {/* Logo */}
        <Link
          href="/"
          className="text-white font-bold text-xl tracking-tight interactive"
          aria-label="ReddyExch — Home"
        >
          Reddy<span className="text-red-500">Exch</span>
        </Link>

        {/* Desktop nav links */}
        <div className="hidden md:flex items-center gap-6">
          <Link href="/" className="text-white/80 hover:text-white text-sm transition-colors">
            Home
          </Link>
          <Link href="/keyword/online-cricket-id" className="text-white/80 hover:text-white text-sm transition-colors">
            Cricket ID
          </Link>
          <Link href="/keyword/whatsapp-cricket-id" className="text-white/80 hover:text-white text-sm transition-colors">
            WhatsApp ID
          </Link>
          <Link href="/responsible-gaming" className="text-white/80 hover:text-white text-sm transition-colors">
            Responsible Gaming
          </Link>
        </div>

        {/* Desktop WhatsApp CTA */}
        <div className="hidden md:block">
          <NavWhatsAppCTA phone={phone} />
        </div>

        {/* Mobile: hamburger + WhatsApp icon */}
        <div className="flex md:hidden items-center gap-3">
          <NavWhatsAppCTA mobile phone={phone} />
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="text-white p-2 interactive"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              {menuOpen ? (
                <>
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </>
              ) : (
                <>
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </>
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-black border-t border-white/10 px-4 py-4 flex flex-col gap-4">
          <Link href="/" className="text-white/80 hover:text-white text-sm" onClick={() => setMenuOpen(false)}>
            Home
          </Link>
          <Link href="/keyword/online-cricket-id" className="text-white/80 hover:text-white text-sm" onClick={() => setMenuOpen(false)}>
            Cricket ID
          </Link>
          <Link href="/keyword/whatsapp-cricket-id" className="text-white/80 hover:text-white text-sm" onClick={() => setMenuOpen(false)}>
            WhatsApp ID
          </Link>
          <Link href="/responsible-gaming" className="text-white/80 hover:text-white text-sm" onClick={() => setMenuOpen(false)}>
            Responsible Gaming
          </Link>
        </div>
      )}
    </nav>
  )
}
