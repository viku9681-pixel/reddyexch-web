export interface ComplianceViolation {
  term: string
  field: string
  position: number
}

export interface ComplianceCheckResult {
  passed: boolean
  violations: ComplianceViolation[]
}

// Whole-word match for "betting" and "bet" (case-insensitive)
const BANNED_TERMS_REGEX = /\b(betting|bet)\b/gi

type CheckFields = {
  bodyRaw: string
  title: string
  metaDesc: string
  h1: string
}

/**
 * Scans content fields for non-compliant language ("betting", "bet").
 * Returns a result with all violations found across all fields.
 */
export function checkCompliantLanguage(fields: CheckFields): ComplianceCheckResult {
  const violations: ComplianceViolation[] = []

  const fieldEntries = Object.entries(fields) as [keyof CheckFields, string][]

  for (const [fieldName, text] of fieldEntries) {
    if (!text) continue

    // Reset lastIndex before each exec loop
    BANNED_TERMS_REGEX.lastIndex = 0
    let match: RegExpExecArray | null

    while ((match = BANNED_TERMS_REGEX.exec(text)) !== null) {
      violations.push({
        term: match[0],
        field: fieldName,
        position: match.index,
      })
    }
  }

  return {
    passed: violations.length === 0,
    violations,
  }
}
