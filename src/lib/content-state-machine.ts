import type { PageStatus } from '@/types'

/**
 * Valid state transitions for content pages.
 *
 * Allowed:
 *   draft       → scheduled
 *   draft       → published
 *   scheduled   → published
 *   published   → unpublished
 *   unpublished → draft
 *
 * Disallowed (examples):
 *   published   → draft   (must go through unpublished first)
 *   unpublished → published (must go through draft first)
 *   scheduled   → draft
 */
const VALID_TRANSITIONS: Record<PageStatus, PageStatus[]> = {
  draft:       ['scheduled', 'published'],
  scheduled:   ['published'],
  published:   ['unpublished'],
  unpublished: ['draft'],
}

/**
 * Validates whether a state transition is allowed.
 * Returns true if the transition is valid, false otherwise.
 */
export function validateStateTransition(
  current: PageStatus,
  target: PageStatus
): boolean {
  if (current === target) return false
  const allowed = VALID_TRANSITIONS[current]
  return allowed ? allowed.includes(target) : false
}
