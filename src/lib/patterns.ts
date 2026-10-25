import type { DayTheme } from '../config/event'

const enc = (svg: string) => `url("data:image/svg+xml,${encodeURIComponent(svg)}")`

/** Repeating SVG motif for each day, tinted with that day's accent colour. */
export function patternUrl(kind: DayTheme['pattern'], color: string, opacity = 0.14): string {
  const s = `stroke="${color}" stroke-opacity="${opacity}" fill="none" stroke-width="1.2"`
  switch (kind) {
    case 'geometric':
      // Eight-point Islamic star lattice
      return enc(`<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 80 80"><g ${s}>
        <path d="M40 10 L48 32 L70 40 L48 48 L40 70 L32 48 L10 40 L32 32 Z"/>
        <rect x="22" y="22" width="36" height="36" transform="rotate(45 40 40)"/>
        <rect x="22" y="22" width="36" height="36"/>
        <path d="M0 0 L10 10 M80 0 L70 10 M0 80 L10 70 M80 80 L70 70"/>
        <circle cx="40" cy="40" r="4"/></g></svg>`)
    case 'jharokha':
      // Mughal arch windows with a paisley
      return enc(`<svg xmlns="http://www.w3.org/2000/svg" width="96" height="120" viewBox="0 0 96 120"><g ${s}>
        <path d="M18 110 V52 Q18 30 48 14 Q78 30 78 52 V110"/>
        <path d="M28 110 V58 Q28 40 48 28 Q68 40 68 58 V110"/>
        <path d="M48 14 V4"/><circle cx="48" cy="3" r="2"/>
        <path d="M44 84 Q36 72 46 64 Q56 60 54 72 Q52 80 44 84 Z"/>
        <path d="M0 116 H96"/></g></svg>`)
    case 'floral': {
      const petals = [0, 60, 120, 180, 240, 300]
        .map((r) => `<ellipse rx="6" ry="14" cy="-14" transform="rotate(${r})"/>`)
        .join('')
      return enc(`<svg xmlns="http://www.w3.org/2000/svg" width="90" height="90" viewBox="0 0 90 90"><g ${s}>
        <g transform="translate(45 45)">${petals}<circle r="4"/></g>
        <path d="M0 0 Q12 8 8 20 M90 90 Q78 82 82 70 M90 0 Q78 8 82 20 M0 90 Q12 82 8 70"/></g></svg>`)
    }
  }
}

/** Fine paper grain, layered over envelope and card colours. */
export const paperGrain = enc(
  `<svg xmlns="http://www.w3.org/2000/svg" width="180" height="180"><filter id="n"><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" stitchTiles="stitch"/><feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.1 0"/></filter><rect width="100%" height="100%" filter="url(#n)"/></svg>`,
)

/**
 * Tone-on-tone embossed florals (like letterpress paper): each sprig is drawn
 * twice, a light highlight up-left and a soft shadow down-right.
 */
export function embossedFlorals(light = '#FFFFFF', dark = '#000000', strength = 1): string {
  const flower = (x: number, y: number, r: number) =>
    [0, 72, 144, 216, 288]
      .map((a) => {
        const rad = (a * Math.PI) / 180
        return `<ellipse cx="${(x + Math.cos(rad) * r).toFixed(1)}" cy="${(y + Math.sin(rad) * r).toFixed(1)}" rx="${r * 0.75}" ry="${r * 0.5}" transform="rotate(${a} ${(x + Math.cos(rad) * r).toFixed(1)} ${(y + Math.sin(rad) * r).toFixed(1)})"/>`
      })
      .join('') + `<circle cx="${x}" cy="${y}" r="${r * 0.35}"/>`
  const leaf = (x: number, y: number, a: number, l: number) =>
    `<path transform="translate(${x} ${y}) rotate(${a})" d="M0 0 Q${l / 2} ${-l * 0.32} ${l} 0 Q${l / 2} ${l * 0.32} 0 0 Z M0 0 L${l} 0"/>`
  const sprig = [
    '<path d="M20 230 C60 190 70 140 120 110 C150 92 170 70 178 40"/>',
    '<path d="M120 110 C140 120 160 118 182 128"/>',
    leaf(60, 186, -60, 22),
    leaf(74, 160, 20, 20),
    leaf(98, 128, -40, 20),
    leaf(150, 120, 30, 18),
    leaf(166, 76, -70, 18),
    flower(178, 38, 9),
    flower(186, 130, 7),
    flower(36, 212, 6),
    '<path d="M200 200 C214 190 222 176 224 160"/>',
    leaf(214, 186, -30, 14),
    flower(226, 156, 5),
  ].join('')
  const g = (stroke: string, op: number, d: number) =>
    `<g fill="none" stroke="${stroke}" stroke-opacity="${op * strength}" stroke-width="1.1" stroke-linecap="round" transform="translate(${d} ${d})">${sprig}</g>`
  return enc(
    `<svg xmlns="http://www.w3.org/2000/svg" width="240" height="240" viewBox="0 0 240 240">${g(dark, 0.16, 0.9)}${g(light, 0.6, -0.7)}</svg>`,
  )
}
