import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { wedding } from '../config/event'
import { music } from '../lib/music'
import { useReducedMotion } from '../hooks/useReducedMotion'
import { shade } from './CharacterRealistic'

// Palette: carved rosewood doors in a white-marble arch with gold inlay.
const WOOD = '#5A1E22'
const GOLD = '#D4AF37'
const MARBLE = '#F5EFE5'

// The gate is drawn in a box exactly the shape of the screen: 860 units tall,
// W units wide. The doorway fills ~92% of a phone's width, or 60% of a laptop's.
const H = 860
const TIP = 236 // top of the pointed arch
const FLOOR = 806

type Geometry = { W: number; half: number; drop: number; desktop: boolean }

function useGeometry(): Geometry {
  const read = (): Geometry => {
    const vw = window.innerWidth
    const vh = window.innerHeight
    const W = (H * vw) / vh
    const desktop = vw >= 640
    const half = (W * (desktop ? 0.6 : 0.92)) / 2
    // Pointed-arch shoulder drop: proportional to the leaf width, capped so wide doors keep straight sides.
    const drop = Math.min(half * 1.07, 210)
    return { W, half, drop, desktop }
  }
  const [g, setG] = useState(read)
  useEffect(() => {
    const onResize = () => setG(read())
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])
  return g
}

/** Pointed Mughal arch outline for the doorway, `grow` units outward. */
function archPath({ W, half, drop }: Geometry, grow = 0, floor = FLOOR) {
  const L = W / 2 - half - grow
  const R = W / 2 + half + grow
  const S = TIP + drop - grow * 0.2
  const T = TIP - grow * 1.1
  const h = half + grow
  return `M${L} ${floor} V${S} C${L} ${S - drop * 0.53} ${W / 2 - h * 0.43} ${T + drop * 0.13} ${W / 2} ${T} C${W / 2 + h * 0.43} ${T + drop * 0.13} ${R} ${S - drop * 0.53} ${R} ${S} V${floor}`
}

