import { useLayoutEffect, useRef, useState } from 'react'
import type { WeddingEvent } from '../config/event'
import { useGuest } from '../hooks/useGuest'
import { useLenis } from '../hooks/useLenis'
import { usePageLock } from '../hooks/usePageLock'
import { useReducedMotion } from '../hooks/useReducedMotion'
import { useReveal } from '../hooks/useReveal'
import { themeVars } from '../lib/theme'
import { Countdown } from '../components/Countdown'
import { EventDetails } from '../components/EventDetails'
import { Envelope } from '../components/Envelope'
import { Footer } from '../components/Footer'
import { MusicToggle } from '../components/MusicToggle'
import { Petals } from '../components/Petals'
import { ThemeBackdrop } from '../components/ThemeBackdrop'
import { WeddingScene } from '../components/scene/WeddingScene'

type Stage = 'envelope' | 'revealing' | 'open'

/**
 * A single-event invitation (Nikkah, Barat or Walima):
 * envelope → curtains part on the couple → names → details → countdown → the rest.
 */
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
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', e.scene.frame)
  }, [e])

  return (
    <>
      <ThemeBackdrop zones={[{ id: 'base', theme: e.theme }]} active="base" />
      <Petals active={stage === 'open'} count={e.slug === 'barat' ? 22 : 14} />

      <main className="relative">
        <WeddingScene event={e} start={stage !== 'envelope'} />
        <EventDetails event={e} />
        <Countdown events={[e]} />
        <Wish event={e} />
      </main>
      <Footer />

      {stage === 'open' && <MusicToggle className="fixed right-4 bottom-4 z-40" />}
      {stage !== 'open' && <Envelope event={e} guest={guest} onReveal={() => setStage('revealing')} onDone={() => setStage('open')} />}
    </>
  )
}

/** The day's wish, after the countdown. */
function Wish({ event: e }: { event: WeddingEvent }) {
  const ref = useRef<HTMLElement>(null)
  useReveal(ref, { y: 60, duration: 1.3 })
  return (
    <section ref={ref} className="relative z-10 px-5 py-8 text-center text-ink sm:py-16">
      <div className="mx-auto max-w-2xl">
        <p className="reveal font-display text-lg italic opacity-90 sm:text-xl">{e.tagline}</p>
        <div className="reveal mx-auto my-6 h-px w-20 bg-accent/70" aria-hidden />
        <blockquote className="reveal">
          <p className="font-display text-xl leading-relaxed sm:text-2xl">“{e.wish}”</p>
          {e.wishSource && <footer className="font-display mt-3 text-base text-accent italic">— {e.wishSource}</footer>}
        </blockquote>
      </div>
    </section>
  )
}
