import type { SceneStyle } from '../../config/event'
import { shade } from '../CharacterRealistic'

// The view through the arch, in the 400 × 860 scene box: sky, a distant palace,
// garden trees and cypresses, a domed pavilion, a lotus pond, a marble railing and
// a tiled terrace where the couple stands. Static SVG, drawn once.

export const W = 400
export const H = 860
const HORIZON = 626
const POND = [664, 700] as const
const RAIL = [700, 738] as const
const VANISH = { x: 200, y: 600 }

function BubbleTree({ x, y, r, c }: { x: number; y: number; r: number; c: SceneStyle }) {
  const base = shade(c.leaf, -0.12)
  const blobs: [number, number, number][] = [
    [0, 0, 1],
    [-0.62, 0.3, 0.75],
    [0.6, 0.26, 0.8],
    [0, -0.5, 0.72],
    [-0.3, 0.55, 0.6],
    [0.35, 0.6, 0.6],
  ]
  return (
    <g>
      <rect x={x - r * 0.08} y={y + r * 0.4} width={r * 0.16} height={r * 0.9} fill={shade(c.leaf, -0.45)} />
      {blobs.map(([dx, dy, s], i) => (
        <circle key={i} cx={x + dx * r} cy={y + dy * r} r={r * s} fill={i % 2 ? base : c.leaf} />
      ))}
      {blobs.slice(0, 4).map(([dx, dy, s], i) => (
        <circle key={i} cx={x + dx * r - r * 0.18 * s} cy={y + dy * r - r * 0.22 * s} r={r * s * 0.45} fill={shade(c.leaf, 0.22)} opacity="0.55" />
      ))}
    </g>
  )
}

function Cypress({ x, base, h, w, c }: { x: number; base: number; h: number; w: number; c: SceneStyle }) {
  const dark = shade(c.leaf, -0.42)
  return (
    <g>
      <path d={`M${x} ${base} Q${x - w} ${base - h * 0.45} ${x} ${base - h} Q${x + w} ${base - h * 0.45} ${x} ${base} Z`} fill={dark} />
      <path d={`M${x} ${base} Q${x + w} ${base - h * 0.45} ${x} ${base - h} Q${x + w * 0.35} ${base - h * 0.45} ${x} ${base} Z`} fill={shade(c.leaf, -0.2)} opacity="0.7" />
    </g>
  )
}

function Palace({ c }: { c: SceneStyle }) {
  const b = shade(c.building, -0.06)
  const d = shade(c.building, -0.18)
  const onion = (cx: number, base: number, r: number) =>
    `M${cx - r} ${base} C${cx - r * 1.15} ${base - r * 1.1} ${cx - r * 0.3} ${base - r * 1.4} ${cx} ${base - r * 2} C${cx + r * 0.3} ${base - r * 1.4} ${cx + r * 1.15} ${base - r * 1.1} ${cx + r} ${base} Z`
  return (
    <g opacity="0.8">
      {[238, 336].map((x) => (
        <g key={x}>
          <rect x={x - 2.5} y={HORIZON - 58} width="5" height="58" fill={b} />
          <path d={onion(x, HORIZON - 58, 4)} fill={b} />
        </g>
      ))}
      <rect x="250" y={HORIZON - 30} width="76" height="30" fill={b} />
      <rect x="276" y={HORIZON - 44} width="24" height="16" fill={b} />
      <path d={onion(288, HORIZON - 44, 17)} fill={b} />
      <path d={onion(260, HORIZON - 30, 8)} fill={b} />
      <path d={onion(316, HORIZON - 30, 8)} fill={b} />
      <path d={`M282 ${HORIZON} V${HORIZON - 16} Q288 ${HORIZON - 24} 294 ${HORIZON - 16} V${HORIZON} Z`} fill={d} opacity="0.6" />
      {[258, 270, 306, 318].map((x) => (
        <path key={x} d={`M${x - 3} ${HORIZON} V${HORIZON - 10} Q${x} ${HORIZON - 15} ${x + 3} ${HORIZON - 10} V${HORIZON} Z`} fill={d} opacity="0.45" />
      ))}
      <path d={`M288 ${HORIZON - 78} V${HORIZON - 88}`} stroke={d} strokeWidth="0.8" />
    </g>
  )
}

