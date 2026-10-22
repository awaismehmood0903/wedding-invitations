import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { wedding, type WeddingEvent } from '../config/event'
import { music } from '../lib/music'
import { paperGrain, patternUrl } from '../lib/patterns'
import { formatDay, formatMonthYear } from '../lib/time'
import { useReducedMotion } from '../hooks/useReducedMotion'
import { shade } from './CharacterRealistic'
import { WaxSeal } from './WaxSeal'

// Envelope geometry, in % of the envelope's height.
const FLAP = 55 // tip of the top flap (where the seal sits)
const POCKET = 47 // where the side folds meet

/**
 * Zoomed-in envelope sealed with the H & S wax stamp. Tapping it pulls back,
 * breaks the seal, swings the flap open and slides the invitation card out.
 */
export function Envelope({ event: e, guest, onOpen, onDone }: { event: WeddingEvent; guest: string; onOpen: () => void; onDone: () => void }) {
  const env = e.envelope
  const reduced = useReducedMotion()
  const root = useRef<HTMLDivElement>(null)
  const [ready, setReady] = useState(false)
  const [opening, setOpening] = useState(false)
  const { groom, bride } = wedding.couple

  // Wait for fonts so the seal's monogram never flashes in a fallback face.
  useEffect(() => {
    let alive = true
    Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, 3000))]).then(() => alive && setReady(true))
    return () => {
      alive = false
    }
  }, [])

  useLayoutEffect(() => {
    if (!ready) return
    const ctx = gsap.context(() => {
      gsap.set('.env-stage', { scale: reduced ? 1 : 1.45 })
      gsap.fromTo('.env-stage', { autoAlpha: 0, y: 30 }, { autoAlpha: 1, y: 0, duration: 1.1, ease: 'power3.out' })
      gsap.fromTo('.env-hint', { autoAlpha: 0 }, { autoAlpha: 1, delay: 1, duration: 0.8 })
      if (!reduced) gsap.to('.env-float', { y: -8, duration: 2.2, ease: 'sine.inOut', yoyo: true, repeat: -1 })
    }, root)
    return () => ctx.revert()
  }, [ready, reduced])

  const open = () => {
    if (opening || !ready) return
    setOpening(true)
    void music.start()
    onOpen()

    if (reduced) {
      gsap.to(root.current, { autoAlpha: 0, duration: 0.5, onComplete: onDone })
      return
    }
    const q = gsap.utils.selector(root)
    gsap.killTweensOf(q('.env-float'))
    gsap
      .timeline({ defaults: { ease: 'power2.inOut' }, onComplete: onDone })
      .to(q('.env-hint'), { autoAlpha: 0, duration: 0.3 }, 0)
      .to(q('.env-float'), { y: 0, duration: 0.3 }, 0)
      .to(q('.env-stage'), { scale: 1, duration: 0.9 }, 0)
      // press, then the seal breaks away
      .to(q('.env-seal'), { scale: 0.88, duration: 0.14, ease: 'power1.in' }, 0.55)
      .to(q('.env-seal'), { scale: 1.35, y: -40, rotate: -18, autoAlpha: 0, duration: 0.5, ease: 'power2.in' }, 0.69)
      .to(q('.env-flap-shadow'), { autoAlpha: 0, duration: 0.25 }, 0.95)
      // flap swings up and over; once past vertical it drops behind the card
      .to(q('.env-flap'), { rotateX: 180, duration: 1, ease: 'power2.inOut' }, 1)
      .set(q('.env-flap'), { zIndex: 1 }, 1.5)
      // the card slides out
      .to(q('.env-card'), { yPercent: -64, duration: 1.1, ease: 'power3.out' }, 1.85)
      .to(q('.env-card-inner'), { scale: 1.04, duration: 1.1, ease: 'power3.out' }, 1.85)
      // fade into the invitation
      .to(q('.env-stage'), { y: '18vh', scale: 1.08, autoAlpha: 0, duration: 0.9, ease: 'power2.in' }, 3.25)
      .to(root.current, { autoAlpha: 0, duration: 0.7 }, 3.55)
  }

  const paper = { backgroundColor: env.paper, backgroundImage: paperGrain }

  return (
    <div
      ref={root}
      className="fixed inset-0 z-50 grid place-items-center overflow-hidden"
      style={{
        backgroundColor: e.theme.bg,
        backgroundImage: `radial-gradient(ellipse at 50% 45%, transparent 10%, ${shade(e.theme.bg, -0.25)} 120%), ${patternUrl(e.theme.pattern, e.theme.accent, 0.16)}`,
        backgroundSize: e.theme.pattern === 'jharokha' ? 'auto, 96px 120px' : 'auto, 80px 80px',
      }}
    >
      <div className="env-float">
        <div
          role="button"
          tabIndex={0}
          onClick={open}
          onKeyDown={(ev) => (ev.key === 'Enter' || ev.key === ' ') && (ev.preventDefault(), open())}
          aria-label={`Open the ${e.title} invitation`}
          className="env-stage invisible relative block aspect-[3/4] w-[min(84vw,58svh)] cursor-pointer [perspective:1600px] sm:aspect-[7/5] sm:w-[min(64vw,108svh,620px)]"
        >
          {/* back panel (inside of the envelope) */}
          <div className="absolute inset-0 rounded-[6px] shadow-[0_30px_70px_-25px_rgba(0,0,0,0.55)]" style={{ ...paper, backgroundColor: shade(env.paper, -0.1) }} />
          <div
            className="absolute inset-x-0 top-0 rounded-t-[6px]"
            style={{
              height: `${FLAP}%`,
              backgroundColor: env.liner,
              backgroundImage: patternUrl(e.theme.pattern, env.paper, 0.35),
              backgroundSize: '56px 56px',
              clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)',
              opacity: 0.9,
            }}
          />

          {/* the invitation card */}
          <div className="env-card absolute inset-x-[7%] top-[5%] bottom-[7%] z-[2]">
            <div
              className="env-card-inner flex h-full flex-col items-center justify-start rounded-[4px] px-3 pt-[9%] text-center shadow-md ring-1 ring-black/5"
              style={{ backgroundColor: e.theme.card, backgroundImage: paperGrain, color: e.theme.ink }}
            >
              <div className="absolute inset-[5%] rounded-[3px] border" style={{ borderColor: `${e.theme.accent}88` }} />
              <p className="text-[9px] tracking-[0.3em] uppercase sm:text-[10px]" style={{ color: e.theme.accent }}>
                The {e.title} of
              </p>
              <p className="font-script mt-1 text-[clamp(1.6rem,7vw,2.6rem)] leading-tight" style={{ color: e.theme.primary }}>
                {groom} &amp; {bride}
              </p>
              <p className="font-display mt-1 text-sm sm:text-base">
                {formatDay(e)} {formatMonthYear(e)}
              </p>
            </div>
          </div>

          {/* front pocket: side folds + bottom fold */}
          <div className="absolute inset-0 z-[3] overflow-hidden rounded-[6px]" style={{ clipPath: `polygon(0 0, 50% ${POCKET}%, 100% 0, 100% 100%, 0 100%)` }}>
            <div className="absolute inset-0" style={paper} />
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full" aria-hidden>
              <polygon points={`0,0 50,${POCKET} 0,100`} fill={shade(env.paper, -0.07)} />
              <polygon points={`100,0 50,${POCKET} 100,100`} fill={shade(env.paper, -0.05)} />
              <polygon points={`0,100 50,${POCKET + 9} 100,100`} fill={shade(env.paper, 0.03)} />
              <polyline points={`0,100 50,${POCKET + 9} 100,100`} fill="none" stroke={shade(env.paper, -0.2)} strokeWidth="0.6" vectorEffect="non-scaling-stroke" />
              <polyline points={`0,0 50,${POCKET} 100,0`} fill="none" stroke={shade(env.paper, -0.18)} strokeWidth="0.6" vectorEffect="non-scaling-stroke" />
            </svg>
            <div className="absolute inset-x-0 top-[72%] text-center" style={{ color: env.ink }}>
              <p className="text-[9px] tracking-[0.3em] uppercase opacity-80 sm:text-[10px]">Kindly addressed to</p>
              <p className="font-script mt-0.5 text-[clamp(1.4rem,6vw,2.2rem)] leading-tight">{guest}</p>
            </div>
          </div>

          {/* soft shadow the closed flap casts on the pocket */}
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="env-flap-shadow pointer-events-none absolute inset-x-0 top-0 z-[3] w-full" style={{ height: `${FLAP + 3}%` }} aria-hidden>
            <polygon points="0,0 100,0 50,100" fill="#000" opacity="0.12" style={{ filter: 'blur(2px)' }} />
          </svg>

          {/* top flap: paper outside, patterned liner inside */}
          <div className="env-flap absolute inset-x-0 top-0 z-[4] origin-top [transform-style:preserve-3d]" style={{ height: `${FLAP}%` }}>
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full [backface-visibility:hidden]" aria-hidden>
              <defs>
                <linearGradient id="env-flap-grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor={shade(env.paper, 0.04)} />
                  <stop offset="1" stopColor={shade(env.paper, -0.06)} />
                </linearGradient>
              </defs>
              <polygon points="0,0 100,0 50,100" fill="url(#env-flap-grad)" stroke={shade(env.paper, -0.22)} strokeWidth="0.6" vectorEffect="non-scaling-stroke" />
            </svg>
            <div className="absolute inset-0 [backface-visibility:hidden]" style={{ ...paper, backgroundColor: 'transparent', clipPath: 'polygon(0 0, 100% 0, 50% 100%)' }} />
            <div
              className="absolute inset-0 [backface-visibility:hidden] [transform:rotateX(180deg)]"
              style={{
                clipPath: 'polygon(0 0, 100% 0, 50% 100%)',
                backgroundColor: env.liner,
                backgroundImage: patternUrl(e.theme.pattern, env.paper, 0.35),
                backgroundSize: '56px 56px',
              }}
            />
          </div>

          {/* wax seal on the flap's tip */}
          <div className="env-seal absolute left-1/2 z-[5] w-[30%] -translate-x-1/2 -translate-y-1/2 sm:w-[22%]" style={{ top: `${FLAP}%` }}>
            <WaxSeal color={env.seal} ink={env.sealInk} className="h-auto w-full" />
          </div>
        </div>
      </div>

      <p className="env-hint invisible pointer-events-none absolute bottom-[6svh] left-0 right-0 text-center text-xs tracking-[0.3em] uppercase" style={{ color: e.theme.ink }}>
        <span className="seal-pulse inline-block">Tap the seal to open</span>
      </p>
    </div>
  )
}
