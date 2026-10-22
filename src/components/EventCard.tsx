import type { WeddingEvent } from '../config/event'
import { downloadIcs, googleCalendarUrl } from '../lib/ics'
import { patternUrl } from '../lib/patterns'
import { formatDay, formatMonthYear, formatTime, formatWeekdayLong } from '../lib/time'
import { wedding } from '../config/event'

/**
 * Horizontal "ticket" for one event: a coloured date stub on the left, a perforated
 * divider, and venue / dress code / actions on the right.
 */
export function EventCard({ event: e }: { event: WeddingEvent }) {
  const swatches = [e.outfit.bride.dress, e.outfit.bride.dupatta, e.outfit.groom.coat, e.theme.accent]

  return (
    <article
      className="reveal relative mx-auto flex max-w-3xl rounded-[1.6rem] bg-card shadow-[0_24px_60px_-28px_rgba(0,0,0,0.45)] ring-1 ring-accent/35"
      aria-label={`${e.title} details`}
    >
      {/* date stub */}
      <div
        className="relative flex w-[36%] shrink-0 flex-col items-center justify-center overflow-hidden rounded-l-[1.6rem] px-2 py-6 text-center text-bg sm:w-[30%] sm:py-10"
        style={{ backgroundColor: e.theme.primary, backgroundImage: patternUrl(e.theme.pattern, e.theme.bg, 0.22), backgroundSize: e.theme.pattern === 'jharokha' ? '72px 90px' : '64px 64px' }}
      >
        <div className="pointer-events-none absolute inset-2 rounded-[1.2rem] border border-current/30" aria-hidden />
        <p className="text-[10px] font-medium tracking-[0.25em] uppercase opacity-90 sm:text-xs">{formatWeekdayLong(e)}</p>
        <p className="font-display my-1 text-[3.6rem] leading-none font-semibold sm:text-[5.5rem]">{formatDay(e)}</p>
        <p className="font-display text-base tracking-wide sm:text-xl">{formatMonthYear(e)}</p>
        <span className="my-3 h-px w-10 bg-current/50 sm:w-14" aria-hidden />
        <p className="text-sm font-semibold sm:text-base">{formatTime(e.date, e.startTime)}</p>
        <p className="text-[10px] tracking-wide opacity-80 sm:text-xs">
          till {formatTime(e.date, e.endTime)} {wedding.timezoneLabel}
        </p>
      </div>

      {/* perforation */}
      <div className="relative w-0 border-l-2 border-dashed border-accent/40" aria-hidden>
        <span className="absolute -top-3 -left-3 h-6 w-6 rounded-full bg-bg ring-1 ring-accent/35 [clip-path:inset(50%_0_0_0)]" />
        <span className="absolute -bottom-3 -left-3 h-6 w-6 rounded-full bg-bg ring-1 ring-accent/35 [clip-path:inset(0_0_50%_0)]" />
      </div>

      {/* details */}
      <div className="flex min-w-0 flex-1 flex-col justify-center gap-3 p-4 text-left sm:gap-4 sm:p-8">
        <p className="text-[10px] tracking-[0.25em] text-accent uppercase sm:text-xs">
          Day {e.day} · {e.title}
        </p>

        <div className="flex items-start gap-2">
          <PinIcon />
          <div className="min-w-0">
            <p className="font-display text-lg leading-tight font-semibold text-primary sm:text-2xl">{e.venue}</p>
            <p className="mt-0.5 text-xs opacity-80 sm:text-sm">{e.address}</p>
          </div>
        </div>

        <div className="flex items-start gap-2">
          <HangerIcon />
          <div className="min-w-0">
            <p className="text-sm leading-snug sm:text-base">{e.dress}</p>
            <div className="mt-1.5 flex gap-1" aria-hidden>
              {swatches.map((c, i) => (
                <span key={i} className="h-3.5 w-3.5 rounded-full ring-1 ring-black/10" style={{ background: c }} />
              ))}
            </div>
          </div>
        </div>

        {e.notes && <p className="font-display text-sm leading-snug italic opacity-85 sm:text-base">{e.notes}</p>}

        <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-2.5">
          <a href={e.mapUrl} target="_blank" rel="noopener noreferrer" className="btn btn-solid min-h-10 px-3 text-xs sm:min-h-11 sm:px-5 sm:text-sm">
            Directions
          </a>
          <button type="button" onClick={() => downloadIcs(e)} className="btn btn-ghost min-h-10 px-3 text-xs sm:min-h-11 sm:px-5 sm:text-sm">
            <span className="sm:hidden">Calendar</span>
            <span className="hidden sm:inline">Save the date</span>
          </button>
          <a href={googleCalendarUrl(e)} target="_blank" rel="noopener noreferrer" className="text-[11px] underline decoration-accent/60 underline-offset-4 opacity-75 sm:text-xs">
            Google Calendar
          </a>
        </div>
      </div>
    </article>
  )
}

function PinIcon() {
  return (
    <svg viewBox="0 0 24 24" className="mt-1 h-4 w-4 shrink-0 text-accent" aria-hidden>
      <path fill="currentColor" d="M12 2a7 7 0 0 0-7 7c0 5.2 7 13 7 13s7-7.8 7-13a7 7 0 0 0-7-7Zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5Z" />
    </svg>
  )
}

function HangerIcon() {
  return (
    <svg viewBox="0 0 24 24" className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden>
      <path fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" d="M12 7.5a2 2 0 1 1 2-2M12 7.5v1.6L3.5 15a1.3 1.3 0 0 0 .7 2.4h15.6a1.3 1.3 0 0 0 .7-2.4L12 9.1" />
    </svg>
  )
}
