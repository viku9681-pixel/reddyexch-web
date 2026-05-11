'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface Page {
  id: string
  slug: string
  title: string
  status: string
  page_type: string
  scheduled_at: string | null
  published_at: string | null
  updated_at: string
}

const STATUS_COLOR: Record<string, string> = {
  published:   'bg-green-500/20 text-green-400 border-green-500/30',
  draft:       'bg-white/10 text-white/50 border-white/20',
  scheduled:   'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  unpublished: 'bg-red-500/20 text-red-400 border-red-500/30',
}

export default function ContentCalendarPage() {
  const [pages, setPages] = useState<Page[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/pages')
      .then(r => r.json())
      .then(d => { setPages(d.pages ?? []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  // Filter to rolling 90-day window
  const now = new Date()
  const windowStart = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
  const windowEnd   = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000)

  const inWindow = pages.filter(p => {
    const date = p.scheduled_at ?? p.published_at
    if (!date) return false
    const d = new Date(date)
    return d >= windowStart && d < windowEnd
  }).sort((a, b) => {
    const da = new Date(a.scheduled_at ?? a.published_at ?? 0).getTime()
    const db = new Date(b.scheduled_at ?? b.published_at ?? 0).getTime()
    return db - da
  })

  const drafts = pages.filter(p => p.status === 'draft')

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Content Calendar</h1>
          <p className="text-white/50 text-sm mt-1">Rolling 90-day window · {inWindow.length} pages</p>
        </div>
        <Link href="/admin/content/new" className="bg-red-500 text-white text-sm font-semibold px-4 py-2 rounded-xl hover:bg-red-600 transition-colors">
          + New Page
        </Link>
      </div>

      {loading ? (
        <div className="text-white/40 text-sm py-20 text-center">Loading…</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar timeline */}
          <div className="lg:col-span-2">
            <h2 className="text-white/60 text-xs font-semibold uppercase tracking-wider mb-4">Published & Scheduled (90-day window)</h2>
            {inWindow.length === 0 ? (
              <div className="bg-white/5 border border-white/10 rounded-2xl p-8 text-center">
                <p className="text-white/30 text-sm">No pages in the 90-day window.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {inWindow.map(page => {
                  const date = page.scheduled_at ?? page.published_at
                  return (
                    <div key={page.id} className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 flex items-center justify-between hover:bg-white/10 transition-colors">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="text-center min-w-[48px]">
                          <div className="text-white/30 text-xs">{date ? new Date(date).toLocaleDateString('en-IN', { month: 'short' }) : '—'}</div>
                          <div className="text-white font-bold text-lg leading-none">{date ? new Date(date).getDate() : '—'}</div>
                        </div>
                        <div className="min-w-0">
                          <p className="text-white text-sm font-medium truncate">{page.title}</p>
                          <p className="text-white/30 text-xs">/{page.slug}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 ml-3 flex-shrink-0">
                        <span className={`text-xs px-2 py-1 rounded-full border capitalize ${STATUS_COLOR[page.status] ?? STATUS_COLOR.draft}`}>
                          {page.status}
                        </span>
                        <Link href={`/admin/content/${page.id}`} className="text-white/40 hover:text-white text-xs px-2 py-1 rounded-lg hover:bg-white/10 transition-colors">
                          Edit
                        </Link>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Drafts sidebar */}
          <div>
            <h2 className="text-white/60 text-xs font-semibold uppercase tracking-wider mb-4">Drafts ({drafts.length})</h2>
            <div className="space-y-2">
              {drafts.length === 0 ? (
                <p className="text-white/30 text-sm">No drafts.</p>
              ) : drafts.map(page => (
                <div key={page.id} className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 hover:bg-white/10 transition-colors">
                  <p className="text-white text-sm font-medium truncate">{page.title}</p>
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-white/30 text-xs">/{page.slug}</p>
                    <Link href={`/admin/content/${page.id}`} className="text-red-400 text-xs hover:underline">Edit →</Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
