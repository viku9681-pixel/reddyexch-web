'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface Page {
  id: string
  slug: string
  title: string
  status: string
  page_type: string
  seo_score: number | null
  published_at: string | null
  updated_at: string
}

export default function ContentManagerPage() {
  const [pages, setPages] = useState<Page[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    fetch('/api/admin/pages')
      .then(r => r.json())
      .then(data => { setPages(data.pages ?? []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const filtered = filter === 'all' ? pages : pages.filter(p => p.status === filter)

  const statusColor = (s: string) => ({
    published: 'bg-green-500/20 text-green-400',
    draft: 'bg-white/10 text-white/50',
    scheduled: 'bg-yellow-500/20 text-yellow-400',
    unpublished: 'bg-red-500/20 text-red-400',
  }[s] ?? 'bg-white/10 text-white/50')

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Content Manager</h1>
          <p className="text-white/50 text-sm mt-1">{pages.length} pages total</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/admin/content/calendar" className="text-white/50 hover:text-white text-sm px-3 py-2 rounded-lg hover:bg-white/10 transition-colors">
            📅 Calendar
          </Link>
          <Link
            href="/admin/content/new"
            className="bg-red-500 text-white text-sm font-semibold px-4 py-2 rounded-xl hover:bg-red-600 transition-colors"
          >
            + New Page
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6">
        {['all', 'published', 'draft', 'scheduled', 'unpublished'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`text-xs px-3 py-1.5 rounded-full capitalize transition-colors ${
              filter === f ? 'bg-white text-black font-semibold' : 'bg-white/10 text-white/60 hover:bg-white/20'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-white/40 text-sm py-20 text-center">Loading pages…</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-white/40 text-sm mb-4">No pages found.</p>
          <Link href="/admin/content/new" className="text-red-400 text-sm hover:underline">
            Create your first page →
          </Link>
        </div>
      ) : (
        <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left text-white/40 font-medium px-4 py-3">Title</th>
                <th className="text-left text-white/40 font-medium px-4 py-3 hidden md:table-cell">Type</th>
                <th className="text-left text-white/40 font-medium px-4 py-3">Status</th>
                <th className="text-left text-white/40 font-medium px-4 py-3 hidden md:table-cell">SEO</th>
                <th className="text-left text-white/40 font-medium px-4 py-3 hidden lg:table-cell">Updated</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(page => (
                <tr key={page.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="px-4 py-3">
                    <div className="text-white font-medium truncate max-w-xs">{page.title}</div>
                    <div className="text-white/30 text-xs mt-0.5">/{page.slug}</div>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <span className="text-white/50 text-xs capitalize">{page.page_type?.replace('_', ' ')}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded-full capitalize ${statusColor(page.status)}`}>
                      {page.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    {page.seo_score != null ? (
                      <span className={`text-xs font-bold ${page.seo_score >= 70 ? 'text-green-400' : page.seo_score >= 50 ? 'text-yellow-400' : 'text-red-400'}`}>
                        {page.seo_score}/100
                      </span>
                    ) : <span className="text-white/20 text-xs">—</span>}
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    <span className="text-white/30 text-xs">
                      {new Date(page.updated_at).toLocaleDateString('en-IN')}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/admin/content/${page.id}`}
                        className="text-white/50 hover:text-white text-xs px-2 py-1 rounded-lg hover:bg-white/10 transition-colors"
                      >
                        Edit
                      </Link>
                      <Link
                        href={page.page_type === 'keyword_landing' ? `/keyword/${page.slug}` : `/${page.slug}`}
                        target="_blank"
                        className="text-white/30 hover:text-white text-xs"
                      >
                        ↗
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
