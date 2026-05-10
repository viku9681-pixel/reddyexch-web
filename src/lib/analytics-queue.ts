import type { AnalyticsEvent } from '@/types'

const STORAGE_KEY = 'reddyexch_analytics_queue'
const MAX_EVENTS = 50

/**
 * Client-side analytics queue backed by localStorage.
 * FIFO eviction when full (oldest events removed first).
 * Silent fail when localStorage is unavailable (SSR, private browsing).
 */
export class AnalyticsQueue {
  private readQueue(): AnalyticsEvent[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (!raw) return []
      return JSON.parse(raw) as AnalyticsEvent[]
    } catch {
      return []
    }
  }

  private writeQueue(events: AnalyticsEvent[]): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(events))
    } catch {
      // localStorage unavailable or quota exceeded — silent fail
    }
  }

  /**
   * Adds an event to the queue.
   * If the queue is full (50 events), the oldest event is evicted first.
   */
  enqueue(event: AnalyticsEvent): void {
    try {
      const queue = this.readQueue()

      // FIFO eviction: remove oldest if at capacity
      if (queue.length >= MAX_EVENTS) {
        queue.shift()
      }

      queue.push(event)
      this.writeQueue(queue)
    } catch {
      // Silent fail
    }
  }

  /**
   * Returns all queued events and clears the queue.
   */
  dequeue(): AnalyticsEvent[] {
    try {
      const queue = this.readQueue()
      this.writeQueue([])
      return queue
    } catch {
      return []
    }
  }

  /**
   * Returns the current number of queued events.
   */
  size(): number {
    try {
      return this.readQueue().length
    } catch {
      return 0
    }
  }

  /**
   * Clears all queued events.
   */
  clear(): void {
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch {
      // Silent fail
    }
  }
}
