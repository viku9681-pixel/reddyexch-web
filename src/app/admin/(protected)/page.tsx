import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/server'

export const metadata = {
  title: 'Admin Dashboard — ReddyExch',
  robots: { index: false, follow: false },
}

export default async function AdminDashboardPage() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/admin/login')

  // Real stats
  const service = createServiceClient()
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()

  const [pagesRes, eventsRes, ctaRes] = await Promise.all([
    service.from('content_pages').select('id', { count: 'exact', head: true }).eq('status', 'published'),
    service.from('analytics_events').select('id', { count: 'exact', head: true }).eq('event', 'page_view').gte('timestamp', since),
    service.from('analytics_events').select('id', { count: 'exact', head: true }).eq('event', 'whatsapp_cta_click').gte('timestamp', since),
  ])

  const stats = [
    { label: 'Published Pages', value: String(pagesRes.count ?? 0), note: 'Live on site' },
    { label: 'Page Views Today', value: String(eventsRes.count ?? 0), note: 'Last 24 hours' },
    { label: 'WhatsApp Clicks Today', value: String(ctaRes.count ?? 0), note: 'Last 24 hours' },
    { label: 'Keywords Tracked', value: '30', note: 'In rank tracker' },
  ]

  const quickLinks = [
    { href: '/admin/content',      icon: '📝', title: 'Content Manager',  desc: 'Create, edit, and publish keyword landing pages' },
    { href: '/admin/analytics',    icon: '📊', title: 'Analytics',        desc: 'View traffic, conversions, and funnel data' },
    { href: '/admin/rank-tracker', icon: '📈', title: 'Rank Tracker',     desc: 'Monitor keyword positions in Google Search' },
    { href: '/admin/audit-log',    icon: '🔍', title: 'Audit Log',        desc: 'View compliance and admin action history' },
    { href: '/admin/config',       icon: '⚙️', title: 'Platform Config',  desc: 'Manage WhatsApp number, analytics, and settings' },
    { href: '/admin/widgets',      icon: '🧩', title: 'Widgets',          desc: 'Configure WhatsApp CTA, live scores, Instagram' },
  ]

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <div className="mb-10">
        <h1 className="text-2xl font-bold text-white mb-1">Welcome back</h1>
        <p className="text-white/50 text-sm">
          {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          {' · '}{user.email}
        </p>
      </div>

      {/* Live Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        {stats.map(({ label, value, note }) => (
          <div key={label} className="bg-white/5 border border-white/10 rounded-2xl p-5">
            <p className="text-white/50 text-xs font-medium uppercase tracking-wider mb-1">{label}</p>
            <p className="text-white text-3xl font-bold">{value}</p>
            <p className="text-white/30 text-xs mt-1">{note}</p>
          </div>
        ))}
      </div>

      {/* Quick Links */}
      <h2 className="text-white/70 text-sm font-semibold uppercase tracking-wider mb-4">Quick Access</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {quickLinks.map(({ href, icon, title, desc }) => (
          <Link
            key={href}
            href={href}
            className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 hover:border-white/20 transition-all group"
          >
            <div className="text-3xl mb-3" aria-hidden="true">{icon}</div>
            <h3 className="text-white font-semibold mb-1 group-hover:text-red-400 transition-colors">{title}</h3>
            <p className="text-white/50 text-sm">{desc}</p>
          </Link>
        ))}
      </div>

      <div className="mt-10 pt-6 border-t border-white/10 flex items-center gap-6">
        <Link href="/" target="_blank" className="text-white/40 hover:text-white text-sm transition-colors">
          ↗ View live site
        </Link>
        <a href="/api/admin/compliance/export" className="text-white/40 hover:text-white text-sm transition-colors">
          ↓ Export compliance log
        </a>
      </div>
    </div>
  )
}
