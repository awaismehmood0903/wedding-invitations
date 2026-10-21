import { createContext, useContext, useLayoutEffect, type RefObject } from 'react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import type { DayTheme } from '../config/event'
import { patternUrl } from '../lib/patterns'

export type Zone = { id: string; theme: DayTheme }

export const ZoneContext = createContext<(id: string) => void>(() => {})

/** Marks a section as belonging to a theme zone; the backdrop crossfades when it reaches mid-screen. */
export function useThemeZone(ref: RefObject<HTMLElement | null>, id: string) {
  const setActive = useContext(ZoneContext)
  useLayoutEffect(() => {
    if (!ref.current) return
    const st = ScrollTrigger.create({
      trigger: ref.current,
      start: 'top 55%',
      end: 'bottom 55%',
      onToggle: (self) => self.isActive && setActive(id),
      // Recalculate after the pinned scenes, which add height above later sections.
      refreshPriority: -1,
    })
    return () => st.kill()
  }, [ref, id, setActive])
}

/** Fixed stack of full-screen colour + pattern layers; only opacity changes, so it stays smooth. */
export function ThemeBackdrop({ zones, active }: { zones: Zone[]; active: string }) {
  return (
    <div className="pointer-events-none fixed inset-0 z-0" aria-hidden>
      {zones.map(({ id, theme }) => (
        <div
          key={id}
          className="absolute inset-0 transition-opacity duration-[1200ms] ease-in-out"
          style={{
            opacity: id === active ? 1 : 0,
            backgroundColor: theme.bg,
            backgroundImage: `radial-gradient(ellipse at 50% 35%, transparent 0%, ${theme.bg} 78%), ${patternUrl(theme.pattern, theme.accent, theme.pattern === 'jharokha' ? 0.2 : 0.16)}`,
            backgroundSize: theme.pattern === 'jharokha' ? 'auto, 96px 120px' : 'auto, 80px 80px',
          }}
        />
      ))}
    </div>
  )
}
