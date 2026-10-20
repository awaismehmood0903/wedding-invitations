import type { BrideOutfit, GroomOutfit } from '../config/event'

// Semi-realistic bride & groom: natural proportions (~7 heads tall), gradient shading
// on skin and fabric, detailed faces, embroidery and jewellery. Same moving parts as
// the flat characters so Character.tsx can animate either style.

type R = React.RefObject<SVGGElement | null>

export const REAL_VIEWBOX = '0 -30 200 560'
export const REAL_GROUND = 512

const SKIN = { light: '#F3CDAA', base: '#E4B08B', shade: '#C98F6A', line: '#B07656' }
const HAIR = { base: '#1C130E', shine: '#3D2C22' }
const LIP = { groom: '#9E5546', bride: '#B32A43' }
const MEHNDI = '#8A3B17'

/** Mix a hex colour toward black (amt < 0) or white (amt > 0). */
export function shade(hex: string, amt: number): string {
  const n = parseInt(hex.slice(1), 16)
  const t = amt < 0 ? 0 : 255
  const p = Math.abs(amt)
  const ch = (s: number) => Math.round((((n >> s) & 255) * (1 - p) + t * p)).toString(16).padStart(2, '0')
  return `#${ch(16)}${ch(8)}${ch(0)}`
}

/** Pivot points for each moving part (depends on outfit for the groom's legs). */
export function realOrigins(who: 'groom' | 'bride', suit: boolean) {
  return who === 'groom'
    ? { armL: '64 138', armR: '136 138', legL: suit ? '89 298' : '88 396', legR: suit ? '111 298' : '112 396', skirt: '100 210', drape: '100 40' }
    : { armL: '72 136', armR: '128 136', legL: '90 400', legR: '110 400', skirt: '100 210', drape: '100 40' }
}

/** Shared gradient defs, namespaced per instance. */
function Defs({ id, fabric, fabric2 }: { id: string; fabric: string; fabric2?: string }) {
  const f2 = fabric2 ?? fabric
  return (
    <defs>
      <radialGradient id={`${id}-skin`} cx="45%" cy="38%" r="70%">
        <stop offset="0" stopColor={SKIN.light} />
        <stop offset="0.65" stopColor={SKIN.base} />
        <stop offset="1" stopColor={SKIN.shade} />
      </radialGradient>
      <linearGradient id={`${id}-limb`} x1="0" x2="1">
        <stop offset="0" stopColor={SKIN.shade} />
        <stop offset="0.45" stopColor={SKIN.light} />
        <stop offset="1" stopColor={SKIN.base} />
      </linearGradient>
      <linearGradient id={`${id}-fab`} x1="0" x2="1">
        <stop offset="0" stopColor={shade(fabric, -0.22)} />
        <stop offset="0.28" stopColor={fabric} />
        <stop offset="0.5" stopColor={shade(fabric, 0.1)} />
        <stop offset="0.72" stopColor={fabric} />
        <stop offset="1" stopColor={shade(fabric, -0.25)} />
      </linearGradient>
      <linearGradient id={`${id}-fab2`} x1="0" x2="1">
        <stop offset="0" stopColor={shade(f2, -0.25)} />
        <stop offset="0.3" stopColor={f2} />
        <stop offset="0.55" stopColor={shade(f2, 0.12)} />
        <stop offset="1" stopColor={shade(f2, -0.28)} />
      </linearGradient>
      <linearGradient id={`${id}-sleeve`} x1="0" x2="1">
        <stop offset="0" stopColor={shade(fabric, -0.25)} />
        <stop offset="0.5" stopColor={shade(fabric, 0.06)} />
        <stop offset="1" stopColor={shade(fabric, -0.15)} />
      </linearGradient>
      <linearGradient id={`${id}-hair`} x1="0" y1="0" x2="0.4" y2="1">
        <stop offset="0" stopColor={HAIR.shine} />
        <stop offset="0.5" stopColor={HAIR.base} />
        <stop offset="1" stopColor={HAIR.base} />
      </linearGradient>
    </defs>
  )
}

