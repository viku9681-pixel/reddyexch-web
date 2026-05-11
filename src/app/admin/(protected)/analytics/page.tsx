'use client'

import { useState, useEffect } from 'react'

interface Summary {
  total_events: number
  page_views: number
  cta_clicks: number
  conversions: number
  top_pages: { page_url: string; clicks: number }[]
}

export default function AnalyticsPage() {
  const [data, setData] = useState<Summary | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/analytics/summary')
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const stat = (label: string, value: number | string) => (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
      <p className="text-white/50 text-xs font-medium uppercase tracking-wider mb-1">{label}</p>
      <p className="text-white text-3xl font-bold">{loading ? '—' : value}</p>
    </div>
  )

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <h1 className="text-2xl font-bold text-white mb-2">Analytics</h1>
      <p className="text-white/50 text-sm mb-8">Last 30 days</p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        {stat('Page Views', data?.page_views ?? 0)}
        {stat('WhatsApp Clicks', data?.cta_clicks ?? 0)}
        {stat('Conversions', data?.conversions ?? 0)}
        {stat('CTR', data && data.page_views > 0 ? `${((data.cta_clicks / data.page_views) * 100).toFixed(1)}%` : '0%')}
      </div>

      <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
        <h2 className="text-white font-semibold mb-4">Top Pages by WhatsApp Clicks</h2>
        {loading ? (
          <p className="text-white/30 text-sm">Loading…</p>
        ) : !data?.top_pages?.length ? (
          <p className="text-white/30 text-sm">No data yet. Analytics will appear once visitors start interacting.</p>
        ) : (
          <div className="space-y-3">
            {data.top_pages.map((p, i) => (
              <div key={i} className="flex items-center justify-between">
                <span className="text-white/70 text-sm truncate max-w-md">{p.page_url}</span>
                <span className="text-white font-semibold text-sm ml-4">{p.clicks} clicks</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-6 bg-white/5 border border-white/10 rounded-2xl p-6">
        <h2 className="text-white font-semibold mb-2">Google Analytics 4</h2>
        <p className="text-white/50 text-sm">
          Full analytics available in your GA4 dashboard. Update your GA4 Measurement ID in{' '}
          <a href="/admin/config" className="text-red-400 hover:underline">Platform Config</a>.
        </p>
      </div>
    </div>
  )
}
