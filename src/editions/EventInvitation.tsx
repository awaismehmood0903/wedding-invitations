import { useLayoutEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { wedding, type WeddingEvent } from '../config/event'
import { useGuest } from '../hooks/useGuest'
import { useLenis } from '../hooks/useLenis'
import { usePageLock } from '../hooks/usePageLock'
import { useReducedMotion } from '../hooks/useReducedMotion'
import { useReveal } from '../hooks/useReveal'
import { paperGrain } from '../lib/patterns'
import { themeVars } from '../lib/theme'
import { formatDay, formatMonthYear, formatTime, formatWeekdayLong } from '../lib/time'
import { Arch } from '../components/Arch'
import { Couple } from '../components/Couple'
import { Countdown } from '../components/Countdown'
import { Envelope } from '../components/Envelope'
import { EventCard } from '../components/EventCard'
import { Footer } from '../components/Footer'
import { Monogram } from '../components/Monogram'
import { MusicToggle } from '../components/MusicToggle'
import { Petals } from '../components/Petals'
import { ThemeBackdrop } from '../components/ThemeBackdrop'
import type { Pose } from '../components/Character'

type Stage = 'envelope' | 'opening' | 'open'

/** A single-event invitation (Nikkah, Barat or Walima): envelope → card → details → couple. */
export function EventInvitation({ event: e }: { event: WeddingEvent }) {
  const { guest } = useGuest()
  const [stage, setStage] = useState<Stage>('envelope')
  useLenis(!useReducedMotion())
  usePageLock(stage !== 'open')

  // The whole page wears this event's colours.
  useLayoutEffect(() => {
    const root = document.documentElement
    Object.entries(themeVars(e.theme)).forEach(([k, v]) => root.style.setProperty(k, String(v)))
    document.body.style.background = e.theme.bg
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', e.theme.bg)
  }, [e])

  return (
    <>
      <ThemeBackdrop zones={[{ id: 'base', theme: e.theme }]} active="base" />
      <Petals active={stage !== 'envelope'} count={e.slug === 'barat' ? 24 : 16} />

      <main className="relative">
        <InviteCard event={e} start={stage !== 'envelope'} />
        <Details event={e} />
        <Countdown events={[e]} />
        <CoupleScene event={e} />
      </main>
      <Footer />

      {stage !== 'envelope' && <MusicToggle className="fixed top-4 right-4 z-40" />}
      {stage !== 'open' && <Envelope event={e} guest={guest} onOpen={() => setStage('opening')} onDone={() => setStage('open')} />}
    </>
  )
}

/** The formal invitation card the guest lands on after the envelope opens. */
function InviteCard({ event: e, start }: { event: WeddingEvent; start: boolean }) {
  const ref = useRef<HTMLElement>(null)
  const reduced = useReducedMotion()
  const { groom, bride, groomFull, brideFull, groomParents, brideParents } = wedding.couple

  useLayoutEffect(() => {
    if (reduced) return
    const ctx = gsap.context(() => {
      gsap.set('.inv-frame, .inv-in', { autoAlpha: 0 })
      if (!start) return
      gsap
        .timeline({ delay: 0.9, defaults: { ease: 'power3.out' } })
        .fromTo('.inv-frame', { y: 50, scale: 0.94 }, { y: 0, scale: 1, autoAlpha: 1, duration: 1.1 })
        .fromTo('.inv-in', { y: 18 }, { y: 0, autoAlpha: 1, duration: 0.8, stagger: 0.11 }, '-=0.6')
    }, ref)
    return () => ctx.revert()
  }, [start, reduced])

  return (
    <section ref={ref} className="relative z-10 flex min-h-[100svh] items-center justify-center px-4 py-16 text-ink">
      <div
        className="inv-frame relative w-full max-w-md rounded-[1.75rem] sm:max-w-lg px-6 py-10 text-center shadow-[0_30px_80px_-30px_rgba(0,0,0,0.45)] ring-1 ring-accent/40 sm:px-10 sm:py-12"
        style={{ backgroundColor: e.theme.card, backgroundImage: paperGrain }}
      >
        <Frame />
        <Monogram className="inv-in mx-auto w-16 text-accent" />
        <p className="inv-in font-arabic mt-3 text-xl leading-loose text-primary" lang="ar" dir="rtl">
          {wedding.bismillah}
        </p>
        <p className="inv-in mt-3 text-[10px] tracking-[0.35em] text-accent uppercase">Together with their families</p>

        <h1 className="inv-in font-script mt-4 text-[clamp(2.6rem,12.5vw,3.6rem)] leading-[1.05] text-primary">
          {groom} <span className="font-display align-middle text-[0.45em] text-accent">&amp;</span> {bride}
        </h1>
        <p className="inv-in font-display mt-2 text-sm tracking-[0.14em] uppercase">
          {groomFull} <span className="text-accent">·</span> {brideFull}
        </p>
        {(groomParents || brideParents) && (
          <p className="inv-in mt-2 text-xs opacity-75">
            {[groomParents, brideParents].filter(Boolean).join(' · ')}
          </p>
        )}

        <p className="inv-in font-display mt-6 text-base italic opacity-90">request the honour of your presence at the</p>
        <p className="inv-in font-urdu mt-3 text-3xl leading-[1.9] text-primary" lang="ur" dir="rtl">
          {e.titleUrdu}
        </p>
        <h2 className="inv-in font-script mt-1 text-6xl leading-none text-primary">{e.title}</h2>

        <div className="inv-in mx-auto mt-7 flex max-w-xs items-center justify-center gap-4">
          <span className="flex-1 border-t border-accent/50 pt-2 text-[11px] tracking-[0.2em] uppercase">{formatWeekdayLong(e)}</span>
          <span className="font-display text-5xl leading-none font-semibold text-primary">{formatDay(e)}</span>
          <span className="flex-1 border-t border-accent/50 pt-2 text-[11px] tracking-[0.2em] uppercase">{formatTime(e.date, e.startTime)}</span>
        </div>
        <p className="inv-in font-display mt-2 text-lg">{formatMonthYear(e)}</p>
        <p className="inv-in mt-4 text-sm opacity-85">
          {e.venue}
          <br />
          <span className="text-xs opacity-80">{e.address}</span>
        </p>
      </div>
    </section>
  )
}

/** Gold double rule with corner flourishes inside the invitation card. */
function Frame() {
  const corner = (cls: string) => (
    <svg viewBox="0 0 40 40" className={`absolute h-9 w-9 text-accent ${cls}`} aria-hidden>
      <path d="M2 38 V14 Q2 2 14 2 H38" fill="none" stroke="currentColor" strokeWidth="1.4" />
      <path d="M8 38 V18 Q8 8 18 8 H38" fill="none" stroke="currentColor" strokeWidth="0.7" opacity="0.7" />
      <circle cx="14" cy="14" r="2" fill="currentColor" />
    </svg>
  )
  return (
    <div className="pointer-events-none absolute inset-3 rounded-[1.25rem] border border-accent/30" aria-hidden>
      {corner('-top-px -left-px')}
      {corner('-top-px -right-px rotate-90')}
      {corner('-bottom-px -right-px rotate-180')}
      {corner('-bottom-px -left-px -rotate-90')}
    </div>
  )
}

/** The day's wish and the ticket-style details card. */
function Details({ event: e }: { event: WeddingEvent }) {
  const ref = useRef<HTMLElement>(null)
  useReveal(ref)
  return (
    <section ref={ref} className="relative z-10 px-4 py-20 text-ink">
      <div className="mx-auto max-w-2xl text-center">
        <p className="reveal font-display text-lg italic opacity-90 sm:text-xl">{e.tagline}</p>
        <div className="reveal mx-auto my-6 h-px w-20 bg-accent/70" aria-hidden />
        <blockquote className="reveal">
          <p className="font-display text-xl leading-relaxed sm:text-2xl">“{e.wish}”</p>
          {e.wishSource && <footer className="font-display mt-3 text-base text-accent italic">— {e.wishSource}</footer>}
        </blockquote>
      </div>
      <div className="mt-14">
        <EventCard event={e} />
      </div>
    </section>
  )
}

const SETTLE: Pose[] = ['wave', 'together']

/** The couple, in this day's outfits, walking in under the dome. */
function CoupleScene({ event: e }: { event: WeddingEvent }) {
  const ref = useRef<HTMLElement>(null)
  const reduced = useReducedMotion()
  const [arrive, setArrive] = useState(reduced)
  useReveal(ref)

  useLayoutEffect(() => {
    if (reduced) return setArrive(true)
    const st = ScrollTrigger.create({ trigger: ref.current, start: 'top 55%', once: true, onEnter: () => setArrive(true) })
    return () => st.kill()
  }, [reduced])

  return (
    <section ref={ref} className="relative z-10 flex min-h-[100svh] flex-col items-center justify-center overflow-hidden px-4 py-16 text-center text-ink">
      <p className="reveal text-xs tracking-[0.35em] text-accent uppercase">{e.title} · {formatDay(e)} {formatMonthYear(e)}</p>
      <div className="relative mt-6 aspect-[400/520] w-[min(92vw,460px)] transition-[scale] duration-500 ease-out motion-safe:hover:scale-105">
        <Arch className="pointer-events-none absolute inset-0 h-full w-full text-accent" />
        <div className="absolute inset-x-[13%] bottom-[2%]">
          <Couple groom={e.outfit.groom} bride={e.outfit.bride} arrive={arrive} settle={SETTLE} day={e.day} look="real" />
        </div>
      </div>
      <p className="reveal font-script mt-6 text-4xl text-primary sm:text-5xl">We can’t wait to celebrate with you</p>
    </section>
  )
}