function Eye({ cx, cy, bride }: { cx: number; cy: number; bride?: boolean }) {
  const w = bride ? 6.5 : 6
  return (
    <g>
      {bride && <ellipse cx={cx} cy={cy - 3} rx={w + 1} ry="3.4" fill="#9A5B6E" opacity="0.28" />}
      <path d={`M${cx - w} ${cy} Q${cx} ${cy - 5.5} ${cx + w} ${cy} Q${cx} ${cy + 3.6} ${cx - w} ${cy} Z`} fill="#FBF7F2" />
      <circle cx={cx} cy={cy - 0.3} r={bride ? 2.9 : 2.6} fill="#4A2C19" />
      <circle cx={cx} cy={cy - 0.3} r="1.3" fill="#120B07" />
      <circle cx={cx + 0.9} cy={cy - 1.3} r="0.75" fill="#fff" />
      <path d={`M${cx - w - 0.5} ${cy} Q${cx} ${cy - 6} ${cx + w + 0.5} ${cy}`} stroke="#22140D" strokeWidth={bride ? 1.9 : 1.4} fill="none" strokeLinecap="round" />
      {bride && (
        <path
          d={cx < 100 ? `M${cx - w - 0.5} ${cy} l-2.6 -1.8 M${cx - 3} ${cy - 4.6} l-0.8 -2 M${cx} ${cy - 5.2} l0 -2.1 M${cx + 3} ${cy - 4.6} l0.8 -2` : `M${cx + w + 0.5} ${cy} l2.6 -1.8 M${cx - 3} ${cy - 4.6} l-0.8 -2 M${cx} ${cy - 5.2} l0 -2.1 M${cx + 3} ${cy - 4.6} l0.8 -2`}
          stroke="#22140D"
          strokeWidth="0.9"
          strokeLinecap="round"
        />
      )}
      <path d={`M${cx - w + 1} ${cy + 1.6} Q${cx} ${cy + 3.6} ${cx + w - 1} ${cy + 1.6}`} stroke={SKIN.line} strokeWidth="0.6" fill="none" opacity="0.6" />
    </g>
  )
}

function Hand({ cx, cy, id, flip, mehndi }: { cx: number; cy: number; id: string; flip?: boolean; mehndi?: boolean }) {
  const s = flip ? -1 : 1
  return (
    <g>
      <path d={`M${cx - 6 * s} ${cy - 9} C${cx - 10 * s} ${cy} ${cx - 8 * s} ${cy + 11} ${cx} ${cy + 12} C${cx + 8 * s} ${cy + 12} ${cx + 9 * s} ${cy + 2} ${cx + 7 * s} ${cy - 9} Z`} fill={`url(#${id}-limb)`} />
      <path d={`M${cx + 6 * s} ${cy - 6} Q${cx + 12 * s} ${cy - 1} ${cx + 9 * s} ${cy + 5}`} stroke={SKIN.base} strokeWidth="3.4" strokeLinecap="round" fill="none" />
      <path d={`M${cx - 3 * s} ${cy + 6} v4 M${cx} ${cy + 7} v4 M${cx + 3 * s} ${cy + 6} v4`} stroke={SKIN.line} strokeWidth="0.6" opacity="0.6" />
      {mehndi && (
        <g stroke={MEHNDI} strokeWidth="0.7" fill="none" opacity="0.75">
          <circle cx={cx} cy={cy + 1} r="3" />
          <circle cx={cx} cy={cy + 1} r="1" fill={MEHNDI} />
          <path d={`M${cx - 5} ${cy - 6} q5 3 10 0 M${cx - 5} ${cy - 3} q5 3 10 0`} />
          <path d={`M${cx - 3 * s} ${cy + 7} v3 M${cx} ${cy + 8} v3 M${cx + 3 * s} ${cy + 7} v3`} strokeDasharray="1 1" />
        </g>
      )}
    </g>
  )
}

// ─────────────────────────────── GROOM ───────────────────────────────

