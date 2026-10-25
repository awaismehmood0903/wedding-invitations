import { useRef, type ReactNode } from 'react'
import { wedding, type WeddingEvent } from '../config/event'
import { useReveal } from '../hooks/useReveal'
import { downloadIcs, googleCalendarUrl } from '../lib/ics'
import { paperGrain, patternUrl } from '../lib/patterns'
import { formatDay, formatMonthYear, formatTime, formatWeekdayLong } from '../lib/time'
import { Monogram } from './Monogram'

/** Two stacked cards for a single-event invitation: the invitation itself, then the venue and practical details. */
export function EventDetails({ event: e }: { event: WeddingEvent }) {
  const ref = useRef<HTMLElement>(null)
  useReveal(ref, { y: 50, duration: 0.9, stagger: 0.1 })
  return (
    <section ref={ref} className="relative z-10 space-y-4 px-3 pt-8 pb-6 text-ink sm:space-y-6 sm:px-6 sm:py-20">
      <InviteCard event={e} />
      <VenueCard event={e} />
    </section>
  )
}

const cardShell = 'reveal relative mx-auto w-full max-w-3xl overflow-hidden rounded-[1.5rem] shadow-[0_24px_60px_-28px_rgba(0,0,0,0.45)] ring-1 ring-accent/40 sm:rounded-[1.75rem]'

/** Couple, event and date: centred on phones, names and date side by side on wider screens. */
function InviteCard({ event: e }: { event: WeddingEvent }) {
  const { groom, bride, groomFull, brideFull, groomParents, brideParents } = wedding.couple
  return (
    <article
      className={`${cardShell} text-center`}
      style={{ backgroundColor: e.scene.frame, backgroundImage: `${patternUrl(e.theme.pattern, e.theme.accent, 0.12)}, ${paperGrain}`, backgroundSize: '64px 64px, 180px 180px' }}
      aria-label={`${e.title} invitation`}
    >
      <Frame />
      <div className="grid items-center gap-5 px-6 py-8 sm:grid-cols-[1.25fr_auto_1fr] sm:gap-8 sm:px-12 sm:py-12">
        <div>
          <Monogram className="mx-auto w-12 text-accent sm:w-14" />
          <p className="font-arabic mt-2 text-lg leading-loose text-primary" lang="ar" dir="rtl">
            {wedding.bismillah}
          </p>
          <p className="mt-1 text-[10px] tracking-[0.32em] text-accent uppercase">Together with their families</p>
          <h1 className="font-script mt-2 text-[clamp(2.6rem,12vw,3.6rem)] leading-[1.05] whitespace-nowrap sm:text-[clamp(2.4rem,4.4vw,3.2rem)] text-primary">
            {groom} <span className="font-display align-middle text-[0.45em] text-accent">&amp;</span> {bride}
          </h1>
          <p className="font-display mt-1 text-[11px] tracking-[0.14em] uppercase sm:text-xs">
            {groomFull} <span className="text-accent">·</span> {brideFull}
          </p>
          {(groomParents || brideParents) && <p className="mt-1 text-xs opacity-75">{[groomParents, brideParents].filter(Boolean).join(' · ')}</p>}
        </div>

        {/* divider: a short rule on phones, a vertical line on wider screens */}
        <div className="ornament mx-auto w-40 sm:hidden" aria-hidden>
          <span className="text-[10px]">◆</span>
        </div>
        <div className="hidden h-44 w-px self-center bg-gradient-to-b from-transparent via-accent/60 to-transparent sm:block" aria-hidden />

        <div>
          <p className="font-display text-base italic opacity-90">request the honour of your presence at the</p>
          <h2 className="font-script mt-1 text-6xl leading-none text-primary">{e.title}</h2>
          <div className="mx-auto mt-5 flex max-w-[16rem] items-center justify-center gap-3">
            <span className="flex-1 border-y border-accent/50 py-1.5 text-[10px] tracking-[0.2em] uppercase">{formatWeekdayLong(e)}</span>
            <span className="font-display text-5xl leading-none font-semibold text-primary">{formatDay(e)}</span>
            <span className="flex-1 border-y border-accent/50 py-1.5 text-[10px] tracking-[0.2em] uppercase">{formatTime(e.date, e.startTime)}</span>
          </div>
          <p className="font-display mt-1.5 text-lg">{formatMonthYear(e)}</p>
        </div>
      </div>
    </article>
  )
}

const ICONS = {
  pin: 'M12 2a7 7 0 0 0-7 7c0 5.2 7 13 7 13s7-7.8 7-13a7 7 0 0 0-7-7Zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5Z',
  clock: 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm1 10.4 3.2 1.9-.8 1.3L11 13V6.5h2v5.9Z',
  dress: 'M9 2h6l-1 3 4 4-2 2v11H8V11L6 9l4-4-1-3Z',
  note: 'M5 3h14v18l-7-4-7 4V3Z',
  calendar: 'M7 2h2v2h6V2h2v2h3v18H4V4h3V2Zm-1 8v10h12V10H6Z',
}

