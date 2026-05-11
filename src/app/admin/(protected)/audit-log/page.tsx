'use client'

import { useState, useEffect } from 'react'

interface LogEntry {
  id: number
  action: string
  resource_type: string
  resource_id: string
  timestamp: string
  user_id: string | null
}

export default function AuditLogPage() {
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    fetch('/api/admin/audit-log')
      .then(r => r.json())
      .then(d => { setLogs(d.logs ?? []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const filtered = filter === 'all' ? logs : logs.filter(l => l.action === filter)

  const actionColor = (a: string) => ({
    publish: 'bg-green-500/20 text-green-400',
    unpublish: 'bg-yellow-500/20 text-yellow-400',
    delete: 'bg-red-500/20 text-red-400',
    create: 'bg-blue-500/20 text-blue-400',
    edit: 'bg-white/10 text-white/60',
    age_gate_confirmed: 'bg-green-500/10 text-green-300',
    age_gate_declined: 'bg-red-500/10 text-red-300',
    geo_block_triggered: 'bg-orange-500/20 text-orange-400',
    config_change: 'bg-purple-500/20 text-purple-400',
    compliance_export: 'bg-blue-500/10 text-blue-300',
  }[a] ?? 'bg-white/10 text-white/50')

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Audit Log</h1>
          <p className="text-white/50 text-sm mt-1">All admin actions and compliance events</p>
        </div>
        <a
          href="/api/admin/compliance/export"
          className="text-white/50 hover:text-white text-sm border border-white/20 px-3 py-1.5 rounded-lg hover:border-white/40 transition-colors"
        >
          ↓ Export CSV
        </a>
      </div>

      {/* Action filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        {['all', 'publish', 'create', 'edit', 'delete', 'age_gate_confirmed', 'geo_block_triggered', 'config_change'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`text-xs px-3 py-1.5 rounded-full capitalize transition-colors ${
              filter === f ? 'bg-white text-black font-semibold' : 'bg-white/10 text-white/60 hover:bg-white/20'
            }`}
          >
            {f.replace(/_/g, ' ')}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-white/40 text-sm py-20 text-center">Loading logs…</div>
      ) : filtered.length === 0 ? (
        <div className="text-white/30 text-sm py-20 text-center">No log entries found.</div>
      ) : (
        <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left text-white/40 font-medium px-4 py-3">Time</th>
                <th className="text-left text-white/40 font-medium px-4 py-3">Action</th>
                <th className="text-left text-white/40 font-medium px-4 py-3 hidden md:table-cell">Resource</th>
                <th className="text-left text-white/40 font-medium px-4 py-3 hidden lg:table-cell">ID</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(log => (
                <tr key={log.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="px-4 py-3">
                    <span className="text-white/50 text-xs">
                      {new Date(log.timestamp).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' })}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded-full capitalize ${actionColor(log.action)}`}>
                      {log.action.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <span className="text-white/60 text-xs capitalize">{log.resource_type?.replace(/_/g, ' ')}</span>
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    <span className="text-white/30 text-xs font-mono truncate max-w-xs block">{log.resource_id}</span>
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
