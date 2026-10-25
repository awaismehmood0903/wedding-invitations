import { format } from 'date-fns'
import { wedding, type WeddingEvent } from '../config/event'

/** Absolute instant of an event time, using the configured Pakistan offset. */
export function eventInstant(e: WeddingEvent, which: 'start' | 'end' = 'start'): Date {
  const t = which === 'start' ? e.startTime : e.endTime
  const d = new Date(`${e.date}T${t}:00${wedding.timezoneOffset}`)
  // An end time past midnight belongs to the next day.
  if (which === 'end' && e.endTime <= e.startTime) d.setUTCDate(d.getUTCDate() + 1)
  return d
}

// Display helpers format the wall-clock strings directly, so guests abroad
// still see the venue's local time rather than a converted one.
const wallClock = (date: string, time = '00:00') => new Date(`${date}T${time}:00`)

export const formatDay = (e: WeddingEvent) => format(wallClock(e.date), 'd')
export const formatMonth = (e: WeddingEvent) => format(wallClock(e.date), 'MMM')
export const formatWeekdayLong = (e: WeddingEvent) => format(wallClock(e.date), 'EEEE')
export const formatMonthYear = (e: WeddingEvent) => format(wallClock(e.date), 'MMMM yyyy')
export const formatTime = (date: string, time: string) => format(wallClock(date, time), 'h:mm a')
