import { useId } from 'react'
import { wedding } from '../config/event'
import { shade } from './CharacterRealistic'

// Irregular, slightly lumpy outline like poured wax.
const BLOB = (() => {
  const n = 48
  const pts = Array.from({ length: n }, (_, i) => {
    const a = (i / n) * Math.PI * 2
    const r = 52 + 2.6 * Math.sin(5 * a) + 1.8 * Math.sin(11 * a + 1) + 1.2 * Math.sin(17 * a + 2)
    return [60 + r * Math.cos(a), 60 + r * Math.sin(a)]
  })
  const mid = (p: number[], q: number[]) => [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2]
  let d = `M${mid(pts[n - 1], pts[0]).join(' ')}`
  pts.forEach((p, i) => {
    const m = mid(p, pts[(i + 1) % n])
    d += ` Q${p[0].toFixed(2)} ${p[1].toFixed(2)} ${m[0].toFixed(2)} ${m[1].toFixed(2)}`
  })
  return `${d} Z`
})()

/** H & S wax seal with an embossed monogram and a glossy, uneven rim. */
export function WaxSeal({ color, ink, className = '' }: { color: string; ink: string; className?: string }) {
  const id = useId().replace(/[^a-zA-Z0-9]/g, '')
  const [a, b] = wedding.couple.initials
  const deep = shade(color, -0.38)
  const lift = shade(color, 0.28)

  const monogram = (fill: string, dx: number, dy: number, opacity = 1) => (
    <g transform={`translate(${dx} ${dy})`} fill={fill} opacity={opacity}>
      <text x="45" y="72" textAnchor="middle" fontFamily="Great Vibes, cursive" fontSize="40">
        {a}
      </text>
      <text x="60" y="66" textAnchor="middle" fontFamily="Cormorant Garamond, serif" fontSize="14">
        &amp;
      </text>
      <text x="76" y="80" textAnchor="middle" fontFamily="Great Vibes, cursive" fontSize="40">
        {b}
      </text>
    </g>
  )

  return (
    <svg viewBox="0 0 120 120" className={className} role="img" aria-label={`${a} and ${b} wax seal`} overflow="visible">
      <defs>
        <radialGradient id={`${id}-wax`} cx="38%" cy="32%" r="75%">
          <stop offset="0" stopColor={lift} />
          <stop offset="0.55" stopColor={color} />
          <stop offset="1" stopColor={deep} />
        </radialGradient>
        <radialGradient id={`${id}-well`} cx="55%" cy="60%" r="60%">
          <stop offset="0" stopColor={shade(color, 0.08)} />
          <stop offset="1" stopColor={shade(color, -0.18)} />
        </radialGradient>
        <filter id={`${id}-drop`} x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="3" stdDeviation="3" floodColor="#000" floodOpacity="0.35" />
        </filter>
      </defs>

      <path d={BLOB} fill={`url(#${id}-wax)`} filter={`url(#${id}-drop)`} />
      {/* pressed well */}
      <circle cx="60" cy="60" r="38" fill={`url(#${id}-well)`} />
      <circle cx="60" cy="60" r="38" fill="none" stroke={deep} strokeWidth="2.5" opacity="0.55" />
      <circle cx="60.8" cy="60.8" r="39.5" fill="none" stroke={lift} strokeWidth="1" opacity="0.5" />
      <circle cx="60" cy="60" r="33" fill="none" stroke={ink} strokeWidth="0.6" strokeDasharray="1.2 2.4" opacity="0.7" />
      {/* embossed monogram: shadow, highlight, face */}
      {monogram(deep, 0.9, 1.1, 0.8)}
      {monogram(lift, -0.6, -0.7, 0.55)}
      {monogram(ink, 0, 0)}
      {/* glossy highlight */}
      <path d="M30 36 Q40 22 58 18" stroke="#fff" strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.28" />
    </svg>
  )
}