export function RealGroom({ o, id, refs }: { o: GroomOutfit; id: string; refs: Record<'upper' | 'eyes' | 'armL' | 'armR' | 'legL' | 'legR', R> }) {
  const suit = o.style === 'suit'
  const t = o.trim
  return (
    <>
      <Defs id={id} fabric={o.coat} fabric2={o.pants} />
      {suit ? <SuitLegs o={o} id={id} refs={refs} /> : <ChuridarLegs o={o} id={id} refs={refs} />}

      <g ref={refs.upper}>
        {suit ? <SuitJacket o={o} id={id} /> : <Sherwani o={o} id={id} />}

        {/* arms */}
        {(['L', 'R'] as const).map((side) => {
          const m = (x: number) => (side === 'L' ? x : 200 - x)
          const d = `M${m(62)} 132 C${m(50)} 136 ${m(45)} 150 ${m(45)} 172 L${m(42)} 290 Q${m(49)} 298 ${m(59)} 295 L${m(66)} 178 C${m(69)} 160 ${m(69)} 146 ${m(62)} 132 Z`
          return (
            <g key={side} ref={side === 'L' ? refs.armL : refs.armR}>
              <path d={d} fill={`url(#${id}-sleeve)`} />
              <path d={`M${m(48)} 230 Q${m(52)} 240 ${m(50)} 255`} stroke={shade(o.coat, -0.3)} strokeWidth="0.8" fill="none" opacity="0.5" />
              <path d={`M${m(42)} 280 L${m(59)} 284 L${m(59)} 293 Q${m(49)} 297 ${m(42)} 290 Z`} fill={suit ? '#F5F3EE' : t} opacity={suit ? 1 : 0.9} />
              <Hand cx={m(51)} cy={306} id={id} flip={side === 'R'} />
            </g>
          )
        })}

        {/* neck */}
        <path d="M89 92 L89 120 Q100 127 111 120 L111 92 Z" fill={SKIN.shade} />
        <path d="M89 104 Q100 112 111 104" stroke={SKIN.line} strokeWidth="0.8" fill="none" opacity="0.5" />
        {suit ? (
          <path d="M86 112 L97 128 L100 120 L103 128 L114 112 L111 106 L100 116 L89 106 Z" fill="#FBFAF6" stroke="#D9D5CC" strokeWidth="0.6" />
        ) : (
          <path d="M86 108 L114 108 L116 126 Q100 132 84 126 Z" fill={o.coat} stroke={t} strokeWidth="1.6" />
        )}

        {/* head */}
        <ellipse cx="75" cy="68" rx="5" ry="9" fill={SKIN.base} />
        <ellipse cx="125" cy="68" rx="5" ry="9" fill={SKIN.base} />
        <path d="M74 66 q2 -4 3 2 M126 66 q-2 -4 -3 2" stroke={SKIN.line} strokeWidth="0.8" fill="none" />
        <path d="M76 62 C76 36 88 26 100 26 C112 26 124 36 124 62 C124 84 114 100 100 102 C86 100 76 84 76 62 Z" fill={`url(#${id}-skin)`} />
        {/* trimmed beard + moustache */}
        <path d="M76.5 68 C78 90 88 104 100 106 C112 104 122 90 123.5 68 C121 82 116 92 108 96 C104 94 96 94 92 96 C84 92 79 82 76.5 68 Z" fill={HAIR.base} opacity="0.88" />
        <path d="M89 85 C93 82 97 82.5 100 84 C103 82.5 107 82 111 85 C107 87.5 103 87 100 86 C97 87 93 87.5 89 85 Z" fill={HAIR.base} />
        <path d="M93 90 Q100 88 107 90 Q104 95 100 95 Q96 95 93 90 Z" fill={LIP.groom} />
        <path d="M93 90 Q100 92.5 107 90" stroke="#5E2A22" strokeWidth="0.8" fill="none" />
        {/* features */}
        <g ref={refs.eyes}>
          <Eye cx={90} cy={64} />
          <Eye cx={110} cy={64} />
        </g>
        <path d="M82 56 Q89 51.5 96.5 55 M103.5 55 Q111 51.5 118 56" stroke={HAIR.base} strokeWidth="2.6" fill="none" strokeLinecap="round" />
        <path d="M100.5 66 Q98.5 74 96 78.5 Q99 81 102.5 79.5" stroke={SKIN.line} strokeWidth="1.1" fill="none" strokeLinecap="round" />
        <ellipse cx="85" cy="76" rx="5" ry="3" fill="#E07C6E" opacity="0.14" />
        <ellipse cx="115" cy="76" rx="5" ry="3" fill="#E07C6E" opacity="0.14" />

        {o.turban ? <Turban o={o} id={id} /> : <GroomHair id={id} />}
      </g>
    </>
  )
}

