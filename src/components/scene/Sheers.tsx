import type { SceneStyle } from '../../config/event'
import { shade } from '../CharacterRealistic'
import { H, W } from './Garden'

// Sheer, swagged curtains pinned at the top of the arch and caught halfway down by a
// tasselled cord, with a beaded fringe along the inner edge. The left drape is drawn
// in scene units (400 × 860) and mirrored for the right.

type Pt = [number, number]
const APEX: Pt = [200, 54]
const TIE: Pt = [50, 468]
// inner edge: apex → tie (swag), tie → floor (fall)
const SWAG: [Pt, Pt, Pt, Pt] = [APEX, [150, 150], [64, 318], TIE]
const FALL: [Pt, Pt, Pt, Pt] = [TIE, [58, 560], [120, 640], [112, 860]]

const bez = ([p0, p1, p2, p3]: [Pt, Pt, Pt, Pt], t: number): Pt =>
  [0, 1].map((i) => (1 - t) ** 3 * p0[i] + 3 * (1 - t) ** 2 * t * p1[i] + 3 * (1 - t) * t ** 2 * p2[i] + t ** 3 * p3[i]) as Pt
const c = ([, p1, p2, p3]: [Pt, Pt, Pt, Pt]) => `C${p1.join(' ')} ${p2.join(' ')} ${p3.join(' ')}`

/** Fabric colour: the event's curtain colour, lightened to a sheer voile. */
export const sheerColour = (s: SceneStyle) => shade(s.curtain, 0.8)

/** One swagged drape, drawn as a group inside the scene's frame SVG (static, no layer of its own). */
export function Drape({ s, id, mirror }: { s: SceneStyle; id: string; mirror: boolean }) {
  const fabric = sheerColour(s)
  const outline = `M${APEX.join(' ')} L${APEX[0]} 30 L-10 30 L-10 ${H} L${FALL[3].join(' ')} ` +
    `C${FALL[2].join(' ')} ${FALL[1].join(' ')} ${TIE.join(' ')} C${SWAG[2].join(' ')} ${SWAG[1].join(' ')} ${APEX.join(' ')} Z`
  const edge = `M${APEX.join(' ')} ${c(SWAG)} ${c(FALL)}`

  // fold lines gathered at the tie, fanning out above and below it
  const folds = [0.18, 0.34, 0.5, 0.66, 0.82].map((t) => {
    const sx = APEX[0] - t * 210
    const sy = 40 + t * t * 120
    const tx = TIE[0] - (1 - t) * 12
    const bx = -6 + t * 112
    return `M${sx} ${sy} Q${(sx + tx) / 2 - 18} ${(sy + TIE[1]) / 2} ${tx} ${TIE[1]} Q${tx - 6 + t * 30} 650 ${bx} ${H}`
  })

  const beads: Pt[] = []
  for (let t = 0.04; t <= 1; t += 0.035) beads.push(bez(SWAG, t))
  for (let t = 0.05; t <= 0.95; t += 0.05) beads.push(bez(FALL, t))

  return (
    <g>
      <defs>
        <pattern id={`${id}-sprig`} width="34" height="40" patternUnits="userSpaceOnUse">
          {[
            [9, 10],
            [26, 30],
          ].map(([x, y], i) => (
            <g key={i} transform={`translate(${x} ${y})`} fill={s.curtainTrim} opacity="0.75">
              {[0, 90, 180, 270].map((a) => (
                <ellipse key={a} cy="-2.2" rx="1" ry="2" transform={`rotate(${a})`} />
              ))}
              <circle r="0.9" fill={shade(s.curtainTrim, -0.25)} />
            </g>
          ))}
        </pattern>
        <linearGradient id={`${id}-depth`} x1="0" x2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0.35" />
          <stop offset="0.7" stopColor="#fff" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity="0.08" />
        </linearGradient>
      </defs>

      <g transform={mirror ? `translate(${W} 0) scale(-1 1)` : undefined}>
      <path d={outline} fill={fabric} opacity="0.82" />
      <path d={outline} fill={`url(#${id}-depth)`} />
      <path d={outline} fill={`url(#${id}-sprig)`} />
      {folds.map((d, i) => (
        <g key={i}>
          <path d={d} fill="none" stroke={shade(fabric, -0.35)} strokeOpacity="0.28" strokeWidth="2.4" />
          <path d={d} fill="none" stroke="#fff" strokeOpacity="0.5" strokeWidth="1.2" transform="translate(3 0)" />
        </g>
      ))}

      {/* gold edge with a beaded fringe */}
      <path d={edge} fill="none" stroke={s.curtainTrim} strokeWidth="1.6" />
      {beads.map(([x, y], i) => (
        <g key={i}>
          <line x1={x} y1={y} x2={x + 2} y2={y + 5} stroke={s.curtainTrim} strokeWidth="0.7" />
          <circle cx={x + 2.3} cy={y + 6.4} r="1.5" fill={s.curtainTrim} />
        </g>
      ))}

      {/* tasselled cord tying the drape back */}
      <g transform={`translate(${TIE[0]} ${TIE[1]})`}>
        <ellipse rx="20" ry="5" fill="none" stroke={s.curtainTrim} strokeWidth="2.6" />
        <ellipse rx="20" ry="5" fill="none" stroke={shade(s.curtainTrim, -0.3)} strokeWidth="0.6" strokeDasharray="2 2" />
        <path d="M-6 4 C-8 14 -4 22 -6 30" stroke={s.curtainTrim} strokeWidth="1.6" fill="none" />
        <g transform="translate(-6 30)">
          <circle r="4.2" fill={s.curtainTrim} stroke={shade(s.curtainTrim, -0.3)} strokeWidth="0.5" />
          <path d="M-4 3 H4 L5 10 H-5 Z" fill={s.blossom} />
          <path d="M-5 10 H5 L7.5 40 Q0 44 -7.5 40 Z" fill={s.blossom} />
          <path d="M-5 10 H5" stroke={s.curtainTrim} strokeWidth="1.6" />
          <path d="M-6 20 H6" stroke={s.curtainTrim} strokeWidth="1" />
          <path d="M-4.5 12 L-6 40 M-2 12 L-2.5 41 M0.5 12 L0.8 42 M3 12 L3.8 41 M5 12 L6 40" stroke={shade(s.blossom, -0.3)} strokeWidth="0.5" />
        </g>
      </g>
      </g>
    </g>
  )
}

