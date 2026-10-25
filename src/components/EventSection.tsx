import { useLayoutEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import type { WeddingEvent } from '../config/event'
import { themeVars } from '../lib/theme'
import { useReducedMotion } from '../hooks/useReducedMotion'
import { useReveal } from '../hooks/useReveal'
import { useThemeZone } from './ThemeBackdrop'
import { Couple } from './Couple'
import { EventCard } from './EventCard'
import { Arch } from './Arch'
import type { Pose } from './Character'

const SETTLE: Pose[] = ['wave', 'together']
const ORDINAL = ['', 'One', 'Two', 'Three']

/** One wedding day: a pinned title scene where the couple walks in wearing that day's outfits, then the details card. */
export function EventSection({ event: e }: { event: WeddingEvent }) {
  const ref = useRef<HTMLElement>(null)
  const scene = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()
  const [arrive, setArrive] = useState(reduced)
  useThemeZone(ref, e.id)
  useReveal(ref)

  useLayoutEffect(() => {
    if (reduced) return setArrive(true)
    const ctx = gsap.context(() => {
      // Title reveal as the scene scrolls in, then the couple walks on.
      const intro = gsap.timeline({
        scrollTrigger: { trigger: scene.current, start: 'top 65%', once: true },
        defaults: { ease: 'power3.out' },
        onComplete: () => setArrive(true),
      })
      intro
        .fromTo('.ev-arch', { scale: 0.6, autoAlpha: 0 }, { scale: 1, autoAlpha: 1, duration: 1.2 })
        .fromTo('.ev-line', { x: -28, autoAlpha: 0 }, { x: 0, autoAlpha: 1, duration: 0.8, stagger: 0.12 }, '-=0.8')

      // Hold the scene for a moment while the theme settles in.
      gsap
        .timeline({ scrollTrigger: { trigger: scene.current, start: 'top top', end: '+=55%', scrub: 1, pin: true, anticipatePin: 1 } })
        .to('.ev-titles', { y: -20, ease: 'none' }, 0)
    }, ref)
    return () => ctx.revert()
  }, [reduced])

  // Pin spacers change page height; let other triggers recalculate.
  useLayoutEffect(() => {
    const id = requestAnimationFrame(() => ScrollTrigger.refresh())
    return () => cancelAnimationFrame(id)
  }, [])

  return (
    <section ref={ref} id={e.id} style={themeVars(e.theme)} className="relative z-10 text-ink" aria-labelledby={`${e.id}-title`}>
      <div ref={scene} className="relative flex min-h-[100svh] items-center overflow-hidden px-4 py-16">
        <div className="mx-auto grid w-full max-w-5xl grid-cols-[1fr_1.1fr] items-center gap-3 sm:gap-12">
          {/* left: heading + wish */}
          <div className="ev-titles relative text-left">
            <p className="ev-line text-[10px] tracking-[0.3em] text-accent uppercase sm:text-xs sm:tracking-[0.4em]">Day {ORDINAL[e.day] ?? e.day}</p>
            <p className="ev-line font-urdu mt-2 text-left text-2xl leading-[1.9] text-primary sm:text-4xl" lang="ur" dir="rtl">
              {e.titleUrdu}
            </p>
            <h2 id={`${e.id}-title`} className="ev-line font-script mt-2 text-[clamp(2.7rem,12vw,6rem)] leading-none text-primary sm:mt-3">
              {e.title}
            </h2>
            <p className="ev-line font-display mt-2 text-sm italic opacity-90 sm:text-lg">{e.tagline}</p>
            <div className="ev-line mt-4 h-px w-16 bg-accent/70 sm:mt-6 sm:w-24" aria-hidden />
            <blockquote className="ev-line mt-4 sm:mt-6">
              <p className="font-display text-[0.95rem] leading-relaxed sm:text-xl">“{e.wish}”</p>
              {e.wishSource && <footer className="font-display mt-2 text-sm text-accent italic sm:text-base">— {e.wishSource}</footer>}
            </blockquote>
          </div>

          {/* right: dome with the couple standing under it; grows slightly on hover */}
          <div className="relative mx-auto aspect-[400/520] w-full max-w-[420px] transition-[scale] duration-500 ease-out motion-safe:hover:scale-105">
            <Arch className="ev-arch pointer-events-none absolute inset-0 h-full w-full text-accent" />
            <div className="absolute inset-x-[12%] bottom-[2%]">
              <Couple groom={e.outfit.groom} bride={e.outfit.bride} arrive={arrive} settle={SETTLE} day={e.day} />
            </div>
          </div>
        </div>
      </div>

      <div className="relative px-4 pb-28">
        <EventCard event={e} />
      </div>
    </section>
  )
}
