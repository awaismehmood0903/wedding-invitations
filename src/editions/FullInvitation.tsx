import { useCallback, useEffect, useMemo, useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import { wedding } from '../config/event'
import { useGuest } from '../hooks/useGuest'
import { usePageLock } from '../hooks/usePageLock'
import { useLenis } from '../hooks/useLenis'
import { useReducedMotion } from '../hooks/useReducedMotion'
import { Loader } from '../components/Loader'
import { GateIntro } from '../components/GateIntro'
import { Hero } from '../components/Hero'
import { Greeting } from '../components/Greeting'
import { EventSection } from '../components/EventSection'
import { Countdown } from '../components/Countdown'
import { Footer } from '../components/Footer'
import { MusicToggle } from '../components/MusicToggle'
import { Petals } from '../components/Petals'
import { ThemeBackdrop, ZoneContext, type Zone } from '../components/ThemeBackdrop'

type Stage = 'loading' | 'gate' | 'open'

/** The all-in-one invitation: doors intro, then all three days. */
export function FullInvitation() {
  const { guest, events } = useGuest()
  const [stage, setStage] = useState<Stage>('loading')
  const [gateVisible, setGateVisible] = useState(true)
  const [zone, setZone] = useState('base')
  useLenis(!useReducedMotion())
  usePageLock(stage !== 'open')

  const zones = useMemo<Zone[]>(() => [{ id: 'base', theme: wedding.baseTheme }, ...events.map((e) => ({ id: e.id, theme: e.theme }))], [events])
  const activeTheme = zones.find((z) => z.id === zone)?.theme ?? wedding.baseTheme

  // Browser chrome follows the section theme.
  useEffect(() => {
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', activeTheme.bg)
  }, [activeTheme])

  const onLoaded = useCallback(() => setStage('gate'), [])

  return (
    <ZoneContext.Provider value={setZone}>
      <ThemeBackdrop zones={zones} active={zone} />
      <Petals active={stage === 'open'} count={zone === 'day2' ? 26 : 16} />

      <main className="relative">
        <Hero start={stage === 'open'} />
        <Greeting guest={guest} events={events} />
        {events.map((e) => (
          <EventSection key={e.id} event={e} />
        ))}
        <Countdown events={events} />
      </main>
      <Footer />

      {stage === 'open' && <MusicToggle className="fixed top-4 right-4 z-40" />}
      {stage !== 'loading' && gateVisible && <GateIntro guest={guest} onOpen={() => setStage('open')} onGone={() => setGateVisible(false)} />}
      <AnimatePresence>{stage === 'loading' && <Loader onDone={onLoaded} />}</AnimatePresence>
    </ZoneContext.Provider>
  )
}
