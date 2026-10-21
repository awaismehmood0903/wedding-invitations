import { useId, useLayoutEffect, useRef } from 'react'
import { gsap } from 'gsap'
import type { BrideOutfit, GroomOutfit } from '../config/event'
import { useReducedMotion } from '../hooks/useReducedMotion'
import { REAL_GROUND, REAL_VIEWBOX, RealBride, RealGroom, realOrigins } from './CharacterRealistic'

export type Pose = 'idle' | 'walk' | 'wave' | 'together'

type Props = {
  pose: Pose
  /** Which side of the couple this character stands on — decides which arm is the "inner" one. */
  side: 'left' | 'right'
  /** flat = simple illustrated style, real = semi-realistic detailed style */
  look?: 'flat' | 'real'
  className?: string
} & ({ who: 'groom'; outfit: GroomOutfit } | { who: 'bride'; outfit: BrideOutfit })

const SKIN = '#E8B996'
const SKIN_SHADE = '#D9A27D'
const HAIR = '#1E1410'

// Pivot points (in SVG units) for each moving part.
const ORIGINS = {
  groom: { armL: '46 108', armR: '94 108', legL: '58 212', legR: '82 212', skirt: '70 140', drape: '70 40' },
  bride: { armL: '50 104', armR: '90 104', legL: '58 212', legR: '82 212', skirt: '70 140', drape: '70 40' },
}

/**
 * Flat-style bride / groom drawn as layered inline SVG and animated with GSAP
 * (blink, breathe, walk cycle, wave, hands-together). Outfit colours come from config.
 */
export function Character(props: Props) {
  const { pose, side, who, className, look = 'flat' } = props
  const real = look === 'real'
  const suit = props.who === 'groom' && props.outfit.style === 'suit'
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '')
  const reduced = useReducedMotion()
  const root = useRef<SVGSVGElement>(null)
  const body = useRef<SVGGElement>(null)
  const upper = useRef<SVGGElement>(null)
  const eyes = useRef<SVGGElement>(null)
  const armL = useRef<SVGGElement>(null)
  const armR = useRef<SVGGElement>(null)
  const legL = useRef<SVGGElement>(null)
  const legR = useRef<SVGGElement>(null)
  const skirt = useRef<SVGGElement>(null)
  const drape = useRef<SVGGElement>(null)

  useLayoutEffect(() => {
    const o = real ? realOrigins(who, suit) : ORIGINS[who]
    const ground = real ? `100 ${REAL_GROUND}` : '70 290'
    const parts = { armL, armR, legL, legR, skirt, drape } as const
    const el = (k: keyof typeof parts) => parts[k].current
    const rot = (k: keyof typeof parts, rotation: number, vars: gsap.TweenVars = {}) =>
      el(k) && gsap.to(el(k), { rotation, svgOrigin: o[k], duration: 0.45, ease: 'sine.inOut', overwrite: 'auto', ...vars })

    const outer = side === 'left' ? 'armL' : 'armR'
    const inner = side === 'left' ? 'armR' : 'armL'
    // Positive rotation swings the viewer-left arm outward; negative swings the right one out.
    const out = (k: 'armL' | 'armR', deg: number) => (k === 'armL' ? deg : -deg)

    const ctx = gsap.context(() => {
      const instant = reduced ? { duration: 0 } : {}
      ;(['armL', 'armR', 'legL', 'legR', 'skirt'] as const).forEach((k) => rot(k, 0, instant))
      gsap.to(body.current, { y: 0, rotation: 0, svgOrigin: ground, duration: 0.3, overwrite: 'auto' })

      if (pose === 'together') rot(inner, out(inner, real ? 30 : 40), instant)
      if (reduced) return

      // The bride's dupatta drifts as if in a light breeze.
      if (drape.current) gsap.fromTo(drape.current, { rotation: -0.8 }, { rotation: 0.8, svgOrigin: o.drape, duration: 2.4, yoyo: true, repeat: -1, ease: 'sine.inOut' })

      // Always-on life: blinking and breathing.
      gsap.to(eyes.current, {
        scaleY: 0.1,
        transformOrigin: '50% 50%',
        duration: 0.07,
        yoyo: true,
        repeat: 1,
        repeatDelay: 0.05,
        delay: 1 + Math.random() * 2,
        onComplete: function (this: gsap.core.Tween) {
          this.delay(2.5 + Math.random() * 2.5).restart(true)
        },
      })
      gsap.to(upper.current, { y: -1.4, duration: 1.8, ease: 'sine.inOut', yoyo: true, repeat: -1 })

      if (pose === 'walk') {
        const step = 0.32
        rot('legL', 16, { duration: step, yoyo: true, repeat: -1, startAt: { rotation: -16 } })
        rot('legR', -16, { duration: step, yoyo: true, repeat: -1, startAt: { rotation: 16 } })
        rot('armL', -12, { duration: step, yoyo: true, repeat: -1, startAt: { rotation: 12 } })
        rot('armR', -12, { duration: step, yoyo: true, repeat: -1, startAt: { rotation: 12 } })
        rot('skirt', 3, { duration: step, yoyo: true, repeat: -1, startAt: { rotation: -3 } })
        gsap.to(body.current, { y: -3, duration: step / 2, yoyo: true, repeat: -1, ease: 'sine.inOut' })
      } else if (pose === 'wave') {
        const tl = gsap.timeline()
        tl.add(rot(outer, out(outer, 150), { duration: 0.5 }) as gsap.core.Tween)
        tl.to(el(outer), { rotation: out(outer, 125), svgOrigin: o[outer], duration: 0.35, yoyo: true, repeat: 5, ease: 'sine.inOut' })
        tl.to(el(outer), { rotation: 0, svgOrigin: o[outer], duration: 0.6, ease: 'sine.inOut' })
      } else {
        // idle / together: gentle sway
        gsap.to(body.current, { rotation: side === 'left' ? 1.2 : -1.2, svgOrigin: ground, duration: 2.6, yoyo: true, repeat: -1, ease: 'sine.inOut' })
      }
    }, root)
    return () => ctx.kill()
  }, [pose, side, who, reduced, real, suit])

  const label = who === 'groom' ? 'Illustrated groom' : 'Illustrated bride'

  return (
    <svg ref={root} viewBox={real ? REAL_VIEWBOX : '0 -24 140 324'} overflow="visible" className={className} role="img" aria-label={label}>
      {real ? <ellipse cx="100" cy={REAL_GROUND} rx="62" ry="8" fill="#000" opacity="0.14" /> : <ellipse cx="70" cy="294" rx="44" ry="6" fill="#000" opacity="0.12" />}
      <g ref={body}>
        {props.who === 'groom' ? (
          real ? <RealGroom o={props.outfit} id={uid} refs={{ upper, eyes, armL, armR, legL, legR }} /> : <Groom o={props.outfit} refs={{ upper, eyes, armL, armR, legL, legR }} />
        ) : real ? (
          <RealBride o={props.outfit} id={uid} refs={{ upper, eyes, armL, armR, skirt, drape }} />
        ) : (
          <Bride o={props.outfit} refs={{ upper, eyes, armL, armR, skirt }} />
        )}
      </g>
    </svg>
  )
}

