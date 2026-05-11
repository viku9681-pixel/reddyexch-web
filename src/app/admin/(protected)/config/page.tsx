'use client'

import { useState, useEffect } from 'react'

interface Config {
  whatsapp_number: string
  fallback_contact_phone: string
  fallback_contact_email: string
  exit_url: string
  ga4_measurement_id: string
  ga4_api_secret: string
  gsc_site_url: string
}

const DEFAULT_CONFIG: Config = {
  whatsapp_number: '',
  fallback_contact_phone: '',
  fallback_contact_email: '',
  exit_url: 'https://www.google.com',
  ga4_measurement_id: '',
  ga4_api_secret: '',
  gsc_site_url: 'https://reddyexchgaming.com',
}

export default function ConfigPage() {
  const [config, setConfig] = useState<Config>(DEFAULT_CONFIG)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  useEffect(() => {
    fetch('/api/admin/config')
      .then(r => r.json())
      .then(d => {
        if (d.config) setConfig({ ...DEFAULT_CONFIG, ...d.config })
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const save = async () => {
    setSaving(true)
    setMessage(null)
    try {
      const res = await fetch('/api/admin/config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      })
      const data = await res.json()
      if (res.ok) {
        setMessage({ type: 'success', text: '✓ Settings saved. WhatsApp number is now live on the site.' })
      } else {
        setMessage({ type: 'error', text: data.error ?? 'Save failed. Please try again.' })
      }
    } catch {
      setMessage({ type: 'error', text: 'Network error. Please try again.' })
    } finally {
      setSaving(false)
    }
  }

  const field = (
    key: keyof Config,
    label: string,
    placeholder: string,
    type = 'text',
    hint?: string
  ) => (
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
      {hint && <p className="text-white/30 text-xs mt-1.5">{hint}</p>}
    </div>
  )

  return (
    <div className="max-w-2xl mx-auto px-6 py-8">
      <h1 className="text-2xl font-bold text-white mb-2">Platform Config</h1>
      <p className="text-white/50 text-sm mb-8">
        Changes take effect immediately on the live site — no redeploy needed.
      </p>

      {message && (
        <div className={`mb-6 px-4 py-3 rounded-xl text-sm border ${
          message.type === 'success'
            ? 'bg-green-500/10 text-green-400 border-green-500/20'
            : 'bg-red-500/10 text-red-400 border-red-500/20'
        }`}>
          {message.text}
        </div>
      )}

      <div className="space-y-6">
        {/* WhatsApp */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-white font-semibold">WhatsApp</h2>
            {config.whatsapp_number && !loading && (
              <span className="text-green-400 text-xs bg-green-500/10 border border-green-500/20 px-2 py-1 rounded-full">
                Active: {config.whatsapp_number}
              </span>
            )}
          </div>
          {field(
            'whatsapp_number',
            'WhatsApp Business Number',
            '+919876543210',
            'tel',
            'E.164 format — must start with + and country code. e.g. +919876543210'
          )}
          {field(
            'fallback_contact_phone',
            'Fallback Phone (shown if WhatsApp fails)',
            '+919876543210',
            'tel'
          )}
          {field(
            'fallback_contact_email',
            'Fallback Email',
            'support@reddyexchgaming.com',
            'email'
          )}
        </div>

        {/* Analytics */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-5">
          <h2 className="text-white font-semibold">Analytics</h2>
          {field('ga4_measurement_id', 'GA4 Measurement ID', 'G-XXXXXXXXXX', 'text', 'Found in Google Analytics → Admin → Data Streams')}
          {field('ga4_api_secret', 'GA4 API Secret', 'your-api-secret', 'text', 'Used for server-side event tracking')}
        </div>

        {/* Compliance */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-5">
          <h2 className="text-white font-semibold">Compliance</h2>
          {field('exit_url', 'Age Gate Exit URL', 'https://www.google.com', 'url', 'Where users are sent if they decline the 18+ age gate')}
          {field('gsc_site_url', 'Google Search Console Site URL', 'https://reddyexchgaming.com', 'url')}
        </div>

        <button
          onClick={save}
          disabled={saving || loading}
          className="w-full bg-red-500 text-white font-semibold py-3 rounded-xl hover:bg-red-600 transition-colors disabled:opacity-50"
        >
          {saving ? 'Saving…' : 'Save Changes'}
        </button>
      </div>
    </div>
  )
}
