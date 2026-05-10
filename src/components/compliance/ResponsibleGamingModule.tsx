import Link from 'next/link'

export default function ResponsibleGamingModule() {
  return (
    <div className="border-t border-white/10 pt-6 mt-6" role="complementary" aria-label="Responsible Gaming">
      {/* Play Responsibly Badge — must never be hidden */}
      <div className="flex items-center gap-2 mb-3">
        <span
          className="inline-flex items-center gap-1.5 bg-success/10 text-success text-xs font-semibold px-3 py-1.5 rounded-full border border-success/20"
          aria-label="Play Responsibly badge"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
          </svg>
          Play Responsibly
        </span>
      </div>

      {/* Age disclaimer */}
      <p className="text-white/60 text-xs mb-2">
        This platform is for users 18 years and older.
      </p>

      {/* Helpline */}
      <p className="text-white/60 text-xs mb-2">
        Problem gambling helpline:{' '}
        <a href="tel:9152987821" className="text-success hover:underline">
          iCall: 9152987821
        </a>
      </p>

      {/* Links */}
      <div className="flex flex-wrap gap-3 text-xs">
        <Link href="/responsible-gaming" className="text-white/50 hover:text-white transition-colors">
          Responsible Gaming
        </Link>
        <Link href="/terms" className="text-white/50 hover:text-white transition-colors">
          Terms &amp; Conditions
        </Link>
        <Link href="/privacy-policy" className="text-white/50 hover:text-white transition-colors">
          Privacy Policy
        </Link>
        <a
          href="https://aigf.in"
          target="_blank"
          rel="noopener noreferrer"
          className="text-white/50 hover:text-white transition-colors"
        >
          AIGF Guidelines
        </a>
      </div>
    </div>
  )
}