function GroomHair({ id }: { id: string }) {
  return (
    <>
      <path d="M74 62 C70 30 86 16 104 17 C121 18 131 32 126.5 60 C124 47 119 41 111 38 C101 44 87 43 81 40 C77.5 46 76 53 74 62 Z" fill={`url(#${id}-hair)`} />
      <path d="M83 31 C91 14 116 11 125 28 C114 22 98 21 83 31 Z" fill={HAIR.shine} />
      <path d="M90 26 Q104 20 118 25" stroke="#5A4535" strokeWidth="0.8" fill="none" opacity="0.6" />
      <path d="M75 60 L77 72 M125 60 L123 72" stroke={HAIR.base} strokeWidth="3" strokeLinecap="round" />
    </>
  )
}

function Turban({ o, id }: { o: GroomOutfit; id: string }) {
  const c = o.turban ?? o.coat
  const t = o.trim
  return (
    <>
      <path d="M126 50 C140 72 138 104 128 128" stroke={shade(t, -0.1)} strokeWidth="9" fill="none" strokeLinecap="round" />
      <path d="M126 50 C140 72 138 104 128 128" stroke={c} strokeWidth="6.5" fill="none" strokeLinecap="round" />
      <path d="M71 60 C66 26 83 8 100 8 C117 8 134 26 129 60 C117 50 83 50 71 60 Z" fill={`url(#${id}-fab)`} stroke={shade(c, -0.25)} strokeWidth="0.8" />
      <path d="M73 52 Q100 38 127 52 M75 42 Q100 27 125 42 M80 31 Q100 17 120 31" stroke={t} strokeWidth="1.8" fill="none" />
      <path d="M73 52 Q100 38 127 52" stroke={shade(c, -0.3)} strokeWidth="0.6" fill="none" transform="translate(0 3)" opacity="0.6" />
      {/* kalgi: brooch + feather */}
      <path d="M100 32 C93 12 95 -8 104 -24 C107 -6 109 12 100 32 Z" fill={t} />
      <path d="M100 30 C99 12 101 -6 104 -22" stroke={shade(t, -0.3)} strokeWidth="0.8" fill="none" />
      {[-14, -6, 2, 10].map((y) => (
        <path key={y} d={`M${101 + y * 0.05} ${y + 12} l-4 -3 M${101.5 + y * 0.05} ${y + 12} l4 -3`} stroke={shade(t, -0.25)} strokeWidth="0.6" />
      ))}
      <circle cx="100" cy="35" r="6" fill={t} stroke={shade(t, -0.3)} strokeWidth="0.8" />
      <circle cx="100" cy="35" r="2.8" fill="#B5122B" />
      <circle cx="99" cy="34" r="0.9" fill="#fff" opacity="0.8" />
      {[-8, 8].map((dx) => (
        <circle key={dx} cx={100 + dx} cy="38" r="1.4" fill="#F7F1E4" />
      ))}
    </>
  )
}

