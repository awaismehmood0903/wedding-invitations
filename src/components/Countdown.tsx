import { useMemo, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import type { WeddingEvent } from '../config/event'
import { eventInstant } from '../lib/time'
import { useCountdown } from '../hooks/useCountdown'
import { useReveal } from '../hooks/useReveal'
import { useThemeZone } from './ThemeBackdrop'

/** Live countdown to the next upcoming event the guest is invited to (Day 1 first). */
export function Countdown({ events }: { events: WeddingEvent[] }) {
  const ref = useRef<HTMLElement>(null)
  useThemeZone(ref, 'base')
  useReveal(ref)

  const next = useMemo(() => events.find((e) => eventInstant(e, 'end') > new Date()) ?? null, [events])
  const target = useMemo(() => (next ? eventInstant(next) : null), [next])
  const left = useCountdown(target)

  return (
    <section ref={ref} className="relative z-10 px-5 py-24 text-center text-ink" aria-labelledby="countdown-title">
      {!next || !left ? (
        <p className="reveal font-script text-5xl text-primary">Alhamdulillah — thank you for celebrating with us</p>
      ) : (
        <>
          <p className="reveal text-xs tracking-[0.35em] text-accent uppercase">{left.done ? 'Happening now' : 'Counting down to the'}</p>
          <h2 id="countdown-title" className="reveal font-script mt-2 text-6xl text-primary">
            {next.title}
          </h2>
          {!left.done && (
            <div className="reveal mx-auto mt-10 grid max-w-md grid-cols-4 gap-2.5 sm:gap-4" role="timer" aria-live="off">
              <Tile value={left.days} label="Days" />
              <Tile value={left.hours} label="Hours" />
              <Tile value={left.minutes} label="Minutes" />
              <Tile value={left.seconds} label="Seconds" />
            </div>
          )}
        </>
      )}
    </section>
  )
}

function Tile({ value, label }: { value: number; label: string }) {
  const text = String(value).padStart(2, '0')
  return (
    <div className="rounded-t-[3rem] rounded-b-2xl border border-accent/40 bg-card px-1 pt-5 pb-3 shadow-sm">
      <div className="font-display relative h-10 overflow-hidden text-4xl leading-10 font-semibold text-primary tabular-nums sm:h-12 sm:text-5xl sm:leading-[3rem]">
        <AnimatePresence initial={false} mode="popLayout">
          <motion.span
            key={text}
            className="block"
            initial={{ y: '-100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          >
            {text}
          </motion.span>
        </AnimatePresence>
      </div>
      <p className="mt-1 text-[10px] tracking-[0.2em] uppercase opacity-75">{label}</p>
    </div>
  )
}
