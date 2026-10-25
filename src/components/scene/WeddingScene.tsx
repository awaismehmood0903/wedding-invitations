import { useLayoutEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { wedding, type SceneStyle, type WeddingEvent } from '../../config/event'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { patternUrl } from '../../lib/patterns'
import { shade } from '../CharacterRealistic'
import { CoupleBack } from './CoupleBack'
import { Curtains } from './Curtains'

// The scene is drawn in a 400 × 860 portrait box that fits the screen height;
// wider screens get carved-wall margins on either side.
const W = 400
const H = 860
const HORIZON = 560

/** Mughal multifoil arch opening; `inset` shrinks it (negative grows it). */
function archOpening(inset = 0): string {
  const L = 62 + inset
  const R = W - L
  const S = 318
  const A = 118 + inset * 1.3
  const cubic = (t: number, p0: number[], p1: number[], p2: number[], p3: number[]) =>
    [0, 1].map((i) => (1 - t) ** 3 * p0[i] + 3 * (1 - t) ** 2 * t * p1[i] + 3 * (1 - t) * t ** 2 * p2[i] + t ** 3 * p3[i])
  const side = (p0: number[], p1: number[], p2: number[], p3: number[]) => {
    const n = 6
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
    side([L, S], [L, S - 120], [W / 2 - 74, A + 44], [W / 2, A]) +
    side([W / 2, A], [W / 2 + 74, A + 44], [R, S - 120], [R, S]) +
    ` L${R} ${H} Z`
  )
}

function Mosque({ c }: { c: SceneStyle }) {
  const b = c.building
  const d = shade(b, -0.12)
  const dd = shade(b, -0.22)
  const minaret = (x: number, top: number) => (
    <g key={x}>
      <rect x={x - 3.5} y={top} width="7" height={HORIZON - top} fill={b} />
      <rect x={x - 3.5} y={top} width="2.5" height={HORIZON - top} fill={d} opacity="0.5" />
      {[0.35, 0.65].map((f) => (
        <rect key={f} x={x - 5.5} y={top + (HORIZON - top) * f} width="11" height="2.5" fill={d} />
      ))}
      <path d={`M${x - 5} ${top} Q${x} ${top - 12} ${x + 5} ${top} Z`} fill={b} />
      <path d={`M${x} ${top - 10} V${top - 17}`} stroke={dd} strokeWidth="0.8" />
    </g>
  )
  return (
    <g>
      {minaret(104, 436)}
      {minaret(296, 436)}
      <rect x="120" y="536" width="160" height={HORIZON - 536} fill={d} />
      <rect x="146" y="468" width="108" height="70" fill={b} />
      <rect x="146" y="468" width="22" height="70" fill={d} opacity="0.35" />
      {/* iwan (great arched doorway) */}
      <path d="M184 538 V504 Q184 486 200 478 Q216 486 216 504 V538 Z" fill={dd} opacity="0.55" />
      <path d="M158 538 V514 Q158 506 164 502 Q170 506 170 514 V538 Z M230 538 V514 Q230 506 236 502 Q242 506 242 514 V538 Z" fill={dd} opacity="0.4" />
      {/* domes */}
      <rect x="168" y="456" width="64" height="14" fill={b} />
      <path d="M164 458 C160 410 188 398 200 372 C212 398 240 410 236 458 Z" fill={b} />
      <path d="M164 458 C160 410 188 398 200 372 C194 400 176 418 178 458 Z" fill={d} opacity="0.35" />
      <path d="M200 372 V352" stroke={dd} strokeWidth="1" />
      <circle cx="200" cy="356" r="2" fill={dd} />
      {[136, 264].map((x) => (
        <g key={x}>
          <rect x={x - 10} y="470" width="20" height="10" fill={b} />
          <path d={`M${x - 11} 472 C${x - 12} 456 ${x - 4} 452 ${x} 444 C${x + 4} 452 ${x + 12} 456 ${x + 11} 472 Z`} fill={b} />
          <path d={`M${x} 444 V436`} stroke={dd} strokeWidth="0.8" />
        </g>
      ))}
    </g>
  )
}

function Rose({ x, y, r, c, a = 0 }: { x: number; y: number; r: number; c: string; a?: number }) {
  const dark = shade(c, -0.2)
  const mid = shade(c, -0.08)
  return (
    <g transform={`translate(${x} ${y}) rotate(${a})`}>
      <circle r={r} fill={mid} />
      {[0, 72, 144, 216, 288].map((t) => (
        <ellipse key={t} cx={Math.cos((t * Math.PI) / 180) * r * 0.42} cy={Math.sin((t * Math.PI) / 180) * r * 0.42} rx={r * 0.6} ry={r * 0.46} transform={`rotate(${t + 90} ${Math.cos((t * Math.PI) / 180) * r * 0.42} ${Math.sin((t * Math.PI) / 180) * r * 0.42})`} fill={c} stroke={dark} strokeWidth="0.4" strokeOpacity="0.6" />
      ))}
      <circle r={r * 0.5} fill={c} stroke={dark} strokeWidth="0.5" strokeOpacity="0.7" />
      <path d={`M${-r * 0.3} 0 A${r * 0.3} ${r * 0.3} 0 1 1 0 ${r * 0.3} A${r * 0.18} ${r * 0.18} 0 1 1 ${r * 0.08} ${-r * 0.1}`} fill="none" stroke={dark} strokeWidth="0.6" strokeOpacity="0.8" />
      <circle cx={-r * 0.32} cy={-r * 0.34} r={r * 0.22} fill="#fff" opacity="0.35" />
    </g>
  )
}

function Leaf({ x, y, a, l, c }: { x: number; y: number; a: number; l: number; c: string }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${a})`}>
      <path d={`M0 0 Q${l / 2} ${-l * 0.36} ${l} 0 Q${l / 2} ${l * 0.36} 0 0 Z`} fill={c} />
      <path d={`M0 0 L${l * 0.92} 0`} stroke={shade(c, -0.25)} strokeWidth="0.5" />
    </g>
  )
}

/** A cascade of roses, buds and leaves for one corner (drawn for the top-left; flip/mirror for others). */
function Cluster({ c, transform, className }: { c: SceneStyle; transform: string; className?: string }) {
  const leaves: [number, number, number, number][] = [
    [8, 74, 60, 26], [34, 92, 20, 24], [66, 30, 10, 22], [86, 18, -20, 20], [12, 128, 80, 22], [48, 64, 40, 18], [102, 40, 30, 18], [20, 40, 100, 20],
  ]
  return (
    <g className={className} transform={transform}>
      {leaves.map(([x, y, a, l], i) => (
        <Leaf key={i} x={x} y={y} a={a} l={l} c={i % 2 ? c.leaf : shade(c.leaf, -0.12)} />
      ))}
      <Rose x={22} y={22} r={20} c={c.flower} a={10} />
      <Rose x={58} y={14} r={14} c={c.flower2} a={-20} />
      <Rose x={14} y={62} r={15} c={c.flower2} a={40} />
      <Rose x={44} y={46} r={11} c={c.flower} a={70} />
      <Rose x={88} y={8} r={10} c={c.flower} a={0} />
      <Rose x={8} y={100} r={10} c={c.flower} a={20} />
      {[
        [74, 34], [32, 84], [104, 22], [22, 118], [62, 60],
      ].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={3.2} fill={i % 2 ? c.flower2 : c.flower} stroke={shade(c.flower, -0.2)} strokeWidth="0.4" />
      ))}
      {Array.from({ length: 14 }, (_, i) => (
        <circle key={i} cx={30 + ((i * 37) % 90)} cy={30 + ((i * 53) % 90)} r={1.1} fill="#fff" opacity="0.8" />
      ))}
    </g>
  )
}

function Lantern({ x, y, len, c, className }: { x: number; y: number; len: number; c: SceneStyle; className: string }) {
  const metal = c.frameTrim
  return (
    <g className={className}>
      <line x1={x} y1={y} x2={x} y2={y + len} stroke={shade(metal, -0.2)} strokeWidth="0.9" />
      <g transform={`translate(${x} ${y + len})`}>
        <defs>
          <radialGradient id={className + '-glow'}>
            <stop offset="0" stopColor={c.glow} stopOpacity="0.9" />
            <stop offset="1" stopColor={c.glow} stopOpacity="0" />
          </radialGradient>
        </defs>
        <circle className="lantern-glow" cx="0" cy="22" r="36" fill={'url(#' + className + '-glow)'} opacity="0.55" />
        <path d="M-7 0 Q0 -8 7 0 Z" fill={metal} />
        <rect x="-9" y="0" width="18" height="3" fill={metal} />
        <path d="M-9 3 L-11 32 L11 32 L9 3 Z" fill="#FFE7A8" opacity="0.92" />
        <path d="M-9 3 L-11 32 L11 32 L9 3 Z M-3.5 3 L-4 32 M3.5 3 L4 32" fill="none" stroke={metal} strokeWidth="1.2" />
        <path d="M-12 32 H12 L8 38 H-8 Z" fill={metal} />
        <path d="M0 38 V46" stroke={metal} strokeWidth="1.4" />
        <circle cx="0" cy="47" r="1.8" fill={metal} />
      </g>
    </g>
  )
}

/**
 * Opening scene of a single-event invitation: curtains part on a carved Mughal arch
 * framing a mosque at golden hour; the couple walk in hand in hand, then the names appear.
 */
export function WeddingScene({ event: e, start }: { event: WeddingEvent; start: boolean }) {
  const ref = useRef<HTMLElement>(null)
  const reduced = useReducedMotion()
  const c = e.scene
  const { groom, bride } = wedding.couple
  const opening = archOpening()

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      if (reduced) return
      gsap.set('.scene-stage', { opacity: 0.01, y: '16vh' })
      gsap.set('.scene-couple', { autoAlpha: 0 })
      gsap.set('.scene-cue', { autoAlpha: 0 })
      if (!start) return

      const q = gsap.utils.selector(ref)
      const tl = gsap.timeline()
      tl.to('.scene-stage', { opacity: 1, y: 0, duration: 1.05, ease: 'power2.out' }, 0)
      // curtains draw back into tied drapes
      tl.to('.curtain-closed', { scaleX: 0.34, duration: 1.3, ease: 'power2.inOut' }, 0.35)
        .to('.curtain-open', { opacity: 1, duration: 0.5, ease: 'power1.out' }, 1.1)
        .to('.curtain-closed', { opacity: 0, duration: 0.45, ease: 'power1.in' }, 1.25)
      tl.fromTo('.lantern-glow', { opacity: 0 }, { opacity: 0.55, duration: 1.2 }, 0.6)
        // the couple walk in, from close to the viewer toward the mosque
        .fromTo('.scene-couple', { autoAlpha: 0, y: 60, scale: 1.2, transformOrigin: '50% 100%' }, { autoAlpha: 1, y: 0, scale: 1, duration: 2.4, ease: 'power2.out' }, 0.75)
        .add(() => {
          const walk = gsap.timeline({ repeat: 1 })
          walk.to(q('.cb-leg-l'), { y: -4, duration: 0.3, ease: 'sine.inOut', yoyo: true, repeat: 1 }, 0).to(q('.cb-leg-r'), { y: -4, duration: 0.3, ease: 'sine.inOut', yoyo: true, repeat: 1 }, 0.6)
          walk.to(q('.cb-groom, .cb-bride'), { y: -1.5, duration: 0.3, ease: 'sine.inOut', yoyo: true, repeat: 3 }, 0)
        }, 0.75)
        .fromTo('.scene-cue', { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.7 }, 2.9)

      // ambient life
      gsap.to('.lantern-l', { rotation: 5, transformOrigin: '50% 0%', duration: 2.4, ease: 'sine.inOut', yoyo: true, repeat: -1, startAt: { rotation: -5 } })
      gsap.to('.lantern-r', { rotation: -5, transformOrigin: '50% 0%', duration: 2.7, ease: 'sine.inOut', yoyo: true, repeat: -1, startAt: { rotation: 4 } })
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
        backgroundImage: `radial-gradient(ellipse at 50% 50%, transparent 30%, ${shade(c.frame, -0.22)} 100%), ${patternUrl('geometric', c.frameTrim, 0.22)}`,
        backgroundSize: 'auto, 64px 64px',
      }}
      aria-label={`${e.title} of ${groom} and ${bride}`}
    >
      <div className="scene-stage absolute inset-0 flex items-center justify-center will-change-transform">
        <div className="relative shrink-0 w-[max(100vw,calc(100svh*400/860))] sm:w-[min(100vw,calc(100svh*400/860))]" style={{ aspectRatio: `${W} / ${H}` }}>
          <svg viewBox={`0 0 ${W} ${H}`} className="absolute inset-0 h-full w-full" aria-hidden>
            <defs>
              <linearGradient id="scene-sky" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor={c.skyTop} />
                <stop offset={HORIZON / H} stopColor={c.skyBottom} />
              </linearGradient>
              <radialGradient id="scene-glow" cx="50%" cy="50%" r="50%">
                <stop offset="0" stopColor={c.glow} stopOpacity="0.95" />
                <stop offset="1" stopColor={c.glow} stopOpacity="0" />
              </radialGradient>
              <linearGradient id="scene-water" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor={shade(c.skyBottom, -0.04)} />
                <stop offset="1" stopColor={shade(c.skyTop, -0.05)} />
              </linearGradient>
              <linearGradient id="scene-ground" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor={shade(c.building, -0.05)} />
                <stop offset="1" stopColor={shade(c.building, -0.2)} />
              </linearGradient>
              <linearGradient id="scene-frame" x1="0" x2="1">
                <stop offset="0" stopColor={shade(c.frame, -0.1)} />
                <stop offset="0.5" stopColor={shade(c.frame, 0.06)} />
                <stop offset="1" stopColor={shade(c.frame, -0.1)} />
              </linearGradient>
              <pattern id="scene-jali" width="16" height="16" patternUnits="userSpaceOnUse">
                <path d="M8 0 L16 8 L8 16 L0 8 Z" fill="none" stroke={c.frameTrim} strokeOpacity="0.28" strokeWidth="0.7" />
                <circle cx="8" cy="8" r="1.4" fill={c.frameTrim} opacity="0.3" />
              </pattern>
              <g id="scene-mosque">
                <Mosque c={c} />
              </g>
            </defs>

            {/* sky, light, clouds */}
            <rect width={W} height={HORIZON + 2} fill="url(#scene-sky)" />
            <circle cx="200" cy="462" r="190" fill="url(#scene-glow)" />
            {[
              [120, 230, 46],
              [290, 290, 38],
              [200, 180, 30],
            ].map(([x, y, r], i) => (
              <ellipse key={i} className="scene-cloud" cx={x} cy={y} rx={r} ry={r * 0.28} fill="#fff" opacity="0.28" />
            ))}

            {/* mosque, cypress rows */}
            <use href="#scene-mosque" />
            {[70, 86, 314, 330].map((x, i) => (
              <path key={x} d={`M${x} ${HORIZON} Q${x - 6} ${HORIZON - 26} ${x} ${HORIZON - 44} Q${x + 6} ${HORIZON - 26} ${x} ${HORIZON} Z`} fill={shade(c.leaf, -0.35)} opacity={0.55 - i * 0.02} />
            ))}

            {/* reflecting pool */}
            <path d={`M150 ${HORIZON} L250 ${HORIZON} L310 660 L90 660 Z`} fill="url(#scene-water)" />
            <g opacity="0.22" transform={`translate(0 ${HORIZON * 2}) scale(1 -1)`} clipPath="url(#scene-pool-clip)">
              <use href="#scene-mosque" />
            </g>
            <clipPath id="scene-pool-clip">
              <path d={`M150 ${HORIZON} L250 ${HORIZON} L310 660 L90 660 Z`} transform={`translate(0 ${HORIZON * 2}) scale(1 -1)`} />
            </clipPath>
            {[580, 600, 622, 644].map((y, i) => (
              <line key={y} className="scene-shimmer" x1={170 - i * 12} x2={230 + i * 12} y1={y} y2={y} stroke="#fff" strokeOpacity="0.45" strokeWidth="0.8" />
            ))}

            {/* garden and walkway */}
            <path d={`M0 ${HORIZON} H150 L90 660 L50 ${H} H0 Z M${W} ${HORIZON} H250 L310 660 L350 ${H} H${W} Z`} fill="url(#scene-ground)" />
            <path d={`M90 660 H310 L350 ${H} H50 Z`} fill={shade(c.building, 0.08)} />
            <path d={`M90 660 L50 ${H} M310 660 L350 ${H} M200 660 V${H}`} stroke={shade(c.building, -0.2)} strokeWidth="0.7" opacity="0.6" />
            {[700, 760, 830].map((y) => (
              <line key={y} x1={90 - ((y - 660) * 40) / 200} x2={310 + ((y - 660) * 40) / 200} y1={y} y2={y} stroke={shade(c.building, -0.15)} strokeWidth="0.5" opacity="0.5" />
            ))}


            {/* carved arch frame */}
            <path d={`M0 0 H${W} V${H} H0 Z ${opening}`} fillRule="evenodd" fill="url(#scene-frame)" />
            <path d={`M0 0 H${W} V${H} H0 Z ${archOpening(-14)}`} fillRule="evenodd" fill="url(#scene-jali)" />
            <path d={opening} fill="none" stroke={c.frameTrim} strokeWidth="3" />
            <path d={archOpening(-8)} fill="none" stroke={c.frameTrim} strokeWidth="1" opacity="0.75" />
            <path d={archOpening(-14)} fill="none" stroke={c.frameTrim} strokeWidth="0.6" opacity="0.5" />
            {[40, W - 40].map((x) => (
              <g key={x}>
                <rect x={x - 9} y="330" width="18" height={H - 330} fill={shade(c.frame, -0.06)} stroke={c.frameTrim} strokeWidth="0.8" strokeOpacity="0.7" />
                <path d={`M${x} 340 V${H}`} stroke={c.frameTrim} strokeWidth="0.6" opacity="0.6" />
                <rect x={x - 13} y="318" width="26" height="12" rx="2" fill={shade(c.frame, -0.04)} stroke={c.frameTrim} strokeWidth="0.8" />
                <path d={`M${x - 8} 318 Q${x} 300 ${x + 8} 318 Z`} fill={c.frameTrim} opacity="0.85" />
              </g>
            ))}
            <circle cx="200" cy="96" r="5" fill={c.frameTrim} />
            <path d="M188 100 Q200 84 212 100" stroke={c.frameTrim} strokeWidth="1" fill="none" />

            {/* lanterns and flowers */}
            <Lantern x={98} y={232} len={44} c={c} className="lantern-l" />
            <Lantern x={302} y={232} len={44} c={c} className="lantern-r" />
            <Cluster c={c} className="scene-cluster" transform="translate(-6 -6) scale(1.15)" />
            <g transform={`translate(${W} 0) scale(-1 1)`}>
              <Cluster c={c} className="scene-cluster" transform="translate(-6 -6) scale(1.15)" />
            </g>
            <g transform={`translate(0 ${H}) scale(1 -1)`}>
              <Cluster c={c} className="scene-cluster" transform="translate(-10 -10) scale(1.35)" />
            </g>
            <g transform={`translate(${W} ${H}) scale(-1 -1)`}>
              <Cluster c={c} className="scene-cluster" transform="translate(-10 -10) scale(1.35)" />
            </g>
          </svg>

          {/* the couple, on their own layer so their walk-in doesn't repaint the whole scene */}
          <div className="scene-couple absolute will-change-transform" style={{ left: '25%', top: '55.81%', width: '52.5%', height: '36.05%' }}>
            <svg viewBox="100 480 210 310" className="h-full w-full overflow-visible" aria-hidden>
              <g transform="translate(112 520) scale(0.86)">
                <CoupleBack groom={e.outfit.groom} bride={e.outfit.bride} />
              </g>
            </svg>
          </div>

        </div>
      </div>

      {/* curtains */}
      <Curtains c={c} open={reduced} />

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