function Pavilion({ c }: { c: SceneStyle }) {
  const marble = shade(c.building, 0.32)
  const shadow = shade(c.building, -0.12)
  const trim = c.frameTrim
  const cols = [56, 86, 116]
  return (
    <g>
      {/* platform */}
      <rect x="38" y="700" width="104" height="10" fill={shadow} />
      <rect x="34" y="694" width="112" height="8" fill={marble} stroke={trim} strokeWidth="0.6" />
      {/* arches between the columns */}
      {[71, 101].map((x) => (
        <path key={x} d={`M${x - 12} 694 V640 Q${x} 622 ${x + 12} 640 V694 Z`} fill={shade(c.leaf, -0.3)} opacity="0.55" />
      ))}
      {cols.map((x) => (
        <g key={x}>
          <rect x={x - 3.5} y="612" width="7" height="82" fill={marble} />
          <rect x={x - 3.5} y="612" width="2.4" height="82" fill={shadow} opacity="0.5" />
          <rect x={x - 5.5} y="608" width="11" height="5" fill={marble} stroke={trim} strokeWidth="0.4" />
        </g>
      ))}
      {/* chhajja (eave) with a scalloped edge */}
      <path d="M30 600 H150 L144 610 H36 Z" fill={marble} stroke={trim} strokeWidth="0.6" />
      <path d={Array.from({ length: 12 }, (_, i) => `M${37 + i * 9.5} 610 q4.75 6 9.5 0`).join(' ')} stroke={trim} strokeWidth="0.6" fill="none" />
      {/* drum + dome + finial */}
      <rect x="52" y="580" width="76" height="20" fill={marble} />
      {Array.from({ length: 7 }, (_, i) => (
        <rect key={i} x={56 + i * 10.5} y="584" width="5" height="12" rx="2.5" fill={shadow} opacity="0.4" />
      ))}
      <path d="M50 582 C44 540 76 520 90 500 C104 520 136 540 130 582 Z" fill={marble} />
      <path d="M50 582 C44 540 76 520 90 500 C84 524 66 542 70 582 Z" fill={shadow} opacity="0.35" />
      <path d="M50 582 H130" stroke={trim} strokeWidth="1" />
      <path d="M90 500 V482" stroke={trim} strokeWidth="1.2" />
      <circle cx="90" cy="490" r="2.6" fill={trim} />
      <path d="M86 484 Q90 474 94 484 Z" fill={trim} />
    </g>
  )
}

