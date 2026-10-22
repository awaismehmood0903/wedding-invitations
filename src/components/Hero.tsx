import { useLayoutEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { wedding } from '../config/event'
import { useReducedMotion } from '../hooks/useReducedMotion'
import { useThemeZone } from './ThemeBackdrop'
import { Couple } from './Couple'
import type { Pose } from './Character'

const SETTLE: Pose[] = ['wave', 'together']

const Letters = ({ text }: { text: string }) => (
  <span aria-label={text} className="inline-block">
    {[...text].map((ch, i) => (
      <span key={i} aria-hidden className="hero-letter inline-block will-change-transform">
        {ch}
      </span>
    ))}
  </span>
)

/** Bismillah, names writing in, and the couple walking in from opposite sides to meet. */
export function Hero({ start }: { start: boolean }) {
  const ref = useRef<HTMLElement>(null)
  const reduced = useReducedMotion()
  const { groom, bride, groomFull, brideFull } = wedding.couple
  useThemeZone(ref, 'base')

  useLayoutEffect(() => {
    if (reduced) return
    const ctx = gsap.context(() => {
      gsap.set('.hero-in, .hero-letter', { autoAlpha: 0 })
      if (!start) return
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })
      tl.fromTo('.hero-bismillah', { y: 16 }, { y: 0, autoAlpha: 1, duration: 1 })
        .fromTo('.hero-pre', { y: 12 }, { y: 0, autoAlpha: 1, duration: 0.8 }, '-=0.5')
        .fromTo('.hero-letter', { y: 30, rotate: -8 }, { y: 0, rotate: 0, autoAlpha: 1, duration: 0.7, stagger: 0.07 }, '-=0.3')
        .fromTo('.hero-full', { y: 10 }, { y: 0, autoAlpha: 1, duration: 0.8, stagger: 0.15 }, '-=0.4')
        .fromTo('.hero-cue', { y: 0 }, { autoAlpha: 1, duration: 0.6 }, '+=1.2')
    }, ref)
    return () => ctx.revert()
  }, [start, reduced])

  return (
    <section ref={ref} className="relative z-10 flex min-h-[100svh] flex-col items-center justify-start overflow-hidden px-4 pt-[7svh] text-center text-ink">
      <p className="hero-in hero-bismillah font-arabic text-2xl leading-loose text-primary sm:text-3xl" lang="ar" dir="rtl">
        {wedding.bismillah}
      </p>
      <p className="hero-in hero-pre font-display mt-3 text-xs tracking-[0.4em] text-accent uppercase sm:text-sm">Together with their families</p>

      <h1 className="font-script mt-4 text-[clamp(3.4rem,15vw,6.5rem)] leading-[1.05] text-primary">
        <Letters text={groom} />
        <span className="hero-in hero-full font-display mx-3 inline-block align-middle text-[0.4em] text-accent">&amp;</span>
        <Letters text={bride} />
      </h1>
      <p className="hero-in hero-full font-display mt-2 text-[0.95rem] tracking-[0.12em] uppercase sm:text-lg sm:tracking-[0.18em]">
        {groomFull} <span className="text-accent">·</span> {brideFull}
      </p>

      <div className="mt-auto w-[min(80vw,340px)] pb-[8svh]">
        <Couple groom={wedding.introOutfit.groom} bride={wedding.introOutfit.bride} arrive={start} settle={SETTLE} day={0} />
      </div>

      <div className="hero-in hero-cue absolute bottom-5 left-1/2 flex -translate-x-1/2 flex-col items-center gap-1 text-[10px] tracking-[0.3em] text-ink/70 uppercase">
        Scroll
        <span className="scroll-cue block h-3 w-px bg-current" />
      </div>
    </section>
  )
}
