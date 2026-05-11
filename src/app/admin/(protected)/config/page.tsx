'use client'

import { useState, useEffect } from 'react'

interface Config {
  whatsapp_number: string
  exit_url: string
  ga4_measurement_id: string
  ga4_api_secret: string
  gsc_site_url: string
  fallback_contact_phone: string
  fallback_contact_email: string
}

export default function ConfigPage() {
  const [config, setConfig] = useState<Config>({
    whatsapp_number: '',
    exit_url: 'https://www.google.com',
    ga4_measurement_id: '',
    ga4_api_secret: '',
    gsc_site_url: 'https://reddyexchgaming.com',
    fallback_contact_phone: '',
    fallback_contact_email: '',
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    fetch('/api/admin/config')
      .then(r => r.json())
      .then(d => { if (d.config) setConfig(d.config); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const save = async () => {
    setSaving(true)
    const res = await fetch('/api/admin/config', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config),
    })
    setSaving(false)
    if (res.ok) { setSaved(true); setTimeout(() => setSaved(false), 3000) }
  }

  const field = (key: keyof Config, label: string, placeholder: string, type = 'text') => (
    <div>
      <label className="block text-white/70 text-sm font-medium mb-2">{label}</label>
      <input
        type={type}
        value={config[key]}
        onChange={e => setConfig(prev => ({ ...prev, [key]: e.target.value }))}
        placeholder={placeholder}
        className="w-full bg-white/10 border border-white/20 text-white placeholder-white/30 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-red-500 transition-colors"
        disabled={loading}
      />
    </div>
  )

  return (
    <div className="max-w-2xl mx-auto px-6 py-8">
      <h1 className="text-2xl font-bold text-white mb-2">Platform Config</h1>
      <p className="text-white/50 text-sm mb-8">Update WhatsApp number, analytics, and compliance settings.</p>

      <div className="space-y-6">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-5">
          <h2 className="text-white font-semibold">WhatsApp</h2>
          {field('whatsapp_number', 'WhatsApp Business Number', '+919999999999')}
          {field('fallback_contact_phone', 'Fallback Phone (if WhatsApp fails)', '+919999999999')}
          {field('fallback_contact_email', 'Fallback Email', 'support@reddyexchgaming.com', 'email')}
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-5">
          <h2 className="text-white font-semibold">Analytics</h2>
          {field('ga4_measurement_id', 'GA4 Measurement ID', 'G-XXXXXXXXXX')}
          {field('ga4_api_secret', 'GA4 API Secret', 'your-api-secret')}
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-5">
          <h2 className="text-white font-semibold">Compliance</h2>
          {field('exit_url', 'Age Gate Exit URL', 'https://www.google.com', 'url')}
          {field('gsc_site_url', 'Google Search Console Site URL', 'https://reddyexchgaming.com', 'url')}
        </div>

        <button
          onClick={save}
          disabled={saving || loading}
          className="w-full bg-red-500 text-white font-semibold py-3 rounded-xl hover:bg-red-600 transition-colors disabled:opacity-50"
        >
          {saving ? 'Saving…' : saved ? '✓ Saved!' : 'Save Changes'}
        </button>
      </div>
    </div>
  )
}