type R = React.RefObject<SVGGElement | null>

function Face({ eyes, bride }: { eyes: R; bride?: boolean }) {
  const cy = bride ? 58 : 60
  return (
    <>
      <path d={`M58 ${cy - 7} q4 -3 8 -1 M74 ${cy - 8} q4 -2 8 1`} stroke={HAIR} strokeWidth="1.6" fill="none" strokeLinecap="round" />
      <g ref={eyes}>
        <ellipse cx="62" cy={cy} rx="2.6" ry="3.2" fill={HAIR} />
        <ellipse cx="78" cy={cy} rx="2.6" ry="3.2" fill={HAIR} />
        {bride && <path d={`M58 ${cy - 2} l-2 -2 M82 ${cy - 2} l2 -2`} stroke={HAIR} strokeWidth="1.2" strokeLinecap="round" />}
      </g>
      <circle cx="58" cy={cy + 8} r="4" fill="#E67C7C" opacity="0.25" />
      <circle cx="82" cy={cy + 8} r="4" fill="#E67C7C" opacity="0.25" />
      <path d={`M70 ${cy + 2} q-2 5 1 6`} stroke={SKIN_SHADE} strokeWidth="1.4" fill="none" strokeLinecap="round" />
      <path d={`M64 ${cy + 12} Q70 ${cy + 17} 76 ${cy + 12}`} stroke={bride ? '#B83B4F' : '#8A4A3A'} strokeWidth="2" fill="none" strokeLinecap="round" />
    </>
  )
}

function Arm({ armRef, d, hand, cuff, sleeve, bangles }: { armRef: R; d: string; hand: [number, number]; cuff: string; sleeve: string; bangles?: string }) {
  return (
    <g ref={armRef}>
      <path d={d} fill={sleeve} stroke={cuff} strokeOpacity="0.45" strokeWidth="1" />
      <circle cx={hand[0]} cy={hand[1]} r="6" fill={SKIN} />
      <path d={`M${hand[0] - 6} ${hand[1] - 9} h12`} stroke={cuff} strokeWidth="3" strokeLinecap="round" />
      {bangles && <path d={`M${hand[0] - 6} ${hand[1] - 13} h12 M${hand[0] - 6} ${hand[1] - 17} h12`} stroke={bangles} strokeWidth="2" strokeLinecap="round" />}
    </g>
  )
}

