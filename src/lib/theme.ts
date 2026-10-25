import type { CSSProperties } from 'react'
import type { DayTheme } from '../config/event'

/** Inline CSS variables so Tailwind's bg-bg / text-ink / text-primary utilities pick up a section's theme. */
export const themeVars = (t: DayTheme): CSSProperties =>
  ({ '--bg': t.bg, '--primary': t.primary, '--accent': t.accent, '--ink': t.ink, '--card': t.card }) as CSSProperties
