import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import type { WeddingEvent } from '../config/event'
import { music } from '../lib/music'
import { embossedFlorals, paperGrain, patternUrl } from '../lib/patterns'
import { useReducedMotion } from '../hooks/useReducedMotion'
import { shade } from './CharacterRealistic'
import { WaxSeal } from './WaxSeal'

// Envelope geometry, in % of the screen height.
const FLAP = 57 // tip of the top flap, where the seal sits
const POCKET = 50 // where the side folds meet

type Props = {
  event: WeddingEvent
  guest: string
  /** Fired when the envelope starts gliding away, so the page can rise in behind it. */
  onReveal: () => void
  /** Fired once the envelope is fully gone. */
  onDone: () => void
}

/**
 * Full-screen embossed envelope sealed with the H & S wax stamp. Tapping it lifts the
 * seal, swings the flap open, then the envelope glides down as the invitation rises.
 */
export function Envelope({ event: e, guest, onReveal, onDone }: Props) {
  const env = e.envelope
  const reduced = useReducedMotion()
  const root = useRef<HTMLDivElement>(null)
  const [ready, setReady] = useState(false)
  const [opening, setOpening] = useState(false)

  // Wait for fonts so the seal's monogram never flashes in a fallback face.
  useEffect(() => {
    let alive = true
    Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, 3000))]).then(() => {
      if (!alive) return
      setReady(true)
      music.preload()
    })
    return () => {
      alive = false
    }
  }, [])

  useLayoutEffect(() => {
    if (!ready) return
    const ctx = gsap.context(() => {
      gsap.fromTo('.env-body', { autoAlpha: 0, scale: 1.06 }, { autoAlpha: 1, scale: 1, duration: 1.4, ease: 'power2.out' })
      gsap.fromTo('.env-seal', { autoAlpha: 0, scale: 1.3 }, { autoAlpha: 1, scale: 1, duration: 0.9, delay: 0.5, ease: 'back.out(1.6)' })
      gsap.fromTo('.env-text', { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, duration: 1, delay: 0.9, stagger: 0.15, ease: 'power2.out' })
      if (!reduced) gsap.to('.env-seal-inner', { scale: 1.04, duration: 1.6, delay: 1.6, ease: 'sine.inOut', yoyo: true, repeat: -1 })
    }, root)
    return () => ctx.revert()
  }, [ready, reduced])

  const open = () => {
    if (opening || !ready) return
    setOpening(true)
    void music.start()

    if (reduced) {
      onReveal()
      gsap.to(root.current, { autoAlpha: 0, duration: 0.6, onComplete: onDone })
      return
    }
    const q = gsap.utils.selector(root)
    gsap.killTweensOf(q('.env-seal-inner'))
    gsap
      .timeline({ onComplete: onDone })
      .to(q('.env-text, .env-hint'), { autoAlpha: 0, duration: 0.3, ease: 'power1.out' }, 0)
      // seal: a quick press, then it lifts away
      .to(q('.env-seal-inner'), { scale: 0.92, duration: 0.12, ease: 'power1.inOut' }, 0)
      .to(q('.env-seal'), { y: -40, scale: 1.1, autoAlpha: 0, duration: 0.5, ease: 'power2.out' }, 0.1)
      .to(q('.env-flap-shadow'), { autoAlpha: 0, duration: 0.25 }, 0.2)
      // flap swings up and over in one smooth motion
      .to(q('.env-flap'), { rotateX: 180, duration: 0.85, ease: 'power2.inOut' }, 0.22)
      // fade the flap out before it lies flat, so its lining never shows as a big triangle
      .to(q('.env-flap'), { autoAlpha: 0, duration: 0.3, ease: 'power1.in' }, 0.45)
      // the card slides up out of the pocket
      .to(q('.env-card'), { yPercent: -42, duration: 0.6, ease: 'power2.out' }, 0.8)
      // then the envelope glides down as the invitation rises in behind it
      .add(() => onReveal(), 1.15)
      .to(q('.env-body'), { yPercent: 105, duration: 0.95, ease: 'power2.inOut' }, 1.15)
      .to(q('.env-body'), { autoAlpha: 0, duration: 0.6, ease: 'power1.in' }, 1.3)
      .to(root.current, { backgroundColor: 'rgba(0,0,0,0)', duration: 0.7, ease: 'power1.inOut' }, 1.25)
  }

  const paper = {
    backgroundColor: env.paper,
    backgroundImage: `${embossedFlorals(shade(env.paper, 0.6), shade(env.paper, -0.6))}, ${paperGrain}`,
    backgroundSize: '240px 240px, 180px 180px',
  }
  const liner = { backgroundColor: env.liner, backgroundImage: patternUrl(e.theme.pattern, env.paper, 0.32), backgroundSize: '56px 56px' }

  return (
    <div ref={root} className="fixed inset-0 z-50 overflow-hidden" style={{ backgroundColor: shade(env.paper, -0.35) }}>
      <div
        role="button"
        tabIndex={0}
        onClick={open}
        onKeyDown={(ev) => (ev.key === 'Enter' || ev.key === ' ') && (ev.preventDefault(), open())}
        aria-label={`Open the ${e.title} invitation`}
        className="env-body invisible absolute inset-0 cursor-pointer will-change-transform [perspective:1400px]"
      >
        {/* inside of the envelope */}
        <div className="absolute inset-0" style={{ ...paper, backgroundColor: shade(env.paper, -0.12) }} />

        {/* the card inside */}
        <div className="env-card will-change-transform absolute top-[10%] bottom-0 left-1/2 z-[2] w-[min(84%,520px)] -translate-x-1/2 rounded-t-md shadow-[0_-6px_20px_rgba(0,0,0,0.12)]" style={{ backgroundColor: e.theme.card, backgroundImage: paperGrain }}>
          <div className="absolute inset-x-[6%] top-[4%] bottom-0 rounded-t border border-b-0" style={{ borderColor: `${e.theme.accent}99` }} />
          <p className="font-script absolute inset-x-0 top-[9%] text-center text-[clamp(2rem,9vw,3.4rem)]" style={{ color: e.theme.primary }}>
            {e.title}
          </p>
        </div>

        {/* front pocket: side folds + bottom fold */}
        <div className="absolute inset-0 z-[3]" style={{ clipPath: `polygon(0 0, 50% ${POCKET}%, 100% 0, 100% 100%, 0 100%)` }}>
          <div className="absolute inset-0" style={paper} />
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full" aria-hidden>
            <defs>
              <linearGradient id="env-fold-l" x1="0" x2="1">
                <stop offset="0" stopColor="#000" stopOpacity="0.07" />
                <stop offset="1" stopColor="#000" stopOpacity="0" />
              </linearGradient>
              <linearGradient id="env-fold-r" x1="1" x2="0">
                <stop offset="0" stopColor="#000" stopOpacity="0.09" />
                <stop offset="1" stopColor="#000" stopOpacity="0" />
              </linearGradient>
            </defs>
            <polygon points={`0,0 50,${POCKET} 0,100`} fill="url(#env-fold-l)" />
            <polygon points={`100,0 50,${POCKET} 100,100`} fill="url(#env-fold-r)" />
            <polyline points={`0,100 50,${POCKET + 12} 100,100`} fill="none" stroke={shade(env.paper, -0.18)} strokeWidth="0.8" vectorEffect="non-scaling-stroke" />
            <polyline points={`0,0 50,${POCKET} 100,0`} fill="none" stroke={shade(env.paper, -0.14)} strokeWidth="0.8" vectorEffect="non-scaling-stroke" />
          </svg>
        </div>

        {/* shadow the closed flap casts on the pocket */}
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="env-flap-shadow pointer-events-none absolute inset-x-0 top-0 z-[3] w-full" style={{ height: `${FLAP + 2.5}%` }} aria-hidden>
          <polygon points="0,0 100,0 50,100" fill="#000" opacity="0.13" style={{ filter: 'blur(3px)' }} />
        </svg>

        {/* top flap: embossed paper outside, patterned liner inside */}
        <div className="env-flap absolute inset-x-0 top-0 z-[4] origin-top will-change-transform [transform-style:preserve-3d]" style={{ height: `${FLAP}%` }}>
          <div className="absolute inset-0 [backface-visibility:hidden]" style={{ ...paper, backgroundColor: shade(env.paper, 0.03), clipPath: 'polygon(0 0, 100% 0, 50% 100%)' }} />
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full [backface-visibility:hidden]" aria-hidden>
            <polyline points="0,0 50,100 100,0" fill="none" stroke={shade(env.paper, -0.2)} strokeWidth="0.8" vectorEffect="non-scaling-stroke" />
          </svg>
          <div className="absolute inset-0 [backface-visibility:hidden] [transform:rotateX(180deg)]" style={{ ...liner, clipPath: 'polygon(0 0, 100% 0, 50% 100%)' }} />
        </div>

        {/* wax seal on the flap's tip */}
        <div className="env-seal invisible absolute left-1/2 z-[5] w-[min(36vw,190px)] -translate-x-1/2 -translate-y-1/2" style={{ top: `${FLAP}%` }}>
          <div className="env-seal-inner">
            <WaxSeal color={env.seal} ink={env.sealInk} className="h-auto w-full" />
          </div>
        </div>

        {/* writing on the pocket */}
        <div className="pointer-events-none absolute inset-x-0 top-[71%] z-[5] px-6 text-center" style={{ color: env.ink }}>
          <p className="env-text invisible font-script text-[clamp(1.9rem,8.5vw,3.2rem)] leading-tight">Requests the pleasure of your company</p>
          <p className="env-text invisible mt-3 text-[10px] tracking-[0.3em] uppercase opacity-80 sm:text-xs">Dear {guest}</p>
        </div>
      </div>

      <p className="env-text env-hint invisible pointer-events-none absolute inset-x-0 bottom-[4svh] z-[6] text-center text-[10px] tracking-[0.3em] uppercase sm:text-xs" style={{ color: env.ink }}>
        <span className="seal-pulse inline-block">Tap the seal to open</span>
      </p>
    </div>
  )
}
