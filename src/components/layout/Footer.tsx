import Link from 'next/link'
import ResponsibleGamingModule from '@/components/compliance/ResponsibleGamingModule'

export default function Footer() {
  return (
    <footer className="bg-black text-white mt-16 px-4 py-12" role="contentinfo">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Brand */}
          <div>
            <Link href="/" className="text-white font-bold text-xl tracking-tight">
              Reddy<span className="text-red-500">Exch</span>
            </Link>
            <p className="text-white/50 text-sm mt-2 max-w-xs">
              Gaming IDs for online sports prediction and fantasy participation platforms.
            </p>
          </div>

          {/* Quick links */}
          <div>
            <h3 className="text-white/80 text-sm font-semibold mb-3 uppercase tracking-wider">
              Quick Links
            </h3>
            <ul className="space-y-2">
              {[
                { href: '/keyword/online-cricket-id',   label: 'Online Cricket ID' },
                { href: '/keyword/whatsapp-cricket-id', label: 'WhatsApp Cricket ID' },
                { href: '/keyword/instant-cricket-id',  label: 'Instant Cricket ID' },
                { href: '/keyword/cricket-betting-id',  label: 'Cricket Gaming ID' },
              ].map(({ href, label }) => (
                <li key={href}>
                  <Link href={href} className="text-white/50 hover:text-white text-sm transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-white/80 text-sm font-semibold mb-3 uppercase tracking-wider">
              Legal
            </h3>
            <ul className="space-y-2">
              {[
                { href: '/terms',               label: 'Terms & Conditions' },
                { href: '/privacy-policy',      label: 'Privacy Policy' },
                { href: '/responsible-gaming',  label: 'Responsible Gaming' },
              ].map(({ href, label }) => (
                <li key={href}>
                  <Link href={href} className="text-white/50 hover:text-white text-sm transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Responsible Gaming Module — always visible */}
        <ResponsibleGamingModule />

        {/* Copyright */}
        <p className="text-white/30 text-xs mt-6 text-center">
          © {new Date().getFullYear()} ReddyExch. All rights reserved.
          ReddyExch provides gaming IDs for online sports prediction and fantasy participation platforms.
          This is not a betting or gambling service.
        </p>
      </div>
    </footer>
  )
}