function Groom({ o, refs }: { o: GroomOutfit; refs: Record<'upper' | 'eyes' | 'armL' | 'armR' | 'legL' | 'legR', R> }) {
  const suit = o.style === 'suit'
  // Suit: straight trousers from under the jacket + black shoes. Sherwani: churidar + khussa.
  const leg = suit ? { y: 196, w: 15, h: 92, shoe: '#1A1A1C' } : { y: 210, w: 12, h: 78, shoe: '#5A3420' }
  return (
    <>
      <g ref={refs.legL}>
        <rect x={64 - leg.w} y={leg.y} width={leg.w} height={leg.h} rx={suit ? 3 : 5} fill={o.pants} />
        <path d="M48 288 q10 -8 18 0 q-2 6 -18 4 z" fill={leg.shoe} />
      </g>
      <g ref={refs.legR}>
        <rect x="76" y={leg.y} width={leg.w} height={leg.h} rx={suit ? 3 : 5} fill={o.pants} />
        <path d="M74 288 q8 -8 18 0 q-16 2 -18 -0 z" fill={leg.shoe} />
      </g>
      <g ref={refs.upper}>
        {suit ? (
          <>
            {/* pant coat: hip-length jacket, white shirt, tie, pocket square */}
            <path d="M48 104 Q70 96 92 104 L98 208 Q70 214 42 208 Z" fill={o.coat} stroke={o.trim} strokeWidth="1.2" />
            <path d="M58 100 L70 136 L82 100 Z" fill="#F7F5F0" />
            <path d="M67.5 104 h5 l1 6 -2 20 -1.5 3 -1.5 -3 -2 -20 z" fill={o.tie ?? '#7A1F2B'} />
            <path d="M58 100 L64 122 L70 136 M82 100 L76 122 L70 136" stroke={o.trim} strokeWidth="1.6" fill="none" />
            <path d="M58 100 L54 112 L64 122 M82 100 L86 112 L76 122" stroke={o.trim} strokeWidth="1.2" fill="none" />
            <path d="M70 136 V208" stroke={o.trim} strokeWidth="1" opacity="0.8" />
            <circle cx="73" cy="152" r="2" fill={o.trim} />
            <circle cx="73" cy="170" r="2" fill={o.trim} />
            <path d="M78 128 h10 M50 178 h12 M78 178 h12" stroke={o.trim} strokeWidth="1.2" />
            <path d="M80 128 l3 -5 2 5 z" fill={o.tie ?? '#F7F5F0'} />
          </>
        ) : (
          <>
            {/* sherwani */}
            <path d="M48 104 Q70 96 92 104 L102 238 Q70 248 38 238 Z" fill={o.coat} stroke={o.trim} strokeOpacity="0.55" strokeWidth="1.2" />
            <path d="M40 232 Q70 242 100 232" stroke={o.trim} strokeWidth="3" fill="none" />
            <path d="M70 102 V242" stroke={o.trim} strokeWidth="1.6" />
            {[122, 140, 158, 176, 194].map((y) => (
              <circle key={y} cx="70" cy={y} r="2.2" fill={o.trim} />
            ))}
            <path d="M54 110 q16 10 32 0" stroke={o.trim} strokeWidth="1.2" fill="none" opacity="0.7" />
          </>
        )}
        <Arm armRef={refs.armL} d="M46 104 Q36 106 34 120 L32 184 Q32 192 40 192 Q47 192 47 184 L52 120 Z" hand={[39, 196]} cuff={suit ? '#F7F5F0' : o.trim} sleeve={o.coat} />
        <Arm armRef={refs.armR} d="M94 104 Q104 106 106 120 L108 184 Q108 192 100 192 Q93 192 93 184 L88 120 Z" hand={[101, 196]} cuff={suit ? '#F7F5F0' : o.trim} sleeve={o.coat} />
        {/* neck + collar */}
        <rect x="63" y="80" width="14" height="18" fill={SKIN_SHADE} />
        {suit ? (
          <path d="M60 94 L70 104 L80 94 L80 99 L70 108 L60 99 Z" fill="#F7F5F0" />
        ) : (
          <rect x="60" y="92" width="20" height="12" rx="3" fill={o.coat} stroke={o.trim} strokeWidth="1.5" />
        )}
        {/* head */}
        <circle cx="44" cy="62" r="5" fill={SKIN} />
        <circle cx="96" cy="62" r="5" fill={SKIN} />
        <circle cx="70" cy="58" r="26" fill={SKIN} />
        <Face eyes={refs.eyes} />
        {o.turban ? (
          <>
            <path d="M98 50 Q110 70 104 96" stroke={o.trim} strokeWidth="7" fill="none" strokeLinecap="round" />
            <path d="M98 50 Q110 70 104 96" stroke={o.turban} strokeWidth="5" fill="none" strokeLinecap="round" />
            <path d="M42 54 Q40 18 70 14 Q100 18 98 54 Q70 42 42 54 Z" fill={o.turban} stroke={o.trim} strokeWidth="1.2" />
            <path d="M44 46 Q70 30 96 46 M46 36 Q70 22 94 36" stroke={o.trim} strokeWidth="1.6" fill="none" />
            <circle cx="70" cy="30" r="4" fill={o.trim} />
            <path d="M70 16 Q60 -6 66 -18 Q72 -8 70 16 Z" fill={o.trim} />
          </>
        ) : (
          <path d="M44 56 Q42 26 70 26 Q98 26 96 56 Q92 40 80 38 Q66 46 50 42 Q46 48 44 56 Z" fill={HAIR} />
        )}
      </g>
    </>
  )
}

