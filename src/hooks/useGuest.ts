import { useMemo } from 'react'
import { wedding, type WeddingEvent } from '../config/event'

/**
 * Reads the personalised link: ?guest=Ahmed+Family&days=1,2,3
 *  - guest → greeting name (falls back to wedding.defaultGuest)
 *  - days  → which events this family is invited to (all if absent/invalid)
 */
export function useGuest(): { guest: string; isPersonal: boolean; events: WeddingEvent[] } {
  return useMemo(() => {
    const params = new URLSearchParams(window.location.search)
    const raw = params.get('guest')?.trim().slice(0, 60)
    const days = (params.get('days') ?? '')
      .split(',')
      .map((d) => Number(d.trim()))
      .filter((d) => Number.isInteger(d))
    const filtered = wedding.events.filter((e) => days.includes(e.day))
    return {
      guest: raw || wedding.defaultGuest,
      isPersonal: Boolean(raw),
      events: filtered.length ? filtered : wedding.events,
    }
  }, [])
}