function Sherwani({ o, id }: { o: GroomOutfit; id: string }) {
  const t = o.trim
  return (
    <>
      <path d="M66 128 Q100 116 134 128 L141 142 L147 402 Q100 416 53 402 L59 142 Z" fill={`url(#${id}-fab)`} stroke={shade(t, -0.05)} strokeOpacity="0.6" strokeWidth="1" />
      <path d="M66 132 Q100 152 134 132" stroke={t} strokeWidth="1.4" fill="none" opacity="0.7" />
      {/* chest embroidery vines */}
      <g stroke={t} strokeWidth="1.3" fill="none" opacity="0.85">
        <path d="M100 136 C88 146 80 162 84 184 M100 136 C112 146 120 162 116 184" />
        <path d="M86 156 q-6 -2 -8 4 M114 156 q6 -2 8 4 M84 172 q-6 0 -6 6 M116 172 q6 0 6 6" />
      </g>
      {[150, 170, 190].map((y) => (
        <g key={y} fill={t} opacity="0.9">
          <circle cx={y === 170 ? 80 : 84} cy={y} r="1.6" />
          <circle cx={y === 170 ? 120 : 116} cy={y} r="1.6" />
        </g>
      ))}
      <path d="M100 126 V406" stroke={t} strokeWidth="2.2" />
      {[146, 168, 190, 212, 234, 256, 278].map((y) => (
        <g key={y}>
          <circle cx="100" cy={y} r="2.8" fill={t} />
          <circle cx="99.2" cy={y - 0.8} r="0.9" fill="#fff" opacity="0.6" />
        </g>
      ))}
      {/* folds */}
      <path d="M78 210 Q73 300 69 396 M122 210 Q127 300 131 396 M90 300 Q88 350 86 404" stroke={shade(o.coat, -0.35)} strokeWidth="1" fill="none" opacity="0.28" />
      {/* hem border */}
      <path d="M54 384 Q100 398 146 384 L147 402 Q100 416 53 402 Z" fill={t} opacity="0.9" />
      <path d="M55 392 Q100 406 146 392" stroke={shade(t, -0.3)} strokeWidth="0.8" strokeDasharray="2 3" fill="none" />
    </>
  )
}

function SuitJacket({ o, id }: { o: GroomOutfit; id: string }) {
  const dark = shade(o.coat, -0.3)
  return (
    <>
      <path d="M66 128 Q100 116 134 128 L141 142 L145 302 Q100 312 55 302 L59 142 Z" fill={`url(#${id}-fab)`} stroke={dark} strokeWidth="0.8" />
      <path d="M86 116 L100 182 L114 116 Z" fill="#F7F5F0" />
      <path d="M96 121 L104 121 L103 128 L97 128 Z" fill={o.tie ?? '#7A1F2B'} />
      <path d="M97 128 L103 128 L105.5 136 L102 174 L100 179 L98 174 L94.5 136 Z" fill={o.tie ?? '#7A1F2B'} />
      <path d="M98 140 L102 138 M97.5 150 L102.5 148 M97 160 L103 158" stroke={shade(o.tie ?? '#7A1F2B', -0.25)} strokeWidth="0.8" />
      {/* lapels */}
      <path d="M86 114 L75 152 L87 154 L100 184 Z" fill={shade(o.coat, -0.12)} stroke={dark} strokeWidth="0.8" />
      <path d="M114 114 L125 152 L113 154 L100 184 Z" fill={shade(o.coat, -0.12)} stroke={dark} strokeWidth="0.8" />
      <path d="M100 184 V306" stroke={dark} strokeWidth="1" />
      <circle cx="102.5" cy="206" r="2.6" fill={dark} />
      <circle cx="102.5" cy="234" r="2.6" fill={dark} />
      {/* pockets */}
      <path d="M112 166 L128 165" stroke={dark} strokeWidth="1.4" />
      <path d="M114 166 L117 158 L120 163 L123 157 L126 165 Z" fill={o.tie ?? '#F7F5F0'} />
      <path d="M66 256 L88 257 M112 257 L134 256" stroke={dark} strokeWidth="1.4" />
      <path d="M76 200 Q72 250 70 298 M124 200 Q128 250 130 298" stroke={dark} strokeWidth="0.8" fill="none" opacity="0.35" />
    </>
  )
}

