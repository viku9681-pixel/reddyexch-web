'use client'

import { useState, useEffect } from 'react'

interface KeywordRank {
  id: string
  keyword: string
  slug: string
  tier: string
  position: number | null
  previous_position: number | null
  source: string
  recorded_at: string | null
}

export default function RankTrackerPage() {
  const [keywords, setKeywords] = useState<KeywordRank[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/admin/rank-tracker')
      .then(r => r.json())
      .then(d => { setKeywords(d.keywords ?? []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const updateRank = async (keywordId: string, position: number) => {
    setSaving(keywordId)
    await fetch('/api/admin/rank-tracker', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ keywordId, position, source: 'manual' }),
    })
    // Refresh
    const res = await fetch('/api/admin/rank-tracker')
    const d = await res.json()
    setKeywords(d.keywords ?? [])
    setSaving(null)
  }

  const tierBadge = (tier: string) => ({
    primary: 'bg-red-500/20 text-red-400',
    secondary: 'bg-blue-500/20 text-blue-400',
    long_tail: 'bg-white/10 text-white/50',
  }[tier] ?? 'bg-white/10 text-white/50')

  const delta = (curr: number | null, prev: number | null) => {
    if (curr == null || prev == null) return null
    return prev - curr // positive = improved (lower rank number = better)
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Rank Tracker</h1>
          <p className="text-white/50 text-sm mt-1">Track Google positions for all {keywords.length} target keywords</p>
        </div>
      </div>

      {loading ? (
        <div className="text-white/40 text-sm py-20 text-center">Loading keywords…</div>
      ) : (
        <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left text-white/40 font-medium px-4 py-3">Keyword</th>
                <th className="text-left text-white/40 font-medium px-4 py-3 hidden md:table-cell">Tier</th>
                <th className="text-left text-white/40 font-medium px-4 py-3">Position</th>
                <th className="text-left text-white/40 font-medium px-4 py-3 hidden md:table-cell">Change</th>
                <th className="text-left text-white/40 font-medium px-4 py-3">Update</th>
              </tr>
            </thead>
            <tbody>
              {keywords.map(kw => {
                const d = delta(kw.position, kw.previous_position)
                return (
                  <tr key={kw.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="px-4 py-3">
                      <div className="text-white font-medium">{kw.keyword}</div>
                      <div className="text-white/30 text-xs">/keyword/{kw.slug}</div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className={`text-xs px-2 py-1 rounded-full capitalize ${tierBadge(kw.tier)}`}>
                        {kw.tier.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {kw.position != null ? (
                        <span className="text-white font-bold text-lg">#{kw.position}</span>
                      ) : (
                        <span className="text-white/30 text-sm">Not tracked</span>
                      )}
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      {d != null ? (
                        <span className={`text-sm font-semibold ${d > 0 ? 'text-green-400' : d < 0 ? 'text-red-400' : 'text-white/40'}`}>
                          {d > 0 ? `↑ +${d}` : d < 0 ? `↓ ${d}` : '→ 0'}
                        </span>
                      ) : <span className="text-white/20 text-xs">—</span>}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min="1"
                          max="100"
                          placeholder="Pos"
                          className="w-16 bg-white/10 border border-white/20 text-white text-xs rounded-lg px-2 py-1 focus:outline-none focus:border-red-500"
                          onKeyDown={e => {
                            if (e.key === 'Enter') {
                              const val = parseInt((e.target as HTMLInputElement).value)
                              if (val > 0) updateRank(kw.id, val)
                            }
                          }}
                        />
                        <span className="text-white/30 text-xs">↵</span>
                        {saving === kw.id && <span className="text-white/40 text-xs">Saving…</span>}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      <p className="text-white/30 text-xs mt-4">
        Enter a position number and press Enter to save. Connect Ahrefs/SEMrush API in Config for automatic updates.
      </p>
    </div>
  )
}