function Icon({ name, className = 'h-[18px] w-[18px]' }: { name: keyof typeof ICONS; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path fill="currentColor" d={ICONS[name]} />
    </svg>
  )
}

function InfoTile({ icon, label, children }: { icon: keyof typeof ICONS; label: string; children: ReactNode }) {
  return (
    <div className="flex h-full items-start gap-3 rounded-2xl bg-bg/60 p-3.5 ring-1 ring-accent/20 sm:p-4">
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary text-card">
        <Icon name={icon} />
      </span>
      <div className="min-w-0">
        <p className="text-[10px] tracking-[0.26em] text-accent uppercase">{label}</p>
        <div className="mt-0.5">{children}</div>
      </div>
    </div>
  )
}

/** Venue up top with directions, then time, dress code and note as icon tiles. */
function VenueCard({ event: e }: { event: WeddingEvent }) {
  return (
    <article className={cardShell} style={{ backgroundColor: e.theme.card, backgroundImage: paperGrain }} aria-label={`${e.title} venue and details`}>
      <div className="px-5 pt-7 pb-5 text-center sm:px-10 sm:pt-9 sm:pb-6">
        <span className="mx-auto grid h-11 w-11 place-items-center rounded-full text-accent ring-1 ring-accent/50">
          <Icon name="pin" className="h-5 w-5" />
        </span>
        <p className="mt-3 text-[10px] tracking-[0.35em] text-accent uppercase">The venue</p>
        <h3 className="font-display mt-1 text-2xl leading-tight font-semibold text-primary sm:text-3xl">{e.venue}</h3>
        <p className="mx-auto mt-1 max-w-md text-sm opacity-80">{e.address}</p>
        <div className="mt-5 grid grid-cols-2 gap-2 sm:mx-auto sm:flex sm:w-fit sm:gap-3">
          <a href={e.mapUrl} target="_blank" rel="noopener noreferrer" className="btn btn-solid px-2 text-[13px] whitespace-nowrap sm:px-6 sm:text-sm">
            <Icon name="pin" className="h-4 w-4" />
            Directions
          </a>
          <button type="button" onClick={() => downloadIcs(e)} className="btn btn-ghost px-2 text-[13px] whitespace-nowrap sm:px-6 sm:text-sm">
            <Icon name="calendar" className="h-4 w-4" />
            Save the date
          </button>
        </div>
      </div>

      <div className="mx-5 h-px bg-gradient-to-r from-transparent via-accent/50 to-transparent sm:mx-10" aria-hidden />

      <div className="grid gap-2.5 p-3 sm:grid-cols-2 sm:gap-4 sm:p-8">
        <InfoTile icon="clock" label="Time">
          <p className="font-display text-lg leading-snug">
            {formatTime(e.date, e.startTime)} – {formatTime(e.date, e.endTime)}
          </p>
          <p className="text-xs opacity-70">
            {formatWeekdayLong(e)}, {formatDay(e)} {formatMonthYear(e)} · {wedding.timezoneLabel}
          </p>
        </InfoTile>
        <InfoTile icon="dress" label="Dress code">
          <p className="font-display text-lg leading-snug">{e.dress}</p>
          <div className="mt-1.5 flex gap-1" aria-hidden>
            {[e.outfit.bride.dress, e.outfit.bride.dupatta, e.outfit.groom.coat, e.theme.accent].map((c, i) => (
              <span key={i} className="h-3.5 w-3.5 rounded-full ring-1 ring-black/10" style={{ background: c }} />
            ))}
          </div>
        </InfoTile>
        {e.notes && (
          <div className="sm:col-span-2">
            <InfoTile icon="note" label="Please note">
              <p className="font-display text-base leading-snug italic">{e.notes}</p>
            </InfoTile>
          </div>
        )}
      </div>

      <p className="pb-5 text-center sm:pb-7">
        <a href={googleCalendarUrl(e)} target="_blank" rel="noopener noreferrer" className="text-xs underline decoration-accent/60 underline-offset-4 opacity-75">
          Add to Google Calendar
        </a>
      </p>
    </article>
  )
}

/** Gold double rule with corner flourishes. */
function Frame() {
  const corner = (cls: string) => (
    <svg viewBox="0 0 40 40" className={`absolute h-7 w-7 text-accent sm:h-9 sm:w-9 ${cls}`} aria-hidden>
      <path d="M2 38 V14 Q2 2 14 2 H38" fill="none" stroke="currentColor" strokeWidth="1.4" />
      <path d="M8 38 V18 Q8 8 18 8 H38" fill="none" stroke="currentColor" strokeWidth="0.7" opacity="0.7" />
      <circle cx="14" cy="14" r="2" fill="currentColor" />
    </svg>
  )
  return (
    <div className="pointer-events-none absolute inset-2.5 rounded-[1.1rem] border border-accent/30 sm:inset-3 sm:rounded-[1.25rem]" aria-hidden>
      {corner('-top-px -left-px')}
      {corner('-top-px -right-px rotate-90')}
      {corner('-bottom-px -right-px rotate-180')}
      {corner('-bottom-px -left-px -rotate-90')}
    </div>
  )
}
