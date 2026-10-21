import { lazy, Suspense, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { wedding, type BrideOutfit, type GroomOutfit } from '../config/event'
import { useReducedMotion } from '../hooks/useReducedMotion'
import { Character, type Pose } from './Character'

const RiveCouple = lazy(() => import('./RiveCouple'))

export type CoupleProps = {
  groom: GroomOutfit
  bride: BrideOutfit
  /** Flip to true to make them walk in from opposite sides and meet. */
  arrive: boolean
  /** Poses played after arriving, ~3s each; the last one stays. */
  settle: Pose[]
  /** 0 = intro, 1–3 = event day. Passed to the Rive state machine. */
  day?: number
  /** Character drawing style: flat (default) or semi-realistic. */
  look?: 'flat' | 'real'
  className?: string
}

/**
 * The bride & groom. Uses the SVG characters by default; set `wedding.rive.src`
 * to swap in a Rive file without touching any other component.
 */
export function Couple(props: CoupleProps) {
  if (wedding.rive.src) {
    return (
      <Suspense fallback={<SvgCouple {...props} />}>
        <RiveCouple {...props} fallback={<SvgCouple {...props} />} />
      </Suspense>
    )
  }
  return <SvgCouple {...props} />
}

function SvgCouple({ groom, bride, arrive, settle, look = 'flat', className = '' }: CoupleProps) {
  const reduced = useReducedMotion()
  const groomEl = useRef<HTMLDivElement>(null)
  const brideEl = useRef<HTMLDivElement>(null)
  const heart = useRef<SVGSVGElement>(null)
  const [pose, setPose] = useState<Pose>('idle')
  const [arrived, setArrived] = useState(false)

  useLayoutEffect(() => {
    if (!arrive) {
      gsap.set([groomEl.current, brideEl.current], { autoAlpha: reduced ? 1 : 0 })
      return
    }
    if (reduced) {
      gsap.set([groomEl.current, brideEl.current], { autoAlpha: 1, xPercent: 0 })
      setArrived(true)
      return
    }
    setPose('walk')
    const tl = gsap.timeline({ onComplete: () => setArrived(true) })
    tl.fromTo(groomEl.current, { xPercent: -150, autoAlpha: 0 }, { xPercent: 0, autoAlpha: 1, duration: 2.4, ease: 'power1.out' }, 0)
    tl.fromTo(brideEl.current, { xPercent: 150, autoAlpha: 0 }, { xPercent: 0, autoAlpha: 1, duration: 2.4, ease: 'power1.out' }, 0)
    return () => void tl.kill()
  }, [arrive, reduced])

  // Step through the settle poses once they've met.
  useEffect(() => {
    if (!arrived) return
    const timers = settle.map((p, i) => setTimeout(() => setPose(p), i * 3200))
    return () => timers.forEach(clearTimeout)
  }, [arrived, settle])

  useLayoutEffect(() => {
    if (!heart.current) return
    const show = pose === 'together'
    gsap.to(heart.current, {
      scale: show ? 1 : 0,
      autoAlpha: show ? 1 : 0,
      y: show ? -8 : 0,
      transformOrigin: '50% 100%',
      duration: show ? 0.7 : 0.3,
      ease: show ? 'back.out(2.5)' : 'power1.in',
      delay: show ? 0.35 : 0,
    })
  }, [pose])

  return (
    <div className={`relative mx-auto flex items-end justify-center gap-[6%] ${className}`}>
      <div ref={groomEl} className="w-[44%] will-change-transform">
        <Character who="groom" side="left" outfit={groom} pose={pose} look={look} className="h-auto w-full" />
      </div>
      <div ref={brideEl} className="w-[44%] will-change-transform">
        <Character who="bride" side="right" outfit={bride} pose={pose} look={look} className="h-auto w-full" />
      </div>
      <svg ref={heart} viewBox="0 0 24 22" aria-hidden className={`pointer-events-none invisible absolute left-1/2 w-[11%] -translate-x-1/2 ${look === 'real' ? 'top-[44%]' : 'top-[34%]'}`}>
        <path d="M12 21 C5 15 1 11.5 1 7 A5.5 5.5 0 0 1 12 4.5 A5.5 5.5 0 0 1 23 7 C23 11.5 19 15 12 21 Z" fill="#D63A5B" />
        <path d="M6 6.5 a2.5 2.5 0 0 1 3 -1.5" stroke="#fff" strokeWidth="1.3" fill="none" strokeLinecap="round" opacity="0.7" />
      </svg>
    </div>
  )
}