function ChuridarLegs({ o, id, refs }: { o: GroomOutfit; id: string; refs: Record<'legL' | 'legR', R> }) {
  const shoe = shade(o.trim, -0.35)
  return (
    <>
      {(['L', 'R'] as const).map((side) => {
        const m = (x: number) => (side === 'L' ? x : 200 - x)
        return (
          <g key={side} ref={side === 'L' ? refs.legL : refs.legR}>
            <path d={`M${m(80)} 392 L${m(80)} 494 Q${m(87)} 499 ${m(95)} 495 L${m(97)} 392 Z`} fill={`url(#${id}-fab2)`} />
            <path d={[462, 472, 482].map((y) => `M${Math.min(m(80), m(96))} ${y} q8 3 16 0`).join(' ')} stroke={shade(o.pants, -0.3)} strokeWidth="0.8" fill="none" opacity="0.6" />
            <path d={`M${m(74)} 500 Q${m(86)} 486 ${m(101)} 498 Q${m(104)} 507 ${m(96)} 509 L${m(78)} 509 Q${m(70)} 506 ${m(74)} 500 Z`} fill={shoe} />
            <path d={`M${m(74)} 500 Q${m(65)} 498 ${m(67)} 491`} stroke={shoe} strokeWidth="2.4" fill="none" strokeLinecap="round" />
            <path d={`M${m(80)} 499 Q${m(88)} 494 ${m(97)} 500`} stroke={o.trim} strokeWidth="1.2" strokeDasharray="1.5 1.5" fill="none" />
          </g>
        )
      })}
    </>
  )
}

function SuitLegs({ o, id, refs }: { o: GroomOutfit; id: string; refs: Record<'legL' | 'legR', R> }) {
  return (
    <>
      {(['L', 'R'] as const).map((side) => {
        const m = (x: number) => (side === 'L' ? x : 200 - x)
        return (
          <g key={side} ref={side === 'L' ? refs.legL : refs.legR}>
            <path d={`M${m(78)} 294 L${m(77)} 498 L${m(99)} 498 L${m(101)} 294 Z`} fill={`url(#${id}-fab2)`} />
            <path d={`M${m(89)} 300 L${m(88)} 496`} stroke={shade(o.pants, -0.35)} strokeWidth="0.8" opacity="0.6" />
            <path d={`M${m(73)} 502 Q${m(74)} 494 ${m(84)} 494 L${m(100)} 495 Q${m(104)} 502 ${m(100)} 508 L${m(76)} 508 Q${m(71)} 507 ${m(73)} 502 Z`} fill="#141416" />
            <path d={`M${m(78)} 498 Q${m(84)} 496 ${m(90)} 497`} stroke="#5D5F66" strokeWidth="1.2" fill="none" strokeLinecap="round" />
          </g>
        )
      })}
    </>
  )
}

// ─────────────────────────────── BRIDE ───────────────────────────────

