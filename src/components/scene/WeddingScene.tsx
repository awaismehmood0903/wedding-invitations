import { useLayoutEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { wedding, type SceneStyle, type WeddingEvent } from '../../config/event'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { patternUrl } from '../../lib/patterns'
import { shade } from '../CharacterRealistic'
import { CoupleBack } from './CoupleBack'
import { ChintzPattern, RoseBush, Spray } from './Florals'
import { Garden, H, W } from './Garden'
import { Drape, SheerPanels } from './Sheers'

/** Scalloped Mughal arch opening; `inset` shrinks it (negative grows it). */
function archOpening(inset = 0): string {
  const L = 34 + inset
  const R = W - L
  const S = 262
  const A = 44 + inset * 1.25
  const cubic = (t: number, p0: number[], p1: number[], p2: number[], p3: number[]) =>
    [0, 1].map((i) => (1 - t) ** 3 * p0[i] + 3 * (1 - t) ** 2 * t * p1[i] + 3 * (1 - t) * t ** 2 * p2[i] + t ** 3 * p3[i])
  const side = (p0: number[], p1: number[], p2: number[], p3: number[]) => {
    const n = 7
    let d = ''
    let prev = p0
    for (let i = 1; i <= n; i++) {
      const p = cubic(i / n, p0, p1, p2, p3)
      const r = Math.hypot(p[0] - prev[0], p[1] - prev[1]) * 0.56
      d += ` A${r.toFixed(2)} ${r.toFixed(2)} 0 0 1 ${p[0].toFixed(2)} ${p[1].toFixed(2)}`
      prev = p
    }
    return d
  }
  return (
    `M${L} ${H} L${L} ${S}` +
    side([L, S], [L, S - 140], [W / 2 - 78, A + 48], [W / 2, A]) +
    side([W / 2, A], [W / 2 + 78, A + 48], [R, S - 140], [R, S]) +
    ` L${R} ${H} Z`
  )
}

/** Carved frame filled with painted chintz, gold mouldings, mosaic side strips, climbing roses and rose bushes. */
function Frame({ c }: { c: SceneStyle }) {
  const opening = archOpening()
  const outside = `M-2 -2 H${W + 2} V${H + 2} H-2 Z ${opening}`
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden>
      <defs>
        <ChintzPattern id="scene-chintz" c={c} />
        <pattern id="scene-mosaic" width="12" height="12" patternUnits="userSpaceOnUse">
          <rect width="12" height="12" fill={shade(c.blossom, -0.15)} />
          <path d="M6 0 L12 6 L6 12 L0 6 Z" fill={shade(c.blossom, 0.35)} />
          <circle cx="6" cy="6" r="1.4" fill={c.frameTrim} />
        </pattern>
        <linearGradient id="scene-frame-shade" x1="0" x2="1">
          <stop offset="0" stopColor="#000" stopOpacity="0.12" />
          <stop offset="0.12" stopColor="#000" stopOpacity="0" />
          <stop offset="0.88" stopColor="#000" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity="0.12" />
        </linearGradient>
      </defs>

      {/* sheer drapes, swagged from the top of the arch */}
      <Drape s={c} id="sheer-l" mirror={false} />
      <Drape s={c} id="sheer-r" mirror />

      <path d={outside} fillRule="evenodd" fill="url(#scene-chintz)" />
      <path d={outside} fillRule="evenodd" fill="url(#scene-frame-shade)" />
      {/* mosaic side strips below the shoulders */}
      {[6, W - 26].map((x) => (
        <g key={x}>
          <rect x={x} y="430" width="20" height={H - 430} fill="url(#scene-mosaic)" />
          <rect x={x} y="430" width="20" height={H - 430} fill="none" stroke={c.frameTrim} strokeWidth="1" />
          <rect x={x - 3} y="418" width="26" height="12" rx="2" fill={shade(c.frame, 0.1)} stroke={c.frameTrim} strokeWidth="0.8" />
        </g>
      ))}
      {/* gold mouldings along the arch */}
      <path d={opening} fill="none" stroke={c.frameTrim} strokeWidth="3.2" />
      <path d={archOpening(-6)} fill="none" stroke={c.frameTrim} strokeWidth="1" opacity="0.8" />
      <path d={archOpening(3)} fill="none" stroke={shade(c.frameTrim, 0.4)} strokeWidth="0.8" opacity="0.6" />
      <path d="M200 40 V22" stroke={c.frameTrim} strokeWidth="1.4" />
      <path d="M193 24 Q200 8 207 24 Z" fill={c.frameTrim} />

      {/* climbing roses on the shoulders, rose bushes in the corners */}
      <Spray c={c} transform="translate(22 250)" />
      <Spray c={c} transform={`translate(${W - 22} 250) scale(-1 1)`} />
      <RoseBush c={c} transform={`translate(-18 ${H - 282}) scale(0.95)`} />
      <RoseBush c={c} transform={`translate(${W + 18} ${H - 282}) scale(-0.95 0.95)`} />
    </svg>
  )
}

function Bird({ className, color, style }: { className: string; color: string; style: React.CSSProperties }) {
  return (
    <div className={`${className} pointer-events-none absolute will-change-transform`} style={style} aria-hidden>
      <svg viewBox="0 0 24 12" className="bird-wing h-full w-full overflow-visible">
        <path d="M0 7 Q6 0 12 7 Q18 0 24 7 Q18 4 12 9 Q6 4 0 7 Z" fill={color} />
      </svg>
    </div>
  )
}

/**
 * Opening scene of a single-event invitation: sheer curtains part on a floral Mughal arch
 * opening onto a palace garden, and the couple walks in hand in hand.
 */
