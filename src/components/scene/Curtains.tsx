import type { SceneStyle } from '../../config/event'
import { shade } from '../CharacterRealistic'

// Curtain shapes in % of the screen (viewBox 0 0 100 100, stretched to fit).
// Each drape is defined by its width at the top, at the tie-back and at the floor.
type Widths = { top: number; mid: number; bottom: number }
const CLOSED: Widths = { top: 50.5, mid: 50.5, bottom: 50.5 }
const OPEN: Widths = { top: 17, mid: 6.5, bottom: 15 }
const TIE = 56 // height of the tie-back
const FOLDS = 7

const mirror = (side: 'l' | 'r', x: number) => (side === 'l' ? x : 100 - x).toFixed(2)

/** Outline of one drape: full at the top, pinched at the tie-back, flaring into a puddle at the floor. */
function drape(side: 'l' | 'r', w: Widths): string {
  const x = (v: number) => mirror(side, v)
  return `M${x(0)} 0 L${x(w.top)} 0 C${x(w.top)} 18 ${x(w.mid)} ${TIE - 18} ${x(w.mid)} ${TIE} C${x(w.mid)} ${TIE + 16} ${x(w.bottom)} 86 ${x(w.bottom + 1.5)} 100 L${x(0)} 100 Z`
}

/** A fold line at fraction f across the drape, following the same pinch. */
function fold(side: 'l' | 'r', f: number, w: Widths): string {
  const x = (v: number) => mirror(side, v * f)
  return `M${x(w.top)} 0 C${x(w.top)} 18 ${x(w.mid)} ${TIE - 18} ${x(w.mid)} ${TIE} C${x(w.mid)} ${TIE + 16} ${x(w.bottom)} 86 ${x(w.bottom + 1.5)} 100`
}

/**
 * Velvet curtains that start closed and draw back into tied drapes, held to the wall
 * at mid-height by a rope tie-back. Each path carries its open shape in `data-open`
 * so the scene's timeline can tween the outline (`attr: { d }`) from closed to open.
 */
export function Curtains({ c, open }: { c: SceneStyle; open: boolean }) {
  const w = open ? OPEN : CLOSED
  const sides = ['l', 'r'] as const

  return (
    <div className="pointer-events-none absolute inset-0 z-20" aria-hidden>
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full">
        <defs>
          {sides.map((s) => (
            <linearGradient key={s} id={`curtain-velvet-${s}`} x1={s === 'l' ? 0 : 1} x2={s === 'l' ? 1 : 0}>
              <stop offset="0" stopColor={shade(c.curtain, -0.45)} />
              <stop offset="0.25" stopColor={shade(c.curtain, -0.1)} />
              <stop offset="0.55" stopColor={shade(c.curtain, 0.12)} />
              <stop offset="0.85" stopColor={shade(c.curtain, -0.05)} />
              <stop offset="1" stopColor={shade(c.curtain, -0.35)} />
            </linearGradient>
          ))}
          <linearGradient id="curtain-depth" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#000" stopOpacity="0.35" />
            <stop offset="0.15" stopColor="#000" stopOpacity="0" />
            <stop offset="0.85" stopColor="#000" stopOpacity="0" />
            <stop offset="1" stopColor="#000" stopOpacity="0.4" />
          </linearGradient>
        </defs>

        {sides.map((s) => (
          <g key={s}>
            <path className="curtain-shape" d={drape(s, w)} data-open={drape(s, OPEN)} fill={`url(#curtain-velvet-${s})`} />
            {/* fold shadows and sheen; they bunch together at the tie-back */}
            {Array.from({ length: FOLDS }, (_, i) => {
              const f = (i + 1) / (FOLDS + 1)
              return (
                <g key={i}>
                  <path className="curtain-shape" d={fold(s, f, w)} data-open={fold(s, f, OPEN)} fill="none" stroke="#000" strokeOpacity="0.22" strokeWidth="7" vectorEffect="non-scaling-stroke" strokeLinecap="round" />
                  <path className="curtain-shape" d={fold(s, f + 0.035, w)} data-open={fold(s, f + 0.035, OPEN)} fill="none" stroke="#fff" strokeOpacity="0.12" strokeWidth="3" vectorEffect="non-scaling-stroke" strokeLinecap="round" />
                </g>
              )
            })}
            <path className="curtain-shape" d={drape(s, w)} data-open={drape(s, OPEN)} fill="url(#curtain-depth)" />
            {/* trimmed leading edge */}
            <path className="curtain-shape" d={fold(s, 1, w)} data-open={fold(s, 1, OPEN)} fill="none" stroke={c.curtainTrim} strokeWidth="3" vectorEffect="non-scaling-stroke" />
          </g>
        ))}
      </svg>

      {/* rope tie-backs fixed to the wall, with tassels */}
      {sides.map((s) => (
        <div
          key={s}
          className="curtain-tie absolute"
          style={{ top: `${TIE}%`, [s === 'l' ? 'left' : 'right']: 0, width: `${OPEN.mid + 1.2}%`, opacity: open ? 1 : 0 }}
        >
          <div className={`absolute top-1/2 -translate-y-1/2 ${s === 'l' ? '-left-1' : '-right-1'} h-4 w-4 rounded-full`} style={{ background: `radial-gradient(circle at 35% 35%, ${shade(c.curtainTrim, 0.35)}, ${shade(c.curtainTrim, -0.35)})`, boxShadow: '0 2px 3px rgba(0,0,0,0.4)' }} />
          <div
            className="h-2.5 w-full -translate-y-1/2 rounded-full"
            style={{ background: `repeating-linear-gradient(115deg, ${shade(c.curtainTrim, 0.25)} 0 3px, ${shade(c.curtainTrim, -0.3)} 3px 6px)`, boxShadow: '0 3px 4px rgba(0,0,0,0.35)' }}
          />
          <svg viewBox="0 0 16 36" className={`absolute top-0 h-9 w-4 ${s === 'l' ? '-right-2' : '-left-2'}`}>
            <circle cx="8" cy="4" r="3.6" fill={c.curtainTrim} stroke={shade(c.curtainTrim, -0.35)} strokeWidth="0.6" />
            <path d="M4 7 Q8 6 12 7 L13 12 H3 Z" fill={shade(c.curtainTrim, -0.1)} />
            <path d="M3 12 H13 L14.5 33 Q8 36 1.5 33 Z" fill={c.curtainTrim} />
            <path d="M4 13 V32 M6.5 13 V33 M9 13 V33 M11.5 13 V32" stroke={shade(c.curtainTrim, -0.35)} strokeWidth="0.6" />
          </svg>
        </div>
      ))}
    </div>
  )
}