/** One door leaf, drawn as the left leaf (the right one is mirrored). lw × lh units, shoulder at `s`. */
function DoorLeaf({ id, lw, lh, s }: { id: string; lw: number; lh: number; s: number }) {
  const leaf = (i: number) => `M${i} ${lh - i} V${s + i * 0.4} C${i} ${s * 0.47 + i * 1.3} ${lw * 0.57} ${s * 0.13 + i * 1.6} ${lw - i} ${i * 2.2} V${lh - i} Z`
  const pad = Math.min(30, lw * 0.19)
  const x0 = pad
  const x1 = lw - pad
  const jaliBottom = s + 100
  const midTop = jaliBottom + 22
  const avail = lh - 28 - midTop
  const midH = avail * 0.55
  const lowTop = midTop + midH + 16
  const lowH = lh - 28 - lowTop
  const rosette = Math.min(30, (x1 - x0) / 3, midH / 3.2)
  const lock = midTop + 6

  const studs: [number, number][] = []
  for (let y = s + 25; y <= lh - 16; y += 38) studs.push([12, y], [lw - 12, y])
  for (let x = 30; x <= lw - 30; x += 20) studs.push([x, lh - 13])

  return (
    <svg viewBox={`0 0 ${lw} ${lh}`} className="h-full w-full" aria-hidden>
      <defs>
        <linearGradient id={`${id}-wood`} x1="0" x2="1">
          <stop offset="0" stopColor={shade(WOOD, -0.35)} />
          <stop offset="0.45" stopColor={WOOD} />
          <stop offset="1" stopColor={shade(WOOD, -0.2)} />
        </linearGradient>
        <linearGradient id={`${id}-grain`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#000" stopOpacity="0.25" />
          <stop offset="0.2" stopColor="#000" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity="0.3" />
        </linearGradient>
        <radialGradient id={`${id}-brass`} cx="35%" cy="35%" r="70%">
          <stop offset="0" stopColor="#FFF1B8" />
          <stop offset="0.5" stopColor={GOLD} />
          <stop offset="1" stopColor={shade(GOLD, -0.45)} />
        </radialGradient>
        <pattern id={`${id}-jali`} width="14" height="14" patternUnits="userSpaceOnUse">
          <rect width="14" height="14" fill={shade(WOOD, -0.5)} />
          <path d="M7 0 L14 7 L7 14 L0 7 Z" fill="none" stroke={GOLD} strokeWidth="1.1" />
          <circle cx="7" cy="7" r="1.6" fill={GOLD} />
        </pattern>
      </defs>

      <path d={leaf(0)} fill={`url(#${id}-wood)`} />
      <path d={leaf(0)} fill={`url(#${id}-grain)`} />
      {Array.from({ length: Math.max(4, Math.round(lw / 20)) }, (_, i) => {
        const x = ((i + 1) * lw) / (Math.round(lw / 20) + 1)
        return <path key={i} d={`M${x} ${lh} C${x - 2} ${lh * 0.7} ${x + 3} ${lh * 0.5} ${x} ${s * 0.9}`} stroke="#000" strokeOpacity="0.08" strokeWidth="0.8" fill="none" />
      })}
      {/* gold inlay border following the arch */}
      <path d={leaf(8)} fill="none" stroke={GOLD} strokeWidth="2" />
      <path d={leaf(14)} fill="none" stroke={GOLD} strokeWidth="0.8" opacity="0.7" />

      {/* arched upper panel with gold jali */}
      <path d={`M${x0} ${jaliBottom} V${s + 20} C${x0} ${s - 30} ${x0 + (x1 - x0) * 0.6} ${s * 0.55} ${x1} ${s * 0.47} V${jaliBottom} Z`} fill={`url(#${id}-jali)`} stroke={GOLD} strokeWidth="1.6" />
      {/* carved middle panel with a rosette */}
      <rect x={x0} y={midTop} width={x1 - x0} height={midH} rx="4" fill={shade(WOOD, -0.12)} stroke={GOLD} strokeWidth="1.4" />
      <rect x={x0 + 6} y={midTop + 6} width={x1 - x0 - 12} height={midH - 12} rx="3" fill="none" stroke={GOLD} strokeWidth="0.6" opacity="0.6" />
      <g transform={`translate(${(x0 + x1) / 2} ${midTop + midH / 2})`} stroke={GOLD} fill="none" strokeWidth="1.1">
        {Array.from({ length: 8 }, (_, i) => (
          <ellipse key={i} rx={rosette * 0.23} ry={rosette * 0.66} cy={-rosette * 0.46} transform={`rotate(${i * 45})`} opacity="0.9" />
        ))}
        <circle r={rosette * 0.23} fill={GOLD} stroke="none" />
        <circle r={rosette} opacity="0.6" />
      </g>
      {/* lower panel */}
      <rect x={x0} y={lowTop} width={x1 - x0} height={lowH} rx="4" fill={shade(WOOD, -0.12)} stroke={GOLD} strokeWidth="1.4" />
      <g transform={`translate(${(x0 + x1) / 2} ${lowTop + lowH / 2})`}>
        <path d={`M0 ${-lowH * 0.38} L${Math.min(32, (x1 - x0) * 0.35)} 0 L0 ${lowH * 0.38} L${-Math.min(32, (x1 - x0) * 0.35)} 0 Z`} fill="none" stroke={GOLD} strokeWidth="1.1" />
        <path d={`M0 ${-lowH * 0.22} L${Math.min(20, (x1 - x0) * 0.2)} 0 L0 ${lowH * 0.22} L${-Math.min(20, (x1 - x0) * 0.2)} 0 Z`} fill={GOLD} opacity="0.35" />
      </g>

      {studs.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="3.2" fill={`url(#${id}-brass)`} />
      ))}
      {/* ring handle near the seam */}
      <g transform={`translate(${lw - 18} ${lock})`}>
        <circle r="7" fill={`url(#${id}-brass)`} />
        <circle cy="15" r="11" fill="none" stroke={`url(#${id}-brass)`} strokeWidth="3.4" />
      </g>
      {/* darkens as the leaf turns away from the light */}
      <path className="gate-door-shade" d={leaf(0)} fill="#000" opacity="0" />
      <rect x={lw - 4} y="0" width="4" height={lh} fill="#000" opacity="0.35" />
    </svg>
  )
}

