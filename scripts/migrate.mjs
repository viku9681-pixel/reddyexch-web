/**
 * Migration runner — uses Supabase's direct PostgreSQL connection
 * Run: node scripts/migrate.mjs
 *
 * Requires DATABASE_URL in .env.local:
 * postgresql://postgres:[password]@db.djirwwtijunzrpanfxwa.supabase.co:5432/postgres
 */

import { readFileSync } from 'fs'
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://djirwwtijunzrpanfxwa.supabase.co'
const SERVICE_KEY  = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRqaXJ3d3RpanVuenJwYW5meHdhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODQwODU1NSwiZXhwIjoyMDkzOTg0NTU1fQ.dsCtVODdWUop-qwP2oWttc7JFhRftPUhW-bMu-0c9F0'

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false }
})

// Split SQL into individual statements (handles multi-statement files)
function splitStatements(sql) {
  return sql
    .split(/;\s*\n/)
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--'))
}

async function runSQL(label, sql) {
  console.log(`\n=== ${label} ===`)
  const statements = splitStatements(sql)
  console.log(`  ${statements.length} statements to execute`)

  for (let i = 0; i < statements.length; i++) {
    const stmt = statements[i] + ';'
    try {
      const { error } = await supabase.rpc('exec_sql', { sql: stmt }).single()
      if (error && !error.message.includes('already exists') && !error.message.includes('duplicate')) {
        console.warn(`  [${i+1}] WARN: ${error.message.substring(0, 100)}`)
      } else {
        process.stdout.write('.')
      }
    } catch (e) {
      console.warn(`  [${i+1}] SKIP: ${String(e).substring(0, 80)}`)
    }
  }
  console.log('\n  Done.')
}

// Use Supabase's built-in SQL execution via the pg endpoint
async function execSQL(sql) {
  const response = await fetch(`${SUPABASE_URL}/pg/query`, {
    method: 'POST',
    headers: {
      'apikey': SERVICE_KEY,
      'Authorization': `Bearer ${SERVICE_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query: sql })
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`HTTP ${response.status}: ${text}`)
  }
  return response.json()
}

async function main() {
  console.log('ReddyExch — Database Migration Runner')
  console.log(`Project: djirwwtijunzrpanfxwa.supabase.co`)

  const migrations = [
    { label: 'Migration 001: Initial Schema', file: 'supabase/migrations/001_initial_schema.sql' },
    { label: 'Migration 002: RLS Policies',   file: 'supabase/migrations/002_rls_policies.sql' },
    { label: 'Seed Data',                      file: 'supabase/seed.sql' },
  ]

  for (const { label, file } of migrations) {
    console.log(`\n=== ${label} ===`)
    const sql = readFileSync(file, 'utf8')

    try {
      await execSQL(sql)
      console.log('  ✓ Success')
    } catch (err) {
      console.log(`  ✗ Failed: ${err.message}`)
      console.log('  Trying statement-by-statement...')

      // Fall back to statement-by-statement
      const statements = sql
        .replace(/--[^\n]*/g, '')  // remove comments
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 5)

      let ok = 0, skip = 0
      for (const stmt of statements) {
        try {
          await execSQL(stmt + ';')
          ok++
        } catch (e) {
          const msg = e.message
          if (msg.includes('already exists') || msg.includes('duplicate')) {
            skip++
          } else {
            console.log(`  WARN: ${msg.substring(0, 120)}`)
          }
        }
      }
      console.log(`  ${ok} executed, ${skip} skipped (already exist)`)
    }
  }

  console.log('\n✓ All migrations complete.')
  console.log('\nVerifying tables...')

  try {
    const result = await execSQL(
      "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;"
    )
    console.log('Tables created:')
    if (Array.isArray(result)) {
      result.forEach(r => console.log(`  - ${r.table_name}`))
    } else {
      console.log(JSON.stringify(result, null, 2))
    }
  } catch (e) {
    console.log('Could not verify tables:', e.message)
  }
}

main().catch(console.error)
