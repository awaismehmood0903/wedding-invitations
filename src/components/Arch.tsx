/** Large decorative jharokha arch behind each day's title. */
export function Arch({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 400 520" className={className} aria-hidden>
      <g fill="none" stroke="currentColor">
        <path d="M30 515 V210 Q30 110 200 20 Q370 110 370 210 V515" strokeWidth="1.5" strokeOpacity="0.55" />
        <path d="M52 515 V220 Q52 130 200 50 Q348 130 348 220 V515" strokeWidth="1" strokeOpacity="0.35" />
        <path d="M200 20 V2" strokeWidth="1.5" strokeOpacity="0.55" />
        <circle cx="200" cy="0" r="5" fill="currentColor" fillOpacity="0.5" stroke="none" />
        {Array.from({ length: 9 }, (_, i) => (
          <circle key={i} cx={52 + i * 37} cy="515" r="3" fill="currentColor" fillOpacity="0.35" stroke="none" />
        ))}
      </g>
    </svg>
  )
}
