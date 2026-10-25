import { wedding } from '../config/event'

type Props = { className?: string; draw?: boolean }

/** Couple's initials in an ornate ring. With `draw`, strokes animate in (see .monogram-draw in Loader). */
export function Monogram({ className = '', draw = false }: Props) {
  const [a, b] = wedding.couple.initials
  return (
    <svg viewBox="0 0 200 200" className={`${className} ${draw ? 'monogram-draw' : ''}`} role="img" aria-label={`${a} and ${b} monogram`}>
      <circle cx="100" cy="100" r="88" fill="none" stroke="currentColor" strokeWidth="1.2" pathLength={1} className="mg-stroke" />
      <circle cx="100" cy="100" r="80" fill="none" stroke="currentColor" strokeWidth="0.6" strokeDasharray="2 4" className="mg-fade" />
      {[0, 90, 180, 270].map((r) => (
        <path key={r} d="M100 6 l5 6 -5 6 -5 -6z" fill="currentColor" transform={`rotate(${r} 100 100)`} className="mg-fade" />
      ))}
      <text x="66" y="122" textAnchor="middle" fontFamily="Great Vibes, cursive" fontSize="72" fill="currentColor" stroke="currentColor" strokeWidth="0.8" className="mg-text">
        {a}
      </text>
      <text x="100" y="112" textAnchor="middle" fontFamily="Cormorant Garamond, serif" fontSize="26" fill="currentColor" className="mg-fade">
        &amp;
      </text>
      <text x="136" y="140" textAnchor="middle" fontFamily="Great Vibes, cursive" fontSize="72" fill="currentColor" stroke="currentColor" strokeWidth="0.8" className="mg-text">
        {b}
      </text>
    </svg>
  )
}