/** Closed sheer panels covering the screen, which slide aside to reveal the scene. */
export function SheerPanels({ s }: { s: SceneStyle }) {
  const fabric = sheerColour(s)
  const folds = `repeating-linear-gradient(90deg, ${shade(fabric, -0.12)} 0%, ${fabric} 3%, ${shade(fabric, 0.4)} 5.5%, ${fabric} 8%, ${shade(fabric, -0.12)} 11%)`
  const sprig = `url("data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="34" height="40"><g fill="${s.curtainTrim}" opacity="0.7"><g transform="translate(9 10)">${[0, 90, 180, 270].map((a) => `<ellipse cy="-2.2" rx="1" ry="2" transform="rotate(${a})"/>`).join('')}</g><g transform="translate(26 30)">${[0, 90, 180, 270].map((a) => `<ellipse cy="-2.2" rx="1" ry="2" transform="rotate(${a})"/>`).join('')}</g></g></svg>`,
  )}")`
  return (
    <div className="pointer-events-none absolute inset-0 z-20" aria-hidden>
      {(['l', 'r'] as const).map((side) => (
        <div
          key={side}
          className={`curtain-closed absolute top-0 bottom-0 w-[50.5%] will-change-transform ${side === 'l' ? 'left-0 origin-left' : 'right-0 origin-right'}`}
          style={{ backgroundImage: `${sprig}, linear-gradient(180deg, rgba(0,0,0,0.08), transparent 20%, transparent 85%, rgba(0,0,0,0.12)), ${folds}`, backgroundSize: '34px 40px, auto, auto' }}
        >
          <div className={`absolute top-0 bottom-0 w-[3px] ${side === 'l' ? 'right-0' : 'left-0'}`} style={{ background: s.curtainTrim }} />
        </div>
      ))}
    </div>
  )
}
