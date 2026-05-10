'use client'

import { useState, useEffect } from 'react'

export default function WidgetsPage() {
  const [waNumber, setWaNumber] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/config')
      .then(r => r.json())
      .then(d => { setWaNumber(d.config?.whatsapp_number ?? ''); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const saveWA = async () => {
    setSaving(true)
    await fetch('/api/admin/config', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ whatsapp_number: waNumber }),
    })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      <h1 className="text-2xl font-bold text-white mb-2">Widget Configuration</h1>
      <p className="text-white/50 text-sm mb-8">Configure WhatsApp CTA, live scores, and Instagram feed.</p>

      {/* WhatsApp CTA */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-6">
        <h2 className="text-white font-semibold mb-1">WhatsApp CTA</h2>
        <p className="text-white/50 text-sm mb-4">The number visitors will message to get their gaming ID.</p>
        <div className="flex gap-3">
          <input
            type="tel"
            value={waNumber}
            onChange={e => setWaNumber(e.target.value)}
            placeholder="+919999999999"
            className="flex-1 bg-white/10 border border-white/20 text-white placeholder-white/30 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-red-500"
            disabled={loading}
          />
          <button
            onClick={saveWA}
            disabled={saving || loading}
            className="bg-red-500 text-white font-semibold px-5 py-3 rounded-xl hover:bg-red-600 transition-colors disabled:opacity-50 text-sm"
          >
            {saving ? 'Saving…' : saved ? '✓ Saved' : 'Save'}
          </button>
        </div>
        <p className="text-white/30 text-xs mt-2">Format: +91XXXXXXXXXX (E.164 format with country code)</p>
      </div>

      {/* Live Scores */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-6">
        <h2 className="text-white font-semibold mb-1">Live Scores Widget</h2>
        <p className="text-white/50 text-sm mb-4">Configure which matches to show in the live scores section.</p>
        <div className="grid grid-cols-2 gap-3">
          {['IPL', 'T20I', 'ODI', 'Test'].map(type => (
            <label key={type} className="flex items-center gap-3 bg-white/5 rounded-xl px-4 py-3 cursor-pointer hover:bg-white/10 transition-colors">
              <input type="checkbox" defaultChecked className="accent-red-500" />
              <span className="text-white text-sm">{type}</span>
            </label>
          ))}
        </div>
        <p className="text-white/30 text-xs mt-3">Live scores integration via Supabase Realtime — Phase 4 feature.</p>
      </div>

      {/* Instagram Feed */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
        <h2 className="text-white font-semibold mb-1">Instagram Feed</h2>
        <p className="text-white/50 text-sm mb-4">Configure hashtags and handles for the Instagram section.</p>
        <div className="space-y-3">
          <div>
            <label className="block text-white/60 text-xs mb-1">Hashtags (comma separated)</label>
            <input
              type="text"
              defaultValue="cricketid, reddyexch, onlinecricket"
              className="w-full bg-white/10 border border-white/20 text-white placeholder-white/30 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-red-500"
            />
          </div>
          <div>
            <label className="block text-white/60 text-xs mb-1">Account Handles (comma separated)</label>
            <input
              type="text"
              defaultValue="@reddyexch"
              className="w-full bg-white/10 border border-white/20 text-white placeholder-white/30 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-red-500"
            />
          </div>
        </div>
        <p className="text-white/30 text-xs mt-3">Instagram API integration — connect your account to enable live feed.</p>
      </div>
    </div>
  )
}
