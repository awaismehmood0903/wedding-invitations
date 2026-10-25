import { useEffect } from 'react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { getLenis } from './useLenis'

/** Keeps the page pinned at the top (e.g. behind the doors or envelope) until unlocked. */
export function usePageLock(locked: boolean) {
  useEffect(() => {
    document.documentElement.style.overflow = locked ? 'hidden' : ''
    const lenis = getLenis()
    if (locked) {
      lenis?.stop()
      window.scrollTo(0, 0)
    } else {
      lenis?.start()
      ScrollTrigger.refresh()
    }
  }, [locked])
}