export function WeddingScene({ event: e, start }: { event: WeddingEvent; start: boolean }) {
  const ref = useRef<HTMLElement>(null)
  const reduced = useReducedMotion()
  const c = e.scene
  const { groom, bride } = wedding.couple

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      if (reduced) return
      gsap.set('.scene-stage', { opacity: 0.01, y: '16vh' })
      gsap.set('.scene-couple', { autoAlpha: 0 })
      gsap.set('.scene-cue, .scene-bird', { autoAlpha: 0 })
      if (!start) return

      const q = gsap.utils.selector(ref)
      const tl = gsap.timeline()
      tl.to('.scene-stage', { opacity: 1, y: 0, duration: 1.05, ease: 'power2.out' }, 0)
        // sheer panels slide aside, the swagged drapes settle in
        .to('.curtain-closed', { scaleX: 0.3, duration: 1.3, ease: 'power2.inOut' }, 0.35)
        .to('.curtain-closed', { opacity: 0, duration: 0.55, ease: 'power1.in' }, 1.1)
        // the couple walk in toward the railing
        .fromTo('.scene-couple', { autoAlpha: 0, y: 60, scale: 1.2, transformOrigin: '50% 100%' }, { autoAlpha: 1, y: 0, scale: 1, duration: 2.4, ease: 'power2.out' }, 0.75)
        .add(() => {
          const walk = gsap.timeline({ repeat: 1 })
          walk.to(q('.cb-leg-l'), { y: -4, duration: 0.3, ease: 'sine.inOut', yoyo: true, repeat: 1 }, 0).to(q('.cb-leg-r'), { y: -4, duration: 0.3, ease: 'sine.inOut', yoyo: true, repeat: 1 }, 0.6)
          walk.to(q('.cb-groom, .cb-bride'), { y: -1.5, duration: 0.3, ease: 'sine.inOut', yoyo: true, repeat: 3 }, 0)
        }, 0.75)
        .fromTo('.scene-cue', { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.7 }, 2.9)

      // ambient life: birds crossing the sky
      q('.scene-bird').forEach((el, i) => {
        gsap
          .timeline({ repeat: -1, delay: 2.2 + i * 1.6, repeatDelay: 3 + i })
          .fromTo(el, { x: 0, y: 0, autoAlpha: 0 }, { x: '-520%', y: '-160%', duration: 9, ease: 'none' }, 0)
          .to(el, { autoAlpha: 1, duration: 0.8 }, 0)
          .to(el, { autoAlpha: 0, duration: 0.8 }, 8.2)
      })
      gsap.to(q('.bird-wing'), { scaleY: 0.35, transformOrigin: '50% 60%', duration: 0.22, ease: 'sine.inOut', yoyo: true, repeat: -1, stagger: 0.11 })
      gsap.to('.cb-veil', { skewX: -2.5, transformOrigin: '20% 0%', duration: 2.6, ease: 'sine.inOut', yoyo: true, repeat: -1 })
      gsap.to('.cb-skirt', { rotation: 1.2, transformOrigin: '50% 0%', duration: 1.8, ease: 'sine.inOut', yoyo: true, repeat: -1 })
      gsap.to('.cb-shamla', { skewX: 4, transformOrigin: '50% 0%', duration: 2.2, ease: 'sine.inOut', yoyo: true, repeat: -1 })
    }, ref)
    return () => ctx.revert()
  }, [start, reduced])

  return (
    <section
      ref={ref}
      className="relative z-10 h-[100svh] overflow-hidden"
      style={{
        backgroundColor: c.frame,
        backgroundImage: `radial-gradient(ellipse at 50% 50%, transparent 30%, ${shade(c.frame, -0.22)} 100%), ${patternUrl('floral', c.frameTrim, 0.2)}`,
        backgroundSize: 'auto, 90px 90px',
      }}
      aria-label={`${e.title} of ${groom} and ${bride}`}
    >
      <div className="scene-stage absolute inset-0 flex items-center justify-center will-change-transform">
        <div className="relative shrink-0 w-[max(100vw,calc(100svh*400/860))] sm:w-[min(100vw,calc(100svh*400/860))]" style={{ aspectRatio: `${W} / ${H}` }}>
          <Garden c={c} />

          <Bird className="scene-bird" color={shade(c.leaf, -0.5)} style={{ left: '74%', top: '50%', width: '5%', height: '2.5%' }} />
          <Bird className="scene-bird" color={shade(c.leaf, -0.4)} style={{ left: '82%', top: '56%', width: '4%', height: '2%' }} />

          {/* the couple, on their own layer so their walk-in doesn't repaint the scene */}
          <div className="scene-couple absolute will-change-transform" style={{ left: '25%', top: '55.81%', width: '52.5%', height: '36.05%' }}>
            <svg viewBox="100 480 210 310" className="h-full w-full overflow-visible" aria-hidden>
              <g transform="translate(112 520) scale(0.86)">
                <CoupleBack groom={e.outfit.groom} bride={e.outfit.bride} />
              </g>
            </svg>
          </div>

          <Frame c={c} />
        </div>
      </div>

      {!reduced && <SheerPanels s={c} />}

      <div className="scene-cue absolute inset-x-0 bottom-[max(14px,env(safe-area-inset-bottom))] z-30 flex flex-col items-center gap-1 text-[10px] tracking-[0.3em] uppercase" style={{ color: shade(c.frame, -0.6) }}>
        <span className="font-script text-xl tracking-normal normal-case [@media(max-height:700px)]:hidden" style={{ color: e.theme.primary }}>
          Scroll down
        </span>
        <svg viewBox="0 0 20 12" className="scroll-cue h-3 w-5" aria-hidden>
          <path d="M2 2 L10 10 L18 2" fill="none" stroke="currentColor" strokeWidth="1.6" />
        </svg>
      </div>
    </section>
  )
}
