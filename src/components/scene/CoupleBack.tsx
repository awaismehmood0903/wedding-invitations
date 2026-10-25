import { forwardRef, useId } from 'react'
import type { BrideOutfit, GroomOutfit } from '../../config/event'
import { shade } from '../CharacterRealistic'

const SKIN = '#D9A07B'
const HAIR = '#1C130E'

/**
 * Bride and groom seen from behind, hand in hand, walking toward the mosque.
 * Drawn in a 200×300 box; WeddingScene places and animates it. Class names
 * (cb-leg-l, cb-veil, …) are the hooks the scene's GSAP timeline animates.
 */
export const CoupleBack = forwardRef<SVGGElement, { groom: GroomOutfit; bride: BrideOutfit; transform?: string }>(function CoupleBack({ groom: g, bride: b, transform }, ref) {
  const id = useId().replace(/[^a-zA-Z0-9]/g, '')
  const suit = g.style === 'suit'

  const fabric = (key: string, c: string) => (
    <linearGradient id={`${id}-${key}`} x1="0" x2="1">
      <stop offset="0" stopColor={shade(c, -0.22)} />
      <stop offset="0.45" stopColor={shade(c, 0.08)} />
      <stop offset="1" stopColor={shade(c, -0.25)} />
    </linearGradient>
  )

  return (
    <g ref={ref} transform={transform}>
      <defs>
        {fabric('coat', g.coat)}
        {fabric('pants', g.pants)}
        {fabric('dress', b.dress)}
        {fabric('top', b.top)}
        <linearGradient id={`${id}-veil`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={b.dupatta} stopOpacity="0.92" />
          <stop offset="0.6" stopColor={b.dupatta} stopOpacity="0.8" />
          <stop offset="1" stopColor={b.dupatta} stopOpacity="0.65" />
        </linearGradient>
        <linearGradient id={`${id}-hair`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={shade(HAIR, 0.18)} />
          <stop offset="0.7" stopColor={HAIR} />
          <stop offset="1" stopColor={shade(HAIR, 0.25)} />
        </linearGradient>
        <pattern id={`${id}-buti`} width="9" height="9" patternUnits="userSpaceOnUse">
          <circle cx="4.5" cy="4.5" r="0.8" fill={b.trim} opacity="0.85" />
        </pattern>
        <radialGradient id={`${id}-shadow`}>
          <stop offset="0" stopColor="#000" stopOpacity="0.28" />
          <stop offset="1" stopColor="#000" stopOpacity="0" />
        </radialGradient>
      </defs>

      <ellipse cx="108" cy="290" rx="98" ry="10" fill={`url(#${id}-shadow)`} />

      {/* ───── groom ───── */}
      <g className="cb-groom">
        <g className="cb-leg-l">
          <path d={suit ? 'M47 168 L46 266 L59 266 L60 168 Z' : 'M48 198 L48 262 L58 262 L59 198 Z'} fill={`url(#${id}-pants)`} />
          <path d="M45 262 Q52 258 60 262 L60 270 L44 270 Z" fill={suit ? '#141416' : shade(g.trim, -0.35)} />
        </g>
        <g className="cb-leg-r">
          <path d={suit ? 'M64 168 L65 266 L78 266 L77 168 Z' : 'M65 198 L66 262 L76 262 L76 198 Z'} fill={`url(#${id}-pants)`} />
          <path d="M64 262 Q71 258 79 262 L79 270 L63 270 Z" fill={suit ? '#141416' : shade(g.trim, -0.35)} />
        </g>

        {/* coat back: broad shoulders tapering to a trim waist */}
        {suit ? (
          <>
            <path d="M29 74 C30 63 45 57 62 57 C79 57 94 63 95 74 L86 130 L88 172 Q62 178 36 172 L38 130 Z" fill={`url(#${id}-coat)`} />
            <path d="M62 60 V176" stroke={shade(g.coat, -0.35)} strokeWidth="1" />
            <path d="M58 150 L62 176 L66 150" stroke={shade(g.coat, -0.35)} strokeWidth="0.8" fill="none" />
            <path d="M52 56 L62 64 L72 56" fill="#F5F3EE" />
          </>
        ) : (
          <>
            <path d="M29 74 C30 63 45 57 62 57 C79 57 94 63 95 74 L86 130 L90 204 Q62 212 34 204 L38 130 Z" fill={`url(#${id}-coat)`} />
            <path d="M62 60 V208" stroke={shade(g.coat, -0.28)} strokeWidth="0.9" opacity="0.7" />
            <path d="M35 194 Q62 202 89 194 L90 204 Q62 212 34 204 Z" fill={g.trim} opacity="0.9" />
            <path d="M40 140 Q42 170 38 200 M84 140 Q82 170 86 200" stroke={shade(g.coat, -0.35)} strokeWidth="0.8" fill="none" opacity="0.35" />
            <rect x="53" y="55" width="18" height="9" rx="2" fill={g.coat} stroke={g.trim} strokeWidth="1.2" />
          </>
        )}
        {/* shoulder blades and back muscles under the fabric */}
        <path d="M44 78 Q52 96 46 118 M80 78 Q72 96 78 118" stroke={shade(g.coat, -0.35)} strokeWidth="1" fill="none" opacity="0.3" />
        <path d="M33 76 Q40 70 48 70 M91 76 Q84 70 76 70" stroke={shade(g.coat, 0.25)} strokeWidth="1.4" fill="none" opacity="0.45" />

        {/* outer arm, hanging: fuller upper arm */}
        <g className="cb-arm-out">
          <path d="M33 70 C22 74 19 88 20 104 L21 160 Q27 167 34 164 L37 108 C39 92 40 80 33 70 Z" fill={`url(#${id}-coat)`} />
          <path d="M21 152 L35 154" stroke={suit ? '#F5F3EE' : g.trim} strokeWidth="3" />
          <ellipse cx="27.5" cy="171" rx="5.5" ry="7.5" fill={SKIN} />
        </g>
        {/* strong neck + head (back) */}
        <path d="M53 40 L53 58 Q62 62 71 58 L71 40 Z" fill={shade(SKIN, -0.12)} />
        <ellipse cx="45.5" cy="31" rx="3.2" ry="5.5" fill={SKIN} />
        <ellipse cx="78.5" cy="31" rx="3.2" ry="5.5" fill={SKIN} />
        {g.turban ? (
          <>
            {/* neatly tapered hair at the nape below the turban */}
            <path d="M50 36 Q62 42 74 36 L73 44 Q62 49 51 44 Z" fill={HAIR} />
            <path d="M48 20 C48 0 76 0 76 20 L77 40 Q62 46 47 40 Z" fill={g.turban} stroke={g.trim} strokeWidth="0.8" />
            <path d="M48 16 Q62 8 76 16 M48 26 Q62 18 76 26 M48 35 Q62 28 76 35" stroke={g.trim} strokeWidth="1.2" fill="none" />
            <path className="cb-shamla" d="M64 38 C66 60 62 80 66 104" stroke={g.turban} strokeWidth="6" strokeLinecap="round" fill="none" />
            <path d="M64 38 C66 60 62 80 66 104" stroke={g.trim} strokeWidth="0.8" fill="none" transform="translate(2.6 0)" />
            <path d="M60 4 C58 -8 62 -16 66 -22 C67 -12 66 -4 64 4 Z" fill={g.trim} />
          </>
        ) : (
          <>
            {/* full, styled hair with volume on top and a clean taper at the nape */}
            <path d="M46 30 C44 10 53 1 63 1 C75 1 82 11 80 30 C80 38 77 42 73 45 Q62 49 51 45 C48 42 46 38 46 30 Z" fill={`url(#${id}-hair)`} />
            <path d="M47 18 C49 2 62 -4 72 -1 C79 2 82 10 81 18 C76 9 70 6 63 6 C56 6 50 10 47 18 Z" fill={shade(HAIR, 0.22)} />
            <path d="M52 10 Q60 4 70 6 M50 16 Q60 9 74 11 M49 24 Q60 18 77 21 M50 31 Q62 26 78 29" stroke="#5A4535" strokeWidth="0.8" fill="none" opacity="0.65" strokeLinecap="round" />
            <path d="M51 41 Q62 46 73 41 L72 46 Q62 50 52 46 Z" fill={shade(HAIR, 0.35)} opacity="0.7" />
            <path d="M46 28 L47 38 M80 28 L79 38" stroke={shade(HAIR, 0.3)} strokeWidth="1.2" opacity="0.6" />
          </>
        )}
      </g>

      {/* ───── bride ───── */}
      <g className="cb-bride">
        <g className="cb-skirt">
          <path d="M112 118 Q130 112 148 118 L180 284 Q136 296 96 286 Z" fill={`url(#${id}-dress)`} />
          <path d="M112 118 Q130 112 148 118 L180 284 Q136 296 96 286 Z" fill={`url(#${id}-buti)`} opacity="0.6" />
          <path d="M98 272 Q138 284 179 270 L180 284 Q136 296 96 286 Z" fill={b.trim} />
          <path d="M104 230 Q138 240 172 228" stroke={b.trim} strokeWidth="1.4" fill="none" />
        </g>
        <path d="M114 70 Q130 64 146 70 L149 120 Q130 126 111 120 Z" fill={`url(#${id}-top)`} />
        {/* braid under the veil */}
        <path d="M130 50 C128 70 132 90 129 112" stroke={HAIR} strokeWidth="6" strokeLinecap="round" fill="none" opacity="0.8" />
        <path d="M130 112 l-3 10 h6 z" fill={b.trim} opacity="0.8" />
        {/* head under the veil */}
        <ellipse cx="130" cy="36" rx="13" ry="15" fill={HAIR} />

        {/* veil: over the head and down the back into a long train */}
        <g className="cb-veil">
          <path d="M115 34 C113 12 147 12 145 34 L152 70 C164 140 182 214 214 292 L118 296 C116 222 113 150 111 74 Z" fill={`url(#${id}-veil)`} />
          <path d="M115 34 C113 12 147 12 145 34 L152 70 C164 140 182 214 214 292 L118 296 C116 222 113 150 111 74 Z" fill={`url(#${id}-buti)`} opacity="0.55" />
          <path d="M152 70 C164 140 182 214 214 292 M111 74 C113 150 116 222 118 296" stroke={b.trim} strokeWidth="2.2" fill="none" />
          <path d="M118 294 Q166 302 214 290" stroke={b.trim} strokeWidth="3.4" fill="none" />
          <path d="M115 34 C113 12 147 12 145 34" stroke={b.trim} strokeWidth="1.8" fill="none" />
        </g>
      </g>

      {/* hands joined between them */}
      <g className="cb-hands">
        <path d="M91 70 C101 76 104 108 105 150 L95 152 C93 120 89 98 80 80 Z" fill={`url(#${id}-coat)`} />
        <path d="M95 146 L104 145" stroke={suit ? '#F5F3EE' : g.trim} strokeWidth="2.6" />
        <path d="M113 76 C108 96 106 124 106 150 L113 151 C114 126 116 102 118 84 Z" fill={`url(#${id}-top)`} />
        <path d="M106 146 L113 146" stroke={b.trim} strokeWidth="2.2" />
        <ellipse cx="104" cy="158" rx="6.5" ry="7" fill={SKIN} />
        <ellipse cx="108" cy="156" rx="4.5" ry="5.5" fill={shade(SKIN, -0.06)} />
      </g>
    </g>
  )
})
