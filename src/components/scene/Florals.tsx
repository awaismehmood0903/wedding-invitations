import type { SceneStyle } from '../../config/event'
import { shade } from '../CharacterRealistic'

// Flowers for the opening scene: roses, leaves, daisies and small blossoms, combined into
// a chintz border pattern, climbing sprays and rose bushes. Everything is static SVG.

export function Rose({ x, y, r, c, a = 0 }: { x: number; y: number; r: number; c: string; a?: number }) {
  const dark = shade(c, -0.22)
  const mid = shade(c, -0.08)
  return (
    <g transform={`translate(${x} ${y}) rotate(${a})`}>
      <circle r={r} fill={mid} />
      {[0, 72, 144, 216, 288].map((t) => {
        const px = Math.cos((t * Math.PI) / 180) * r * 0.42
        const py = Math.sin((t * Math.PI) / 180) * r * 0.42
        return <ellipse key={t} cx={px} cy={py} rx={r * 0.6} ry={r * 0.46} transform={`rotate(${t + 90} ${px} ${py})`} fill={c} stroke={dark} strokeWidth="0.4" strokeOpacity="0.6" />
      })}
      <circle r={r * 0.5} fill={c} stroke={dark} strokeWidth="0.5" strokeOpacity="0.7" />
      <path d={`M${-r * 0.3} 0 A${r * 0.3} ${r * 0.3} 0 1 1 0 ${r * 0.3} A${r * 0.18} ${r * 0.18} 0 1 1 ${r * 0.08} ${-r * 0.1}`} fill="none" stroke={dark} strokeWidth="0.6" strokeOpacity="0.8" />
      <circle cx={-r * 0.32} cy={-r * 0.34} r={r * 0.22} fill="#fff" opacity="0.3" />
    </g>
  )
}

