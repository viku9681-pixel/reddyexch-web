import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/admin/login')

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* Top nav */}
      <header className="border-b border-white/10 px-6 py-3 flex items-center justify-between sticky top-0 z-40 bg-black">
        <div className="flex items-center gap-6">
          <Link href="/admin" className="font-bold text-lg">
            Reddy<span className="text-red-500">Exch</span>
            <span className="text-white/30 text-xs ml-2 font-normal">Admin</span>
          </Link>
          <nav className="hidden md:flex items-center gap-1">
            {[
              { href: '/admin/content',      label: '📝 Content' },
              { href: '/admin/analytics',    label: '📊 Analytics' },
              { href: '/admin/rank-tracker', label: '📈 Rankings' },
              { href: '/admin/audit-log',    label: '🔍 Audit Log' },
              { href: '/admin/config',       label: '⚙️ Config' },
              { href: '/admin/widgets',      label: '🧩 Widgets' },
            ].map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="text-white/60 hover:text-white text-sm px-3 py-1.5 rounded-lg hover:bg-white/10 transition-colors"
              >
                {label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-white/40 text-xs hidden md:block">{user.email}</span>
          <Link href="/" target="_blank" className="text-white/40 hover:text-white text-xs">↗ Site</Link>
          <form action="/api/admin/auth/logout" method="POST">
            <button type="submit" className="text-white/40 hover:text-white text-xs">Sign out</button>
          </form>
        </div>
      </header>
      <main className="flex-1">{children}</main>
    </div>
  )
}