/**
 * Grand Mughal palace doors: carved rosewood leaves with brass studs and a gold jali,
 * set in a white-marble arch. Tapping the doors swings them inward, golden light pours
 * through, and the view moves forward into the invitation.
 */
export function GateIntro({ guest, onOpen, onGone }: { guest: string; onOpen: () => void; onGone: () => void }) {
  const root = useRef<HTMLDivElement>(null)
  const [opening, setOpening] = useState(false)
  const reduced = useReducedMotion()
  const g = useGeometry()
  const { groom, bride } = wedding.couple
  const { W, half, drop, desktop } = g
  const x = (v: number) => `${(v / W) * 100}%`
  const y = (v: number) => `${(v / H) * 100}%`
  const lockY = TIP + drop + 122

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.gate-stage', { autoAlpha: 0, scale: 1.04 }, { autoAlpha: 1, scale: 1, duration: 1, ease: 'power2.out' })
      gsap.fromTo('.gate-text', { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, duration: 0.9, delay: 0.4, stagger: 0.12, ease: 'power2.out' })
      if (!reduced) gsap.to('.gate-seam-glow', { opacity: 0.9, duration: 1.4, ease: 'sine.inOut', yoyo: true, repeat: -1 })
    }, root)
    return () => ctx.revert()
  }, [reduced])

  const open = () => {
    if (opening) return
    setOpening(true)
    void music.start()
    const q = gsap.utils.selector(root)
    gsap.killTweensOf(q('.gate-seam-glow'))

    if (reduced) {
      onOpen()
      gsap.to(root.current, { autoAlpha: 0, duration: 0.6, onComplete: onGone })
      return
    }

    // petals blowing toward the viewer from the doorway
    q('.gate-petal').forEach((el, i) => {
      const a = (i / 18) * Math.PI * 2 + Math.random() * 0.4
      const d = 220 + Math.random() * 260
      gsap.fromTo(
        el,
        { x: 0, y: 0, scale: 0.2, rotate: Math.random() * 360, autoAlpha: 0 },
        { x: Math.cos(a) * d, y: Math.sin(a) * d, scale: 2 + Math.random() * 1.5, rotate: '+=180', autoAlpha: 1, duration: 1.4, delay: 0.5 + Math.random() * 0.3, ease: 'power2.out', onComplete: () => void gsap.to(el, { autoAlpha: 0, duration: 0.4 }) },
      )
    })

    gsap
      .timeline({ onComplete: onGone })
      .to(q('.gate-hint, .gate-text'), { autoAlpha: 0, duration: 0.35 }, 0)
      // a line of light along the seam, then the doors swing inward
      .to(q('.gate-seam-glow'), { opacity: 1, duration: 0.2 }, 0)
      .to(q('.gate-seam-light'), { autoAlpha: 1, duration: 0.25, ease: 'power1.out' }, 0)
      .to(q('.gate-door-l'), { rotateY: 100, duration: 1.4, ease: 'power3.inOut' }, 0.15)
      .to(q('.gate-door-r'), { rotateY: -100, duration: 1.4, ease: 'power3.inOut' }, 0.15)
      .to(q('.gate-door-shade'), { opacity: 0.6, duration: 1.4, ease: 'power3.inOut' }, 0.15)
      .to(q('.gate-seam-light, .gate-seam-glow'), { autoAlpha: 0, duration: 0.4 }, 0.4)
      .fromTo(q('.gate-light'), { autoAlpha: 0, scale: 0.5 }, { autoAlpha: 1, scale: 1.3, duration: 1.1, ease: 'power2.out' }, 0.25)
      .add(onOpen, 0.8)
      // move forward through the doorway
      .to(q('.gate-stage'), { scale: 2.4, duration: 1.3, ease: 'power2.in', transformOrigin: `50% ${y(lockY)}` }, 0.75)
      .to(q('.gate-light'), { autoAlpha: 0, duration: 0.6, ease: 'power1.in' }, 1.5)
      .to(root.current, { autoAlpha: 0, duration: 0.5, ease: 'power1.in' }, 1.65)
  }

  const plaqueW = Math.min(desktop ? 440 : 300, W * 0.84)
  const plaqueTop = 58
  const plaqueH = Math.min(132, TIP - 74)
  const doorway = archPath(g)
  const pillarXs = desktop ? [W / 2 - half - 48, W / 2 + half + 48] : []

  return (
    <div ref={root} className={`fixed inset-0 z-40 overflow-hidden ${opening ? 'pointer-events-none' : ''}`}>
      <div className="gate-stage invisible absolute inset-0">
        {/* golden light behind the doors */}
        <div
          className="gate-light invisible absolute left-1/2 -translate-x-1/2 rounded-full"
          style={{ top: y(TIP + 20), width: x(half * 2.6), aspectRatio: '1', background: 'radial-gradient(circle, rgba(255,243,200,0.98) 0%, rgba(255,214,140,0.75) 30%, rgba(255,200,120,0) 68%)' }}
        />

        {/* door leaves, swinging inward on their hinges; tapping anywhere on them opens the gate */}
        <button
          type="button"
          onClick={open}
          aria-label="Open the invitation"
          className="absolute cursor-pointer [perspective:1400px]"
          style={{ left: x(W / 2 - half), width: x(half * 2), top: y(TIP), bottom: y(H - FLOOR) }}
        >
          {(['l', 'r'] as const).map((s) => (
            <span key={s} className={`gate-door-${s} absolute top-0 bottom-0 block w-1/2 ${s === 'l' ? 'left-0 origin-left' : 'right-0 origin-right'}`} style={{ transformStyle: 'preserve-3d' }}>
              <span className={`block h-full w-full ${s === 'r' ? '-scale-x-100' : ''}`}>
                <DoorLeaf id={`gate-${s}`} lw={half} lh={FLOOR - TIP} s={drop} />
              </span>
            </span>
          ))}
          <span className="gate-seam-glow absolute top-[3%] bottom-0 left-1/2 block w-[2px] -translate-x-1/2 bg-[#FFE9A8] opacity-30 shadow-[0_0_10px_3px_rgba(255,226,150,0.6)]" />
          <span className="gate-seam-light invisible absolute top-[3%] bottom-0 left-1/2 block w-[3px] -translate-x-1/2 bg-[#FFE9A8] shadow-[0_0_18px_6px_rgba(255,226,150,0.85)]" />
        </button>

        {/* marble frame with gold inlay */}
        <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden>
          <defs>
            <linearGradient id="gate-marble" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#FFFDF8" />
              <stop offset="0.5" stopColor={MARBLE} />
              <stop offset="1" stopColor={shade(MARBLE, -0.08)} />
            </linearGradient>
            <pattern id="gate-veins" width="160" height="160" patternUnits="userSpaceOnUse">
              <path d="M0 40 C40 30 60 70 100 60 S150 90 160 80 M20 160 C40 120 90 130 110 100 S150 120 160 110" stroke="#B9A88C" strokeOpacity="0.2" strokeWidth="0.8" fill="none" />
            </pattern>
            <pattern id="gate-jali" width="16" height="16" patternUnits="userSpaceOnUse">
              <path d="M8 0 L16 8 L8 16 L0 8 Z" fill="none" stroke={GOLD} strokeOpacity="0.4" strokeWidth="0.7" />
              <circle cx="8" cy="8" r="1.3" fill={GOLD} opacity="0.4" />
            </pattern>
            <clipPath id="gate-spandrel">
              <path clipRule="evenodd" d={`M${W / 2 - half - 22} ${TIP - 30} H${W / 2 + half + 22} V${TIP + drop} H${W / 2 - half - 22} Z ${archPath(g, 22, TIP + drop)} Z`} />
            </clipPath>
          </defs>
          <path d={`M0 0 H${W} V${H} H0 Z ${doorway} Z`} fillRule="evenodd" fill="url(#gate-marble)" />
          <path d={`M0 0 H${W} V${H} H0 Z ${doorway} Z`} fillRule="evenodd" fill="url(#gate-veins)" />
          {/* jali spandrels over the arch */}
          <rect x="0" y="0" width={W} height={H} fill="url(#gate-jali)" clipPath="url(#gate-spandrel)" />
          {/* layered gold arch mouldings */}
          <path d={doorway} fill="none" stroke={GOLD} strokeWidth="4" />
          <path d={archPath(g, 12, FLOOR + 6)} fill="none" stroke={GOLD} strokeWidth="1.4" />
          <path d={archPath(g, 22, FLOOR + 6)} fill="none" stroke={GOLD} strokeWidth="0.8" opacity="0.7" />
          {/* finial */}
          <path d={`M${W / 2} ${TIP - 24} V${TIP - 46}`} stroke={GOLD} strokeWidth="1.6" />
          <path d={`M${W / 2 - 8} ${TIP - 44} Q${W / 2} ${TIP - 62} ${W / 2 + 8} ${TIP - 44} Z`} fill={GOLD} />
          {/* pillars (laptop only) */}
          {pillarXs.map((px) => (
            <g key={px}>
              <rect x={px - 11} y={TIP + drop - 60} width="22" height={FLOOR - (TIP + drop - 60)} fill={shade(MARBLE, -0.05)} stroke={GOLD} strokeWidth="1" />
              <path d={`M${px - 5} ${TIP + drop - 50} V${FLOOR - 6} M${px + 5} ${TIP + drop - 50} V${FLOOR - 6}`} stroke={GOLD} strokeWidth="0.6" opacity="0.6" />
              <rect x={px - 15} y={TIP + drop - 72} width="30" height="14" rx="2" fill={MARBLE} stroke={GOLD} strokeWidth="1" />
              <path d={`M${px - 9} ${TIP + drop - 72} Q${px} ${TIP + drop - 94} ${px + 9} ${TIP + drop - 72} Z`} fill={GOLD} />
            </g>
          ))}
          {/* plaque for the names */}
          <rect x={W / 2 - plaqueW / 2} y={plaqueTop} width={plaqueW} height={plaqueH} rx="10" fill="#FFFDF8" stroke={GOLD} strokeWidth="1.6" />
          <rect x={W / 2 - plaqueW / 2 + 8} y={plaqueTop + 8} width={plaqueW - 16} height={plaqueH - 16} rx="7" fill="none" stroke={GOLD} strokeWidth="0.6" opacity="0.7" />
          {/* threshold */}
          <rect x="0" y={FLOOR} width={W} height={H - FLOOR} fill={shade(MARBLE, -0.06)} />
          <path d={`M0 ${FLOOR} H${W} M${W * 0.08} ${FLOOR + 16} H${W * 0.92}`} stroke={GOLD} strokeWidth="1" opacity="0.8" />
        </svg>

        {/* names on the plaque */}
        <div className="absolute [container-type:inline-size]" style={{ left: x(W / 2 - plaqueW / 2), width: x(plaqueW), top: y(plaqueTop), height: y(plaqueH), color: '#7A1F2B' }}>
          <div className="flex h-full flex-col items-center justify-center text-center">
            <p className="gate-text text-[length:3.4cqw] tracking-[0.3em] text-[#9C7A24] uppercase">You are invited</p>
            <p className="gate-text font-script text-[length:12cqw] leading-tight">
              {groom} <span className="font-display text-[length:6cqw] text-[#B8902F]">&amp;</span> {bride}
            </p>
            <p className="gate-text font-display text-[length:4.8cqw] italic opacity-85">Dear {guest}</p>
          </div>
        </div>

        {/* petals */}
        <div className="pointer-events-none absolute left-1/2" style={{ top: y(lockY) }} aria-hidden>
          {Array.from({ length: 18 }, (_, i) => (
            <svg key={i} viewBox="0 0 20 24" className="gate-petal invisible absolute -mt-2 -ml-2 h-4 w-4">
              <path d="M10 0 C18 6 16 18 10 24 C4 18 2 6 10 0 Z" fill={['#D63A5B', '#E86A86', '#F2A7B8', '#F0B429', '#FFFFFF'][i % 5]} opacity="0.9" />
            </svg>
          ))}
        </div>
      </div>

      <p className="gate-hint pointer-events-none absolute inset-x-0 bottom-[max(18px,env(safe-area-inset-bottom))] text-center text-[10px] tracking-[0.3em] text-[#7A1F2B] uppercase sm:text-xs">
        <span className="seal-pulse inline-block">Tap the doors to open</span>
      </p>
    </div>
  )
}
