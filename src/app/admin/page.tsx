import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export const metadata = {
  title: 'Admin Dashboard — ReddyExch',
  robots: { index: false, follow: false },
}

export default async function AdminDashboardPage() {
  // Auth gate — redirect to login if not authenticated
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/admin/login')
  }

  const quickLinks = [
    {
      href: '/admin/content',
      icon: '📝',
      title: 'Content Manager',
      desc: 'Create, edit, and publish keyword landing pages',
    },
    {
      href: '/admin/rank-tracker',
      icon: '📈',
      title: 'Rank Tracker',
      desc: 'Monitor keyword positions in Google Search',
    },
    {
      href: '/admin/audit-log',
      icon: '🔍',
      title: 'Audit Log',
      desc: 'View compliance and admin action history',
    },
    {
      href: '/admin/config',
      icon: '⚙️',
      title: 'Platform Config',
      desc: 'Manage WhatsApp number, exit URL, and settings',
    },
    {
      href: '/admin/analytics',
      icon: '📊',
      title: 'Analytics',
      desc: 'View traffic, conversions, and funnel data',
    },
    {
      href: '/admin/widgets',
      icon: '🧩',
      title: 'Widgets',
      desc: 'Configure CricTime, Instagram, and WhatsApp A/B',
    },
  ]

  return (
    <main className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="border-b border-white/10 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="font-bold text-xl">
            Reddy<span className="text-red">Exch</span>
          </span>
          <span className="text-white/30 text-sm">Admin</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-white/50 text-sm">{user.email}</span>
          <form action="/api/admin/auth/logout" method="POST">
            <button
              type="submit"
              className="text-white/50 hover:text-white text-sm transition-colors"
            >
              Sign out
            </button>
          </form>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-10">
        {/* Welcome */}
        <div className="mb-10">
          <h1 className="text-2xl font-bold text-white mb-1">
            Welcome back
          </h1>
          <p className="text-white/50 text-sm">
            {new Date().toLocaleDateString('en-IN', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {[
            { label: 'Published Pages', value: '—', note: 'Loading…' },
            { label: 'Total Events', value: '—', note: 'Loading…' },
            { label: 'Conversions Today', value: '—', note: 'Loading…' },
            { label: 'Avg. Position', value: '—', note: 'Loading…' },
          ].map(({ label, value, note }) => (
            <div
              key={label}
              className="bg-white/5 border border-white/10 rounded-2xl p-5"
            >
              <p className="text-white/50 text-xs font-medium uppercase tracking-wider mb-1">
                {label}
              </p>
              <p className="text-white text-2xl font-bold">{value}</p>
              <p className="text-white/30 text-xs mt-1">{note}</p>
            </div>
          ))}
        </div>

        {/* Quick Links */}
        <h2 className="text-white/70 text-sm font-semibold uppercase tracking-wider mb-4">
          Quick Access
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {quickLinks.map(({ href, icon, title, desc }) => (
            <Link
              key={href}
              href={href}
              className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 hover:border-white/20 transition-all group"
            >
              <div className="text-3xl mb-3" aria-hidden="true">
                {icon}
              </div>
              <h3 className="text-white font-semibold mb-1 group-hover:text-red transition-colors">
                {title}
              </h3>
              <p className="text-white/50 text-sm">{desc}</p>
            </Link>
          ))}
        </div>

        {/* View site link */}
        <div className="mt-10 pt-6 border-t border-white/10">
          <Link
            href="/"
            className="text-white/40 hover:text-white text-sm transition-colors"
            target="_blank"
            rel="noopener noreferrer"
          >
            ↗ View live site
          </Link>
        </div>
      </div>
    </main>
  )
}
