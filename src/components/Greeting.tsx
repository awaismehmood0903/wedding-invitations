import { useRef } from 'react'
import { wedding, type WeddingEvent } from '../config/event'
import { formatDay, formatMonth } from '../lib/time'
import { useReveal } from '../hooks/useReveal'
import { useThemeZone } from './ThemeBackdrop'

const NUMBER_WORDS = ['', 'one', 'two', 'three']

/** "Dear {guest}" invitation text plus a compact schedule of the days they're invited to. */
export function Greeting({ guest, events }: { guest: string; events: WeddingEvent[] }) {
  const ref = useRef<HTMLElement>(null)
  const { groomFull, brideFull, groomParents, brideParents } = wedding.couple
  useThemeZone(ref, 'base')
  useReveal(ref)

  const count = events.length
  const scheduleLine =
    count === 1 ? `Please join us for the ${events[0].title}` : `Please join us for ${NUMBER_WORDS[count]} days of celebration`

  return (
    <section ref={ref} className="relative z-10 px-5 py-24 text-center text-ink" aria-labelledby="greeting-title">
      <div className="mx-auto max-w-xl">
        <p className="reveal font-display text-sm tracking-[0.35em] text-accent uppercase">Assalam-o-Alaikum</p>
        <h2 id="greeting-title" className="reveal font-script mt-4 text-5xl text-primary sm:text-6xl">
          Dear {guest},
        </h2>
        <p className="reveal font-display mx-auto mt-6 max-w-md text-xl leading-relaxed sm:text-2xl">{wedding.invitationLine}</p>

        <div className="reveal mt-10 space-y-1">
          <p className="font-display text-3xl font-semibold text-primary sm:text-4xl">{groomFull}</p>
          {groomParents && <p className="text-sm opacity-75">{groomParents}</p>}
        </div>
        <p className="reveal font-script my-3 text-4xl text-accent">with</p>
        <div className="reveal space-y-1">
          <p className="font-display text-3xl font-semibold text-primary sm:text-4xl">{brideFull}</p>
          {brideParents && <p className="text-sm opacity-75">{brideParents}</p>}
        </div>

        <div className="reveal ornament mx-auto mt-12 max-w-xs">
          <span className="text-xs">◆</span>
        </div>
        <p className="reveal font-display mt-6 text-lg italic">{scheduleLine}</p>

        <ol className="mt-8 flex justify-center gap-3 sm:gap-5">
          {events.map((e) => (
            <li key={e.id} className="reveal">
              <a
                href={`#${e.id}`}
                className="flex w-24 flex-col items-center rounded-t-full border px-2 pt-6 pb-4 transition-transform hover:-translate-y-1 sm:w-28"
                style={{ borderColor: `${e.theme.accent}88`, background: `${e.theme.bg}` , color: e.theme.ink }}
              >
                <span className="text-[10px] tracking-[0.25em] uppercase opacity-80">Day {e.day}</span>
                <span className="font-display mt-1 text-3xl leading-none font-semibold" style={{ color: e.theme.primary }}>
                  {formatDay(e)}
                </span>
                <span className="text-xs uppercase">{formatMonth(e)}</span>
                <span className="font-display mt-2 text-base font-semibold">{e.title}</span>
              </a>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
