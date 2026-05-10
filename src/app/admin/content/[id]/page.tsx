'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'

interface SEOBreakdown {
  keywordDensity:    { pass: boolean; warn?: boolean; current: string; required: string }
  keywordInFirst100: { pass: boolean; current: string; required: string }
  titleLength:       { pass: boolean; current: string; required: string }
  descLength:        { pass: boolean; current: string; required: string }
  exactMatchH1:      { pass: boolean; current: string; required: string }
  headingStructure:  { pass: boolean; current: string; required: string }
  internalLinks:     { pass: boolean; current: string; required: string }
  contentLength:     { pass: boolean; current: string; required: string }
}

interface SEOResult {
  total: number
  breakdown: SEOBreakdown
  suggestions: { criterion: string; message: string; currentValue: string; requiredValue: string }[]
}

export default function ContentEditorPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string
  const isNew = id === 'new'

  const [form, setForm] = useState({
    slug: '', title: '', meta_desc: '', h1: '', body_raw: '',
    target_keyword: '', page_type: 'keyword_landing', language: 'en',
    has_faq: false, status: 'draft',
  })
  const [loading, setLoading] = useState(!isNew)
  const [saving, setSaving] = useState(false)
  const [publishing, setPublishing] = useState(false)
  const [seo, setSeo] = useState<SEOResult | null>(null)
  const [seoLoading, setSeoLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  useEffect(() => {
    if (!isNew) {
      fetch(`/api/admin/pages/${id}`)
        .then(r => r.json())
        .then(d => { if (d.page) setForm(d.page); setLoading(false) })
        .catch(() => setLoading(false))
    }
  }, [id, isNew])

  const runSEO = useCallback(async () => {
    if (!form.title && !form.body_raw) return
    setSeoLoading(true)
    const res = await fetch('/api/admin/pages/score', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    const data = await res.json()
    setSeo(data)
    setSeoLoading(false)
  }, [form])

  const save = async () => {
    setSaving(true)
    setMessage(null)
    const url = isNew ? '/api/admin/pages' : `/api/admin/pages/${id}`
    const method = isNew ? 'POST' : 'PUT'
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    const data = await res.json()
    setSaving(false)
    if (res.ok) {
      setMessage({ type: 'success', text: 'Saved successfully' })
      if (isNew && data.page?.id) router.push(`/admin/content/${data.page.id}`)
    } else {
      setMessage({ type: 'error', text: data.error ?? 'Save failed' })
    }
  }

  const publish = async () => {
    setPublishing(true)
    setMessage(null)
    // Save first
    await fetch(`/api/admin/pages/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    const res = await fetch(`/api/admin/pages/${id}/publish`, { method: 'POST' })
    const data = await res.json()
    setPublishing(false)
    if (res.ok) {
      setForm(prev => ({ ...prev, status: 'published' }))
      setMessage({ type: 'success', text: `Published! SEO Score: ${data.seoScore}/100` })
    } else {
      setMessage({ type: 'error', text: data.error ?? 'Publish failed' })
      if (data.suggestions) setSeo(prev => prev ? { ...prev, suggestions: data.suggestions, total: data.seoScore ?? 0 } : null)
    }
  }

  const unpublish = async () => {
    const res = await fetch(`/api/admin/pages/${id}/unpublish`, { method: 'POST' })
    if (res.ok) {
      setForm(prev => ({ ...prev, status: 'unpublished' }))
      setMessage({ type: 'success', text: 'Unpublished' })
    }
  }

  const field = (key: keyof typeof form, label: string, type: 'text' | 'textarea' | 'select' = 'text', options?: string[]) => (
    <div>
      <label className="block text-white/70 text-xs font-medium mb-1.5">{label}</label>
      {type === 'textarea' ? (
        <textarea
          value={String(form[key])}
          onChange={e => setForm(prev => ({ ...prev, [key]: e.target.value }))}
          rows={key === 'body_raw' ? 16 : 3}
          className="w-full bg-white/5 border border-white/20 text-white placeholder-white/30 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-red-500 transition-colors font-mono resize-y"
        />
      ) : type === 'select' ? (
        <select
          value={String(form[key])}
          onChange={e => setForm(prev => ({ ...prev, [key]: e.target.value }))}
          className="w-full bg-white/5 border border-white/20 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-red-500"
        >
          {options?.map(o => <option key={o} value={o} className="bg-black">{o}</option>)}
        </select>
      ) : (
        <input
          type="text"
          value={String(form[key])}
          onChange={e => setForm(prev => ({ ...prev, [key]: e.target.value }))}
          className="w-full bg-white/5 border border-white/20 text-white placeholder-white/30 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-red-500 transition-colors"
        />
      )}
    </div>
  )

  const scoreColor = (score: number) =>
    score >= 70 ? 'text-green-400' : score >= 50 ? 'text-yellow-400' : 'text-red-400'

  const criterionIcon = (pass: boolean, warn?: boolean) =>
    warn ? '⚠️' : pass ? '✅' : '❌'

  if (loading) return <div className="text-white/40 text-sm p-8">Loading…</div>

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link href="/admin/content" className="text-white/40 hover:text-white text-sm">← Content</Link>
          <span className="text-white/20">/</span>
          <h1 className="text-white font-semibold">{isNew ? 'New Page' : (form.title || 'Edit Page')}</h1>
          <span className={`text-xs px-2 py-1 rounded-full capitalize ${
            form.status === 'published' ? 'bg-green-500/20 text-green-400' :
            form.status === 'draft' ? 'bg-white/10 text-white/50' :
            'bg-yellow-500/20 text-yellow-400'
          }`}>{form.status}</span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={runSEO} disabled={seoLoading} className="text-white/50 hover:text-white text-sm px-3 py-2 rounded-lg hover:bg-white/10 transition-colors">
            {seoLoading ? 'Scoring…' : '🔍 Score SEO'}
          </button>
          <button onClick={save} disabled={saving} className="bg-white/10 text-white text-sm font-medium px-4 py-2 rounded-xl hover:bg-white/20 transition-colors disabled:opacity-50">
            {saving ? 'Saving…' : 'Save Draft'}
          </button>
          {form.status !== 'published' ? (
            <button onClick={publish} disabled={publishing || isNew} className="bg-red-500 text-white text-sm font-semibold px-4 py-2 rounded-xl hover:bg-red-600 transition-colors disabled:opacity-50">
              {publishing ? 'Publishing…' : 'Publish'}
            </button>
          ) : (
            <button onClick={unpublish} className="bg-white/10 text-white/70 text-sm px-4 py-2 rounded-xl hover:bg-white/20 transition-colors">
              Unpublish
            </button>
          )}
        </div>
      </div>

      {/* Message */}
      {message && (
        <div className={`mb-4 px-4 py-3 rounded-xl text-sm ${message.type === 'success' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main editor */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-4">
            <h2 className="text-white/70 text-xs font-semibold uppercase tracking-wider">SEO Fields</h2>
            {field('title', `Meta Title (${form.title.length}/60 chars)`)}
            {field('meta_desc', `Meta Description (${form.meta_desc.length}/160 chars)`, 'textarea')}
            {field('slug', 'URL Slug (e.g. online-cricket-id)')}
            {field('target_keyword', 'Target Keyword')}
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-4">
            <h2 className="text-white/70 text-xs font-semibold uppercase tracking-wider">Content</h2>
            {field('h1', 'H1 Heading (exact-match keyword)')}
            {field('body_raw', 'Body Content (HTML or plain text)', 'textarea')}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Page settings */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-4">
            <h2 className="text-white/70 text-xs font-semibold uppercase tracking-wider">Settings</h2>
            {field('page_type', 'Page Type', 'select', ['keyword_landing', 'content', 'pillar'])}
            {field('language', 'Language', 'select', ['en', 'hi', 'hin'])}
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.has_faq} onChange={e => setForm(prev => ({ ...prev, has_faq: e.target.checked }))} className="accent-red-500" />
              <span className="text-white/70 text-sm">Has FAQ section</span>
            </label>
          </div>

          {/* SEO Score Panel */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-white/70 text-xs font-semibold uppercase tracking-wider">SEO Score</h2>
              {seo && (
                <span className={`text-2xl font-bold ${scoreColor(seo.total)}`}>{seo.total}/100</span>
              )}
            </div>

            {!seo ? (
              <p className="text-white/30 text-xs">Click "Score SEO" to analyse this page.</p>
            ) : (
              <>
                {/* Score bar */}
                <div className="w-full bg-white/10 rounded-full h-2 mb-4">
                  <div
                    className={`h-2 rounded-full transition-all ${seo.total >= 70 ? 'bg-green-400' : seo.total >= 50 ? 'bg-yellow-400' : 'bg-red-400'}`}
                    style={{ width: `${seo.total}%` }}
                  />
                </div>

                {/* Criteria */}
                <div className="space-y-2 mb-4">
                  {Object.entries(seo.breakdown).map(([key, val]) => (
                    <div key={key} className="flex items-center justify-between text-xs">
                      <span className="text-white/50 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                      <span>{criterionIcon(val.pass, val.warn)}</span>
                    </div>
                  ))}
                </div>

                {/* Suggestions */}
                {seo.suggestions.length > 0 && (
                  <div className="border-t border-white/10 pt-3 space-y-2">
                    <p className="text-white/50 text-xs font-medium">Improvements needed:</p>
                    {seo.suggestions.map((s, i) => (
                      <div key={i} className="bg-red-500/10 border border-red-500/20 rounded-lg p-2">
                        <p className="text-red-300 text-xs font-medium">{s.criterion}</p>
                        <p className="text-red-200/70 text-xs mt-0.5">{s.message}</p>
                      </div>
                    ))}
                  </div>
                )}

                {seo.total >= 70 && (
                  <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-2 mt-2">
                    <p className="text-green-300 text-xs">✓ Ready to publish</p>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Quick links */}
          {!isNew && (
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-2">
              <h2 className="text-white/70 text-xs font-semibold uppercase tracking-wider mb-3">Actions</h2>
              <a
                href={form.page_type === 'keyword_landing' ? `/keyword/${form.slug}` : `/${form.slug}`}
                target="_blank"
                className="block text-white/50 hover:text-white text-sm py-1 transition-colors"
              >
                ↗ View live page
              </a>
              <button
                onClick={() => {
                  if (confirm('Delete this page permanently?')) {
                    fetch(`/api/admin/pages/${id}`, { method: 'DELETE' })
                      .then(() => router.push('/admin/content'))
                  }
                }}
                className="block text-red-400/60 hover:text-red-400 text-sm py-1 transition-colors"
              >
                🗑 Delete page
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