export function Leaf({ x, y, a, l, c }: { x: number; y: number; a: number; l: number; c: string }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${a})`}>
      <path d={`M0 0 Q${l / 2} ${-l * 0.38} ${l} 0 Q${l / 2} ${l * 0.38} 0 0 Z`} fill={c} />
      <path d={`M0 0 L${l * 0.92} 0`} stroke={shade(c, -0.28)} strokeWidth="0.5" />
    </g>
  )
}

function Daisy({ x, y, r }: { x: number; y: number; r: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      {Array.from({ length: 8 }, (_, i) => (
        <ellipse key={i} cy={-r * 0.55} rx={r * 0.24} ry={r * 0.55} transform={`rotate(${i * 45})`} fill="#FBF6EC" stroke="#D9CDB8" strokeWidth="0.3" />
      ))}
      <circle r={r * 0.28} fill="#E8B84A" />
    </g>
  )
}

function Blossom({ x, y, r, c }: { x: number; y: number; r: number; c: string }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      {[0, 72, 144, 216, 288].map((t) => (
        <circle key={t} cx={Math.cos((t * Math.PI) / 180) * r * 0.55} cy={Math.sin((t * Math.PI) / 180) * r * 0.55} r={r * 0.45} fill={c} />
      ))}
      <circle r={r * 0.25} fill="#F3E2A8" />
    </g>
  )
}

/** Painted-chintz tile for the arch frame: trailing vines with blossoms, rosettes and buds. */
export function ChintzPattern({ id, c }: { id: string; c: SceneStyle }) {
  const vine = shade(c.leaf, -0.15)
  return (
    <pattern id={id} width="92" height="92" patternUnits="userSpaceOnUse">
      <rect width="92" height="92" fill={c.frame} />
      <path d="M-4 72 C14 52 34 82 54 58 S84 40 96 28 M10 0 C20 14 18 26 30 34 M60 92 C64 80 76 74 88 76" stroke={vine} strokeWidth="0.9" fill="none" opacity="0.8" />
      <Leaf x={8} y={64} a={-50} l={9} c={c.leaf} />
      <Leaf x={36} y={70} a={30} l={8} c={shade(c.leaf, -0.1)} />
      <Leaf x={70} y={46} a={-30} l={8} c={c.leaf} />
      <Leaf x={20} y={20} a={60} l={7} c={shade(c.leaf, -0.1)} />
      <Leaf x={74} y={80} a={-10} l={7} c={c.leaf} />
      <Blossom x={24} y={54} r={4.2} c={c.blossom} />
      <Blossom x={84} y={26} r={3.4} c={c.blossom} />
      <Rose x={56} y={56} r={5.5} c={c.flower2} a={20} />
      <Rose x={30} y={34} r={4} c={c.flower} />
      <Daisy x={62} y={84} r={4.4} />
      {[
        [46, 18],
        [12, 44],
        [80, 62],
        [42, 86],
      ].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="1.3" fill={c.frameTrim} opacity="0.8" />
      ))}
    </pattern>
  )
}

/** A climbing spray of roses for the arch shoulders (drawn hanging down from 0,0). */
export function Spray({ c, transform }: { c: SceneStyle; transform: string }) {
  return (
    <g transform={transform}>
      <path d="M0 0 C10 40 2 80 18 120 C26 140 22 160 30 180" stroke={shade(c.leaf, -0.25)} strokeWidth="1.4" fill="none" />
      {[
        [6, 22, 40, 14],
        [2, 50, 150, 13],
        [12, 78, 30, 14],
        [10, 104, 160, 12],
        [22, 132, 20, 13],
        [24, 160, 150, 11],
      ].map(([x, y, a, l], i) => (
        <Leaf key={i} x={x} y={y} a={a} l={l} c={i % 2 ? c.leaf : shade(c.leaf, -0.12)} />
      ))}
      <Rose x={12} y={40} r={9} c={c.flower} a={10} />
      <Rose x={20} y={96} r={10} c={c.flower2} a={-20} />
      <Rose x={28} y={150} r={8} c={c.flower} a={40} />
      <Blossom x={4} y={68} r={4} c={c.blossom} />
      <Blossom x={32} y={122} r={3.6} c={c.blossom} />
    </g>
  )
}

/** Lush rose bush for a bottom corner: drawn for the bottom-left, ground at y = 300. */
export function RoseBush({ c, transform }: { c: SceneStyle; transform: string }) {
  const leaves: [number, number, number, number][] = [
    [0, 150, -70, 26], [20, 120, -40, 24], [48, 100, -80, 22], [80, 120, -20, 24], [110, 140, -60, 22],
    [130, 190, -10, 24], [150, 230, 10, 22], [140, 270, -30, 24], [0, 200, -20, 26], [10, 250, 10, 24],
    [60, 160, 30, 22], [96, 180, -50, 20], [36, 220, 40, 22], [70, 250, -10, 24], [110, 230, 20, 22],
    [-6, 100, -60, 22], [30, 80, -100, 20], [160, 260, 30, 20], [120, 290, -20, 22], [50, 290, 10, 22],
  ]
  return (
    <g transform={transform}>
      {[
        'M20 300 C24 240 14 180 30 120',
        'M60 300 C64 250 80 200 76 140',
        'M100 300 C104 260 128 220 140 190',
        'M140 300 C146 280 160 260 168 240',
      ].map((d, i) => (
        <path key={i} d={d} stroke={shade(c.leaf, -0.35)} strokeWidth="1.6" fill="none" />
      ))}
      {leaves.map(([x, y, a, l], i) => (
        <Leaf key={i} x={x} y={y} a={a} l={l} c={i % 3 === 0 ? shade(c.leaf, -0.18) : i % 3 === 1 ? c.leaf : shade(c.leaf, 0.1)} />
      ))}
      <Rose x={44} y={176} r={26} c={c.flower} a={10} />
      <Rose x={98} y={214} r={22} c={c.flower2} a={-25} />
      <Rose x={28} y={240} r={20} c={c.flower2} a={30} />
      <Rose x={134} y={258} r={17} c={c.flower} a={60} />
      <Rose x={74} y={132} r={16} c={c.flower2} a={-10} />
      <Rose x={16} y={112} r={13} c={c.flower} a={20} />
      <Rose x={116} y={166} r={12} c={c.flower} a={-40} />
      <Rose x={78} y={274} r={14} c={c.flower} a={0} />
      <Daisy x={62} y={250} r={9} />
      <Daisy x={156} y={226} r={8} />
      <Daisy x={8} y={182} r={8} />
      <Daisy x={104} y={112} r={7} />
      <Blossom x={130} y={122} r={6} c={c.blossom} />
      <Blossom x={166} y={190} r={5.5} c={c.blossom} />
      <Blossom x={46} y={92} r={5.5} c={c.blossom} />
      <Blossom x={110} y={288} r={6} c={c.blossom} />
      <Blossom x={150} y={290} r={5} c={c.blossom} />
      {Array.from({ length: 16 }, (_, i) => (
        <circle key={i} cx={10 + ((i * 41) % 160)} cy={100 + ((i * 67) % 190)} r="1.4" fill={i % 2 ? '#FFFFFF' : c.blossom} opacity="0.85" />
      ))}
    </g>
  )
}