function Bride({ o, refs }: { o: BrideOutfit; refs: Record<'upper' | 'eyes' | 'armL' | 'armR' | 'skirt', R> }) {
  return (
    <>
      {/* dupatta, back drape */}
      <path d="M38 60 Q36 18 70 14 Q104 18 102 60 L114 200 Q104 208 94 198 L92 72 Q88 36 70 36 Q52 36 48 72 L46 198 Q36 208 26 200 Z" fill={o.dupatta} opacity="0.95" />
      <path d="M26 200 Q36 208 46 198 M94 198 Q104 208 114 200" stroke={o.trim} strokeWidth="3" fill="none" />
      <g ref={refs.skirt}>
        <path d="M50 138 Q70 132 90 138 L120 284 Q70 300 20 284 Z" fill={o.dress} />
        <path d="M22 276 Q70 292 118 276" stroke={o.trim} strokeWidth="6" fill="none" />
        <path d="M30 252 Q70 264 110 252" stroke={o.trim} strokeWidth="1.5" fill="none" opacity="0.8" />
        {[40, 55, 70, 85, 100].map((x, i) => (
          <circle key={x} cx={x} cy={i % 2 ? 214 : 196} r="2" fill={o.trim} opacity="0.85" />
        ))}
        <path d="M58 286 q6 -6 12 0 M74 286 q6 -6 12 0" stroke="#7A2E1F" strokeWidth="4" strokeLinecap="round" fill="none" />
      </g>
      <g ref={refs.upper}>
        <path d="M50 100 Q70 94 90 100 L92 144 Q70 150 48 144 Z" fill={o.top} />
        <path d="M48 142 Q70 150 92 142" stroke={o.trim} strokeWidth="2.5" fill="none" />
        <Arm armRef={refs.armL} d="M50 102 Q42 104 40 116 L38 178 Q38 186 44 186 Q50 186 50 178 L54 116 Z" hand={[44, 190]} cuff={o.trim} sleeve={o.top} bangles={o.trim} />
        <Arm armRef={refs.armR} d="M90 102 Q98 104 100 116 L102 178 Q102 186 96 186 Q90 186 90 178 L86 116 Z" hand={[96, 190]} cuff={o.trim} sleeve={o.top} bangles={o.trim} />
        <rect x="64" y="76" width="12" height="20" fill={SKIN_SHADE} />
        <path d="M58 94 Q70 110 82 94" stroke={o.trim} strokeWidth="3" fill="none" />
        <circle cx="70" cy="104" r="3" fill={o.trim} />
        {/* hair */}
        <path d="M44 60 Q42 28 70 28 Q98 28 96 60 L98 90 Q90 80 92 62 Q86 40 70 40 Q54 40 48 62 Q50 80 42 90 Z" fill={HAIR} />
        <circle cx="70" cy="56" r="24" fill={SKIN} />
        <path d="M46 52 Q48 30 70 30 Q92 30 94 52 Q86 38 70 40 Q54 38 46 52 Z" fill={HAIR} />
        <Face eyes={refs.eyes} bride />
        {/* jewellery: tikka, nath, jhumkay */}
        <path d="M70 30 V38" stroke={o.trim} strokeWidth="1.2" />
        <circle cx="70" cy="40" r="2.6" fill={o.trim} />
        <circle cx="76.5" cy="63" r="1.3" fill={o.trim} />
        <circle cx="46" cy="66" r="2.8" fill={o.trim} />
        <circle cx="94" cy="66" r="2.8" fill={o.trim} />
        {/* dupatta, front edge over the head */}
        <path d="M42 50 Q44 18 70 16 Q96 18 98 50 Q90 30 70 28 Q50 30 42 50 Z" fill={o.dupatta} />
        <path d="M42 50 Q44 18 70 16 Q96 18 98 50" stroke={o.trim} strokeWidth="2" fill="none" />
      </g>
    </>
  )
}