export function RealBride({ o, id, refs }: { o: BrideOutfit; id: string; refs: Record<'upper' | 'eyes' | 'armL' | 'armR' | 'skirt' | 'drape', R> }) {
  const t = o.trim
  const dup = o.dupatta
  return (
    <>
      <Defs id={id} fabric={o.dress} fabric2={o.top} />
      <defs>
        <pattern id={`${id}-buti`} width="14" height="14" patternUnits="userSpaceOnUse">
          <circle cx="7" cy="7" r="1.1" fill={t} opacity="0.8" />
        </pattern>
      </defs>

      {/* long hair behind */}
      <path d="M76 66 C72 34 88 22 100 22 C112 22 128 34 124 66 L128 122 Q120 128 114 120 L117 72 C115 52 110 44 100 44 C90 44 85 52 83 72 L86 120 Q80 128 72 122 Z" fill={`url(#${id}-hair)`} />

      {/* dupatta, back drape — sways gently */}
      <g ref={refs.drape}>
        <path d="M70 72 C66 26 84 10 100 10 C116 10 134 26 130 72 L152 336 Q141 350 128 338 L120 98 C118 54 110 32 100 32 C90 32 82 54 80 98 L72 338 Q59 350 48 336 Z" fill={dup} opacity="0.92" />
        <path d="M70 72 C66 26 84 10 100 10 C116 10 134 26 130 72 L152 336 Q141 350 128 338 L120 98 C118 54 110 32 100 32 C90 32 82 54 80 98 L72 338 Q59 350 48 336 Z" fill={`url(#${id}-buti)`} opacity="0.5" />
        <path d="M48 336 Q59 350 72 338 M128 338 Q141 350 152 336" stroke={t} strokeWidth="5" fill="none" />
        <path d="M70 72 L48 336 M130 72 L152 336" stroke={t} strokeWidth="2.5" fill="none" opacity="0.9" />
        {[60, 140].map((x) => (
          <path key={x} d={`M${x - 10} 346 l2 6 M${x - 3} 349 l1 6 M${x + 4} 349 l-1 6 M${x + 11} 346 l-2 6`} stroke={t} strokeWidth="1" />
        ))}
      </g>

      {/* lehenga */}
      <g ref={refs.skirt}>
        <path d="M72 204 Q100 214 128 204 L184 494 Q100 522 16 494 Z" fill={`url(#${id}-fab)`} />
        <path d="M72 204 Q100 214 128 204 L184 494 Q100 522 16 494 Z" fill={`url(#${id}-buti)`} opacity="0.55" />
        <path d="M86 210 L58 502 M100 212 L100 512 M114 210 L142 502 M78 208 L34 494 M122 208 L166 494" stroke={shade(o.dress, -0.35)} strokeWidth="1" opacity="0.22" />
        <path d="M34 398 Q100 420 166 398" stroke={t} strokeWidth="2.2" fill="none" />
        <path d="M30 412 Q100 434 170 412" stroke={t} strokeWidth="1" fill="none" strokeDasharray="2 3" />
        <path d="M20 466 Q100 494 180 466 L184 494 Q100 522 16 494 Z" fill={t} />
        <path d="M22 478 Q100 506 178 478" stroke={shade(t, -0.3)} strokeWidth="1" fill="none" />
        {Array.from({ length: 9 }, (_, i) => {
          const x = 30 + i * 17.5
          const y = 484 + Math.sin((i / 8) * Math.PI) * 12
          return <path key={i} d={`M${x} ${y} q3 -5 6 0 q-3 5 -6 0`} fill={shade(o.dress, -0.1)} />
        })}
      </g>

      <g ref={refs.upper}>
        {/* choli */}
        <path d="M74 124 Q100 114 126 124 L131 210 Q100 222 69 210 Z" fill={`url(#${id}-fab2)`} />
        <path d="M86 120 Q100 142 114 120" stroke={t} strokeWidth="2" fill="none" />
        <path d="M69 206 Q100 220 131 206" stroke={t} strokeWidth="3.5" fill="none" />
        <path d="M82 160 q18 10 36 0" stroke={t} strokeWidth="1" fill="none" strokeDasharray="1.5 2.5" />

        {/* dupatta, front drape across the body */}
        <path d="M74 128 Q92 222 154 306 L164 294 Q104 214 88 122 Z" fill={dup} opacity="0.8" />
        <path d="M74 128 Q92 222 154 306" stroke={t} strokeWidth="2.6" fill="none" />

        {/* arms: elbow sleeve, bangles, mehndi */}
        {(['L', 'R'] as const).map((side) => {
          const m = (x: number) => (side === 'L' ? x : 200 - x)
          return (
            <g key={side} ref={side === 'L' ? refs.armL : refs.armR}>
              <path d={`M${m(71)} 128 C${m(60)} 132 ${m(55)} 146 ${m(55)} 164 L${m(53)} 212 L${m(69)} 212 L${m(73)} 160 C${m(75)} 147 ${m(75)} 137 ${m(71)} 128 Z`} fill={`url(#${id}-fab2)`} />
              <path d={`M${m(53)} 208 L${m(69)} 208`} stroke={t} strokeWidth="3" />
              <path d={`M${m(54)} 210 L${m(49)} 298 Q${m(55)} 304 ${m(61)} 300 L${m(68)} 210 Z`} fill={`url(#${id}-limb)`} />
              {[262, 267, 272, 277, 282, 287].map((y, i) => (
                <path key={y} d={`M${m(49.5)} ${y} L${m(64)} ${y + 1}`} stroke={i % 2 ? t : o.dress} strokeWidth="2.6" strokeLinecap="round" />
              ))}
              <Hand cx={m(55)} cy={310} id={id} flip={side === 'R'} mehndi />
            </g>
          )
        })}

        {/* neck + jewellery */}
        <path d="M90 92 L90 122 Q100 128 110 122 L110 92 Z" fill={SKIN.shade} />
        <path d="M86 106 Q100 116 114 106" stroke={t} strokeWidth="4.5" fill="none" />
        {[90, 95, 100, 105, 110].map((x) => (
          <circle key={x} cx={x} cy={x === 100 ? 112 : x === 95 || x === 105 ? 111 : 109} r="1.4" fill="#B5122B" />
        ))}
        <path d="M82 112 Q100 146 118 112" stroke={t} strokeWidth="2.4" fill="none" />
        <path d="M84 116 Q100 152 116 116" stroke={t} strokeWidth="1" fill="none" strokeDasharray="1.5 2" />
        <path d="M100 136 l6 6 -6 9 -6 -9 z" fill={t} />
        <circle cx="100" cy="143" r="2.4" fill="#1F7A4F" />

        {/* head */}
        <path d="M79 66 C79 42 89 32 100 32 C111 32 121 42 121 66 C121 86 112 100 100 102 C88 100 79 86 79 66 Z" fill={`url(#${id}-skin)`} />
        <g ref={refs.eyes}>
          <Eye cx={91} cy={68} bride />
          <Eye cx={109} cy={68} bride />
        </g>
        <path d="M84 59 Q90.5 55 97 58 M103 58 Q109.5 55 116 59" stroke={HAIR.base} strokeWidth="1.5" fill="none" strokeLinecap="round" />
        <path d="M100.5 70 Q99 77 97.5 80.5 Q100 82.5 102.5 81" stroke={SKIN.line} strokeWidth="0.9" fill="none" strokeLinecap="round" />
        <path d="M93.5 90 Q97 88 100 89.2 Q103 88 106.5 90 Q103 95.5 100 95.5 Q97 95.5 93.5 90 Z" fill={LIP.bride} />
        <path d="M97 93 q3 1.2 6 0" stroke="#fff" strokeWidth="0.7" opacity="0.45" fill="none" />
        <ellipse cx="86" cy="80" rx="5.5" ry="3.2" fill="#E8687A" opacity="0.22" />
        <ellipse cx="114" cy="80" rx="5.5" ry="3.2" fill="#E8687A" opacity="0.22" />
        {/* nath with chain to the hair */}
        <circle cx="104" cy="83" r="5" stroke={t} strokeWidth="1.2" fill="none" />
        <circle cx="104" cy="88" r="1.2" fill="#fff" />
        <path d="M108.5 81 Q118 77 121 64" stroke={t} strokeWidth="0.7" fill="none" />

        {/* front hair + parting */}
        <path d="M79 66 C79 44 89 34 100 34 C111 34 121 44 121 66 C117 51 109 45 100 45 C91 45 83 51 79 66 Z" fill={`url(#${id}-hair)`} />
        <path d="M100 34 V45" stroke="#B5122B" strokeWidth="1.4" opacity="0.7" />
        {/* tikka */}
        <path d="M100 30 V46" stroke={t} strokeWidth="0.9" />
        <circle cx="100" cy="48.5" r="3.4" fill={t} />
        <circle cx="100" cy="48.5" r="1.7" fill="#B5122B" />
        <path d="M100 52 l-1.6 3 h3.2 z" fill={t} />
        {/* jhumkay */}
        {[78, 122].map((x) => (
          <g key={x}>
            <circle cx={x} cy="80" r="2" fill={t} />
            <path d={`M${x - 4.5} 90 Q${x} 81 ${x + 4.5} 90 Z`} fill={t} />
            {[-3, 0, 3].map((dx) => (
              <circle key={dx} cx={x + dx} cy="92" r="1" fill="#F7F1E4" />
            ))}
          </g>
        ))}

        {/* dupatta, front edge framing the face */}
        <path d="M74 64 C74 30 87 16 100 16 C113 16 126 30 126 64 C122 40 112 28 100 28 C88 28 78 40 74 64 Z" fill={dup} />
        <path d="M74 64 C74 30 87 16 100 16 C113 16 126 30 126 64" stroke={t} strokeWidth="2.6" fill="none" />
        <path d="M78 52 C80 32 90 24 100 24 C110 24 120 32 122 52" stroke={shade(t, -0.25)} strokeWidth="0.8" strokeDasharray="1.5 2" fill="none" />
      </g>
    </>
  )
}
