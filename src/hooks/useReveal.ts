import { useLayoutEffect, type RefObject } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useReducedMotion } from './useReducedMotion'

type RevealOptions = { y?: number; duration?: number; stagger?: number }

/** Fades/slides every `.reveal` child of `ref` up into view as it scrolls in. */
export function useReveal(ref: RefObject<HTMLElement | null>, { y = 36, duration = 0.9, stagger = 0.12 }: RevealOptions = {}) {
  const reduced = useReducedMotion()
  useLayoutEffect(() => {
    if (reduced || !ref.current) return
    const ctx = gsap.context(() => {
      gsap.set('.reveal', { autoAlpha: 0, y })
      ScrollTrigger.batch(ref.current!.querySelectorAll('.reveal'), {
        start: 'top 90%',
        once: true,
        onEnter: (els) => gsap.to(els, { autoAlpha: 1, y: 0, duration, stagger, ease: 'power3.out', overwrite: true }),
      })
    }, ref)
    return () => ctx.revert()
  }, [ref, reduced, y, duration, stagger])
}
