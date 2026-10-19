import type { WeddingEvent } from '../config/event'
import { wedding } from '../config/event'
import { eventInstant } from './time'
import { siteUrl } from '../config/edition'

const utcParts = (d: Date): [number, number, number, number, number] => [
  d.getUTCFullYear(),
  d.getUTCMonth() + 1,
  d.getUTCDate(),
  d.getUTCHours(),
  d.getUTCMinutes(),
]

/** Builds an .ics file for one event and triggers a download. */
export async function downloadIcs(e: WeddingEvent) {
  const { createEvent } = await import('ics')
  const { groom, bride } = wedding.couple
  const { error, value } = createEvent({
    title: `${e.title} · ${groom} & ${bride}`,
    description: `${e.tagline}\nDress code: ${e.dress}${e.notes ? `\n${e.notes}` : ''}\n${siteUrl}`,
    location: `${e.venue}, ${e.address}`,
    url: e.mapUrl,
    start: utcParts(eventInstant(e, 'start')),
    startInputType: 'utc',
    startOutputType: 'utc',
    end: utcParts(eventInstant(e, 'end')),
    endInputType: 'utc',
    endOutputType: 'utc',
    status: 'CONFIRMED',
    alarms: [{ action: 'display', description: `${e.title} tomorrow`, trigger: { days: 1, before: true } }],
  })
  if (error || !value) {
    console.error(error)
    return
  }
  const blob = new Blob([value], { type: 'text/calendar;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${groom}-${bride}-${e.title}.ics`.toLowerCase().replace(/\s+/g, '-')
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

/** Google Calendar template link — handy on Android where .ics downloads are clunky. */
export function googleCalendarUrl(e: WeddingEvent) {
  const fmt = (d: Date) => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')
  const { groom, bride } = wedding.couple
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: `${e.title} · ${groom} & ${bride}`,
    dates: `${fmt(eventInstant(e, 'start'))}/${fmt(eventInstant(e, 'end'))}`,
    details: `${e.tagline}\nDress code: ${e.dress}`,
    location: `${e.venue}, ${e.address}`,
  })
  return `https://calendar.google.com/calendar/render?${params}`
}