export function Garden({ c }: { c: SceneStyle }) {
  const marble = shade(c.building, 0.3)
  const marbleShade = shade(c.building, -0.1)
  const floorRows = [738, 754, 773, 797, 826, 860]
  const xAt = (xb: number, y: number) => VANISH.x + ((xb - VANISH.x) * (y - VANISH.y)) / (H - VANISH.y)
  const tiles: string[] = []
  for (let r = 0; r < floorRows.length - 1; r++) {
    for (let k = -6; k < 16; k++) {
      if ((r + k) % 2 === 0) continue
      const xb0 = -140 + k * 48
      const xb1 = xb0 + 48
      const [y0, y1] = [floorRows[r], floorRows[r + 1]]
      tiles.push(`M${xAt(xb0, y0)} ${y0} L${xAt(xb1, y0)} ${y0} L${xAt(xb1, y1)} ${y1} L${xAt(xb0, y1)} ${y1} Z`)
    }
  }

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="absolute inset-0 h-full w-full" aria-hidden>
      <defs>
        <linearGradient id="garden-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={c.skyTop} />
          <stop offset={HORIZON / H} stopColor={c.skyBottom} />
        </linearGradient>
        <radialGradient id="garden-glow">
          <stop offset="0" stopColor={c.glow} stopOpacity="0.9" />
          <stop offset="1" stopColor={c.glow} stopOpacity="0" />
        </radialGradient>
        <linearGradient id="garden-water" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={shade(c.blossom, 0.45)} />
          <stop offset="1" stopColor={shade(c.blossom, 0.15)} />
        </linearGradient>
      </defs>

      {/* sky with soft light and painterly clouds */}
      <rect width={W} height={HORIZON + 4} fill="url(#garden-sky)" />
      <circle cx="290" cy={HORIZON - 40} r="170" fill="url(#garden-glow)" />
      {[
        [110, 300, 60],
        [300, 380, 50],
        [190, 220, 40],
        [80, 460, 44],
      ].map(([x, y, r], i) => (
        <g key={i} opacity="0.28">
          <ellipse cx={x} cy={y} rx={r} ry={r * 0.24} fill="#fff" />
          <ellipse cx={x + r * 0.4} cy={y - r * 0.12} rx={r * 0.5} ry={r * 0.2} fill="#fff" />
        </g>
      ))}

      {/* distant hills, palace and tree line */}
      <path d={`M0 ${HORIZON - 6} C60 ${HORIZON - 26} 120 ${HORIZON - 4} 180 ${HORIZON - 16} S300 ${HORIZON - 30} ${W} ${HORIZON - 10} V${HORIZON + 4} H0 Z`} fill={shade(c.leaf, 0.35)} opacity="0.55" />
      <Palace c={c} />
      <rect x="0" y={HORIZON} width={W} height={POND[0] - HORIZON} fill={shade(c.leaf, 0.12)} />
      {[
        [170, HORIZON + 4, 16],
        [212, HORIZON + 8, 13],
        [350, HORIZON + 2, 18],
        [250, HORIZON + 14, 12],
        [380, HORIZON + 16, 14],
        [150, HORIZON + 18, 12],
      ].map(([x, y, r], i) => (
        <BubbleTree key={i} x={x} y={y} r={r} c={c} />
      ))}
      <Cypress x={150} base={POND[0]} h={120} w={9} c={c} />
      <Cypress x={168} base={POND[0]} h={96} w={8} c={c} />
      <Cypress x={300} base={POND[0]} h={128} w={10} c={c} />
      <Cypress x={322} base={POND[0]} h={104} w={8} c={c} />

      {/* domed pavilion on the left */}
      <Pavilion c={c} />

      {/* lotus pond */}
      <rect x="0" y={POND[0]} width={W} height={POND[1] - POND[0]} fill="url(#garden-water)" />
      {[674, 684, 694].map((y, i) => (
        <path key={y} d={`M${20 + i * 30} ${y} H${380 - i * 24}`} stroke="#fff" strokeOpacity="0.35" strokeWidth="0.7" />
      ))}
      {[60, 128, 196, 262, 330].map((x, i) => (
        <g key={x} transform={`translate(${x} ${POND[0] + 18 + (i % 2) * 6})`}>
          <ellipse rx="12" ry="3.6" fill={shade(c.leaf, -0.08)} />
          <ellipse cx="14" cy="4" rx="8" ry="2.6" fill={c.leaf} />
          {[-40, 0, 40].map((a) => (
            <ellipse key={a} cy="-5" rx="2.6" ry="6" transform={`rotate(${a} 0 0)`} fill={shade(c.flower, 0.15)} stroke={shade(c.flower, -0.2)} strokeWidth="0.3" />
          ))}
        </g>
      ))}

      {/* marble railing */}
      <rect x="0" y={RAIL[0]} width={W} height="6" fill={marble} />
      <rect x="0" y={RAIL[0] + 6} width={W} height="1.5" fill={marbleShade} opacity="0.6" />
      <rect x="0" y={RAIL[1] - 6} width={W} height="6" fill={marble} />
      {Array.from({ length: 40 }, (_, i) => {
        const x = 5 + i * 10
        return (
          <path key={i} d={`M${x - 2} ${RAIL[0] + 7} Q${x - 4.5} ${RAIL[0] + 18} ${x - 2} ${RAIL[1] - 7} H${x + 2} Q${x + 4.5} ${RAIL[0] + 18} ${x + 2} ${RAIL[0] + 7} Z`} fill={marble} stroke={marbleShade} strokeWidth="0.4" />
        )
      })}
      {[0, 70, 140, 260, 330, 400].map((x) => (
        <g key={x}>
          <rect x={x - 6} y={RAIL[0] - 8} width="12" height={RAIL[1] - RAIL[0] + 8} fill={marble} stroke={marbleShade} strokeWidth="0.5" />
          <circle cx={x} cy={RAIL[0] - 12} r="4.5" fill={marble} stroke={marbleShade} strokeWidth="0.5" />
        </g>
      ))}

      {/* tiled terrace */}
      <rect x="0" y={RAIL[1]} width={W} height={H - RAIL[1]} fill={shade(c.building, 0.22)} />
      <path d={tiles.join(' ')} fill={shade(c.building, -0.08)} opacity="0.55" />
      <rect x="0" y={RAIL[1]} width={W} height="4" fill="#000" opacity="0.08" />
    </svg>
  )
}
